from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import json
from sqlalchemy import select, func, and_
from src.tasks.schema import Survey, SurveyAnswer

from src.database import get_async_db

router = APIRouter()

class LeaderboardEntry(BaseModel):
    app_name: str
    average_rating: float
    helpful_percentage: float
    rank: int

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

async def get_leaderboard_data(db: AsyncSession) -> List[LeaderboardEntry]:
    """
    Calculates and returns leaderboard data from the database.
    """
    # Get all template surveys
    stmt = select(Survey).where(Survey.is_template_survey == True)
    result = await db.execute(stmt)
    template_surveys = result.scalars().all()

    leaderboard = []
    for survey in template_surveys:
        # Get all answers for the survey
        answer_stmt = select(SurveyAnswer).where(SurveyAnswer.survey_id == survey.id)
        answer_result = await db.execute(answer_stmt)
        answers = answer_result.scalars().all()

        total_rating = 0
        rating_count = 0
        helpful_count = 0
        
        for answer_record in answers:
            try:
                answer_data = json.loads(answer_record.answers)
                
                # Find the rating and helpful answers
                for ans in answer_data:
                    if ans.get("id") == "rating" and isinstance(ans.get("answer"), int):
                        total_rating += ans["answer"]
                        rating_count += 1
                    if ans.get("id") == "helpful" and ans.get("answer") == "Yes":
                        helpful_count += 1
            except (json.JSONDecodeError, TypeError):
                continue

        average_rating = total_rating / rating_count if rating_count > 0 else 0
        helpful_percentage = (helpful_count / len(answers)) * 100 if answers else 0

        leaderboard.append({
            "app_name": survey.app_name,
            "average_rating": average_rating,
            "helpful_percentage": helpful_percentage,
        })
    
    # Rank the leaderboard
    leaderboard.sort(key=lambda x: (x['average_rating'], x['helpful_percentage']), reverse=True)
    
    ranked_leaderboard = []
    for i, entry in enumerate(leaderboard):
        ranked_leaderboard.append(LeaderboardEntry(rank=i + 1, **entry))

    return ranked_leaderboard

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(db: AsyncSession = Depends(get_async_db)):
    """
    Returns the current leaderboard rankings.
    """
    leaderboard_data = await get_leaderboard_data(db)
    return leaderboard_data

@router.websocket("/ws/leaderboard")
async def websocket_endpoint(websocket: WebSocket, db: AsyncSession = Depends(get_async_db)):
    await manager.connect(websocket)
    try:
        # Send initial leaderboard data
        leaderboard_data = await get_leaderboard_data(db)
        await websocket.send_text(json.dumps([d.dict() for d in leaderboard_data]))
        
        while True:
            # This is just to keep the connection open.
            # In a real app, you wouldn't need this loop if you only broadcast updates.
            await websocket.receive_text() 
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# This function will be called from the survey submission endpoint to broadcast updates.
async def broadcast_leaderboard_update(db: AsyncSession):
    leaderboard_data = await get_leaderboard_data(db)
    await manager.broadcast(json.dumps([d.dict() for d in leaderboard_data])) 