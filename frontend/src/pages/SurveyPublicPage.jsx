import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

const BACKEND_URL = "http://localhost:8000";
const MAX_QUESTIONS = 5; // fallback limit

export default function SurveyPublicPage() {
  const { public_id } = useParams();
  const [topic, setTopic] = useState("");
  const [chat, setChat] = useState([]); // [{question, answer}]
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Fetch initial topic and first question
  useEffect(() => {
    async function fetchSurvey() {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/surveys/s/${public_id}`);
      if (res.ok) {
        const data = await res.json();
        setTopic(data.topic);
        setQuestions(data.questions);
        setCurrentIdx(0);
        setCurrentQuestion(data.questions[0]);
      } else {
        setError("Опрос не найден или недоступен.");
      }
      setLoading(false);
    }
    fetchSurvey();
  }, [public_id]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (error) setError(""); // Clear error on new input
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentQuestion) return;
    const newChat = [...chat, { question: currentQuestion, answer: input }];
    setChat(newChat);
    setInput("");
    setSubmitting(true);

    // Просто переходи к следующему вопросу из списка
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
      setCurrentQuestion(questions[currentIdx + 1]);
    } else {
      await handleSubmit(newChat);
      setCurrentQuestion("");
    }
    setSubmitting(false);
  };

  const handleSubmit = async (finalChat = chat) => {
    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/surveys/s/${public_id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalChat.map(c => c.answer) })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok === false && data.message) {
          setError(data.message);
          setSubmitting(false);
          return;
        }
        setSubmitted(true);
        setCurrentQuestion("");
      } else {
        setError("Ошибка при отправке ответа.");
      }
    } catch {
      setError("Ошибка сети.");
    }
    setSubmitting(false);
  };

  if (loading) return <div className="p-8 text-center">Загрузка...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto mt-10 bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Спасибо за участие!</h2>
        <p className="text-gray-600">Ваши ответы успешно отправлены.</p>
      </div>
    );
  }

  // Chat bubbles for Q&A
  const chatHistory = [];
  for (let i = 0; i < chat.length; i++) {
    chatHistory.push(
      <div key={`q${i}`} className="flex mb-2">
        <div className="bg-gray-100 rounded-xl px-4 py-2 max-w-[80%] text-gray-900">
          <span className="font-semibold">Вопрос {i + 1}:</span> {typeof chat[i].question === 'string' ? chat[i].question : chat[i].question?.text || ""}
        </div>
      </div>
    );
    chatHistory.push(
      <div key={`a${i}`} className="flex justify-end mb-4">
        <div className="bg-blue-500 text-white rounded-xl px-4 py-2 max-w-[80%]">
          {chat[i].answer}
        </div>
      </div>
    );
  }

  // Simple spinner component
  function Spinner() {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-blue-500 text-sm">AI думает...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-2">
      <div className="w-[700px] h-[600px] bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col justify-between p-0">
        <div className="px-12 pt-10 pb-4 border-b border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-1 text-center">{topic}</h2>
        </div>
        <div className="px-12 py-8 flex-1 flex flex-col">
          <div className="overflow-y-auto h-[300px] pr-2">
            {chatHistory}
            {currentQuestion && (
              <>
                <div className="flex mb-2">
                  <div className="bg-gray-100 rounded-xl px-4 py-2 max-w-[80%] text-gray-900">
                    <span className="font-semibold">Вопрос {chat.length + 1}:</span> {typeof currentQuestion === 'string' ? currentQuestion : currentQuestion?.text || ""}
                  </div>
                </div>
                {/* Options/buttons/input for current question */}
                {typeof currentQuestion === 'object' && currentQuestion.type === 'multiple_choice' && (
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {(currentQuestion.options ?? []).map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`btn-secondary ${input === opt ? 'bg-blue-500 text-white' : ''}`}
                        onClick={() => setInput(opt)}
                        disabled={submitting}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
                {typeof currentQuestion === 'object' && currentQuestion.type === 'rating' && (
                  <div className="flex gap-2 justify-center mb-4">
                    {Array.from({ length: currentQuestion.scale || 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`btn-secondary ${input === String(i + 1) ? 'bg-yellow-400 text-white' : ''}`}
                        onClick={() => setInput(String(i + 1))}
                        disabled={submitting}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
                {typeof currentQuestion === 'object' && currentQuestion.type === 'image_choice' && (
                  <div className="flex gap-2 justify-center mb-4">
                    {(currentQuestion.images ?? []).map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`flex flex-col items-center btn-secondary ${input === img.label ? 'bg-blue-500 text-white' : ''}`}
                        onClick={() => setInput(img.label)}
                        disabled={submitting}
                      >
                        <img src={img.url} alt={img.label} className="w-16 h-16 object-cover rounded" />
                        <span className="text-xs mt-1">{img.label}</span>
                      </button>
                    ))}
                  </div>
                )}
                {typeof currentQuestion === 'object' && currentQuestion.type === 'ranking' && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-1">Выберите порядок (реализовать drag-n-drop для UX):</div>
                    {(currentQuestion.items ?? []).map((item, i) => (
                      <div key={i} className="mb-1">{i + 1}. {item}</div>
                    ))}
                  </div>
                )}
                {/* Input field for all types except button-only */}
                {((typeof currentQuestion === 'object' && ['ranking', 'open_ended', 'long_text'].includes(currentQuestion.type)) || typeof currentQuestion === 'string') && (
                  <input
                    className="flex-1 border rounded-xl px-4 py-3 w-full mb-4"
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder={typeof currentQuestion === 'object' && currentQuestion.type === 'ranking' ? "Введите порядок через запятую, например: 2,1,3" : "Ваш ответ..."}
                    autoFocus
                    disabled={submitting}
                  />
                )}
                {/* Submit button and error */}
                <form className="flex items-center gap-2 mb-2" onSubmit={handleSend}>
                  <button
                    className="btn-primary w-full"
                    type="submit"
                    disabled={!input.trim() || submitting}
                  >
                    Далее
                  </button>
                </form>
                {error && (
                  <div className="pb-4 text-red-600 text-sm text-center mt-2">{error}</div>
                )}
              </>
            )}
            {/* Show spinner when waiting for AI response and not in thank you state */}
            {submitting && !submitted && <Spinner />}
          </div>
        </div>
        {/* The area below the chat is now empty or just for layout */}
        <div className="px-12 pb-8 pt-2 border-t border-gray-100 bg-white"></div>
      </div>
    </div>
  );
}
