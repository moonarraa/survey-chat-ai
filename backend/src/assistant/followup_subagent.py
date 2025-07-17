import os
from openai import AzureOpenAI
from .openai_assistant import ai_is_meaningful_answer

# Set up a client for gpt-4.1-mini
client = AzureOpenAI(
    api_version="2025-01-01-preview",
    azure_endpoint="https://surveyai-resource.openai.azure.com/",
    api_key=os.getenv("AZURE_OPENAI_KEY"),
)

def generate_followup_with_gpt41mini(topic, question, answer, history):
    """
    Use gpt-4.1-mini to generate a follow-up or clarification prompt.
    """
    prompt = (
        f"Тема опроса: {topic}\n"
        f"Вопрос: {question}\n"
        f"Ответ пользователя: {answer}\n"
        "Ответ не осмысленный или слишком короткий. "
        "Сформулируй вежливую, персонализированную просьбу уточнить и расширить ответ, "
        "ссылаясь на сам вопрос и ответ пользователя. "
        "Попроси дать более развернутый, содержательный и осмысленный ответ."
    )
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": "Ты — AI-бот для опросов."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=120,
        temperature=0.7,
    )
    return response.choices[0].message.content.strip()


def followup_subagent(topic, question, answer, history, session, followup_limit=2):
    """
    Checks if a follow-up is needed for open_ended/long_text questions and generates it if so.
    Args:
        topic: str
        question: dict (must have 'type' and 'text')
        answer: str
        history: list of previous Q&A
        session: dict-like, must support get/set for 'followup_count'
        followup_limit: int, max number of followups per session
    Returns:
        dict: {'action': 'followup', 'message': ...} or {'action': 'next'}
    """
    qtype = question.get('type')
    if qtype in ("open_ended", "long_text"):
        followup_count = session.get('followup_count', 0)
        if followup_count < followup_limit:
            if not ai_is_meaningful_answer(answer, question):
                followup = generate_followup_with_gpt41mini(
                    topic, question.get('text', ''), answer, history
                )
                session['followup_count'] = followup_count + 1
                return {
                    'action': 'followup',
                    'message': followup,
                    'session': session
                }
    # Otherwise, proceed to next question
    return {
        'action': 'next',
        'session': session
    } 