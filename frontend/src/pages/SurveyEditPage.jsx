import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import QRCode from "react-qr-code";

const BACKEND_URL = "http://localhost:8000";

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
      return { type, text: "", images: [{ url: "", label: "" }, { url: "", label: "" }] };
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

  useEffect(() => {
    async function fetchSurvey() {
      setLoading(true);
      const token = localStorage.getItem("token");
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
        setQuestions(data.questions);
        // Загружаем ответы, если есть public_id
        if (data.public_id) {
          const res2 = await fetch(`${BACKEND_URL}/surveys/s/${data.public_id}/answers`);
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
      const res = await fetch(`${BACKEND_URL}/surveys/${id}`, {
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
        setError("Ошибка при сохранении изменений");
      }
    } catch {
      setError("Ошибка сети");
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

  const publicUrl = `${window.location.origin}/s/${survey.public_id}`;

  return (
    <div className="relative max-w-3xl mx-auto mt-10 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      {onClose && (
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          title="Закрыть"
        >×</button>
      )}
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{survey.topic}</h2>
      <div className="mb-4 text-gray-500 text-sm">
        Создан: {new Date(survey.created_at).toLocaleString('ru-RU')}
      </div>
      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-gray-200 mb-6 px-2">
        <button
          className={`pb-2 font-semibold text-lg transition-colors duration-200 ${activeTab === 'questions' ? 'border-b-2 border-primary-600 text-primary-700' : 'text-gray-400 hover:text-primary-600'}`}
          onClick={() => setActiveTab('questions')}
        >
          Вопросы
        </button>
        <button
          className={`pb-2 font-semibold text-lg transition-colors duration-200 ${activeTab === 'responses' ? 'border-b-2 border-primary-600 text-primary-700' : 'text-gray-400 hover:text-primary-600'}`}
          onClick={() => setActiveTab('responses')}
        >
          Все ответы
        </button>
        <button
          className={`ml-auto px-6 py-2 rounded-xl font-semibold ${activeTab === 'share' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-primary-700 hover:bg-primary-600 hover:text-white'} transition-colors`}
          onClick={() => setActiveTab('share')}
        >
          Поделиться
        </button>
      </div>
      {/* Tab content */}
      {activeTab === 'questions' && (
        <>
          <h3 className="text-lg font-semibold mb-2">Вопросы:</h3>
          {success && <div className="text-green-600 mb-2">{success}</div>}
          {error && <div className="text-red-600 mb-2">{error}</div>}
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
                          <div className="border rounded-xl p-4 bg-white mb-2">
                            <div className="flex items-center gap-2 mb-2">
                              <select
                                value={q.type}
                                onChange={e => handleQuestionChange(idx, "type", e.target.value)}
                                className="border rounded px-2 py-1 text-sm"
                              >
                                {QUESTION_TYPES.map(t => (
                                  <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                              </select>
                              <input
                                className="border rounded px-2 py-1 flex-1"
                                value={q.text || ""}
                                onChange={e => handleQuestionChange(idx, "text", e.target.value)}
                                onBlur={e => handleQuestionChange(idx, "text", e.target.value)}
                                placeholder="Текст вопроса"
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
                                      className="ml-2 text-red-500"
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
                                      className="ml-2 text-red-500"
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
                            {q.type === "image_choice" && (
                              <div className="ml-2">
                                <div className="text-xs text-gray-500 mb-1">Картинки-варианты:</div>
                                {(q.images ?? []).map((img, iIdx) => (
                                  <div key={iIdx} className="flex items-center mb-1 gap-2">
                                    <input
                                      className="border rounded px-2 py-1 flex-1"
                                      value={img.url}
                                      onChange={e => {
                                        const newImages = (q.images ?? []).map((im, j) => j === iIdx ? { ...im, url: e.target.value } : im);
                                        handleQuestionChange(idx, "images", newImages);
                                      }}
                                      placeholder="Image URL"
                                    />
                                    <input
                                      className="border rounded px-2 py-1 flex-1"
                                      value={img.label}
                                      onChange={e => {
                                        const newImages = (q.images ?? []).map((im, j) => j === iIdx ? { ...im, label: e.target.value } : im);
                                        handleQuestionChange(idx, "images", newImages);
                                      }}
                                      placeholder="Label"
                                    />
                                    <button
                                      type="button"
                                      className="ml-2 text-red-500"
                                      onClick={() => {
                                        const newImages = (q.images ?? []).length > 2 ? (q.images ?? []).filter((_, j) => j !== iIdx) : q.images;
                                        handleQuestionChange(idx, "images", newImages);
                                      }}
                                      disabled={(q.images ?? []).length <= 2}
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  className="text-blue-600 text-xs mt-1"
                                  onClick={() => {
                                    const newImages = [...(q.images ?? []), { url: "", label: "" }];
                                    handleQuestionChange(idx, "images", newImages);
                                  }}
                                >
                                  + Add Image
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
          <div className="flex gap-2 mt-2">
            <button className="btn-primary" onClick={handleSave}>Сохранить</button>
            <button className="btn-secondary" onClick={() => navigate(`/dashboard/surveys/${id}`)}>Отмена</button>
          </div>
        </>
      )}
      {activeTab === 'responses' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Все ответы</h3>
          <div className="mb-4 flex gap-2">
            <input className="border rounded px-3 py-2 w-64" placeholder="Поиск по ответам..." />
            <select className="border rounded px-2 py-2">
              <option>Все</option>
              {/* Add more filters as needed */}
            </select>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            {responses.length === 0 ? (
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
                    </tr>
                  </thead>
                  <tbody>
                    {responses.map((resp, rIdx) => (
                      <tr key={rIdx}>
                        <td className="border px-2 py-1 text-gray-400">{rIdx + 1}</td>
                        {(resp.answers || []).map((ans, aIdx) => (
                          <td key={aIdx} className="border px-2 py-1">{ans}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === 'share' && (
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="text-lg font-semibold">Публичная ссылка на опрос:</div>
          <div className="flex items-center gap-2">
            <input
              className="border rounded px-3 py-2 w-96 text-gray-700"
              value={publicUrl}
              readOnly
            />
            <button
              className="bg-primary-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-700 transition"
              onClick={() => {navigator.clipboard.writeText(publicUrl); setCopySuccess('Скопировано!'); setTimeout(()=>setCopySuccess(''), 1500);}}
            >
              Копировать
            </button>
            {copySuccess && <span className="text-green-600 ml-2">{copySuccess}</span>}
          </div>
          <div className="mt-4 flex flex-col items-center">
            <div className="mb-2 text-gray-500">QR-код для быстрого доступа:</div>
            <QRCode value={publicUrl} size={160} />
          </div>
        </div>
      )}
    </div>
  );
}
