import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, CheckCircle, Star, Heart } from "lucide-react";

const BACKEND_URL = "http://localhost:8000";

export default function SurveyPublicPage() {
  const { public_id } = useParams();
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
          
          // Simulate typing effect for first question
          setIsTyping(true);
          setTimeout(() => {
            setCurrentQuestion(data.questions[0]);
            setIsTyping(false);
          }, 1000);
        } else {
          setError("Опрос не найден или недоступен.");
        }
      } catch {
        setError("Ошибка загрузки опроса.");
      }
      setLoading(false);
    }
    fetchSurvey();
  }, [public_id]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (error) setError("");
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentQuestion) return;
    
    const newChat = [...chat, { question: currentQuestion, answer: input }];
    setChat(newChat);
    setInput("");
    setSubmitting(true);

    // Simulate AI thinking
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
    }, 1500);
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
        setError("Ошибка при отправке ответа.");
      }
    } catch {
      setError("Ошибка сети.");
    }
  };

  const handleQuickResponse = (response) => {
    setInput(response);
  };

  const renderRatingInput = (question) => {
    const scale = question.scale || 5;
    return (
      <div className="flex justify-center gap-2 my-4">
        {Array.from({ length: scale }).map((_, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            className={`p-3 rounded-full transition-all duration-200 ${
              input === String(i + 1) 
                ? 'bg-yellow-400 text-white shadow-lg' 
                : 'bg-gray-100 hover:bg-yellow-100 text-gray-600'
            }`}
            onClick={() => setInput(String(i + 1))}
          >
            <Star className="h-5 w-5" fill={input === String(i + 1) ? 'currentColor' : 'none'} />
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            className={`p-4 rounded-xl text-left transition-all duration-200 border-2 ${
              input === option
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-25'
            }`}
            onClick={() => setInput(option)}
          >
            {option}
          </motion.button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="bg-white p-8 rounded-3xl shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загружаем опрос...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-red-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md">
            <div className="text-red-500 text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Упс!</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="bg-white p-12 rounded-3xl shadow-xl max-w-md">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-green-500 text-6xl mb-6"
            >
              <CheckCircle className="h-16 w-16 mx-auto" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Спасибо!</h2>
            <p className="text-gray-600 text-lg">
              Ваши ответы успешно отправлены. Мы ценим ваше участие!
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-2xl">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{topic}</h1>
            <p className="text-gray-600">
              Вопрос {chat.length + 1} из {questions.length}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div 
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((chat.length) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        {/* Chat Container */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {/* Chat History */}
              {chat.map((item, index) => (
                <div key={index}>
                  {/* Question */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start space-x-3 mb-4"
                  >
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-full flex-shrink-0">
                      <MessageCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3 max-w-xs sm:max-w-sm md:max-w-md">
                      <p className="text-gray-800">
                        {typeof item.question === 'string' ? item.question : item.question?.text || ""}
                      </p>
                    </div>
                  </motion.div>

                  {/* Answer */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start space-x-3 justify-end mb-6"
                  >
                    <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl rounded-tr-md px-4 py-3 max-w-xs sm:max-w-sm md:max-w-md">
                      <p className="text-white">{item.answer}</p>
                    </div>
                    <div className="bg-gray-300 p-2 rounded-full flex-shrink-0">
                      <div className="h-4 w-4 bg-gray-500 rounded-full"></div>
                    </div>
                  </motion.div>
                </div>
              ))}

              {/* Current Question */}
              {currentQuestion && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start space-x-3"
                >
                  <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-full flex-shrink-0">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3 max-w-xs sm:max-w-sm md:max-w-md">
                    <p className="text-gray-800">
                      {typeof currentQuestion === 'string' ? currentQuestion : currentQuestion?.text || ""}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-start space-x-3"
                >
                  <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-full flex-shrink-0">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3">
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
            <div className="border-t border-gray-200 p-6 bg-white/50">
              {/* Special Input Types */}
              {typeof currentQuestion === 'object' && currentQuestion.type === 'rating' && renderRatingInput(currentQuestion)}
              {typeof currentQuestion === 'object' && currentQuestion.type === 'multiple_choice' && renderMultipleChoice(currentQuestion)}

              {/* Text Input */}
              <form onSubmit={handleSend} className="flex space-x-3">
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Введите ваш ответ..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 bg-white/70 backdrop-blur-sm"
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

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-sm mt-2 text-center"
                >
                  {error}
                </motion.p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}