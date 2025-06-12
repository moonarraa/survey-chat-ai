from dotenv import load_dotenv
load_dotenv()

import openai
import os

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

def ai_generate_followup_question(topic, history, last_answer):
    dialog = ""
    for i, h in enumerate(history):
        dialog += f"Вопрос {i+1}: {h['question']}\nОтвет: {h['answer']}\n"
    prompt = (
        f"Тема опроса: {topic}\n"
        f"{dialog}"
        f"Последний ответ: {last_answer}\n"
        "Сформулируй следующий уточняющий вопрос, чтобы глубже раскрыть тему или получить дополнительные детали. "
        "Если респондент уже дал исчерпывающий ответ, предложи подытожить или спроси о чувствах/эмоциях по теме."
    )
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "Ты — AI-бот для опросов."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=80,
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
