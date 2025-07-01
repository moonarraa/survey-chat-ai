import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare, Brain, BarChart3, FileText, CheckCircle, Star, ChevronDown, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';
import surveyCreateImg from '../assets/survey-create.png';
import aknurAvatar from '../assets/aknur-photo.png';
import danaAvatar from '../assets/dana-photo.jpg';
import { useState } from 'react';

const features = [
  {
    icon: Brain,
    title: 'AI генерирует вопросы',
    description: 'Просто укажите тему — искусственный интеллект автоматически создаст релевантные и интересные вопросы для вашего опроса.'
  },
  {
    icon: MessageSquare,
    title: 'Диалоговый формат',
    description: 'Опрос проходит в виде естественного диалога — участники чувствуют себя комфортно и дают более развернутые ответы.'
  },
  {
    icon: BarChart3,
    title: 'Умные уточнения',
    description: 'AI анализирует ответы в реальном времени и задает дополнительные вопросы для получения более глубокой информации.'
  },
  {
    icon: FileText,
    title: 'Анализ и отчеты',
    description: 'Получайте детальную аналитику с определением эмоций, ключевых тем и готовые отчеты для экспорта.'
  }
];

const benefits = [
  'Увеличение вовлеченности участников на 300%',
  'Сокращение времени создания опроса в 10 раз',
  'Получение более качественных и детальных ответов',
  'Автоматический анализ тональности и эмоций',
  'Экспорт в Excel, Google Sheets и другие форматы'
];

const testimonials = [
  {
    name: 'Акнур Сейдазым',
    role: 'CEO, ShuShu AI',
    content: 'Survey AI помог мне собрать данные о том, как люди воспринимают наш продукт. Теперь мы можем улучшать его на основе этих данных.',
    rating: 5,
    avatar: aknurAvatar
  },
  {
    name: 'Дана Жаксылык',
    role: 'CEO, LazyJumys',
    content: 'Невероятно удобно! Раньше я создавала Google формы, а теперь - Survey AI помогает мне создавать опросы за 2 минуты. А качество данных выросло в разы.',
    rating: 5,
    avatar: danaAvatar
  }
];

function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [newSurveyTitle, setNewSurveyTitle] = useState('');

  const handleCreateSurvey = () => {
    if (!newSurveyTitle.trim()) return;
    // Если пользователь не авторизован — редирект на регистрацию с темой
    window.location.href = `/register?topic=${encodeURIComponent(newSurveyTitle)}`;
    // Если хочешь другой UX — можно показать модалку или что-то ещё
  };

  const faq = [
    {
      q: 'Как быстро я получу аналитику по опросу?',
      a: 'Аналитика формируется мгновенно после получения первых ответов. Вы видите результаты в реальном времени.'
    },
    {
      q: 'Можно ли экспортировать результаты?',
      a: 'Да, вы можете экспортировать все ответы и аналитику в Excel одним кликом.'
    },
    {
      q: 'Нужно ли устанавливать приложение?',
      a: 'Нет, Survey AI полностью работает в браузере — ничего скачивать не нужно.'
    },
    {
      q: 'Могу ли я создать опрос бесплатно?',
      a: 'Да, базовый функционал доступен бесплатно. Для расширенных возможностей выберите подходящий тариф.'
    }
  ];
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center bg-white">
        <div className="w-full max-w-2xl flex flex-col items-center justify-center text-center px-4">
          <div className="mt-[120px]" />
          <h1 className="text-5xl font-bold text-black mb-4">AI-опросы за 2 минуты</h1>
          <div className="text-xl text-primary-600 font-semibold h-8 mb-2">
            <Typewriter
              words={["Создайте опрос за 2 минуты...", "Получайте честные ответы...", "Всё просто, быстро, AI!"]}
              loop={0}
              cursor
              cursorStyle="|"
              typeSpeed={60}
              deleteSpeed={40}
              delaySpeed={1200}
            />
          </div>
          <p className="text-xl text-gray-600 mb-4">Получайте честные ответы от клиентов и сотрудников.</p>
          <p className="text-lg text-gray-600 mb-4">Наша платформа помогает создавать интерактивные опросы с помощью ИИ, которые действительно слушают и понимают участников. </p>
          <div className="flex gap-4 justify-center my-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0 }} viewport={{ once: true }}>
              <MessageSquare className="h-8 w-8 text-primary-500 animate-bounce" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} viewport={{ once: true }}>
              <Brain className="h-8 w-8 text-blue-500 animate-pulse" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} viewport={{ once: true }}>
              <BarChart3 className="h-8 w-8 text-black animate-bounce" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} viewport={{ once: true }}>
              <FileText className="h-8 w-8 text-blue-400 animate-pulse" />
            </motion.div>
          </div>
          <a href="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow mb-8 transition">Попробовать бесплатно</a>
          <div className="mb-[80px]" />
          {/* Screenshot below headline */}
          <div className="w-full flex justify-center">
            <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-2xl border border-gray-200 max-w-xl w-full p-8 flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center rounded-full p-3 bg-blue-100">
                  <Plus className="w-7 h-7 text-blue-500" />
                </span>
                <span className="text-xl font-bold text-gray-900">Создать новый опрос</span>
              </div>
              <input
                type="text"
                className="w-full px-5 py-4 bg-white/80 text-gray-900 placeholder:text-gray-400 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-200 text-lg shadow"
                placeholder="Введите тему опроса..."
                value={newSurveyTitle}
                onChange={e => setNewSurveyTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreateSurvey(); }}
              />
              <button
                className="w-full py-3 text-lg rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
                onClick={handleCreateSurvey}
                disabled={!newSurveyTitle.trim()}
              >
                Создать опрос
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section (замена features) */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Как это работает?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Всего 3 шага до качественной обратной связи
            </p>
          </div>
          <div className="flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0 }}
              viewport={{ once: true }}
              className="card flex items-start gap-6 bg-primary-50 p-6 rounded-2xl shadow group hover:scale-[1.02] transition"
            >
              <div className="bg-primary-100 w-14 h-14 rounded-2xl flex items-center justify-center">
                <Brain className="h-7 w-7 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">1. Создайте опрос за 2 минуты</h3>
                <p className="text-gray-600 leading-relaxed text-base">Укажите тему — AI сам предложит вопросы или выберите шаблон. Не нужно тратить время на ручную настройку.</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="card flex items-start gap-6 bg-primary-50 p-6 rounded-2xl shadow group hover:scale-[1.02] transition"
            >
              <div className="bg-primary-100 w-14 h-14 rounded-2xl flex items-center justify-center">
                <MessageSquare className="h-7 w-7 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">2. Отправьте ссылку или QR-код</h3>
                <p className="text-gray-600 leading-relaxed text-base">Поделитесь опросом с клиентами или коллегами — они проходят его в удобном диалоговом формате на любом устройстве.</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="card flex items-start gap-6 bg-primary-50 p-6 rounded-2xl shadow group hover:scale-[1.02] transition"
            >
              <div className="bg-primary-100 w-14 h-14 rounded-2xl flex items-center justify-center">
                <BarChart3 className="h-7 w-7 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">3. Получите аналитику</h3>
                <p className="text-gray-600 leading-relaxed text-base">Видите результаты в реальном времени: графики, ключевые темы, экспорт в Excel. Всё просто и наглядно.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Analytics Showcase Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Ваша аналитика — наглядно
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Получайте понятные отчёты и реальные инсайты сразу после прохождения опроса. Всё визуально, без Excel и сложных таблиц.
              </p>
              <ul className="space-y-4">
                {[
                  {
                    icon: <BarChart3 className="h-6 w-6 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />, 
                    text: 'Графики по каждому вопросу'
                  },
                  {
                    icon: <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />, 
                    text: 'Ключевые темы и эмоции в ответах'
                  },
                  {
                    icon: <FileText className="h-6 w-6 text-primary-400 mr-3 mt-0.5 flex-shrink-0" />, 
                    text: 'Экспорт в Excel одним кликом'
                  }
                ].map((item, index) => (
                  <motion.li
                    key={item.text}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start"
                  >
                    {item.icon}
                    <span className="text-gray-700">{item.text}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
                {/* Здесь можно вставить реальный скриншот аналитики, если появится */}
                <div className="w-full h-56 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl text-primary-600 font-bold">Пример аналитики</span>
                </div>
                <div className="w-full">
                  <p className="text-gray-700 text-sm mb-2">Опрос: "Удовлетворенность сервисом"</p>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>Средняя оценка: <span className="font-semibold text-gray-900">4.7</span></li>
                    <li>Топ-ответ: <span className="font-semibold text-gray-900">"Очень быстрое обслуживание!"</span></li>
                    <li>Положительных эмоций: <span className="font-semibold text-green-600">87%</span></li>
                    <li>Экспорт: <span className="font-semibold text-primary-600">Excel</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Что говорят наши клиенты
            </h2>
            <p className="text-xl text-gray-600">
              Реальные отзывы от компаний, которые уже используют Survey AI
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="card"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  {testimonial.avatar ? (
                    <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover mr-4" />
                  ) : (
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-primary-600 font-semibold">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Готовы революционизировать ваши опросы?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Присоединяйтесь к тысячам компаний, которые уже используют Survey AI 
              для получения более качественных данных.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-flex items-center">
                Начать бесплатно
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-xl transition-all duration-200">
                Связаться с нами
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 text-center">FAQ</h2>
          <div className="space-y-4">
            {faq.map((item, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl bg-gray-50">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left text-lg font-medium text-gray-800 focus:outline-none"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`h-5 w-5 ml-2 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 text-gray-600 text-base animate-fade-in">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;