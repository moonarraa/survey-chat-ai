import { MessageCircle, Heart } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-primary-600 p-2 rounded-xl">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">SurveyChat AI</span>
            </div>
            <p className="text-gray-400 max-w-md">
              Революционная платформа для проведения опросов в формате живого диалога. 
              Используйте силу ИИ для создания более эффективных и увлекательных опросов.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Быстрые ссылки</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-white transition-colors">Главная</a></li>
              <li><a href="/chat" className="text-gray-400 hover:text-white transition-colors">Чат</a></li>
              <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Возможности</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Контакты</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">munaratuss@yahoo.com</li>
              <li className="text-gray-400">+7 (701) 888-58-50</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 SurveyChat AI. Все права защищены.
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