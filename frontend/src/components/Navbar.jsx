import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Navbar = () => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6",
        isScrolled 
          ? "bg-white/80 backdrop-blur-lg shadow-sm" 
          : "bg-transparent shadow-none backdrop-blur-0"
      )}
    >
      <div className="container max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <a href="/" className="flex items-center ml-6">
            <img 
              src="/src/assets/modern-logo.png" 
              alt="SurveyAI Logo" 
              className="h-9 md:h-12"
            />
          </a>
        </div>
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#how-it-works" className="text-convrt-dark-blue/80 hover:text-convrt-dark-blue font-medium transition-colors">
            {t('How It Works')}
          </a>
          <a href="#testimonials" className="text-convrt-dark-blue/80 hover:text-convrt-dark-blue font-medium transition-colors">
            {t('Case Studies')}
          </a>
          <a href="/dashboard" className="button-primary">
            {t('Get Started')}
          </a>
          <LanguageSwitcher className="ml-4" styleType="header" />
        </div>
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-convrt-dark-blue" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg py-4 px-6">
          <div className="flex flex-col space-y-4">
            <a 
              href="#how-it-works" 
              className="text-convrt-dark-blue/80 hover:text-convrt-dark-blue font-medium transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <a 
              href="#testimonials" 
              className="text-convrt-dark-blue/80 hover:text-convrt-dark-blue font-medium transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Case Studies
            </a>
            <a 
              href="/dashboard" 
              className="button-primary w-full text-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 