import { useState, useEffect } from 'react';

const QUESTION_COUNT = 3;
const QUESTION_TEMPLATES = [
  topic => `Почему вам интересна тема: "${topic}"?`,
  topic => `Какие главные проблемы вы видите в этой области?`,
  topic => `Что бы вы хотели улучшить или изменить по теме "${topic}"?`
];

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);

  // Start survey on mount
  useEffect(() => {
    async function startSurvey() {
      try {
        const res = await fetch('/api/survey/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: 'Ваша тема' })
        });
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        setSessionId(data.sessionId);
        setMessages([{ sender: 'ai', text: data.question }]);
      } catch (err) {
        setMessages([{ sender: 'ai', text: 'Ошибка загрузки опроса. Попробуйте позже.' }]);
      }
    }
    startSurvey();
  }, []);

  async function sendAnswer() {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    try {
      const res = await fetch('/api/survey/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, answer: input }),
      });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      if (data.question) {
        setMessages(prev => [...prev, { sender: 'ai', text: data.question }]);
      } else if (data.summary) {
        setMessages(prev => [...prev, { sender: 'ai', text: data.summary }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Ошибка связи с сервером.' }]);
    }
    setInput('');
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendAnswer();
    }
  }

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
      <div style={{ minHeight: 340, marginBottom: 24, maxHeight: 400, overflowY: 'auto' }}>
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
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ваш ответ..."
          style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid #ccc', fontSize: 16, resize: 'none', minHeight: 40 }}
        />
        <button onClick={sendAnswer} style={{ padding: '12px 28px', borderRadius: 12, background: '#007bff', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16, boxShadow: '0 2px 8px #007bff22', cursor: 'pointer', transition: 'background 0.2s' }}>
          Отправить
        </button>
      </div>
    </div>
  );
}

export default Chat; 