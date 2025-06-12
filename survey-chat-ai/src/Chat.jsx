import { useState } from 'react';

const QUESTION_COUNT = 3;
const QUESTION_TEMPLATES = [
  topic => `Почему вам интересна тема: "${topic}"?`,
  topic => `Какие главные проблемы вы видите в этой области?`,
  topic => `Что бы вы хотели улучшить или изменить по теме "${topic}"?`
];

function Chat() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Привет! О какой теме вы хотите провести опрос?' }
  ]);
  const [input, setInput] = useState('');
  const [awaitingTopic, setAwaitingTopic] = useState(true);
  const [topic, setTopic] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showSummary, setShowSummary] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    if (awaitingTopic) {
      setTopic(input);
      setMessages([
        ...newMessages,
        { sender: 'ai', text: QUESTION_TEMPLATES[0](input) }
      ]);
      setAwaitingTopic(false);
      setQuestionIndex(1);
      setAnswers([]);
    } else if (questionIndex < QUESTION_COUNT) {
      const updatedAnswers = [...answers, input];
      setAnswers(updatedAnswers);
      setMessages([
        ...newMessages,
        { sender: 'ai', text: QUESTION_TEMPLATES[questionIndex](topic) }
      ]);
      setQuestionIndex(questionIndex + 1);
    } else if (questionIndex === QUESTION_COUNT) {
      // Last answer, show summary
      const updatedAnswers = [...answers, input];
      setAnswers(updatedAnswers);
      setShowSummary(true);
      setMessages([
        ...newMessages,
        { sender: 'ai', text: 'Спасибо за ваши ответы! Вот краткое резюме:' }
      ]);
    }
    setInput('');
  };

  // Hover effect for chat bubbles
  const bubbleStyle = (sender) => ({
    background: sender === 'ai' ? '#f0f0f0' : '#d1e7dd',
    padding: '12px 18px',
    borderRadius: 20,
    display: 'inline-block',
    color: '#222',
    fontSize: 16,
    maxWidth: '80%',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    transition: 'box-shadow 0.2s, transform 0.2s',
    cursor: 'pointer',
  });

  return (
    <div style={{ justifyContent: 'center', alignItems: 'center', maxWidth: 700, margin: '2.5rem auto', border: '1px solid #e0e0e0', borderRadius: 28, padding: 32, background: '#f9f9fb', minHeight: 480, boxShadow: '0 8px 32px rgba(60,60,120,0.08)' }}>
      <div style={{ minHeight: 340, marginBottom: 24 }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              textAlign: msg.sender === 'ai' ? 'left' : 'right',
              margin: '14px 0',
              display: 'flex',
              justifyContent: msg.sender === 'ai' ? 'flex-start' : 'flex-end',
            }}
          >
            <span
              style={bubbleStyle(msg.sender)}
              onMouseOver={e => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(60,60,120,0.13)';
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
        {showSummary && (
          <div style={{ marginTop: 32, background: '#fff', borderRadius: 16, padding: 20, color: '#222', boxShadow: '0 2px 12px #0001' }}>
            <b>Тема опроса:</b> {topic}<br />
            <b>Ваши ответы:</b>
            <ol style={{ paddingLeft: 20 }}>
              {answers.map((ans, i) => (
                <li key={i} style={{ marginBottom: 8 }}>{QUESTION_TEMPLATES[i](topic)}<br /><span style={{ color: '#007bff' }}>{ans}</span></li>
              ))}
            </ol>
          </div>
        )}
      </div>
      {!showSummary && (
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={awaitingTopic ? 'Введите тему опроса...' : 'Ваш ответ...'}
            style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid #ccc', fontSize: 16 }}
          />
          <button onClick={handleSend} style={{ padding: '12px 28px', borderRadius: 12, background: '#007bff', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16, boxShadow: '0 2px 8px #007bff22', cursor: 'pointer', transition: 'background 0.2s' }}>
            Отправить
          </button>
        </div>
      )}
    </div>
  );
}

export default Chat; 