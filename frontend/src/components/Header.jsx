import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, MessageCircle } from 'lucide-react';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Главная', href: '/' },
    { name: 'Дашборд', href: '/dashboard' },
  ];

  const isLoggedIn = Boolean(localStorage.getItem('token'));
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary-600 p-2 rounded-xl">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SurveyChat AI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  location.pathname === item.href
                    ? 'text-primary-600'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex space-x-4">
            {!isLoggedIn && (
              <Link to="/register" className="btn-secondary">
                Регистрация
              </Link>
            )}
            {!isLoggedIn && (
              <Link to="/chat" className="btn-primary">
                Начать опрос
              </Link>
            )}
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="btn-secondary"
                style={{ minWidth: 120 }}
              >
                Выйти
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    location.pathname === item.href
                      ? 'text-primary-600'
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {!isLoggedIn && (
                <Link
                  to="/register"
                  className="btn-secondary inline-block text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Регистрация
                </Link>
              )}
              {!isLoggedIn && (
                <Link
                  to="/chat"
                  className="btn-primary inline-block text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Начать опрос
                </Link>
              )}
              {isLoggedIn && (
                <button
                  onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                  className="btn-secondary inline-block text-center"
                  style={{ minWidth: 120 }}
                >
                  Выйти
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;