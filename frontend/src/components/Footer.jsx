import { MessageCircle, Heart, ChevronDown } from 'lucide-react';
import logoo from '../assets/logoo.png';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function Footer() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState(null);
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
    <footer className="bg-gray-50 text-gray-700 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2 flex flex-col items-start">
            <img src={logoo} alt="Survey AI" className="h-14 w-auto mb-4" />
            <p className="text-gray-500 max-w-md">
              {t('Revolutionary platform for conducting surveys in a live dialogue format. Use the power of AI to create more effective and engaging surveys.')}
            </p>
          </div>
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('Quick Links')}</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-500 hover:text-blue-600 transition-colors">{t('Home')}</a></li>
              <li><a href="/dashboard" className="text-gray-500 hover:text-blue-600 transition-colors">{t('Surveys')}</a></li>
              <li><a href="/pricing" className="text-gray-500 hover:text-blue-600 transition-colors">{t('Pricing')}</a></li>
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('Contacts')}</h3>
            <ul className="space-y-2">
              <li className="text-gray-500">munaratuss@yahoo.com</li>
              <li className="text-gray-500">+7 (701) 888-58-50</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 Survey AI. {t('All rights reserved.')} 
          </p>
          <div className="flex items-center space-x-1 text-gray-400 text-sm mt-4 md:mt-0">
            <span>{t('Made with')}</span>
            <Heart className="h-4 w-4 text-red-500" />
            <span>{t('for better surveys')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;