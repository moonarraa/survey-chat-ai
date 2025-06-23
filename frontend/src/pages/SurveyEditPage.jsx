import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import QRCode from "react-qr-code";
import ErrorModal from '../components/ErrorModal';
import { BACKEND_URL, getApiUrl } from '../config';

const QUESTION_TYPES = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "rating", label: "Rating" },
  { value: "ranking", label: "Ranking" },
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
    case "long_text":
      return { type, text: "" };
    default:
      return { type, text: "" };
  }
}

export default function SurveyEditPage({ id: propId, onClose }) {
  const params = useParams();
  const id = propId || params.id;
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("questions"); // 'questions', 'responses', 'share'
  const [copySuccess, setCopySuccess] = useState("");
  const [responses, setResponses] = useState([]);
  const [responseSearch, setResponseSearch] = useState("");
  const [responseFilter, setResponseFilter] = useState("all");
  const [responseDateFrom, setResponseDateFrom] = useState("");
  const [responseDateTo, setResponseDateTo] = useState("");
  const [errorModal, setErrorModal] = useState({ open: false, title: '', message: '' });
  const [showShare, setShowShare] = useState(false);

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
          setQuestions(data.questions);
          // Загружаем ответы, если есть public_id
          if (data.public_id) {
            const res2 = await fetch(getApiUrl(`surveys/s/${data.public_id}/answers`));
            if (res2.ok) {
              const answers = await res2.json();
              setResponses(answers);
            } else {
              setResponses([]);
            }
          }
        } else {
          navigate("/dashboard");
        }
      } catch {
        setErrorModal({ open: true, title: 'Ошибка сети', message: 'Проверьте подключение к интернету и попробуйте ещё раз.' });
      }
      setLoading(false);
    }
    fetchSurvey();
  }, [id, navigate]);

  const handleQuestionChange = (idx, field, value) => {
    setQuestions(qs =>
      qs.map((q, i) => {
        if (i !== idx) return q;
        if (field === "type") {
          const text = typeof q.text === "string" ? q.text : "";
          return { ...getDefaultQuestion(value), text };
        }
        return { ...q, [field]: value };
      })
    );
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    setQuestions(qs =>
      qs.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.map((o, j) => (j === oIdx ? value : o)) }
          : q
      )
    );
  };

  const handleAddOption = (qIdx) => {
    setQuestions(qs =>
      qs.map((q, i) =>
        i === qIdx ? { ...q, options: [...q.options, ""] } : q
      )
    );
  };

  const handleRemoveOption = (qIdx, oIdx) => {
    setQuestions(qs =>
      qs.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.length > 2 ? q.options.filter((_, j) => j !== oIdx) : q.options }
          : q
      )
    );
  };

  const handleRankingItemChange = (qIdx, iIdx, value) => {
    setQuestions(qs =>
      qs.map((q, i) =>
        i === qIdx
          ? { ...q, items: q.items.map((item, j) => (j === iIdx ? value : item)) }
          : q
      )
    );
  };

  const handleAddRankingItem = (qIdx) => {
    setQuestions(qs =>
      qs.map((q, i) =>
        i === qIdx ? { ...q, items: [...q.items, ""] } : q
      )
    );
  };

  const handleRemoveRankingItem = (qIdx, iIdx) => {
    setQuestions(qs =>
      qs.map((q, i) =>
        i === qIdx
          ? { ...q, items: q.items.length > 2 ? q.items.filter((_, j) => j !== iIdx) : q.items }
          : q
      )
    );
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(getApiUrl(`surveys/${id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ questions })
      });
      if (res.ok) {
        setSuccess("Изменения сохранены!");
        setSurvey(s => ({ ...s, questions }));
        setTimeout(() => navigate(`/dashboard`), 1000);
      } else {
        setErrorModal({ open: true, title: 'Ошибка сохранения', message: 'Не удалось сохранить изменения. Попробуйте позже.' });
      }
    } catch {
      setErrorModal({ open: true, title: 'Ошибка сети', message: 'Проверьте подключение к интернету и попробуйте ещё раз.' });
    }
  };

  // Drag and drop reorder
  function handleDragEnd(result) {
    if (!result.destination) return;
    const reordered = Array.from(questions);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setQuestions(reordered);
  }

  if (loading) return <div className="p-8 text-center">Загрузка...</div>;
  if (!survey) return null;

  const publicUrl = `${window.location.origin}/s/${survey.slug || survey.public_id}`;

  // Get unique respondent IDs for filter dropdown
  const respondentIds = Array.from(new Set(responses.map(r => r.respondent_id).filter(Boolean)));

  const filteredResponses = responses.filter(resp => {
    // Search: check if any answer contains the search string (case-insensitive)
    const search = responseSearch.trim().toLowerCase();
    if (search && !(resp.answers || []).some(ans => String(ans).toLowerCase().includes(search))) {
      return false;
    }
    // Respondent filter
    if (responseFilter !== "all" && resp.respondent_id !== responseFilter) {
      return false;
    }
    // Date filter
    if (responseDateFrom) {
      const created = resp.created_at ? new Date(resp.created_at) : null;
      if (!created || created < new Date(responseDateFrom)) return false;
    }
    if (responseDateTo) {
      const created = resp.created_at ? new Date(resp.created_at) : null;
      if (!created || created > new Date(responseDateTo + 'T23:59:59')) return false;
    }
    return true;
  });

  return (
    <div className="relative max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-8">
      {onClose && (
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-2 rounded-full"
          onClick={onClose}
          title="Закрыть"
        >
          <span className="text-2xl font-bold">×</span>
        </button>
      )}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold text-gray-900 break-words">{survey?.topic}</h2>
          {survey?.archived && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 flex-shrink-0">
              Архивирован
            </span>
          )}
        </div>
        {survey?.archived && (
          <p className="text-sm text-gray-500 mb-4">
            Этот опрос находится в архиве и доступен только для просмотра. Новые ответы не принимаются.
          </p>
        )}
        <div className="text-gray-500 text-sm">
          Создан: {survey?.created_at ? new Date(survey.created_at).toLocaleString('ru-RU') : ''}
        </div>
      </div>
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('questions')}
            className={`pb-3 font-medium transition-colors ${
              activeTab === 'questions'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Вопросы
          </button>
          <button
            onClick={() => setActiveTab('responses')}
            className={`pb-3 font-medium transition-colors ${
              activeTab === 'responses'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Все ответы
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`pb-3 font-medium transition-colors ${
              activeTab === 'share'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            disabled={survey?.archived}
            title={survey?.archived ? "Архивированным опросом нельзя делиться" : ""}
          >
            Поделиться
          </button>
        </nav>
      </div>
      {activeTab === 'questions' && (
        <>
          <h3 className="text-lg font-semibold mb-2">Вопросы:</h3>
          {success && <div className="text-green-600 mb-2">{success}</div>}
          <ErrorModal open={errorModal.open} title={errorModal.title} message={errorModal.message} onClose={() => setErrorModal({ open: false, title: '', message: '' })} />
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="questions-list">
              {(provided) => (
                <ul
                  className="list-decimal pl-6 text-gray-800 mb-6"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {questions.map((q, idx) => (
                    <Draggable key={idx} draggableId={String(idx)} index={idx}>
                      {(draggableProvided, snapshot) => (
                        <li
                          ref={draggableProvided.innerRef}
                          {...draggableProvided.draggableProps}
                          className={`mb-4 bg-white ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                        >
                          <span
                            {...draggableProvided.dragHandleProps}
                            className="cursor-move mr-2 inline-block align-top text-gray-400 select-none"
                            title="Перетащить вопрос"
                          >
                            ☰
                          </span>
                          <div className="border rounded-2xl p-4 sm:p-6 bg-white mb-2 shadow-md transition-all duration-200 hover:shadow-lg">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
                              <select
                                value={q.type}
                                onChange={e => handleQuestionChange(idx, "type", e.target.value)}
                                className="border rounded px-2 py-1 text-sm w-full sm:w-auto"
                              >
                                {QUESTION_TYPES.map(t => (
                                  <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                              </select>
                              <textarea
                                className="border rounded-xl px-4 py-3 w-full flex-1 min-h-[48px] max-h-40 resize-y bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-200 transition-all text-base shadow-sm"
                                value={q.text || ""}
                                onChange={e => handleQuestionChange(idx, "text", e.target.value)}
                                onBlur={e => handleQuestionChange(idx, "text", e.target.value)}
                                placeholder="Текст вопроса"
                                rows={2}
                              />
                            </div>
                            {q.type === "multiple_choice" && (
                              <div className="ml-2">
                                <div className="text-xs text-gray-500 mb-1">Варианты ответа:</div>
                                {(q.options ?? []).map((opt, oIdx) => (
                                  <div key={oIdx} className="flex items-center mb-1">
                                    <input
                                      className="border rounded px-2 py-1 flex-1"
                                      value={opt}
                                      onChange={e => handleOptionChange(idx, oIdx, e.target.value)}
                                    />
                                    <button
                                      type="button"
                                      className="ml-2 text-red-500 p-1"
                                      onClick={() => handleRemoveOption(idx, oIdx)}
                                      disabled={(q.options ?? []).length <= 2}
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  className="text-blue-600 text-xs mt-1"
                                  onClick={() => handleAddOption(idx)}
                                >
                                  + Add Option
                                </button>
                              </div>
                            )}
                            {q.type === "rating" && (
                              <div className="ml-2 flex items-center gap-2">
                                <label className="text-xs text-gray-500">Scale:</label>
                                <select
                                  value={q.scale || 5}
                                  onChange={e => handleQuestionChange(idx, "scale", Number(e.target.value))}
                                  className="border rounded px-2 py-1 text-sm"
                                >
                                  {[3, 5, 7, 10].map(n => (
                                    <option key={n} value={n}>{n}</option>
                                  ))}
                                </select>
                                <span className="text-xs text-gray-400">(звёзды/сердечки)</span>
                              </div>
                            )}
                            {q.type === "ranking" && (
                              <div className="ml-2">
                                <div className="text-xs text-gray-500 mb-1">Элементы для ранжирования:</div>
                                {(q.items ?? []).map((item, iIdx) => (
                                  <div key={iIdx} className="flex items-center mb-1">
                                    <input
                                      className="border rounded px-2 py-1 flex-1"
                                      value={item}
                                      onChange={e => handleRankingItemChange(idx, iIdx, e.target.value)}
                                    />
                                    <button
                                      type="button"
                                      className="ml-2 text-red-500 p-1"
                                      onClick={() => handleRemoveRankingItem(idx, iIdx)}
                                      disabled={(q.items ?? []).length <= 2}
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  className="text-blue-600 text-xs mt-1"
                                  onClick={() => handleAddRankingItem(idx)}
                                >
                                  + Add Item
                                </button>
                              </div>
                            )}
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <button className="btn-primary w-full sm:w-auto" onClick={handleSave}>Сохранить</button>
            <button className="btn-secondary w-full sm:w-auto" onClick={() => navigate(`/dashboard/surveys/${id}`)}>Отмена</button>
          </div>
        </>
      )}
      {activeTab === 'responses' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Все ответы</h3>
          <div className="mb-4 flex flex-col sm:flex-row flex-wrap gap-2 items-center">
            <input
              className="border rounded px-3 py-2 w-full sm:w-64"
              placeholder="Поиск по ответам..."
              value={responseSearch}
              onChange={e => setResponseSearch(e.target.value)}
            />
            <select
              className="border rounded px-2 py-2 w-full sm:w-auto"
              value={responseFilter}
              onChange={e => setResponseFilter(e.target.value)}
            >
              <option value="all">Все респонденты</option>
              {respondentIds.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <label className="text-sm text-gray-500">Дата с:</label>
              <input
                type="date"
                className="border rounded px-2 py-2"
                value={responseDateFrom}
                onChange={e => setResponseDateFrom(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <label className="text-sm text-gray-500">по:</label>
              <input
                type="date"
                className="border rounded px-2 py-2"
                value={responseDateTo}
                onChange={e => setResponseDateTo(e.target.value)}
              />
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            {(filteredResponses.length === 0) ? (
              <div className="text-gray-500 text-center py-8">Пока нет ни одного ответа на этот опрос.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1 bg-gray-100">#</th>
                      {questions.map((q, idx) => (
                        <th key={idx} className="border px-2 py-1 bg-gray-100">{typeof q === 'string' ? q : q.text || `Вопрос ${idx+1}`}</th>
                      ))}
                      <th className="border px-2 py-1 bg-gray-100">Респондент</th>
                      <th className="border px-2 py-1 bg-gray-100">Дата</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResponses.map((resp, rIdx) => (
                      <tr key={rIdx}>
                        <td className="border px-2 py-1 text-gray-400">{rIdx + 1}</td>
                        {(resp.answers || []).map((ans, aIdx) => (
                          <td key={aIdx} className="border px-2 py-1">{ans}</td>
                        ))}
                        <td className="border px-2 py-1 text-gray-500">{resp.respondent_id || '-'}</td>
                        <td className="border px-2 py-1 text-gray-500">{resp.created_at ? new Date(resp.created_at).toLocaleString('ru-RU') : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === 'share' && !survey?.archived && (
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="text-lg font-semibold text-center">Публичная ссылка на опрос:</div>
          <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
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
            {copySuccess && <span className="text-green-600 ml-2 text-center w-full sm:w-auto mt-2 sm:mt-0">{copySuccess}</span>}
          </div>
          <div className="mt-4 flex flex-col items-center">
            <div className="mb-2 text-gray-500">QR-код для быстрого доступа:</div>
            <QRCode value={publicUrl} size={160} />
          </div>
        </div>
      )}
      {activeTab === 'share' && survey?.archived && (
        <div className="text-center py-8 text-gray-500">
          <p>Архивированным опросом нельзя делиться.</p>
          <p>Восстановите опрос из архива, чтобы снова начать принимать ответы.</p>
        </div>
      )}
    </div>
  );
}
