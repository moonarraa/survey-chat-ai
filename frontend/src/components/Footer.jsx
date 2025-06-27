import { MessageCircle, Heart, ChevronDown } from 'lucide-react';
import logoo from '../assets/logoo.png';
import { useState } from 'react';

function Footer() {
  const [openFaq, setOpenFaq] = useState(null);
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
    <footer className="bg-gray-50 text-gray-700 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2 flex flex-col items-start">
            <img src={logoo} alt="Survey AI" className="h-14 w-auto mb-4" />
            <p className="text-gray-500 max-w-md">
              Революционная платформа для проведения опросов в формате живого диалога. 
              Используйте силу ИИ для создания более эффективных и увлекательных опросов.
            </p>
          </div>
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Быстрые ссылки</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-500 hover:text-blue-600 transition-colors">Главная</a></li>
              <li><a href="/dashboard" className="text-gray-500 hover:text-blue-600 transition-colors">Опросы</a></li>
              <li><a href="/pricing" className="text-gray-500 hover:text-blue-600 transition-colors">Тарифы</a></li>
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Контакты</h3>
            <ul className="space-y-2">
              <li className="text-gray-500">munaratuss@yahoo.com</li>
              <li className="text-gray-500">+7 (701) 888-58-50</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 Survey AI. Все права защищены.
          </p>
          <div className="flex items-center space-x-1 text-gray-400 text-sm mt-4 md:mt-0">
            <span>Сделано с</span>
            <Heart className="h-4 w-4 text-red-500" />
            <span>для лучших опросов</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;