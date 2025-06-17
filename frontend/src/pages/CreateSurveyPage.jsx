import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "http://localhost:8000";

export default function CreateSurveyPage() {
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState(["", "", ""]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleQuestionChange = (idx, value) => {
    setQuestions(qs => qs.map((q, i) => (i === idx ? value : q)));
  };

  const addQuestion = () => setQuestions(qs => [...qs, ""]);
  const removeQuestion = idx => setQuestions(qs => qs.length > 3 ? qs.filter((_, i) => i !== idx) : qs);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!topic.trim() || questions.some(q => !q.trim())) {
      setError("Заполните все поля и вопросы.");
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/surveys/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ topic, questions })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Ошибка создания опроса");
        setIsSubmitting(false);
        return;
      }
      navigate("/dashboard");
    } catch (err) {
      setError("Ошибка сети. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Создать новый опрос</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Тема/цель опроса</label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 border-gray-300 hover:border-gray-400"
              placeholder="Например: Удовлетворенность сотрудников удаленной работой"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Вопросы (3-5)</label>
            {questions.map((q, idx) => (
              <div key={idx} className="flex items-center mb-2">
                <input
                  type="text"
                  value={q}
                  onChange={e => handleQuestionChange(idx, e.target.value)}
                  className="flex-1 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 border-gray-300 hover:border-gray-400"
                  placeholder={`Вопрос ${idx + 1}`}
                  required
                />
                {questions.length > 3 && (
                  <button type="button" onClick={() => removeQuestion(idx)} className="ml-2 text-red-500 text-sm">Удалить</button>
                )}
              </div>
            ))}
            {questions.length < 5 && (
              <button type="button" onClick={addQuestion} className="mt-2 text-blue-600 text-sm">+ Добавить вопрос</button>
            )}
          </div>
          {error && <div className="text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold transition-all duration-200 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Создание..." : "Создать опрос"}
          </button>
        </form>
      </div>
    </div>
  );
}
