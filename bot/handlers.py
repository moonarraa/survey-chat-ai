from aiogram import Router, F, types
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
import api
import httpx
from config import BACKEND_URL, BOT_API_TOKEN

router = Router()

class SurveyStates(StatesGroup):
    answering = State()

@router.message(Command("start"))
async def cmd_start(message: types.Message, state: FSMContext):
    await message.answer(
        "👋 Привет! Я бот для прохождения опросов.\n\n" \
        "Чтобы пройти опрос, отправьте мне ссылку на опрос или его код (например: s/abc123)."
    )
    await state.clear()

@router.message(lambda message: message.text and (message.text.startswith("http") or message.text.startswith("s/")))
async def handle_survey_link_or_code(message: types.Message, state: FSMContext):
    # Extract public_id from link or code
    text = message.text.strip()
    if text.startswith("http"):
        # Assume link format: .../s/<public_id>
        parts = text.split("/s/")
        if len(parts) != 2:
            await message.answer("Не удалось распознать ссылку. Пожалуйста, отправьте корректную ссылку на опрос.")
            return
        public_id = parts[1].split("/")[0]
    elif text.startswith("s/"):
        public_id = text[2:]
    else:
        await message.answer("Пожалуйста, отправьте ссылку на опрос или его код (например: s/abc123).")
        return
    try:
        survey = await api.get_survey_by_public_id(public_id)
    except Exception:
        await message.answer("Опрос не найден или недоступен.")
        return
    await state.update_data(
        public_id=public_id,
        questions=survey["questions"],
        topic=survey.get("topic", "Опрос"),
        answers=[],
        current=0
    )
    await message.answer(f"Опрос: {survey.get('topic', '')}\n\n{survey['questions'][0]['text']}")
    await state.set_state(SurveyStates.answering)

@router.message(SurveyStates.answering)
async def process_survey_answer(message: types.Message, state: FSMContext):
    data = await state.get_data()
    answers = data.get("answers", [])
    questions = data["questions"]
    current = data["current"]
    answers.append(message.text)
    current += 1
    if current < len(questions):
        await state.update_data(answers=answers, current=current)
        await message.answer(questions[current]["text"])
    else:
        # Отправить ответы на backend
        try:
            await api.submit_survey_answer(
                public_id=data["public_id"],
                answers=answers,
                respondent_id=str(message.from_user.id)
            )
            await message.answer("Спасибо! Ваши ответы сохранены.")
            await message.answer(f"Посмотреть результаты: https://survey-ai.up.railway.app/s/{data['public_id']}/results")
        except Exception as e:
            await message.answer(f"Ошибка при сохранении ответа: {e}")
        await state.clear() 