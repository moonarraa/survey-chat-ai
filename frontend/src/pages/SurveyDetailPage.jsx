import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import QRCode from "react-qr-code";
import ErrorModal from '../components/ErrorModal';
import { BACKEND_URL } from '../config';

const QUESTION_TYPES = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "rating", label: "Rating" },
  { value: "ranking", label: "Ranking" },
  { value: "image_choice", label: "Image Choice" },
  { value: "open_ended", label: "Open-ended" },
  { value: "long_text", label: "Long text" },
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

export default function SurveyDetailPage({ id, onClose }) {
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  const navigate = useNavigate();
  const [errorModal, setErrorModal] = useState({ open: false, title: '', message: '' });

  useEffect(() => {
    async function fetchSurvey() {
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${BACKEND_URL}/surveys/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login?expired=1';
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setSurvey(data);
        } else if (res.status === 404) {
          setErrorModal({ open: true, title: 'Опрос не найден', message: 'Возможно, ссылка устарела или опрос был удалён.' });
        } else {
          setErrorModal({ open: true, title: 'Ошибка сервера', message: 'Не удалось загрузить опрос. Попробуйте позже.' });
        }
      } catch {
        setErrorModal({ open: true, title: 'Ошибка сети', message: 'Проверьте подключение к интернету и попробуйте ещё раз.' });
      }
      setLoading(false);
    }
    fetchSurvey();
  }, [id, navigate]);

  if (loading) return <div className="p-8 text-center">Загрузка...</div>;
  if (!survey) return null;

  const publicUrl = `${window.location.origin}/s/${survey.slug || survey.public_id}`;

  return (
    <div className="relative max-w-2xl mx-auto my-4 sm:my-10 bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-8">
      {onClose && (
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-2 rounded-full"
          onClick={onClose}
          title="Закрыть"
        >×</button>
      )}
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{survey.topic}</h2>
      <div className="mb-4 text-gray-500 text-sm">
        Создан: {new Date(survey.created_at).toLocaleString('ru-RU')}
      </div>
      <h3 className="text-lg font-semibold mb-2">Вопросы:</h3>
      <ul className="list-decimal pl-6 text-gray-800 mb-6">
        {survey.questions && survey.questions.map((q, idx) => (
          <li key={idx} className="mb-4 bg-white">
            <div className="border rounded-xl p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-500 uppercase">
                  {q.type === 'multiple_choice' ? 'Multiple Choice' : q.type === 'rating' ? 'Rating' : q.type === 'ranking' ? 'Ranking' : q.type === 'image_choice' ? 'Image Choice' : 'Open-ended'}
                </span>
              </div>
              <div className="font-medium mb-2">{q.text || ""}</div>
              {q.type === "multiple_choice" && q.options && (
                <ul className="pl-4 list-disc text-sm text-gray-700">
                  {q.options.map((opt, oIdx) => (
                    <li key={oIdx}>{opt}</li>
                  ))}
                </ul>
              )}
              {q.type === "rating" && (
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(q.scale || 5)].map((_, i) => (
                    <span key={i} className="inline-block w-6 h-6 text-yellow-400">★</span>
                  ))}
                  <span className="ml-2 text-xs text-gray-500">Шкала: 1–{q.scale || 5}</span>
                </div>
              )}
              {q.type === "ranking" && q.items && (
                <ol className="pl-4 list-decimal text-sm text-gray-700">
                  {q.items.map((item, iIdx) => (
                    <li key={iIdx}>{item}</li>
                  ))}
                </ol>
              )}
              {q.type === "image_choice" && q.images && (
                <div className="flex gap-2 mt-2">
                  {q.images.map((img, iIdx) => (
                    <div key={iIdx} className="flex flex-col items-center">
                      <img src={img.url} alt={img.label} className="w-16 h-16 object-cover rounded" />
                      <span className="text-xs text-gray-600 mt-1">{img.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-2">
        <Link to={`/dashboard/surveys/${survey.id}/edit`} className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-base px-6 py-3 rounded-xl shadow hover:shadow-md transition">
          <span role="img" aria-label="edit">✏️</span> Редактировать
        </Link>
        <button
          className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 text-base px-6 py-3 rounded-xl shadow hover:shadow-md transition"
          onClick={() => navigate("/dashboard")}
        >
          <span role="img" aria-label="back">←</span> Назад к списку опросов
        </button>
        <button
          className="bg-primary-600 text-white w-full sm:w-auto px-6 py-3 rounded-xl font-semibold shadow hover:bg-primary-700 hover:shadow-lg transition flex items-center justify-center gap-2"
          onClick={() => setShowShare(true)}
        >
          <span role="img" aria-label="share">🔗</span> Поделиться
        </button>
      </div>
      {showShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg relative w-full max-w-lg flex flex-col items-center">
            <button
              onClick={() => setShowShare(false)}
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              aria-label="Закрыть"
            >×</button>
            <div className="text-lg font-semibold mb-4 text-center">Публичная ссылка на опрос:</div>
            <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-6">
              <input
                className="border rounded px-3 py-2 w-full sm:flex-1 text-gray-700 bg-gray-50"
                value={publicUrl}
                readOnly
              />
              <button
                className="bg-primary-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-700 transition flex-shrink-0"
                onClick={() => {navigator.clipboard.writeText(publicUrl); setCopySuccess('Скопировано!'); setTimeout(()=>setCopySuccess(''), 1500);}}
              >
                Копировать
              </button>
              {copySuccess && <span className="text-green-600 text-center w-full sm:w-auto mt-2 sm:mt-0 sm:ml-2">{copySuccess}</span>}
            </div>
            <div className="mb-2 text-gray-500">QR-код для быстрого доступа:</div>
            <QRCode value={publicUrl} size={160} />
          </div>
        </div>
      )}
      <ErrorModal open={errorModal.open} title={errorModal.title} message={errorModal.message} onClose={() => setErrorModal({ open: false, title: '', message: '' })} />
    </div>
  );
}
