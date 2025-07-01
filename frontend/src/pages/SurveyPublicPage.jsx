import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, CheckCircle, Star, Trophy } from "lucide-react";
import ErrorModal from '../components/ErrorModal';
import { BACKEND_URL } from '../config';

export default function SurveyPublicPage() {
  const { public_id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [chat, setChat] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [errorModal, setErrorModal] = useState({ open: false, title: '', message: '' });
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    async function fetchSurvey() {
      setLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/surveys/s/${public_id}`);
        if (res.ok) {
          const data = await res.json();
          setTopic(data.topic);
          setQuestions(data.questions);
          setCurrentIdx(0);
          setIsTyping(true);
          setTimeout(() => {
            setCurrentQuestion(data.questions[0]);
            setIsTyping(false);
          }, 700);
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
  }, [public_id]);

  useEffect(() => {
    setCopySuccess('');
  }, []);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (error) setError("");
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!currentQuestion) return;
    let answerToSave = input;
    if (typeof currentQuestion === 'object' && currentQuestion.type === 'ranking') {
      if (!input.trim()) return;
    } else {
      if (!input.trim()) return;
    }
    const newChat = [...chat, { question: currentQuestion, answer: answerToSave }];
    setChat(newChat);
    setInput("");
    setSubmitting(true);
    setIsTyping(true);
    setTimeout(() => {
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx(currentIdx + 1);
        setCurrentQuestion(questions[currentIdx + 1]);
        setIsTyping(false);
      } else {
        handleSubmit(newChat);
        setCurrentQuestion("");
        setIsTyping(false);
      }
      setSubmitting(false);
    }, 900);
  };

  const handleSubmit = async (finalChat = chat) => {
    try {
      const res = await fetch(`${BACKEND_URL}/surveys/s/${public_id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalChat.map(c => c.answer) })
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setErrorModal({ open: true, title: 'Ошибка отправки', message: 'Не удалось отправить ответы. Попробуйте позже.' });
      }
    } catch {
      setErrorModal({ open: true, title: 'Ошибка сети', message: 'Проверьте подключение к интернету и попробуйте ещё раз.' });
    }
  };

  // --- UI RENDER HELPERS ---
  const renderRatingInput = (question) => {
    const scale = question.scale || 5;
    return (
      <div className="flex justify-center gap-2 my-4">
        {Array.from({ length: scale }).map((_, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            className={`p-3 rounded-full transition-all duration-200 shadow-md border-2 focus:outline-none focus:ring-2 focus:ring-yellow-300
              ${input === String(i + 1) 
                ? 'bg-yellow-400 text-white border-yellow-400' 
                : 'bg-gray-100 hover:bg-yellow-100 text-gray-600 border-gray-200'}
            `}
            onClick={() => setInput(String(i + 1))}
          >
            <Star className="h-6 w-6" fill={input === String(i + 1) ? 'currentColor' : 'none'} />
          </motion.button>
        ))}
      </div>
    );
  };

  const renderMultipleChoice = (question) => {
    return (
      <div className="grid grid-cols-1 gap-3 my-4">
        {(question.options || []).map((option, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            className={`p-4 rounded-xl text-base font-medium transition-all duration-200 border-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300
              ${input === option
                ? 'border-primary-500 bg-primary-50 text-primary-700' 
                : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-25'}
            `}
            onClick={() => setInput(option)}
          >
            {option}
          </motion.button>
        ))}
      </div>
    );
  };

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100 flex items-center justify-center px-2 py-4">
      <AnimatePresence initial={false}>
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto bg-white/80 rounded-3xl shadow-2xl p-8 min-h-[420px]"
          >
            <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-primary-600 mb-6"></div>
            <p className="text-gray-600 text-lg font-medium">Загружаем опрос...</p>
          </motion.div>
        ) : submitted ? (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 rounded-3xl shadow-2xl p-10 min-h-[420px]"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-green-500 mb-6"
            >
              <CheckCircle className="h-20 w-20 mx-auto" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Спасибо!</h2>
            <p className="text-gray-600 text-lg text-center mb-4">
              Ваши ответы успешно отправлены.<br/>Мы ценим ваше участие!
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="w-full max-w-2xl mx-auto bg-white/90 rounded-3xl shadow-2xl p-0 sm:p-0 flex flex-col h-screen max-h-screen"
            style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)' }}
          >
            {/* Header */}
            <div className="px-6 pt-8 pb-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-blue-50 rounded-t-3xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-xl">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 flex-1 truncate">{topic}</h1>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/leaderboard')}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-1"
                  title="View MVP Leaderboard"
                >
                  <Trophy className="h-5 w-5" />
                  <span className="hidden sm:inline text-sm font-semibold">Leaderboard</span>
                </motion.button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-gray-500 text-sm">
                  Вопрос {Math.min(chat.length + 1, questions.length)} из {questions.length}
                </p>
                <span className="text-xs text-primary-600 font-semibold">
                  {Math.round((Math.min(chat.length, questions.length) / questions.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                <motion.div 
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-1 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(Math.min(chat.length, questions.length) / questions.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                ></motion.div>
              </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 min-h-0 px-4 py-6 space-y-4 bg-white/80 overflow-y-auto">
              <AnimatePresence initial={false}>
                {chat.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-col gap-1"
                  >
                    {/* Question */}
                    <div className="flex items-start gap-2">
                      <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-1.5 rounded-full flex-shrink-0">
                        <MessageCircle className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-2 max-w-xs sm:max-w-sm md:max-w-md text-gray-800 text-base">
                        {typeof item.question === 'string' ? item.question : item.question?.text || ""}
                      </div>
                    </div>
                    {/* Answer */}
                    <div className="flex items-end gap-2 justify-end">
                      <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl rounded-tr-md px-4 py-2 max-w-xs sm:max-w-sm md:max-w-md text-white text-base shadow">
                        {Array.isArray(item.answer) ? (
                          <ol className="list-decimal list-inside space-y-1">
                            {item.answer.map((ans, i) => (
                              <li key={i}>{ans}</li>
                            ))}
                          </ol>
                        ) : (
                          <span>{item.answer}</span>
                        )}
                      </div>
                      <div className="bg-gray-300 p-1.5 rounded-full flex-shrink-0">
                        <div className="h-3 w-3 bg-gray-500 rounded-full"></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {/* Current Question (только если не печатает) */}
                {currentQuestion && !isTyping && (
                  <motion.div
                    key={"current-question"}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.35 }}
                    className="flex items-start gap-2"
                  >
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-1.5 rounded-full flex-shrink-0">
                      <MessageCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-2 max-w-xs sm:max-w-sm md:max-w-md text-gray-800 text-base">
                      {typeof currentQuestion === 'string' ? currentQuestion : currentQuestion?.text || ""}
                    </div>
                  </motion.div>
                )}
                {/* Typing Indicator (только если печатает) */}
                {isTyping && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="flex items-start gap-2"
                  >
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-1.5 rounded-full flex-shrink-0">
                      <MessageCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input Area */}
            {currentQuestion && !isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="border-t border-gray-100 px-6 py-6 bg-white/80 rounded-b-3xl"
              >
                {/* Special Input Types */}
                {typeof currentQuestion === 'object' && currentQuestion.type === 'rating' && renderRatingInput(currentQuestion)}
                {typeof currentQuestion === 'object' && currentQuestion.type === 'multiple_choice' && renderMultipleChoice(currentQuestion)}
                {typeof currentQuestion === 'object' && currentQuestion.type === 'ranking' ? (
                  <button
                    className="btn-primary mt-4 w-full"
                    onClick={() => handleSend({ preventDefault: () => {} })}
                    disabled={submitting}
                  >
                    Далее
                  </button>
                ) : (
                  <form onSubmit={handleSend} className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Введите ваш ответ..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 bg-white/70 backdrop-blur-sm text-base shadow-sm"
                      disabled={submitting}
                    />
                    <motion.button
                      type="submit"
                      disabled={!input.trim() || submitting}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-3 rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                    >
                      <Send className="h-5 w-5" />
                    </motion.button>
                  </form>
                )}
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 text-sm mt-2 text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <ErrorModal open={errorModal.open} title={errorModal.title} message={errorModal.message} onClose={() => setErrorModal({ open: false, title: '', message: '' })} />
    </div>
  );
}