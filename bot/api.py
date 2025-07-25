import httpx
from config import BACKEND_URL
from fastapi import HTTPException

async def get_survey_by_public_id(public_id: str):
    print(f"🔍 Attempting to get survey with public_id: {public_id}")
    print(f"🌐 Backend URL: {BACKEND_URL}")
    
    url = f"{BACKEND_URL}/api/surveys/s/{public_id}"
    print(f"📡 Making request to: {url}")
    
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(url)
            print(f"📊 Response status: {res.status_code}")
            print(f"📄 Response headers: {res.headers}")
            
            if res.status_code == 404:
                print("❌ Survey not found (404)")
                raise HTTPException(status_code=404, detail="Survey not found")
            
            res.raise_for_status()
            data = res.json()
            print(f"✅ Survey data received: {data}")
            return data
        except httpx.HTTPStatusError as e:
            print(f"❌ HTTP error: {e}")
            raise
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            raise

async def submit_survey_answer(public_id: str, answers: list, respondent_id: str = None):
    async with httpx.AsyncClient() as client:
        payload = {"answers": answers}
        if respondent_id:
            payload["respondent_id"] = respondent_id
        res = await client.post(f"{BACKEND_URL}/api/surveys/s/{public_id}/answer", json=payload)
        res.raise_for_status()
        return res.json() 