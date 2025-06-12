import { useState, useRef, useEffect } from 'react';
import { Send, RotateCcw, Download, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QUESTION_COUNT = 3;
const QUESTION_TEMPLATES = [
  topic => `Почему вам интересна тема: "${topic}"?`,
  topic => `Какие главные проблемы вы видите в этой области?`,
  topic => `Что бы вы хотели улучшить или изменить по теме "${topic}"?`
];

function ChatPage() {
  const [messages, setMessages] = useState([
    { 
      id: 1,
      sender: 'ai', 
      text: 'Привет! Я помогу вам провести интерактивный опрос. О какой теме вы хотите узнать мнение участников?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [awaitingTopic, setAwaitingTopic] = useState(true);
  const [topic, setTopic] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const simulateTyping = (callback, delay = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    };
    
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    
    if (awaitingTopic) {
      setTopic(input);
      simulateTyping(() => {
        const aiResponse = {
          id: Date.now() + 1,
          sender: 'ai',
          text: QUESTION_TEMPLATES[0](input),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
      });
      setAwaitingTopic(false);
      setQuestionIndex(1);
      setAnswers([]);
    } else if (questionIndex < QUESTION_COUNT) {
      const updatedAnswers = [...answers, input];
      setAnswers(updatedAnswers);
      
      simulateTyping(() => {
        const aiResponse = {
          id: Date.now() + 1,
          sender: 'ai',
          text: QUESTION_TEMPLATES[questionIndex](topic),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
      });
      setQuestionIndex(questionIndex + 1);
    } else if (questionIndex === QUESTION_COUNT) {
      const updatedAnswers = [...answers, input];
      setAnswers(updatedAnswers);
      setShowSummary(true);
      
      simulateTyping(() => {
        const aiResponse = {
          id: Date.now() + 1,
          sender: 'ai',
          text: 'Отлично! Спасибо за ваши развернутые ответы. Вот краткое резюме проведенного опроса:',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1500);
    }
    
    setInput('');
  };

  const handleReset = () => {
    setMessages([
      { 
        id: 1,
        sender: 'ai', 
        text: 'Привет! Я помогу вам провести интерактивный опрос. О какой теме вы хотите узнать мнение участников?',
        timestamp: new Date()
      }
    ]);
    setInput('');
    setAwaitingTopic(true);
    setTopic('');
    setQuestionIndex(0);
    setAnswers([]);
    setShowSummary(false);
    setIsTyping(false);
  };

  const handleExport = () => {
    const exportData = {
      topic,
      questions: QUESTION_TEMPLATES.map(template => template(topic)),
      answers,
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `survey-${topic.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 p-3 rounded-xl">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Интерактивный опрос</h1>
                <p className="text-gray-600">Проведите опрос в формате живого диалога</p>
              </div>
            </div>
            <div className="flex space-x-2">
              {showSummary && (
                <button
                  onClick={handleExport}
                  className="btn-secondary inline-flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Экспорт
                </button>
              )}
              <button
                onClick={handleReset}
                className="btn-secondary inline-flex items-center"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Сброс
              </button>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end space-x-2 max-w-xs sm:max-w-sm md:max-w-md ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'ai' ? 'bg-primary-600' : 'bg-gray-400'}`}>
                      {message.sender === 'ai' ? (
                        <MessageCircle className="h-4 w-4 text-white" />
                      ) : (
                        <span className="text-white text-xs font-semibold">Вы</span>
                      )}
                    </div>
                    <div className={`${message.sender === 'ai' ? 'chat-bubble-ai' : 'chat-bubble-user'}`}>
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.sender === 'ai' ? 'text-gray-500' : 'text-primary-200'}`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-end space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="chat-bubble-ai">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Summary */}
            {showSummary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-6 border border-primary-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary-600" />
                  Резюме опроса
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="font-medium text-gray-700">Тема опроса:</span>
                    <p className="text-primary-700 font-semibold">{topic}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Вопросы и ответы:</span>
                    <div className="mt-2 space-y-3">
                      {answers.map((answer, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            {index + 1}. {QUESTION_TEMPLATES[index](topic)}
                          </p>
                          <p className="text-gray-800">{answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          {!showSummary && (
            <div className="border-t border-gray-200 p-6">
              <div className="flex space-x-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={awaitingTopic ? 'Введите тему опроса...' : 'Введите ваш ответ...'}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="btn-primary inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Отправить
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {awaitingTopic 
                  ? 'Укажите тему, по которой хотите провести опрос' 
                  : `Вопрос ${questionIndex} из ${QUESTION_COUNT}`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;