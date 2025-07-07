from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
import json
import os
from openai import AzureOpenAI

from src.database import get_async_db
from src.tasks.models import User
from src.auth.dependencies import get_current_user
from src.tasks.schema import Survey
from src.config import settings

router = APIRouter()

class TemplateSurveyRequest(BaseModel):
    app_name: str = Field(..., example="My Awesome App")
    app_purpose: str = Field(..., example="To help people find the best coffee shops.")
    app_functionality: str = Field(..., example="Users can search for coffee shops, read reviews, and add their own.")

class TemplateSurveyResponse(BaseModel):
    id: int
    public_id: str
    topic: str

@router.post("/from-template", response_model=TemplateSurveyResponse)
async def create_survey_from_template(
    request: TemplateSurveyRequest,
    db: AsyncSession = Depends(get_async_db),
    user: User = Depends(get_current_user)
):
    """
    Creates a new survey from a template, using AI to generate questions.
    """
    try:
        client = AzureOpenAI(
            api_version="2025-01-01-preview",
            azure_endpoint="https://surveyai-resource.openai.azure.com/",
            api_key=os.getenv("AZURE_OPENAI_KEY"),
        )
        prompt = f"""
        Generate 3 open-ended questions for a survey about an application with the following details:
        - Application Name: {request.app_name}
        - Purpose: {request.app_purpose}
        - Key Functionality: {request.app_functionality}

        The questions should be concise, clear, and designed to gather qualitative feedback.
        Return the questions as a JSON array of strings. For example:
        ["What was your initial reaction to the app?", "What features did you find most useful?", "Is there anything you would change?"]
        """
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        ai_questions_str = response.choices[0].message.content
        ai_question_list = json.loads(ai_questions_str)

        generated_questions = [
            {"id": f"ai_q_{i+1}", "type": "text", "text": q} for i, q in enumerate(ai_question_list)
        ]

    except Exception as e:
        # Fallback to generic questions if AI fails
        generated_questions = [
            {"id": "q1", "type": "text", "text": f"What is your first impression of {request.app_name}?"},
            {"id": "q2", "type": "text", "text": "What feature did you find most useful?"},
            {"id": "q3", "type": "text", "text": "Is there anything you would change or add?"},
        ]

    # Add the two common questions for the leaderboard
    common_questions = [
        {"id": "rating", "type": "rating-10", "text": "On a scale of 1 to 10, how would you rate this app?"},
        {"id": "helpful", "type": "yes-no", "text": "Do you find this app helpful?"},
    ]

    all_questions = generated_questions + common_questions

    new_survey = Survey(
        user_id=user.id,
        topic=f"Feedback for {request.app_name}",
        questions=json.dumps(all_questions),
        is_template_survey=True,
        app_name=request.app_name,
        app_purpose=request.app_purpose,
        app_functionality=request.app_functionality,
    )

    db.add(new_survey)
    await db.commit()
    await db.refresh(new_survey)

    return new_survey 