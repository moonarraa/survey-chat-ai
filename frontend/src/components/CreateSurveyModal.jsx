import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { BACKEND_URL } from '../config';

export default function CreateSurveyModal({ onSuccess }) {
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
        if (data.detail && data.detail.includes("уже есть активный опрос")) {
          setError("У вас уже есть активный опрос. Пожалуйста, архивируйте его в разделе 'Текущие' перед созданием нового.");
        } else {
          setError(data.detail || "Ошибка создания опроса");
        }
        setIsSubmitting(false);
        return;
      }
      const created = await res.json();
      if (onSuccess) {
        onSuccess();
      }
      navigate(`/dashboard/surveys/${created.id}/edit`);
    } catch {
      setError("Ошибка сети. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-2xl w-fit mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Создать новый опрос</h2>
        <p className="text-gray-600">AI автоматически сгенерирует вопросы на основе вашей цели</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-3 text-sm font-medium text-gray-700">
            Цель/контекст опроса
          </label>
          <textarea
            value={context}
            onChange={e => setContext(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400 min-h-[120px] resize-none"
            placeholder="Например: Оценка удовлетворенности студентов университетом, исследование потребностей клиентов, анализ работы команды..."
            rows={4}
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-2">
            Чем подробнее опишете цель, тем лучше будут вопросы
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <p className="text-red-600 text-sm">{error}</p>
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting || !context.trim()}
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              AI создает вопросы...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Создать опрос с AI
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}