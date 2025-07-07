import httpx
from .config import BACKEND_URL

async def get_survey_by_public_id(public_id: str):
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{BACKEND_URL}/surveys/s/{public_id}")
        res.raise_for_status()
        return res.json()

async def submit_survey_answer(public_id: str, answers: list, respondent_id: str = None):
    async with httpx.AsyncClient() as client:
        payload = {"answers": answers}
        if respondent_id:
            payload["respondent_id"] = respondent_id
        res = await client.post(f"{BACKEND_URL}/surveys/s/{public_id}/answer", json=payload)
        res.raise_for_status()
        return res.json() 