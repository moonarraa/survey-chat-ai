import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import QRCode from "react-qr-code";
import ErrorModal from '../components/ErrorModal';
import { getApiUrl } from '../config';
import { Plus, Trash2, BarChart2, Edit, Settings } from 'lucide-react';

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
  const [originalSurvey, setOriginalSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  const navigate = useNavigate();
  const [errorModal, setErrorModal] = useState({ open: false, title: '', message: '' });
  const [activeTab, setActiveTab] = useState('questions'); // 'questions', 'analytics', 'settings'

  useEffect(() => {
    async function fetchSurvey() {
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(getApiUrl(`surveys/${id}`), {
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
          setOriginalSurvey(JSON.parse(JSON.stringify(data)));
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

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(getApiUrl(`surveys/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topic: survey.topic,
          questions: survey.questions
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSurvey(data);
        setOriginalSurvey(JSON.parse(JSON.stringify(data)));
        setIsEditing(false);
      } else {
        const errorData = await res.json().catch(() => ({ detail: 'Не удалось сохранить изменения.' }));
        setErrorModal({ open: true, title: 'Ошибка сохранения', message: errorData.detail });
      }
    } catch {
      setErrorModal({ open: true, title: 'Ошибка сети', message: 'Проверьте подключение и попробуйте снова.' });
    }
  };

  const handleCancel = () => {
    setSurvey(originalSurvey);
    setIsEditing(false);
  };

  const handleQuestionChange = (qIndex, field, value) => {
    const newSurvey = { ...survey };
    if (field === 'type') {
      const oldQuestionText = newSurvey.questions[qIndex].text;
      newSurvey.questions[qIndex] = getDefaultQuestion(value);
      newSurvey.questions[qIndex].text = oldQuestionText;
    } else {
      newSurvey.questions[qIndex][field] = value;
    }
    setSurvey(newSurvey);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newSurvey = { ...survey };
    newSurvey.questions[qIndex].options[oIndex] = value;
    setSurvey(newSurvey);
  };
  
  const handleAddOption = (qIndex) => {
    const newSurvey = { ...survey };
    newSurvey.questions[qIndex].options.push("");
    setSurvey(newSurvey);
  };

  const handleRemoveOption = (qIndex, oIndex) => {
    const newSurvey = { ...survey };
    newSurvey.questions[qIndex].options.splice(oIndex, 1);
    setSurvey(newSurvey);
  };
  
  const handleAddQuestion = () => {
    const newSurvey = { ...survey };
    newSurvey.questions.push(getDefaultQuestion());
    setSurvey(newSurvey);
  };
  
  const handleRemoveQuestion = (qIndex) => {
    const newSurvey = { ...survey };
    newSurvey.questions.splice(qIndex, 1);
    setSurvey(newSurvey);
  };

  if (loading) return <div className="p-8 text-center">Загрузка...</div>;
  if (!survey) return null;

  const publicUrl = `${window.location.origin}/s/${survey.slug || survey.public_id}`;

  const renderEditView = () => (
    <div>
      {survey.questions.map((q, qIndex) => (
        <div key={qIndex} className="border rounded-xl p-4 mb-4 bg-gray-50 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Текст вопроса</label>
          <input
            type="text"
            value={q.text}
            onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md mb-2"
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">Тип вопроса</label>
          <select
            value={q.type}
            onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
          >
            {QUESTION_TYPES.map(qt => <option key={qt.value} value={qt.value}>{qt.label}</option>)}
          </select>

          {q.type === 'multiple_choice' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Варианты ответа</label>
              {q.options.map((opt, oIndex) => (
                <div key={oIndex} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                    className="flex-grow p-2 border border-gray-300 rounded-md"
                  />
                  <button onClick={() => handleRemoveOption(qIndex, oIndex)} className="p-2 text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button onClick={() => handleAddOption(qIndex)} className="btn-secondary text-sm">Добавить вариант</button>
            </div>
          )}

          {q.type === 'rating' && (
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Шкала (1-10)</label>
               <input
                type="number"
                min="2"
                max="10"
                value={q.scale || 5}
                onChange={(e) => handleQuestionChange(qIndex, 'scale', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          )}

          <button onClick={() => handleRemoveQuestion(qIndex)} className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-600">
            <Trash2 size={20}/>
          </button>
        </div>
      ))}
      <button onClick={handleAddQuestion} className="btn-primary w-full flex items-center justify-center gap-2">
        <Plus/> Добавить вопрос
      </button>
    </div>
  );

  const renderDisplayView = () => (
    <>
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
    </>
  );

  return (
    <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-lg border border-gray-200 w-full">
       <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 truncate" title={survey.topic}>{survey.topic}</h2>
        {/* Actions can go here */}
      </div>

       <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2 flex items-center gap-2 border-b-2 border-blue-500 text-blue-600`}
        >
          <Edit size={16} /> Вопросы
        </button>
         <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 flex items-center gap-2 ${activeTab === 'settings' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          <Settings size={16} /> Настройки
        </button>
      </div>

      {activeTab === 'questions' && (
        <>
          {isEditing ? renderEditView() : renderDisplayView()}
          <div className="mt-6 flex gap-4">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="btn-primary">Сохранить</button>
                <button onClick={handleCancel} className="btn-secondary">Отмена</button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="btn-primary">Редактировать</button>
            )}
          </div>
        </>
      )}

      {activeTab === 'settings' && (
        <div>
          <h2 className="text-xl font-bold">Настройки опроса</h2>
          {/* Settings content goes here */}
          <p>Раздел настроек в разработке.</p>
        </div>
      )}

      {showShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg relative w-full max-w-lg flex flex-col items-center">
            <button
              onClick={() => setShowShare(false)}
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              aria-label="Закрыть"
            >×</button>
            <div className="text-lg font-semibold mb-6 text-center">Публичная ссылка на опрос</div>
            <button
              className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition mb-8 text-lg"
              style={{ minWidth: 220 }}
              onClick={() => {navigator.clipboard.writeText(publicUrl); setCopySuccess('Скопировано!'); setTimeout(()=>setCopySuccess(''), 1500);}}
            >
              Копировать ссылку
            </button>
            {copySuccess && <span className="text-green-600 text-center w-full mb-4">{copySuccess}</span>}
            <div className="mb-2 text-gray-500">QR-код для быстрого доступа:</div>
            <div className="flex flex-col items-center gap-2">
              <QRCode id="qr-download" value={publicUrl} size={160} />
              <button
                className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-xl font-medium transition"
                onClick={() => {
                  const canvas = document.querySelector('#qr-download canvas');
                  if (canvas) {
                    const url = canvas.toDataURL('image/png');
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'survey-qr.png';
                    a.click();
                  }
                }}
              >
                Скачать QR
              </button>
            </div>
          </div>
        </div>
      )}
      <ErrorModal
        isOpen={errorModal.open}
        onClose={() => setErrorModal({ open: false, title: '', message: '' })}
        title={errorModal.title}
        message={errorModal.message}
      />
    </div>
  );
}
