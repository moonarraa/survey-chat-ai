from dotenv import load_dotenv
load_dotenv()

import openai
import os
import json

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def ai_generate_first_question(topic):
    prompt = f"Сформулируй первый открытый вопрос для опроса на тему: \"{topic}\"."
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "Ты — AI-бот для опросов."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=60,
        temperature=0.7,
    )
    return response.choices[0].message.content.strip()

def ai_generate_questions_for_topic(topic, n=5):
    prompt = (
        f"Сформулируй {n} открытых, осмысленных и разнообразных вопросов для опроса на тему: '{topic}'. "
        "Вопросы должны быть развернутыми, не повторяться и помогать глубже раскрыть тему. "
        "Ответы на вопросы должны требовать размышлений, а не односложных или случайных ответов. "
        "Верни только список вопросов, по одному на строку, без нумерации и лишнего текста."
    )
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "Ты — AI-бот для опросов."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=300,
        temperature=0.8,
    )
    questions = [q.strip() for q in response.choices[0].message.content.strip().split('\n') if q.strip()]
    return questions[:n]

def ai_is_meaningful_answer(answer, question=None):
    # Если ответ достаточно длинный или содержит >= 4 слов — всегда YES
    if len(answer.strip().split()) >= 4 or len(answer.strip()) > 20:
        return True
    # Количественные вопросы — как раньше
    quantitative_starts = [
        "как часто", "сколько раз", "были ли случаи", "когда", "часто ли", "бывает ли"
    ]
    if question:
        # Если question — объект, берем поле text
        if isinstance(question, dict):
            question_str = question.get("text", "")
        else:
            question_str = str(question)
        q_lower = question_str.lower()
        if any(q_lower.startswith(start) for start in quantitative_starts):
            if len(answer.strip()) > 2 and not any(c.isdigit() for c in answer):
                return True
    # Далее обычная AI-проверка
    prompt = (
        f"Вопрос: '{question}'\n" if question else ""
    ) + (
        f"Ответ: '{answer}'\n"
        "Оцени, является ли этот ответ осмысленным, логичным и соответствует ли он вопросу. "
        "Если ответ — это просто набор букв, бессмыслица или не по теме, ответь 'NO'. "
        "Если ответ содержит эмоции, личный опыт или объяснение, даже если он не очень длинный, ответь 'YES'. "
        "Если ответ короткий, но логичный и по делу (например, 'не часто', 'никогда', 'редко'), ответь 'YES'. "
        "Если ответ осмысленный, даже если он короткий, ответь 'YES'. "
        "Ответь только 'YES' если ответ осмысленный, иначе 'NO'."
    )
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "Ты — AI-бот для проверки качества ответов на опросы."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=3,
        temperature=0.0,
    )
    result = response.choices[0].message.content.strip().upper()
    return result == "YES"

def ai_generate_followup_question(topic, history, last_answer):
    dialog = ""
    for i, h in enumerate(history):
        dialog += f"Вопрос {i+1}: {h['question']}\nОтвет: {h['answer']}\n"
    last_q = history[-1]['question'] if history else ''
    prompt = (
        f"Тема опроса: {topic}\n"
        f"{dialog}"
        f"Последний вопрос: {last_q}\n"
        f"Последний ответ: {last_answer}\n"
        "Если последний ответ не осмысленный (например, набор букв, слишком короткий, бессмысленный), сформулируй персонализированную просьбу уточнить и расширить ответ. "
        "В этой просьбе обязательно укажи предыдущий вопрос и сам ответ пользователя, чтобы он понял, что именно нужно доработать. "
        "Попроси дать более развернутый, содержательный и осмысленный ответ. "
        "Если ответ осмысленный, сформулируй следующий уточняющий вопрос, чтобы глубже раскрыть тему или получить дополнительные детали. "
        "Если респондент уже дал исчерпывающий ответ, предложи подытожить или спроси о чувствах/эмоциях по теме."
    )
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "Ты — AI-бот для опросов."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=300,
        temperature=0.8,
    )
    return response.choices[0].message.content.strip()

def ai_analyze_answers(topic, history):
    answers = "\n".join([f"Вопрос: {h['question']}\nОтвет: {h['answer']}" for h in history])
    prompt = (
        f"Тема опроса: {topic}\n"
        f"{answers}\n"
        "Проанализируй ответы респондента: выдели эмоции, ключевые темы, проблемы и интересы. "
        "Сделай краткое резюме для заказчика опроса."
    )
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "Ты — AI-бот для анализа опросов."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=200,
        temperature=0.6,
    )
    return response.choices[0].message.content.strip()

def ai_generate_advanced_questions_for_context(context, n=6):
    prompt = (
        f"Ты — эксперт по созданию анкет и опросов. На основе следующей темы: '{context}', "
        f"сгенерируй {n} разнообразных вопросов для анкеты на русском языке, обязательно используя разные типы: "
        "multiple_choice (множественный выбор, всегда с 4-6 вариантами), "
        "rating (шкала 1-5, звёзды или сердечки), "
        "open_ended (открытый вопрос) или long_text (развёрнутый ответ). "
        "Сделай большинство вопросов типа multiple_choice и rating, вопросы с ручным вводом (open_ended, long_text) — не более 1-2 на весь опрос. "
        "Для каждого вопроса обязательно укажи: type (multiple_choice, rating, open_ended, long_text), text (текст вопроса), "
        "и если нужно — options (варианты для multiple_choice), scale (для rating, всегда 5), required (true/false). "
        "Пример:\n"
        "[{\"type\": \"multiple_choice\", \"text\": \"Ваш любимый цвет?\", \"options\": [\"Красный\", \"Синий\", \"Зелёный\", \"Жёлтый\"]},"
        "{\"type\": \"rating\", \"text\": \"Оцените качество сервиса\", \"scale\": 5},"
        "Верни только JSON-массив, без пояснений и текста вокруг. Вопросы должны быть максимально разнообразными по типу."
    )
    response = client.chat.completions.create(
        model="gpt-4.1",
        messages=[
            {"role": "system", "content": "Ты — AI-бот для опросов."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=1200,
        temperature=0.85,
    )
    content = response.choices[0].message.content.strip()
    # Try to extract JSON from the response
    try:
        start = content.find('[')
        end = content.rfind(']') + 1
        json_str = content[start:end]
        questions = json.loads(json_str)
        return questions[:n]
    except Exception:
        return []
