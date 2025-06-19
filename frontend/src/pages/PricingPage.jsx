import { Link } from 'react-router-dom';
import { Check, Star, Zap, Crown, X } from 'lucide-react';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Стартер',
    price: 'Бесплатно',
    period: '',
    description: 'Идеально для начинающих и небольших проектов',
    icon: Star,
    color: 'from-gray-400 to-gray-500',
    features: [
      'До 3 опросов в месяц',
      'До 50 ответов на опрос',
      'Базовая аналитика',
      'AI генерация вопросов',
      'Экспорт в CSV',
      'Email поддержка'
    ],
    limitations: [
      'Ограниченная кастомизация',
      'Базовые типы вопросов'
    ],
    cta: 'Начать бесплатно',
    popular: false
  },
  {
    name: 'Профессионал',
    price: '14,990тг',
    period: '/месяц',
    description: 'Для растущих команд и серьезных исследований',
    icon: Zap,
    color: 'from-primary-500 to-primary-600',
    features: [
      'Неограниченные опросы',
      'До 1,000 ответов на опрос',
      'Продвинутая аналитика',
      'AI анализ тональности',
      'Все типы вопросов',
      'Кастомизация дизайна',
      'Экспорт в Excel, Google Sheets',
      'Приоритетная поддержка',
      'Интеграции с CRM'
    ],
    limitations: [],
    cta: 'Попробовать 14 дней бесплатно',
    popular: true
  },
  {
    name: 'Корпоративный',
    price: 'По запросу',
    period: '',
    description: 'Для крупных организаций с особыми требованиями',
    icon: Crown,
    color: 'from-purple-500 to-purple-600',
    features: [
      'Все возможности Профессионал',
      'Неограниченные ответы',
      'Белый лейбл',
      'API доступ',
      'Персональный менеджер',
      'SLA 99.9%',
      'Корпоративная безопасность',
      'Обучение команды',
      'Кастомные интеграции'
    ],
    limitations: [],
    cta: 'Связаться с нами',
    popular: false
  }
];

function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Выберите свой
              <span className="block text-primary-600">идеальный план</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Начните бесплатно и масштабируйтесь по мере роста. 
              Все планы включают AI-генерацию вопросов и диалоговые опросы.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative bg-white rounded-3xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  plan.popular 
                    ? 'border-primary-200 ring-4 ring-primary-100' 
                    : 'border-gray-100 hover:border-primary-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Популярный выбор
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${plan.color} mb-4`}>
                      <plan.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      {plan.period && (
                        <span className="text-lg text-gray-600 ml-1">{plan.period}</span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                    {plan.limitations.map((limitation, limitIndex) => (
                      <div key={limitIndex} className="flex items-start opacity-60">
                        <X className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{limitation}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Link
                    to={plan.name === 'Корпоративный' ? '/contact' : '/register'}
                    className={`w-full block text-center py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                      plan.popular
                        ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Часто задаваемые вопросы
            </h2>
            <p className="text-xl text-gray-600">
              Ответы на самые популярные вопросы о наших тарифах
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                question: 'Можно ли изменить план в любое время?',
                answer: 'Да, вы можете повысить или понизить тариф в любое время. Изменения вступают в силу немедленно.'
              },
              {
                question: 'Есть ли скидки для некоммерческих организаций?',
                answer: 'Да, мы предоставляем скидки до 50% для образовательных учреждений и НКО. Свяжитесь с нами для получения специального предложения.'
              },
              {
                question: 'Что происходит с данными при отмене подписки?',
                answer: 'Ваши данные сохраняются в течение 90 дней после отмены. Вы можете экспортировать все данные в любое время.'
              },
              {
                question: 'Поддерживаете ли вы интеграции?',
                answer: 'Да, мы интегрируемся с популярными CRM, Slack, Microsoft Teams, Zapier и многими другими сервисами.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default PricingPage;