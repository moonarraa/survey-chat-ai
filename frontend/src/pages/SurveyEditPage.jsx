import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import QRCode from "react-qr-code";
import ErrorModal from '../components/ErrorModal';
import { BACKEND_URL, getApiUrl } from '../config';
import Select from '../components/Select';
import { motion } from 'framer-motion';
import { Star, List, Image as ImageIcon, MessageCircle, AlignLeft, Copy } from 'lucide-react';
import { createPortal } from 'react-dom';

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

const typeStyles = {
  multiple_choice: 'from-blue-100 to-blue-50 border-blue-200',
  rating: 'from-yellow-100 to-yellow-50 border-yellow-200',
  ranking: 'from-green-100 to-green-50 border-green-200',
  open_ended: 'from-purple-100 to-purple-50 border-purple-200',
  long_text: 'from-gray-100 to-gray-50 border-gray-200',
};

const typeIcons = {
  multiple_choice: List,
  rating: Star,
  ranking: List,
  open_ended: MessageCircle,
  long_text: AlignLeft,
};

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
  const qrRef = useRef(null);

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
    <>
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
                    {questions.map((q, idx) => {
                      const Icon = typeIcons[q.type] || List;
                      return (
                        <Draggable key={idx} draggableId={String(idx)} index={idx}>
                          {(draggableProvided, snapshot) => (
                            <motion.li
                              ref={draggableProvided.innerRef}
                              {...draggableProvided.draggableProps}
                              initial={{ opacity: 0, y: 30 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: idx * 0.08 }}
                              className={`mb-6 list-none`}
                            >
                              <motion.div
                                className={`relative rounded-2xl shadow-lg border-2 bg-gradient-to-br ${typeStyles[q.type] || 'from-gray-50 to-white border-gray-200'} p-6 hover:scale-[1.01] hover:shadow-2xl transition-transform duration-300`}
                              >
                                <div className="flex items-center gap-3 mb-2">
                                  <span {...draggableProvided.dragHandleProps} className="cursor-move select-none inline-flex items-center justify-center rounded-full p-2 bg-white shadow border border-gray-200 mr-2" title="Перетащить вопрос">☰</span>
                                  <span className={`inline-flex items-center justify-center rounded-full p-2 bg-white shadow border ${typeStyles[q.type]?.split(' ')[2] || 'border-gray-200'}`}> 
                                    <Icon className={`w-6 h-6 ${q.type === 'rating' ? 'text-yellow-400' : 'text-blue-500'}`} />
                                  </span>
                                  <span className="uppercase text-xs font-bold tracking-wider text-gray-500">{QUESTION_TYPES.find(t => t.value === q.type)?.label || q.type}</span>
                                </div>
                                <textarea
                                  className="border-none rounded-xl px-4 py-3 w-full flex-1 min-h-[48px] max-h-40 resize-y bg-white focus:bg-blue-50 focus:ring-2 focus:ring-primary-200 transition-all text-base shadow-sm font-semibold mb-4"
                                  value={q.text || ""}
                                  onChange={e => handleQuestionChange(idx, "text", e.target.value)}
                                  placeholder="Текст вопроса"
                                  rows={2}
                                />
                                <Select
                                  value={q.type}
                                  onValueChange={value => handleQuestionChange(idx, "type", value)}
                                  options={QUESTION_TYPES}
                                  placeholder="Тип вопроса"
                                  className="w-full mb-4"
                                />
                                {q.type === "multiple_choice" && (
                                  <div className="mt-2">
                                    <div className="text-xs text-gray-500 mb-1">Варианты ответа:</div>
                                    <ul className="space-y-2">
                                      {(q.options ?? []).map((opt, oIdx) => (
                                        <motion.li
                                          key={oIdx}
                                          initial={{ opacity: 0, x: 20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ duration: 0.4, delay: oIdx * 0.05 }}
                                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 shadow-sm hover:bg-blue-100 transition"
                                        >
                                          <input
                                            className="flex-1 bg-transparent border-none outline-none text-base"
                                            value={opt}
                                            onChange={e => handleOptionChange(idx, oIdx, e.target.value)}
                                            placeholder={`Вариант ${oIdx + 1}`}
                                          />
                                          <button
                                            type="button"
                                            className="ml-2 text-red-500 p-1 hover:text-red-700"
                                            onClick={() => handleRemoveOption(idx, oIdx)}
                                            disabled={(q.options ?? []).length <= 2}
                                          >
                                            ×
                                          </button>
                                        </motion.li>
                                      ))}
                                    </ul>
                                    <button
                                      type="button"
                                      className="text-blue-600 text-xs mt-2 hover:underline font-semibold"
                                      onClick={() => handleAddOption(idx)}
                                    >
                                      + Добавить вариант
                                    </button>
                                  </div>
                                )}
                                {q.type === "rating" && (
                                  <div className="mt-2 flex items-center gap-2">
                                    <label className="text-xs text-gray-500">Шкала:</label>
                                    <Select
                                      value={q.scale?.toString() || '5'}
                                      onValueChange={v => handleQuestionChange(idx, "scale", Number(v))}
                                      options={[3,5,7,10].map(n => ({ value: n.toString(), label: n.toString() }))}
                                      placeholder="Шкала"
                                      className="w-24"
                                    />
                                    <span className="text-xs text-yellow-600">(звёзды/сердечки)</span>
                                  </div>
                                )}
                                {q.type === "ranking" && (
                                  <div className="mt-2">
                                    <div className="text-xs text-gray-500 mb-1">Элементы для ранжирования:</div>
                                    <ul className="space-y-2">
                                      {(q.items ?? []).map((item, iIdx) => (
                                        <motion.li
                                          key={iIdx}
                                          initial={{ opacity: 0, x: 20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ duration: 0.4, delay: iIdx * 0.05 }}
                                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 border border-green-100 text-green-900 shadow-sm hover:bg-green-100 transition"
                                        >
                                          <input
                                            className="flex-1 bg-transparent border-none outline-none text-base"
                                            value={item}
                                            onChange={e => handleRankingItemChange(idx, iIdx, e.target.value)}
                                            placeholder={`Элемент ${iIdx + 1}`}
                                          />
                                          <button
                                            type="button"
                                            className="ml-2 text-red-500 p-1 hover:text-red-700"
                                            onClick={() => handleRemoveRankingItem(idx, iIdx)}
                                            disabled={(q.items ?? []).length <= 2}
                                          >
                                            ×
                                          </button>
                                        </motion.li>
                                      ))}
                                    </ul>
                                    <button
                                      type="button"
                                      className="text-green-600 text-xs mt-2 hover:underline font-semibold"
                                      onClick={() => handleAddRankingItem(idx)}
                                    >
                                      + Добавить элемент
                                    </button>
                                  </div>
                                )}
                                {q.type === "open_ended" && (
                                  <div className="mt-2 px-4 py-2 rounded-xl bg-purple-50 border border-purple-100 text-purple-900 shadow-sm">
                                    Открытый вопрос (ответ в свободной форме)
                                  </div>
                                )}
                                {q.type === "long_text" && (
                                  <div className="mt-2 px-4 py-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-700 shadow-sm">
                                    Ответ в свободной форме
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuestion(idx)}
                                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-600"
                                  title="Удалить вопрос"
                                >
                                  ×
                                </button>
                              </motion.div>
                            </motion.li>
                          )}
                        </Draggable>
                      );
                    })}
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
            <div className="mb-4 flex flex-col sm:flex-row flex-wrap gap-4 items-center">
              <input
                className="border rounded-xl px-3 py-2 w-full sm:w-auto sm:flex-1"
                placeholder="Поиск по ответам..."
                value={responseSearch}
                onChange={e => setResponseSearch(e.target.value)}
              />
              <select
                className="border rounded-xl px-2 py-2 w-full sm:w-auto"
                value={responseFilter}
                onChange={e => setResponseFilter(e.target.value)}
              >
                <option value="all">Все респонденты</option>
                {respondentIds.map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-sm text-gray-500 whitespace-nowrap">Дата с:</label>
                <input
                  type="date"
                  className="border rounded-xl px-2 py-2 w-full"
                  value={responseDateFrom}
                  onChange={e => setResponseDateFrom(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-sm text-gray-500">по:</label>
                <input
                  type="date"
                  className="border rounded-xl px-2 py-2 w-full"
                  value={responseDateTo}
                  onChange={e => setResponseDateTo(e.target.value)}
                />
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-2 sm:p-4 border border-gray-100">
              {(filteredResponses.length === 0) ? (
                <div className="text-gray-500 text-center py-8">Пока нет ни одного ответа на этот опрос.</div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full border text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border px-2 py-2">#</th>
                          {questions.map((q, idx) => (
                            <th key={idx} className="border px-3 py-2 text-left font-medium text-gray-600">{typeof q === 'string' ? q : q.text || `Вопрос ${idx+1}`}</th>
                          ))}
                          <th className="border px-3 py-2 text-left font-medium text-gray-600">Респондент</th>
                          <th className="border px-3 py-2 text-left font-medium text-gray-600">Дата</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {filteredResponses.map((resp, rIdx) => (
                          <tr key={rIdx} className="hover:bg-gray-50 transition-colors">
                            <td className="border px-2 py-2 text-gray-400 text-center">{rIdx + 1}</td>
                            {(resp.answers || []).map((ans, aIdx) => (
                              <td key={aIdx} className="border px-3 py-2">{String(ans)}</td>
                            ))}
                            <td className="border px-3 py-2 text-gray-500">{resp.respondent_id || '-'}</td>
                            <td className="border px-3 py-2 text-gray-500">{resp.created_at ? new Date(resp.created_at).toLocaleString('ru-RU') : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4">
                    {filteredResponses.map((resp, rIdx) => (
                      <div key={rIdx} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-100">
                          <div>
                            <span className="font-semibold text-gray-800">Ответ #{rIdx + 1}</span>
                            {resp.respondent_id && <span className="block text-xs text-gray-500 mt-1">(ID: {resp.respondent_id})</span>}
                          </div>
                          <div className="text-xs text-gray-500 whitespace-nowrap">{resp.created_at ? new Date(resp.created_at).toLocaleDateString('ru-RU') : '-'}</div>
                        </div>
                        <div className="space-y-3 text-sm">
                          {questions.map((q, qIdx) => (
                            <div key={qIdx}>
                              <div className="font-medium text-gray-600 mb-1">{q.text || `Вопрос ${qIdx + 1}`}</div>
                              <div className="text-gray-800 pl-2 border-l-2 border-primary-200 bg-primary-50/50 py-1">{String(resp.answers[qIdx]) || '-'}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {activeTab === 'share' && !survey?.archived && (
          <div className="flex flex-col items-center gap-8 py-12">
            <div className="text-lg font-semibold text-center mb-2">Публичная ссылка на опрос</div>
            <button
              className="relative bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-primary-700 transition flex items-center gap-3 focus:outline-none focus:ring-4 focus:ring-primary-300"
              onClick={() => {navigator.clipboard.writeText(publicUrl); setCopySuccess('Ссылка скопирована!'); setTimeout(()=>setCopySuccess(''), 1500);}}
              style={{minWidth: 260}}
            >
              <Copy className="w-6 h-6" />
              Скопировать ссылку
              {copySuccess && (
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-xl shadow text-base animate-fade-in">
                  {copySuccess}
                </span>
              )}
            </button>
            <div className="mt-6 flex flex-col items-center">
              <div className="mb-2 text-gray-500">QR-код для быстрого доступа:</div>
              <QRCode ref={qrRef} value={publicUrl} size={160} />
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
    </>
  );
}
