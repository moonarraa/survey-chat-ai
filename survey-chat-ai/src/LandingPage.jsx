import React from 'react';

const features = [
  {
    title: 'AI сам пишет вопросы',
    description: 'Вам не нужно придумывать вопросы — просто укажите тему, и AI подготовит опрос.'
  },
  {
    title: 'Диалоговый формат',
    description: 'Опрос проходит в виде живого чата — удобно и привычно, без скучных форм.'
  },
  {
    title: 'Уточняющие вопросы',
    description: 'AI задаёт дополнительные вопросы, если ответ неполный, и помогает раскрыть детали.'
  },
  {
    title: 'Анализ и экспорт',
    description: 'AI анализирует ответы, определяет эмоции и интерес, готовит отчёт для Excel или Google Sheets.'
  }
];

function LandingPage() {
  return (
    <div style={{ width: '100%', background: '#f7f7fa', minHeight: '100vh', paddingBottom: 40 }}>
      {/* Hero Section */}
      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, padding: '4rem 1rem 2rem 1rem', maxWidth: 1400, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 500, textAlign: 'center', marginBottom: 6, color: '#222' }}>
            Замените скучные опросы
        </h1>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, textAlign: 'center', marginBottom: 16, color: '#222' }}>
            На живой диалог
        </h2>
        <p style={{ fontSize: '1.25rem', textAlign: 'center', maxWidth: 900, marginBottom: 32, color: '#444' }}>
          Просто напишите тему — AI сам подготовит вопросы и проведёт опрос в формате живого диалога. Быстро, удобно, эффективно.
        </p>
        <a href="#chat-demo">
          <button style={{ fontSize: '1.1rem', padding: '14px 36px', borderRadius: 32, background: '#007bff', color: '#fff', border: 'none', fontWeight: 600, boxShadow: '0 2px 8px #0001', cursor: 'pointer' }}>
            Попробовать бесплатно
          </button>
        </a>
      </section>
      {/* Features Section */}
      <section style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 32, maxWidth: 1400, margin: '0 auto', padding: '2rem 1rem' }}>
        {features.map((f, idx) => (
          <div key={idx} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: 28, minWidth: 260, maxWidth: 340, flex: '1 1 260px', margin: 8 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 10, color: '#007bff' }}>{f.title}</h3>
            <p style={{ fontSize: '1rem', color: '#333' }}>{f.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default LandingPage; 