import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare, Brain, BarChart3, FileText, CheckCircle, Star } from 'lucide-react';
import { motion } from 'framer-motion';

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
    name: 'Анна Петрова',
    role: 'HR-директор, TechCorp',
    content: 'SurveyChat AI полностью изменил наш подход к опросам сотрудников. Теперь мы получаем гораздо более честные и развернутые ответы.',
    rating: 5
  },
  {
    name: 'Михаил Сидоров',
    role: 'Маркетолог, StartupXYZ',
    content: 'Невероятно удобно! Раньше на создание опроса уходил целый день, теперь — 5 минут. А качество данных выросло в разы.',
    rating: 5
  }
];

function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Замените скучные опросы
                <span className="block text-primary-600">на живой диалог</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Революционная платформа для создания интерактивных опросов с помощью ИИ. 
                Получайте более качественные данные через естественное общение.
              </p>
              <div className="flex flex-col items-center gap-4 justify-center">
                <Link to="/chat" className="btn-primary inline-flex items-center">
                  Попробовать бесплатно
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link to="/register" className="btn-secondary inline-flex items-center">
                  Получить ранний доступ
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-bounce-subtle"></div>
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-bounce-subtle" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-bounce-subtle" style={{ animationDelay: '2s' }}></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Почему выбирают SurveyChat AI?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Современные технологии для создания опросов нового поколения
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card text-center group hover:scale-105"
              >
                <div className="bg-primary-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Результаты, которые говорят сами за себя
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Наши клиенты получают значительно лучшие результаты благодаря инновационному подходу к опросам.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start"
                  >
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-2xl rounded-bl-md p-3">
                      <p className="text-sm text-gray-700">Привет! О какой теме вы хотите провести опрос?</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 justify-end">
                    <div className="flex-1 bg-primary-600 rounded-2xl rounded-br-md p-3 max-w-xs">
                      <p className="text-sm text-white">Удовлетворенность клиентов нашим сервисом</p>
                    </div>
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-2xl rounded-bl-md p-3">
                      <p className="text-sm text-gray-700">Отлично! Что конкретно вас интересует в удовлетворенности клиентов?</p>
                    </div>
                  </div>
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
              Реальные отзывы от компаний, которые уже используют SurveyChat AI
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
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary-600 font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
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
              Присоединяйтесь к тысячам компаний, которые уже используют SurveyChat AI 
              для получения более качественных данных.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/chat" className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-flex items-center">
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
    </div>
  );
}

export default LandingPage;