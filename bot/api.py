import httpx
from config import BACKEND_URL

class SurveyNotFoundError(Exception):
    """Custom exception for survey not found"""
    pass

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
            print(f"📄 Content-Type: {res.headers.get('content-type', 'Not set')}")
            
            # Логируем первые 200 символов ответа для отладки
            content_preview = res.text[:200]
            print(f"📄 Content preview: {content_preview}")
            
            if res.status_code == 404:
                print("❌ Survey not found (404)")
                raise SurveyNotFoundError("Survey not found")
            
            res.raise_for_status()
            
            # Попробуем разные способы декодирования
            try:
                data = res.json()
                print(f"✅ Survey data received: {data}")
                return data
            except Exception as json_error:
                print(f"❌ JSON parsing error: {json_error}")
                print(f"❌ Raw content: {res.text[:500]}")
                
                # Попробуем декодировать как UTF-8
                try:
                    decoded_content = res.content.decode('utf-8')
                    print(f"🔧 UTF-8 decoded content: {decoded_content[:200]}")
                    import json
                    data = json.loads(decoded_content)
                    print(f"✅ Survey data decoded successfully: {data}")
                    return data
                except Exception as decode_error:
                    print(f"❌ UTF-8 decode error: {decode_error}")
                    raise SurveyNotFoundError(f"Failed to parse survey data: {json_error}")
                    
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