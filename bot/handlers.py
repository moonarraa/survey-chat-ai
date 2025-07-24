from aiogram import Router, F, types
from aiogram.filters import Command, CommandObject
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
import api
import httpx
from config import BACKEND_URL, BOT_API_TOKEN
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

router = Router()

class SurveyStates(StatesGroup):
    answering = State()

@router.message(Command("start"))
async def cmd_start(message: types.Message, command: CommandObject, state: FSMContext):
    print(f"Received /start with payload: {command.args}")
    payload = command.args
    if payload:
        # Поддерживаем s_префикс + обычный ввод public_id
        if payload.startswith("s_"):
            public_id = payload[2:]
        else:
            public_id = payload
            
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
        first_q = survey["questions"][0]
        if first_q["type"] == "multiple_choice":
            keyboard = get_multiple_choice_keyboard(first_q["options"])
            await message.answer(f"📋 Опрос: {survey.get('topic', '')}\n\n{first_q['text']}", reply_markup=keyboard)
        elif first_q["type"] == "rating":
            keyboard = get_rating_keyboard(first_q.get("scale", 5))
            await message.answer(f"📋 Опрос: {survey.get('topic', '')}\n\n{first_q['text']}", reply_markup=keyboard)
        elif first_q["type"] == "ranking":
            keyboard = get_ranking_keyboard(first_q["items"])
            await message.answer(f"📋 Опрос: {survey.get('topic', '')}\n\n{first_q['text']}\n\nВыберите один элемент:", reply_markup=keyboard)
        elif first_q["type"] == "image_choice":
            keyboard = get_image_choice_keyboard(first_q["images"])
            await message.answer(f"📋 Опрос: {survey.get('topic', '')}\n\n{first_q['text']}", reply_markup=keyboard)
        else:
            await message.answer(f"📋 Опрос: {survey.get('topic', '')}\n\n{first_q['text']}")
        await state.set_state(SurveyStates.answering)
        return
    # Only show the welcome message if no valid payload
    await message.answer(
        "👋 Привет! Я бот для прохождения опросов.\n\n"
        "Чтобы пройти опрос, отправьте мне ссылку на опрос или его код (например: s/abc123)."
    )
    await state.clear()

@router.message(Command("help"))
async def cmd_help(message: types.Message):
    await message.answer("Отправьте ссылку на опрос или его код (например: s/abc123), чтобы пройти опрос.")

@router.message(Command("about"))
async def cmd_about(message: types.Message):
    await message.answer("Этот бот создан для прохождения опросов, созданных на Survey AI.")

def get_multiple_choice_keyboard(options):
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text=option, callback_data=f"answer:{i}")]
            for i, option in enumerate(options)
        ]
    )
    return keyboard

def get_rating_keyboard(scale=5):
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text=f"⭐️{i}", callback_data=f"answer:{i}")
                for i in range(1, scale + 1)
            ]
        ]
    )
    return keyboard

def get_ranking_keyboard(items):
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text=item, callback_data=f"answer:{i}")]
            for i, item in enumerate(items)
        ]
    )
    return keyboard

def get_image_choice_keyboard(images):
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text=f"🖼️ {img.get('label', f'Image {i+1}')}", callback_data=f"answer:{i}")]
            for i, img in enumerate(images)
        ]
    )
    return keyboard

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
    elif text.startswith("s/") or text.startswith("s_"):
        public_id = text[2:]
    else:
        await message.answer("Пожалуйста, отправьте ссылку на опрос или его код (например: s/abc123).")
        return
    try:
        survey = await api.get_survey_by_public_id(public_id)
    except Exception as e:
        print(f"Error fetching survey: {e}")
        await message.answer("Опрос не найден или недоступен.")
        return
    await state.update_data(
        public_id=public_id,
        questions=survey["questions"],
        topic=survey.get("topic", "Опрос"),
        answers=[],
        current=0
    )
    first_q = survey["questions"][0]
    if first_q["type"] == "multiple_choice":
        keyboard = get_multiple_choice_keyboard(first_q["options"])
        await message.answer(f"📋 Опрос: {survey.get('topic', '')}\n\n{first_q['text']}", reply_markup=keyboard)
    elif first_q["type"] == "rating":
        keyboard = get_rating_keyboard(first_q.get("scale", 5))
        await message.answer(f"📋 Опрос: {survey.get('topic', '')}\n\n{first_q['text']}", reply_markup=keyboard)
    elif first_q["type"] == "ranking":
        keyboard = get_ranking_keyboard(first_q["items"])
        await message.answer(f"📋 Опрос: {survey.get('topic', '')}\n\n{first_q['text']}\n\nВыберите один элемент:", reply_markup=keyboard)
    elif first_q["type"] == "image_choice":
        keyboard = get_image_choice_keyboard(first_q["images"])
        await message.answer(f"📋 Опрос: {survey.get('topic', '')}\n\n{first_q['text']}", reply_markup=keyboard)
    else:
        await message.answer(f"📋 Опрос: {survey.get('topic', '')}\n\n{first_q['text']}")
    await state.set_state(SurveyStates.answering)

@router.callback_query(F.data.startswith("answer:"))
async def handle_answer_callback(callback_query: types.CallbackQuery, state: FSMContext):
    # Передаем callback_query как message-like объект
    await process_survey_answer(callback_query, state)
    await callback_query.answer()

@router.message(SurveyStates.answering)
async def process_survey_answer(message: types.Message, state: FSMContext):
    # Определяем объект для отправки сообщений в чат
    if hasattr(message, "message"):  # CallbackQuery
        chat_message = message.message
    else:
        chat_message = message

    data = await state.get_data()
    answers = data.get("answers", [])
    questions = data["questions"]
    current = data["current"]

    user_answer = getattr(message, "text", None)
    if hasattr(message, "data") and message.data and message.data.startswith("answer:"):
        answer_index = message.data.split("answer:", 1)[1]
        # Если это индекс, получаем соответствующий ответ
        current_question = questions[current]
        if current_question["type"] == "multiple_choice":
            try:
                index = int(answer_index)
                user_answer = current_question["options"][index]
            except (ValueError, IndexError):
                user_answer = answer_index
        elif current_question["type"] == "ranking":
            try:
                index = int(answer_index)
                user_answer = current_question["items"][index]
            except (ValueError, IndexError):
                user_answer = answer_index
        elif current_question["type"] == "image_choice":
            try:
                index = int(answer_index)
                user_answer = current_question["images"][index].get("label", f"Image {index+1}")
            except (ValueError, IndexError):
                user_answer = answer_index
        else:
            user_answer = answer_index

    answers.append(user_answer)
    current += 1

    if current < len(questions):
        next_q = questions[current]
        await state.update_data(answers=answers, current=current)
        if next_q["type"] == "multiple_choice":
            keyboard = get_multiple_choice_keyboard(next_q["options"])
            await chat_message.answer(f"📝 {next_q['text']}", reply_markup=keyboard)
        elif next_q["type"] == "rating":
            keyboard = get_rating_keyboard(next_q.get("scale", 5))
            await chat_message.answer(f"⭐ {next_q['text']}", reply_markup=keyboard)
        elif next_q["type"] == "ranking":
            keyboard = get_ranking_keyboard(next_q["items"])
            await chat_message.answer(f"📊 {next_q['text']}", reply_markup=keyboard)
        elif next_q["type"] == "image_choice":
            keyboard = get_image_choice_keyboard(next_q["images"])
            await chat_message.answer(f"🖼️ {next_q['text']}", reply_markup=keyboard)
        else:
            await chat_message.answer(f"💭 {next_q['text']}")
    else:
        # Отправить ответы на backend
        try:
            print(f"Submitting survey answers: {answers} for survey {data['public_id']}")
            response = await api.submit_survey_answer(
                public_id=data["public_id"],
                answers=answers,
                respondent_id=str(getattr(message.from_user, 'id', ''))
            )
            print(f"Backend response: {response}")
            if not response.get("ok", True):
                # Backend requests clarification/follow-up
                await message.answer(response.get("message", "Пожалуйста, уточните ваш ответ."))
                # Do not advance or clear state, let user answer again
                return
            
            # Отправляем сообщения об успехе
            print("Sending success messages...")
            await chat_message.answer("🎉 Отлично! Ваши ответы успешно сохранены. Спасибо за участие в опросе!")
            await chat_message.answer("💡 Хотите создать свой опрос? Переходите на сайт: https://survey-ai.live")
            print("Success messages sent!")
            
        except Exception as e:
            print(f"Error submitting survey answers: {e}")
            if hasattr(e, 'response') and e.response is not None:
                try:
                    detail = e.response.json().get('detail')
                    await message.answer(f"Ошибка: {detail}")
                except Exception:
                    await message.answer(f"Ошибка при сохранении ответа: {e}")
            else:
                await message.answer(f"Ошибка при сохранении ответа: {e}")
        finally:
            await state.clear()

@router.message()
async def catch_all(message: types.Message):
    print(f"Received message: {message.text}")
    await message.answer("Received your message.")

@router.message(Command("survey"))
async def cmd_survey(message: types.Message, command: CommandObject, state: FSMContext):
    payload = command.args
    if payload:
        # Поддерживаем как s_ префикс, так и обычный public_id
        if payload.startswith("s_"):
            public_id = payload[2:]
        else:
            public_id = payload.replace("s/", "")
            
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
        first_q = survey["questions"][0]
        if first_q["type"] == "multiple_choice":
            keyboard = get_multiple_choice_keyboard(first_q["options"])
            await message.answer(f"📋 Опрос: {survey.get('topic', '')}\n\n{first_q['text']}", reply_markup=keyboard)
        elif first_q["type"] == "rating":
            keyboard = get_rating_keyboard(first_q.get("scale", 5))
            await message.answer(f"📋 Опрос: {survey.get('topic', '')}\n\n{first_q['text']}", reply_markup=keyboard)
        elif first_q["type"] == "ranking":
            keyboard = get_ranking_keyboard(first_q["items"])
            await message.answer(f"📋 Опрос: {survey.get('topic', '')}\n\n{first_q['text']}\n\nВыберите один элемент:", reply_markup=keyboard)
        elif first_q["type"] == "image_choice":
            keyboard = get_image_choice_keyboard(first_q["images"])
            await message.answer(f"📋 Опрос: {survey.get('topic', '')}\n\n{first_q['text']}", reply_markup=keyboard)
        else:
            await message.answer(f"📋 Опрос: {survey.get('topic', '')}\n\n{first_q['text']}")
        await state.set_state(SurveyStates.answering)
    else:
        await message.answer("Использование: /survey <код_опроса>")

MAX_TG_MESSAGE_LENGTH = 4096

def safe_tg_message(text):
    if len(text) > MAX_TG_MESSAGE_LENGTH:
        return text[:MAX_TG_MESSAGE_LENGTH - 3] + '...'
    return text 