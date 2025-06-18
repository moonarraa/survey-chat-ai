import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "http://localhost:8000";

export default function CreateSurveyModal() {
  const [context, setContext] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!context.trim()) {
      setError("Заполните цель/контекст опроса.");
      return;
    }
    setIsSubmitting(true);
    try {
      const resGen = await fetch(`${BACKEND_URL}/surveys/generate-questions-advanced`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, n: 6 })
      });
      if (!resGen.ok) {
        setError("Ошибка генерации вопросов. Попробуйте позже.");
        setIsSubmitting(false);
        return;
      }
      const dataGen = await resGen.json();
      const questions = dataGen.questions;
      if (!questions || questions.length === 0) {
        setError("AI не смог сгенерировать вопросы. Попробуйте другую формулировку.");
        setIsSubmitting(false);
        return;
      }
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/surveys/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ topic: context, questions })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Ошибка создания опроса");
        setIsSubmitting(false);
        return;
      }
      const created = await res.json();
      navigate(`/survey/${created.id}`);
    } catch {
      setError("Ошибка сети. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Создать новый опрос</h2>
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Цель/контекст опроса
        </label>
        <textarea
          value={context}
          onChange={e => setContext(e.target.value)}
          className="w-full border rounded-xl px-4 py-3 mb-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 border-gray-300 hover:border-gray-400 min-h-[120px]"
          placeholder="Например: Оценка удовлетворенности студентов университетом"
          rows={5}
          disabled={isSubmitting}
        />
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
  );
}
