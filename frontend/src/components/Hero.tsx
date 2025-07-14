import React, { useRef, useState } from 'react';
import AnimatedBackground from './AnimatedBackground';
import { ArrowRight, Zap, MessageSquare, Brain, BarChart3, FileText, CheckCircle, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { Link } from 'react-router-dom';
import aknurAvatar from '../assets/aknur-photo.png';
import danaAvatar from '../assets/dana-photo.jpg';
import Footer from './Footer';
import screenshot from '../assets/Screenshot 2025-07-14 104507.png';

// Testimonials data (copied from LandingPage.jsx)
const testimonials = [
  {
    name: 'Акнур Сейдазым',
    role: 'CEO, ShuShu AI',
    content: 'Survey AI helped me collect data on how people perceive our product. Now we can improve it based on this data.',
    rating: 5,
    avatar: aknurAvatar
  },
  {
    name: 'Дана Жаксылык',
    role: 'CEO, LazyJumys',
    content: 'Incredibly convenient! I used to create Google Forms, but now Survey AI helps me create surveys in 2 minutes. And the data quality has increased dramatically.',
    rating: 5,
    avatar: danaAvatar
  }
];

const Hero: React.FC = () => {
  const { t } = useTranslation();
  const statsRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <section className="relative min-h-screen pt-20 pb-32 overflow-hidden bg-[#F9F6F3]">
          <AnimatedBackground />
          <div className="container-section relative z-10 mt-20">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="max-w-5xl mx-auto text-center"
            >
              <motion.div 
                variants={itemVariants}
                className="inline-flex items-center px-4 py-2 rounded-full bg-convrt-purple/10 text-convrt-purple mb-6"
              >
                <Zap className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium font-inter tracking-wide">{t('Complete AI-Powered Survey Platform')}</span>
              </motion.div>
              <motion.h1 
                variants={itemVariants}
                className="font-inter font-bold text-4xl md:text-5xl lg:text-7xl tracking-tight max-w-4xl mx-auto mb-6 text-convrt-dark-blue leading-[1.1]"
              >
                {t('Create')} <span className="text-[#EA384C] font-extrabold">{t('Smart Surveys')}</span> {t('with')} <span className="text-[#6936F5] font-extrabold">{t('AI Power')}</span>
              </motion.h1>
              <motion.p 
                variants={itemVariants}
                className="font-inter text-xl text-convrt-dark-blue/80 max-w-3xl mx-auto mb-8 leading-relaxed"
              >
                {t('The complete survey platform that uses AI to create engaging surveys, collect responses in real-time, and deliver automated insights')}
              </motion.p>
              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16"
              >
                <Link to="/dashboard" className="button-primary flex items-center group font-inter font-medium">
                  {t('Try Survey AI Free')}
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
              {/* Modern Platform Showcase */}
              <motion.div 
                ref={demoRef}
                variants={itemVariants}
              >
              </motion.div>
            </motion.div>
          </div>

          {/* How It Works Section */}
          <section id="how-it-works" className="container-section bg-[#F9F6F3]">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="font-inter font-bold text-4xl md:text-5xl text-convrt-dark-blue mb-6">
                {t('How does it work?')}
              </h2>
              <p className="font-inter text-xl text-convrt-dark-blue/80 mb-12">
                {t('All it takes is 3 steps for quality feedback')}
              </p>
              <div className="flex flex-col md:flex-row justify-center gap-8">
                {/* Card 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0 }}
                  viewport={{ once: true }}
                  className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-sm border border-white/20 p-6 flex flex-col items-center max-w-xs w-full mx-auto"
                >
                  <div className="bg-primary-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                    <Brain className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="font-inter font-semibold text-lg text-convrt-dark-blue mb-2 text-center">{t('1. Create a survey in 2 minutes')}</h3>
                  <p className="font-inter text-base text-convrt-dark-blue/80 text-center">{t('Specify a topic — AI will propose questions or choose a template. No need to spend time on manual setup.')}</p>
                </motion.div>
                {/* Card 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-sm border border-white/20 p-6 flex flex-col items-center max-w-xs w-full mx-auto"
                >
                  <div className="bg-primary-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="font-inter font-semibold text-lg text-convrt-dark-blue mb-2 text-center">{t('2. Share the link or QR code')}</h3>
                  <p className="font-inter text-base text-convrt-dark-blue/80 text-center">{t('Share the survey with your clients or colleagues — they can complete it on any device in a natural conversational format.')}</p>
                </motion.div>
                {/* Card 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-sm border border-white/20 p-6 flex flex-col items-center max-w-xs w-full mx-auto"
                >
                  <div className="bg-primary-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                    <BarChart3 className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="font-inter font-semibold text-lg text-convrt-dark-blue mb-2 text-center">{t('3. Get analytics')}</h3>
                  <p className="font-inter text-base text-convrt-dark-blue/80 text-center">{t('See results in real time: graphs, key topics, export to Excel. Everything is simple and clear.')}</p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Analytics Showcase Section */}
          <section className="container-section bg-[#F9F6F3]">
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
                    <div className="w-full mb-4">
                      <img src={screenshot} alt="Analytics Example" className="rounded-xl shadow-lg w-full object-cover" />
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
          <section className="container-section bg-[#F9F6F3] scroll-mt-28" id="testimonials">
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
                    <p className="text-gray-700 mb-6 italic">"{t(testimonial.content)}"</p>
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
          <section className="w-full bg-convrt-purple py-20" id="cta">
            <div className="max-w-5xl mx-auto text-center px-4">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
              >
                <h2 className="font-inter font-bold text-4xl md:text-5xl text-white mb-6">
                  {t('Ready to revolutionize your surveys?')}
                </h2>
                <p className="font-inter text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                  {t('Join thousands of companies that already use Survey AI for more qualitative data.')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/register" className="button-primary font-inter font-medium inline-flex items-center">
                    {t('Start for free')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <button className="button-outline font-inter font-medium border-white text-white hover:bg-white hover:text-convrt-purple">
                    {t('Contact us')}
                  </button>
                </div>
              </motion.div>
            </div>
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Hero;
