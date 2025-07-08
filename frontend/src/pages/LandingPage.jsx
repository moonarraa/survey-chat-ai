import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare, Brain, BarChart3, FileText, CheckCircle, Star, ChevronDown, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';
import surveyCreateImg from '../assets/survey-create.png';
import aknurAvatar from '../assets/aknur-photo.png';
import danaAvatar from '../assets/dana-photo.jpg';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function LandingPage() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState(null);
  const [newSurveyTitle, setNewSurveyTitle] = useState('');

  const features = [
    {
      icon: Brain,
      title: t('AI generates questions'),
      description: t('Just specify a topic — AI will automatically create relevant and interesting questions for your survey.')
    },
    {
      icon: MessageSquare,
      title: t('Dialog format'),
      description: t('The survey is conducted as a natural conversation — participants feel comfortable and give more detailed answers.')
    },
    {
      icon: BarChart3,
      title: t('Smart clarifications'),
      description: t('AI analyzes answers in real time and asks follow-up questions for deeper insights.')
    },
    {
      icon: FileText,
      title: t('Analysis and reports'),
      description: t('Get detailed analytics with emotion detection, key topics, and ready-to-export reports.')
    }
  ];

  const benefits = [
    t('Increase participant engagement by 300%'),
    t('Reduce survey creation time by 10x'),
    t('Get higher quality and more detailed answers'),
    t('Automatic sentiment and emotion analysis'),
    t('Export to Excel, Google Sheets, and more')
  ];

  const testimonials = [
    {
      name: 'Акнур Сейдазым',
      role: 'CEO, ShuShu AI',
      content: t('Survey AI helped me collect data on how people perceive our product. Now we can improve it based on this data.'),
      rating: 5,
      avatar: aknurAvatar
    },
    {
      name: 'Дана Жаксылык',
      role: 'CEO, LazyJumys',
      content: t('Incredibly convenient! I used to create Google Forms, but now Survey AI helps me create surveys in 2 minutes. And the data quality has increased dramatically.'),
      rating: 5,
      avatar: danaAvatar
    }
  ];

  const handleCreateSurvey = () => {
    if (!newSurveyTitle.trim()) return;
    window.location.href = `/register?topic=${encodeURIComponent(newSurveyTitle)}`;
  };

  const faq = [
    {
      q: t('How quickly will I get analytics for the survey?'),
      a: t('Analytics is generated instantly after receiving the first responses. You see results in real time.')
    },
    {
      q: t('Can I export the results?'),
      a: t('Yes, you can export all responses and analytics to Excel with one click.')
    },
    {
      q: t('Do I need to install an app?'),
      a: t('No, Survey AI works entirely in the browser — nothing to download.')
    },
    {
      q: t('Can I create a survey for free?'),
      a: t('Yes, basic functionality is free. For advanced features, choose a suitable plan.')
    }
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center bg-white">
        <div className="w-full max-w-2xl flex flex-col items-center justify-center text-center px-4">
          <div className="mt-[120px]" />
          <h1 className="text-5xl font-bold text-black mb-4">{t('AI surveys in 2 minutes')}</h1>
          <div className="text-xl text-primary-600 font-semibold h-8 mb-2">
            <Typewriter
              words={[t('Create a survey in 2 minutes...'), t('Get honest answers...'), t('It\'s simple, fast, AI!')]}
              loop={0}
              cursor
              cursorStyle="|"
              typeSpeed={60}
              deleteSpeed={40}
              delaySpeed={1200}
            />
          </div>
          <p className="text-xl text-gray-600 mb-4">{t('Get honest answers from clients and employees.')}</p>
          <p className="text-lg text-gray-600 mb-4">{t('Our platform helps you create interactive AI-powered surveys that truly listen and understand participants.')}</p>
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
          <a href="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow mb-8 transition">{t('Try for free')}</a>
          <div className="mb-[80px]" />
          {/* Screenshot below headline */}
          <div className="w-full flex justify-center">
            <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-2xl border border-gray-200 max-w-xl w-full p-8 flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center rounded-full p-3 bg-blue-100">
                  <Plus className="w-7 h-7 text-blue-500" />
                </span>
                <span className="text-xl font-bold text-gray-900">{t('Create new survey')}</span>
              </div>
              <input
                type="text"
                className="w-full px-5 py-4 bg-white/80 text-gray-900 placeholder:text-gray-400 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-200 text-lg shadow"
                placeholder={t('Enter survey topic...')}
                value={newSurveyTitle}
                onChange={e => setNewSurveyTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreateSurvey(); }}
              />
              <button
                className="w-full py-3 text-lg rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
                onClick={handleCreateSurvey}
                disabled={!newSurveyTitle.trim()}
              >
                {t('Create survey')}
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
              {t('How does it work?')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('All it takes is 3 steps for quality feedback')}
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
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('1. Create a survey in 2 minutes')}</h3>
                <p className="text-gray-600 leading-relaxed text-base">{t('Specify a topic — AI will propose questions or choose a template. No need to spend time on manual setup.')}</p>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('2. Share the link or QR code')}</h3>
                <p className="text-gray-600 leading-relaxed text-base">{t('Share the survey with your clients or colleagues — they can complete it on any device in a natural conversational format.')}</p>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('3. Get analytics')}</h3>
                <p className="text-gray-600 leading-relaxed text-base">{t('See results in real time: graphs, key topics, export to Excel. Everything is simple and clear.')}</p>
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
                {t('Your analytics - visually clear')}
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                {t('Get clear reports and real insights immediately after the survey is completed. Everything is visual, no Excel or complex tables.')}
              </p>
              <ul className="space-y-4">
                {[
                  {
                    icon: <BarChart3 className="h-6 w-6 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />, 
                    text: t('Charts for each question')
                  },
                  {
                    icon: <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />, 
                    text: t('Key themes and emotions in answers')
                  },
                  {
                    icon: <FileText className="h-6 w-6 text-primary-400 mr-3 mt-0.5 flex-shrink-0" />, 
                    text: t('Export to Excel with one click')
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
                  <span className="text-2xl text-primary-600 font-bold">{t('Analytics example')}</span>
                </div>
                <div className="w-full">
                  <p className="text-gray-700 text-sm mb-2">{t('Survey: "Satisfaction with the service"')}</p>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>{t('Average rating:')} <span className="font-semibold text-gray-900">4.7</span></li>
                    <li>{t('Top answer:')} <span className="font-semibold text-gray-900">"Very fast service!"</span></li>
                    <li>{t('Positive emotions:')} <span className="font-semibold text-green-600">87%</span></li>
                    <li>{t('Export:')} <span className="font-semibold text-primary-600">{t('Excel')}</span></li>
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
              {t('What our clients say')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('Real testimonials from companies that already use Survey AI')}
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
              {t('Ready to revolutionize your surveys?')}
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              {t('Join thousands of companies that already use Survey AI for more qualitative data.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-flex items-center">
                {t('Start for free')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-xl transition-all duration-200">
                {t('Contact us')}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 text-center">{t('FAQ')}</h2>
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