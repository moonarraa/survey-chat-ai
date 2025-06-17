import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BACKEND_URL = "http://localhost:8000";

export default function SurveyDetailPage() {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSurvey() {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/surveys/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSurvey(data);
      } else {
        navigate("/dashboard");
      }
      setLoading(false);
    }
    fetchSurvey();
  }, [id, navigate]);

  if (loading) return <div className="p-8 text-center">Загрузка...</div>;
  if (!survey) return null;

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{survey.topic}</h2>
      <div className="mb-4 text-gray-500 text-sm">
        Создан: {new Date(survey.created_at).toLocaleString('ru-RU')}
      </div>
      <h3 className="text-lg font-semibold mb-2">Вопросы:</h3>
      <ul className="list-decimal pl-6 text-gray-800 mb-6">
        {survey.questions.map((q, idx) => (
          <li key={idx} className="mb-1">{q}</li>
        ))}
      </ul>
      <button
        className="btn-secondary"
        onClick={() => navigate("/dashboard")}
      >
        ← Назад к списку опросов
      </button>
    </div>
  );
}
