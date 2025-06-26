import httpx
from .config import BACKEND_URL, BOT_API_TOKEN

headers = {"Authorization": f"Bearer {BOT_API_TOKEN}"}

async def create_survey(context: str, user_id: int):
    async with httpx.AsyncClient() as client:
        # 1. Сгенерировать вопросы
        res_gen = await client.post(f"{BACKEND_URL}/surveys/generate-questions-advanced", json={"context": context, "n": 6}, headers=headers)
        res_gen.raise_for_status()
        questions = res_gen.json().get("questions", [])
        if not questions:
            raise Exception("AI не смог сгенерировать вопросы")
        # 2. Создать опрос
        res = await client.post(f"{BACKEND_URL}/surveys/", json={"topic": context, "questions": questions, "tg_user_id": user_id}, headers=headers)
        res.raise_for_status()
        return res.json()

async def get_results(user_id: int):
    # TODO: реализовать получение аналитики по опросам пользователя
    return {"message": "Аналитика пока не реализована"}

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