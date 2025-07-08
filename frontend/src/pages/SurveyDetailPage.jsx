import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import QRCode from "react-qr-code";
import ErrorModal from '../components/ErrorModal';
import { getApiUrl } from '../config';
import { Plus, Trash2, BarChart2, Edit, Settings, Star, List, Image as ImageIcon, MessageCircle, AlignLeft, User } from 'lucide-react';
import Select from '../components/Select';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

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

console.log('Select:', Select);

const typeStyles = {
  multiple_choice: 'from-blue-100 to-blue-50 border-blue-200',
  rating: 'from-yellow-100 to-yellow-50 border-yellow-200',
  ranking: 'from-green-100 to-green-50 border-green-200',
  image_choice: 'from-pink-100 to-pink-50 border-pink-200',
  open_ended: 'from-purple-100 to-purple-50 border-purple-200',
  long_text: 'from-gray-100 to-gray-50 border-gray-200',
};
const typeIcons = {
  multiple_choice: List,
  rating: Star,
  ranking: List,
  image_choice: ImageIcon,
  open_ended: MessageCircle,
  long_text: AlignLeft,
};

export default function SurveyDetailPage({ id, onClose }) {
  const { t } = useTranslation();
  const [survey, setSurvey] = useState(null);
  const [originalSurvey, setOriginalSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  const navigate = useNavigate();
  const [errorModal, setErrorModal] = useState({ open: false, title: '', message: '' });
  const [activeTab, setActiveTab] = useState('questions'); // 'questions', 'analytics', 'settings'
  const qrRef = useRef(null);

  useEffect(() => {
    async function fetchSurvey() {
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(getApiUrl(`api/surveys/${id}`), {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setSurvey(data);
          setOriginalSurvey(JSON.parse(JSON.stringify(data)));
        } else if (res.status === 404) {
          setErrorModal({ open: true, title: t('Survey not found'), message: t('Maybe the link is outdated or the survey was deleted.') });
        } else {
          setErrorModal({ open: true, title: t('Server error'), message: t('Failed to load survey. Please try again later.') });
        }
      } catch {
        setErrorModal({ open: true, title: t('Network error'), message: t('Check your internet connection and try again.') });
      }
      setLoading(false);
    }
    fetchSurvey();
  }, [id, navigate, t]);

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(getApiUrl(`api/surveys/${id}`), {
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
        const errorData = await res.json().catch(() => ({ detail: t('Failed to save changes.') }));
        setErrorModal({ open: true, title: t('Save error'), message: errorData.detail });
      }
    } catch {
      setErrorModal({ open: true, title: t('Network error'), message: t('Check your connection and try again.') });
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

  const handleDownloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'survey-qr.png';
      a.click();
    } else {
      alert('QR-код еще не загрузился. Попробуйте чуть позже.');
    }
  };

  if (loading) return <div className="p-8 text-center">{t('Loading...')}</div>;
  if (!survey) return null;

  const publicUrl = `${window.location.origin}/s/${survey.slug || survey.public_id}`;
  const telegramUrl = `https://t.me/survey_chat_ai_bot?start=${survey.public_id}`;

  const renderEditView = () => (
    <div>
      {survey.questions.map((q, qIndex) => {
        const Icon = typeIcons[q.type] || List;
        return (
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: qIndex * 0.08 }}
            className={`relative rounded-2xl shadow-lg border-2 bg-gradient-to-br ${typeStyles[q.type] || 'from-gray-50 to-white border-gray-200'} p-6 mb-6 hover:scale-[1.02] hover:shadow-2xl transition-transform duration-300`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center justify-center rounded-full p-2 bg-white shadow border ${typeStyles[q.type]?.split(' ')[2] || 'border-gray-200'}`}> 
                <Icon className={`w-6 h-6 ${q.type === 'rating' ? 'text-yellow-400' : 'text-blue-500'}`} />
              </span>
              <span className="uppercase text-xs font-bold tracking-wider text-gray-500">{t(QUESTION_TYPES.find(tq => tq.value === q.type)?.label || q.type)}</span>
            </div>
            <input
              type="text"
              value={q.text}
              onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl font-semibold text-lg mb-4 focus:ring-2 focus:ring-primary-400 transition"
              placeholder={t('Question text')}
            />
            <Select
              value={q.type}
              onValueChange={value => handleQuestionChange(qIndex, 'type', value)}
              options={QUESTION_TYPES.map(opt => ({ ...opt, label: t(opt.label) }))}
              placeholder={t('Question type')}
              className="w-full mb-4"
            />
            {q.type === 'multiple_choice' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Answer options')}</label>
                <ul className="space-y-2">
                  {q.options.map((opt, oIndex) => (
                    <motion.li
                      key={oIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: oIndex * 0.05 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 shadow-sm hover:bg-blue-100 transition"
                    >
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        className="flex-grow bg-transparent border-none outline-none text-base"
                        placeholder={`${t('Option')} ${oIndex + 1}`}
                      />
                      <button onClick={() => handleRemoveOption(qIndex, oIndex)} className="p-2 text-red-500 hover:text-red-700">
                        <Trash2 size={18} />
                      </button>
                    </motion.li>
                  ))}
                </ul>
                <button onClick={() => handleAddOption(qIndex)} className="btn-secondary text-sm mt-2">{t('Add option')}</button>
              </div>
            )}
            {q.type === 'rating' && (
              <div className="mt-2 flex items-center gap-2">
                <label className="text-sm text-gray-700">{t('Scale')}:</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={q.scale || 5}
                  onChange={(e) => handleQuestionChange(qIndex, 'scale', parseInt(e.target.value))}
                  className="w-20 p-2 border border-yellow-200 rounded-xl text-yellow-700 font-semibold bg-yellow-50 focus:ring-2 focus:ring-yellow-300 transition"
                />
                <span className="text-xs text-yellow-600">({t('stars/hearts')})</span>
              </div>
            )}
            <button onClick={() => handleRemoveQuestion(qIndex)} className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-600">
              <Trash2 size={20}/>
            </button>
          </motion.div>
        );
      })}
      <button onClick={handleAddQuestion} className="btn-primary w-full flex items-center justify-center gap-2">
        <Plus/> {t('Add question')}
      </button>
    </div>
  );

  const renderDisplayView = () => (
    <>
      <h3 className="text-lg font-semibold mb-4">{t('Questions')}:</h3>
      <ul className="space-y-6">
        {survey.questions && survey.questions.map((q, idx) => {
          const Icon = typeIcons[q.type] || List;
          return (
            <motion.li
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className={`rounded-2xl shadow-lg border-2 bg-gradient-to-br ${typeStyles[q.type] || 'from-gray-50 to-white border-gray-200'} p-6 hover:scale-[1.02] hover:shadow-2xl transition-transform duration-300`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className={`inline-flex items-center justify-center rounded-full p-2 bg-white shadow border ${typeStyles[q.type]?.split(' ')[2] || 'border-gray-200'}`}> 
                  <Icon className={`w-6 h-6 ${q.type === 'rating' ? 'text-yellow-400' : 'text-blue-500'}`} />
                </span>
                <span className="uppercase text-xs font-bold tracking-wider text-gray-500">{t(QUESTION_TYPES.find(tq => tq.value === q.type)?.label || q.type)}</span>
              </div>
              <div className="font-semibold text-lg mb-3 text-gray-800">{q.text || ''}</div>
              {q.type === "multiple_choice" && q.options && (
                <ul className="space-y-2 mt-2">
                  {q.options.map((opt, oIdx) => (
                    <motion.li
                      key={oIdx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: oIdx * 0.05 }}
                      className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 shadow-sm hover:bg-blue-100 transition"
                    >
                      {opt}
                    </motion.li>
                  ))}
                </ul>
              )}
              {q.type === "rating" && (
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(q.scale || 5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" />
                  ))}
                  <span className="ml-2 text-xs text-gray-500">{t('Scale')}: 1–{q.scale || 5}</span>
                </div>
              )}
              {q.type === "ranking" && q.items && (
                <ol className="space-y-1 mt-2">
                  {q.items.map((item, iIdx) => (
                    <motion.li
                      key={iIdx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: iIdx * 0.05 }}
                      className="px-4 py-2 rounded-xl bg-green-50 border border-green-100 text-green-900 shadow-sm hover:bg-green-100 transition"
                    >
                      {item}
                    </motion.li>
                  ))}
                </ol>
              )}
              {q.type === "image_choice" && q.images && (
                <div className="flex gap-4 mt-3 flex-wrap">
                  {q.images.map((img, iIdx) => (
                    <motion.div
                      key={iIdx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: iIdx * 0.07 }}
                      className="flex flex-col items-center bg-pink-50 border border-pink-100 rounded-xl p-2 shadow-sm hover:bg-pink-100 transition"
                    >
                      <img src={img.url} alt={img.label} className="w-20 h-20 object-cover rounded-lg mb-1" />
                      <span className="text-xs text-gray-600 mt-1">{img.label}</span>
                    </motion.div>
                  ))}
                </div>
              )}
              {q.type === "open_ended" && (
                <div className="mt-2 px-4 py-2 rounded-xl bg-purple-50 border border-purple-100 text-purple-900 shadow-sm">
                  {t('Open-ended question')}
                </div>
              )}
              {q.type === "long_text" && (
                <div className="mt-2 px-4 py-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-700 shadow-sm">
                  {t('Free form answer')}
                </div>
              )}
            </motion.li>
          );
        })}
      </ul>
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-6">
        <button
          className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 text-base px-6 py-3 rounded-xl shadow hover:shadow-md transition"
          onClick={() => navigate("/dashboard")}
        >
          <span role="img" aria-label="back">←</span> {t('Back to survey list')}
        </button>
        <button
          className="bg-primary-600 text-white w-full sm:w-auto px-6 py-3 rounded-xl font-semibold shadow hover:bg-primary-700 hover:shadow-lg transition flex items-center justify-center gap-2"
          onClick={() => setShowShare(true)}
        >
          <span role="img" aria-label="share">🔗</span> {t('Share')}
        </button>
      </div>
    </>
  );

  return (
    <>
      <div style={{background: 'blue', color: 'white', padding: 8, borderRadius: 8, marginBottom: 16, fontWeight: 'bold', fontSize: 18, textAlign: 'center'}}>
        TEST MARKER DETAIL
      </div>
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
            <Edit size={16} /> {t('Questions')}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 flex items-center gap-2 ${activeTab === 'settings' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          >
            <User size={16} /> {t('Personal account')}
          </button>
        </div>

        {activeTab === 'questions' && (
          <>
            {isEditing ? renderEditView() : renderDisplayView()}
            <div className="mt-6 flex gap-4">
              {isEditing ? (
                <>
                  <button onClick={handleSave} className="btn-primary">{t('Save')}</button>
                  <button onClick={handleCancel} className="btn-secondary">{t('Cancel')}</button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="btn-primary">{t('Edit')}</button>
              )}
            </div>
          </>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="text-xl font-bold">{t('Survey settings')}</h2>
            {/* Settings content goes here */}
            <p>{t('Settings section in development.')}</p>
          </div>
        )}

        {showShare && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg relative w-full max-w-lg flex flex-col items-center">
              <button
                onClick={() => setShowShare(false)}
                className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                aria-label={t('Close')}
              >×</button>
              <div className="text-lg font-semibold mb-6 text-center">{t('Share survey')}</div>
              <div className="flex flex-col gap-4 w-full mb-8">
                <button
                  className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition text-lg"
                  style={{ minWidth: 220 }}
                  onClick={() => {navigator.clipboard.writeText(publicUrl); setCopySuccess(t('Public link copied!')); setTimeout(()=>setCopySuccess(''), 1500);}}
                >
                  {t('Copy public link')}
                </button>
                <button
                  className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition text-lg"
                  style={{ minWidth: 220 }}
                  onClick={() => {navigator.clipboard.writeText(telegramUrl); setCopySuccess(t('Telegram link copied!')); setTimeout(()=>setCopySuccess(''), 1500);}}
                >
                  {t('Copy Telegram link')}
                </button>
              </div>
              {copySuccess && <span className="text-green-600 text-center w-full mb-4">{copySuccess}</span>}
              <div className="mb-2 text-gray-500">{t('QR code for quick access')}:</div>
              <div className="flex flex-col items-center gap-2">
                <div ref={qrRef}>
                  <QRCode value={publicUrl} size={160} />
                </div>
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
        <div style={{background: 'lime', color: 'black'}}>TEST LOCAL 5173</div>
      </div>
    </>
  );
}
