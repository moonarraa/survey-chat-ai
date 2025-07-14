import { Link } from 'react-router-dom';
import { Check, Star, Zap, Crown, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AnimatedBackground from '../components/AnimatedBackground';

function getPlans(t) {
  return [
    {
      name: t('Starter'),
      price: t('Free'),
      period: '',
      description: t('Ideal for beginners and small projects'),
      icon: Star,
      color: 'from-gray-400 to-gray-500',
      features: [
        t('Up to 3 surveys per month'),
        t('Up to 50 responses per survey'),
        t('Basic analytics'),
        t('AI question generation'),
        t('Export to CSV'),
        t('Email support')
      ],
      limitations: [
        t('Limited customization'),
        t('Basic question types')
      ],
      cta: t('Start for free'),
      popular: false
    },
    {
      name: t('Professional'),
      price: '14,990тг',
      period: t('/month'),
      description: t('For growing teams and serious research'),
      icon: Zap,
      color: 'from-primary-500 to-primary-600',
      features: [
        t('Unlimited surveys'),
        t('Up to 1,000 responses per survey'),
        t('Advanced analytics'),
        t('AI sentiment analysis'),
        t('All question types'),
        t('Design customization'),
        t('Export to Excel, Google Sheets'),
        t('Priority support'),
        t('CRM integrations')
      ],
      limitations: [],
      cta: t('Try 14 days free'),
      popular: true
    },
    {
      name: t('Enterprise'),
      price: t('On request'),
      period: '',
      description: t('For large organizations with special requirements'),
      icon: Crown,
      color: 'from-purple-500 to-purple-600',
      features: [
        t('All Professional features'),
        t('Unlimited responses'),
        t('White label'),
        t('API access'),
        t('Personal manager'),
        t('SLA 99.9%'),
        t('Enterprise security'),
        t('Team training'),
        t('Custom integrations')
      ],
      limitations: [],
      cta: t('Contact us'),
      popular: false
    }
  ];
}

function getFAQs(t) {
  return [
    {
      question: t('Can I change my plan at any time?'),
      answer: t('Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.')
    },
    {
      question: t('Are there discounts for non-profits?'),
      answer: t('Yes, we offer up to 50% discounts for educational institutions and non-profits. Contact us for a special offer.')
    },
    {
      question: t('What happens to my data if I cancel my subscription?'),
      answer: t('Your data is retained for 90 days after cancellation. You can export all data at any time.')
    },
    {
      question: t('Do you support integrations?'),
      answer: t('Yes, we integrate with popular CRMs, Slack, Microsoft Teams, Zapier, and many other services.')
    }
  ];
}

function PricingPage() {
  const { t } = useTranslation();
  const plans = getPlans(t);
  const faqs = getFAQs(t);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AnimatedBackground />
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              {t('Choose your')}
              <span className="block text-primary-600">{t('perfect plan')}</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('Start for free and scale as you grow. All plans include AI question generation and conversational surveys.')}
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
                      {t('Popular choice')}
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
                    to={plan.name === t('Enterprise') ? '/contact' : '/register'}
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
              {t('Frequently Asked Questions')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('Answers to the most popular questions about our pricing')}
            </p>
          </div>

          <div className="space-y-8">
            {faqs.map((faq, index) => (
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