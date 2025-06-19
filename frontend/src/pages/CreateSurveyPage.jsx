import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorModal from '../components/ErrorModal';
import { BACKEND_URL } from '../config';

const QUESTION_TYPES = [
  { value: "multiple_choice", label: "Multiple choice" },
  { value: "open_ended", label: "Open-ended" },
  { value: "ranking", label: "Ranking" },
  { value: "rating", label: "Rating" },
  { value: "image_choice", label: "Image choice" },
];

function getDefaultQuestion(type = "multiple_choice") {
  switch (type) {
    case "multiple_choice":
      return { type, text: "", options: ["", ""] };
    case "open_ended":
      return { type, text: "" };
    case "ranking":
      return { type, text: "", items: ["", "", ""] };
    case "rating":
      return { type, text: "", scale: 5 };
    case "image_choice":
      return { type, text: "", images: ["", ""] };
    default:
      return { type, text: "" };
  }
}

export default function CreateSurveyPage() {
  const [context, setContext] = useState("");
  const [questions, setQuestions] = useState([]);
  const [errorModal, setErrorModal] = useState({ open: false, title: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleTypeChange = (idx, type) => {
    setQuestions(qs => qs.map((q, i) => i === idx ? getDefaultQuestion(type) : q));
  };

  const handleTextChange = (idx, value) => {
    setQuestions(qs => qs.map((q, i) => i === idx ? { ...q, text: value } : q));
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    setQuestions(qs => qs.map((q, i) =>
      i === qIdx ? { ...q, options: q.options.map((o, j) => j === oIdx ? value : o) } : q
    ));
  };

  const handleAddOption = (qIdx) => {
    setQuestions(qs => qs.map((q, i) =>
      i === qIdx ? { ...q, options: [...q.options, ""] } : q
    ));
  };

  const handleRemoveOption = (qIdx, oIdx) => {
    setQuestions(qs => qs.map((q, i) =>
      i === qIdx ? { ...q, options: q.options.length > 2 ? q.options.filter((_, j) => j !== oIdx) : q.options } : q
    ));
  };

  const handleRankingItemChange = (qIdx, iIdx, value) => {
    setQuestions(qs => qs.map((q, i) =>
      i === qIdx ? { ...q, items: q.items.map((item, j) => j === iIdx ? value : item) } : q
    ));
  };

  const handleAddRankingItem = (qIdx) => {
    setQuestions(qs => qs.map((q, i) =>
      i === qIdx ? { ...q, items: [...q.items, ""] } : q
    ));
  };

  const handleRemoveRankingItem = (qIdx, iIdx) => {
    setQuestions(qs => qs.map((q, i) =>
      i === qIdx ? { ...q, items: q.items.length > 2 ? q.items.filter((_, j) => j !== iIdx) : q.items } : q
    ));
  };

  const handleScaleChange = (qIdx, value) => {
    setQuestions(qs => qs.map((q, i) =>
      i === qIdx ? { ...q, scale: Number(value) } : q
    ));
  };

  const handleImageChange = (qIdx, iIdx, value) => {
    setQuestions(qs => qs.map((q, i) =>
      i === qIdx ? { ...q, images: q.images.map((img, j) => j === iIdx ? value : img) } : q
    ));
  };

  const handleAddImage = (qIdx) => {
    setQuestions(qs => qs.map((q, i) =>
      i === qIdx ? { ...q, images: [...q.images, ""] } : q
    ));
  };

  const handleRemoveImage = (qIdx, iIdx) => {
    setQuestions(qs => qs.map((q, i) =>
      i === qIdx ? { ...q, images: q.images.length > 2 ? q.images.filter((_, j) => j !== iIdx) : q.images } : q
    ));
  };

  const addQuestion = () => setQuestions(qs => [...qs, getDefaultQuestion()]);
  const removeQuestion = idx => setQuestions(qs => qs.length > 1 ? qs.filter((_, i) => i !== idx) : qs);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorModal({ open: false, title: '', message: '' });
    if (!context.trim()) {
      setErrorModal({ open: true, title: 'Не заполнено', message: 'Заполните цель/контекст опроса.' });
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. Generate questions
      const resGen = await fetch(`${BACKEND_URL}/surveys/generate-questions-advanced`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, n: 5 })
      });
      if (!resGen.ok) {
        setErrorModal({ open: true, title: 'Ошибка генерации', message: 'Не удалось сгенерировать вопросы. Попробуйте позже.' });
        setIsSubmitting(false);
        return;
      }
      const dataGen = await resGen.json();
      const questions = dataGen.questions;
      if (!questions || questions.length === 0) {
        setErrorModal({ open: true, title: 'Ошибка AI', message: 'AI не смог сгенерировать вопросы. Попробуйте другую формулировку.' });
        setIsSubmitting(false);
        return;
      }
      // 2. Submit survey
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/surveys/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ topic: context, questions })
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login?expired=1';
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        setErrorModal({ open: true, title: 'Ошибка создания', message: data.detail || 'Ошибка создания опроса' });
        setIsSubmitting(false);
        return;
      }
      navigate("/dashboard");
    } catch (err) {
      setErrorModal({ open: true, title: 'Ошибка сети', message: 'Проверьте подключение к интернету и попробуйте ещё раз.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  function Spinner() {
    return (
      <span className="inline-block w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin align-middle ml-2"></span>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Создать новый опрос</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Цель/контекст опроса
            </label>
            <textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 mb-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 border-gray-300 hover:border-gray-400"
              placeholder="Например: Оценка удовлетворенности студентов университетом"
              rows={2}
              disabled={isSubmitting}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold transition-all duration-200 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <><Spinner /> Создание...</> : "Создать опрос"}
          </button>
        </form>
      </div>
      <ErrorModal open={errorModal.open} title={errorModal.title} message={errorModal.message} onClose={() => setErrorModal({ open: false, title: '', message: '' })} />
    </div>
  );
}
