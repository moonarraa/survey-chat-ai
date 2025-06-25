from aiogram import Router, F, types
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
from . import api

router = Router()

class SurveyStates(StatesGroup):
    waiting_for_context = State()

@router.message(Command("start"))
async def cmd_start(message: types.Message):
    await message.answer(
        "👋 Привет! Я помогу быстро собрать фидбек о твоём продукте.\n\n" \
        "Команды:\n" \
        "/create_survey — создать опрос\n" \
        "/results — посмотреть аналитику\n\n" \
        "Просто напиши /create_survey, чтобы начать!"
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