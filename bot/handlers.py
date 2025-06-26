from aiogram import Router, F, types
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
from . import api
import httpx
from .config import BACKEND_URL, BOT_API_TOKEN

router = Router()

class SurveyStates(StatesGroup):
    waiting_for_context = State()
    answering = State()

@router.message(Command("start"))
async def cmd_start(message: types.Message, state: FSMContext):
    parts = message.text.strip().split()
    if len(parts) == 2:
        public_id = parts[1]
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
    else:
        await message.answer(
            "👋 Привет! Я помогу быстро собрать фидбек о твоём продукте.\n\n" \
            "Команды:\n" \
            "/create_survey — создать опрос\n" \
            "/results — посмотреть аналитику\n\n" \
            "Чтобы пройти опрос, перейдите по специальной ссылке из сайта."
        )

@router.message(Command("create_survey"))
async def cmd_create_survey(message: types.Message, state: FSMContext):
    await message.answer("Опиши цель или контекст опроса (например, 'Фидбек о приложении для учёта расходов'):")
    await state.set_state(SurveyStates.waiting_for_context)

@router.message(SurveyStates.waiting_for_context)
async def process_context(message: types.Message, state: FSMContext):
    context = message.text.strip()
    await message.answer("Генерирую опрос... ⏳")
    try:
        FRONTEND_URL = "https://survey-ai.up.railway.app"
        survey = await api.create_survey(context, message.from_user.id)
        link = f"{FRONTEND_URL}/s/{survey['public_id']}"
        await message.answer(f"Готово! Вот ссылка на опрос:\n{link}\n\nОтправь её тестировщикам или добавь на лендинг.")
    except Exception as e:
        import traceback
        traceback.print_exc()
        await message.answer(f"Ошибка: {e}")
    await state.clear()

@router.message(Command("link"))
async def cmd_link(message: types.Message):
    import traceback
    try:
        parts = message.text.strip().split()
        if len(parts) != 2:
            await message.answer("Пожалуйста, отправьте команду в формате: /link <код>")
            return
        code = parts[1]
        await message.answer("Пробую привязать Telegram...")  # Для отладки
        async with httpx.AsyncClient() as client:
            res = await client.post(
                f"{BACKEND_URL}/auth/users/link-telegram",
                json={"tg_link_code": code, "tg_user_id": str(message.from_user.id)},
                headers={"Authorization": f"Bearer {BOT_API_TOKEN}"}
            )
            res.raise_for_status()
        await message.answer("Ваш Telegram успешно привязан к аккаунту!")
    except Exception as e:
        traceback.print_exc()
        await message.answer(f"Ошибка при привязке: {e}")

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