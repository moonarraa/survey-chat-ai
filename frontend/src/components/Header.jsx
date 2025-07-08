import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, MessageCircle, ArrowRight, User } from 'lucide-react';
import logoo from '../assets/logoo.png';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

function Header() {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: t('Home'), href: '/' },
    { name: t('Surveys'), href: '/dashboard' },
    { name: t('Pricing'), href: '/pricing' }
  ];

  const isLoggedIn = Boolean(localStorage.getItem('token'));
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="bg-white/95 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <img src={logoo} alt="Survey AI" className="h-16 w-auto" />
        </Link>
        {/* Navigation and CTA */}
        <div className="flex items-center space-x-8">
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                  location.pathname === item.href
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex space-x-3 items-center">
            {!isLoggedIn && (
              <>
                <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow flex items-center gap-2 text-base transition">
                  {t('Login')} <ArrowRight className="h-5 w-5" />
                </Link>
                {/* Only show LanguageSwitcher here for not logged in */}
                <LanguageSwitcher className="ml-2" styleType="header" />
              </>
            )}
            {isLoggedIn && (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-full transition shadow"
                >
                  <User className="h-6 w-6 text-blue-600" />
                  {t('Profile')}
                </button>
                <LanguageSwitcher className="ml-2" styleType="header" />
              </>
            )}
          </div>
        </div>
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-700 hover:text-blue-700 transition-colors p-2"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden py-4 border-t border-gray-200 bg-white/95 backdrop-blur-lg">
          <div className="flex flex-col space-y-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors duration-200 px-3 py-2 rounded-lg ${
                  location.pathname === item.href
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {!isLoggedIn && (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-700 font-medium px-4 py-2 rounded-lg transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('Login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow flex items-center gap-2 text-base transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('Start for free')} <ArrowRight className="h-5 w-5" />
                </Link>
                <LanguageSwitcher className="mt-2" styleType="header" />
              </>
            )}
            {isLoggedIn && (
              <>
                <button
                  onClick={() => { setIsMenuOpen(false); navigate('/dashboard'); }}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-full transition shadow"
                >
                  <User className="h-6 w-6 text-blue-600" />
                  {t('Profile')}
                </button>
                <LanguageSwitcher className="mt-2" styleType="header" />
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;