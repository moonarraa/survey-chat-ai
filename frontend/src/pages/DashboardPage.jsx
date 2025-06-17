import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home, 
  FolderOpen, 
  HelpCircle, 
  Settings, 
  User, 
  Edit3,
  Building,
  Tag,
  Calendar,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

function DashboardPage() {
  const [activeTab, setActiveTab] = useState('summary');
  const [searchQuery, setSearchQuery] = useState('');
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Mock data for company summary
  const companyData = {
    name: 'SurveyChat AI',
    category: 'B2B SaaS',
    summary: 'SurveyChat AI - это революционная платформа для проведения опросов в формате живого диалога. Используя силу искусственного интеллекта, мы помогаем компаниям получать более качественные и детальные ответы от участников опросов.',
    products: [
      'AI-генерация вопросов',
      'Диалоговые опросы',
      'Анализ тональности',
      'Экспорт данных'
    ],
    features: [
      'Автоматическая настройка опросов',
      'Встроенный сервер разработки',
      'Поддержка современных JavaScript функций',
      'Простая интеграция со сторонними библиотеками'
    ],
    benefits: [
      'Экономия времени на настройку проектов',
      'Упрощение рабочего процесса разработки',
      'Обеспечение следования лучшим практикам',
      'Облегчение развертывания'
    ],
    uniquePoints: [
      'Официально поддерживается командой React',
      'Широко принят в сообществе React',
      'Регулярные обновления и улучшения'
    ]
  };

  const sidebarItems = [
    { id: 'projects', icon: FolderOpen, label: 'Мои опросы', active: activeTab === 'projects' },
    { id: 'summary', icon: Home, label: 'Сводка', active: activeTab === 'summary' },
    { id: 'help', icon: HelpCircle, label: 'Справка', active: false },
    { id: 'settings', icon: Settings, label: 'Настройки', active: false }
  ];

  useEffect(() => {
    async function fetchSurveys() {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/surveys/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSurveys(data);
      }
      setLoading(false);
    }
    fetchSurveys();
  }, []);

  const handleView = (surveyId) => {
    navigate(`/survey/${surveyId}`);
  };

  const handleDelete = async (surveyId) => {
    if (!window.confirm("Удалить этот опрос?")) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:8000/surveys/${surveyId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setSurveys(surveys => surveys.filter(s => s.id !== surveyId));
    } else {
      alert("Ошибка при удалении опроса");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="bg-primary-600 p-2 rounded-lg">
              <span className="text-white font-bold text-sm">SC</span>
            </div>
            <span className="text-xl font-bold">SurveyChat</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          <ul className="space-y-2 px-4">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    item.active 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">MT</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Munara Tussubek...</p>
              <p className="text-xs text-gray-400 truncate">munaratus@yahoo.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Content Area */}
        <main className="flex-1 p-8">
          {activeTab === 'summary' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Company Summary</h1>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Edit3 className="h-5 w-5" />
                </button>
              </div>

              {/* Company Info Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
                <div className="flex items-start space-x-6">
                  {/* Company Avatar */}
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Building className="h-8 w-8 text-white" />
                  </div>

                  {/* Company Details */}
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                      This is how I understand your company:
                    </h2>

                    <div className="space-y-6">
                      {/* Company Name */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Company</h3>
                        <p className="text-gray-600">{companyData.name}</p>
                      </div>

                      {/* Category */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Category</h3>
                        <p className="text-gray-600">{companyData.category}</p>
                      </div>

                      {/* Summary */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Summary</h3>
                        <p className="text-gray-600 leading-relaxed">{companyData.summary}</p>
                      </div>

                      {/* Products/Services */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Products/Services</h3>
                        <ul className="space-y-2">
                          {companyData.products.map((product, index) => (
                            <li key={index} className="flex items-start">
                              <span className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span className="text-gray-600">{product}</span>
                            </li>
                          ))}
                        </ul>
                        
                        <div className="mt-4 space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-900">Features: </span>
                            <span className="text-gray-600">{companyData.features.join(', ')}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">Benefits: </span>
                            <span className="text-gray-600">{companyData.benefits.join(', ')}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">Unique Selling Points: </span>
                            <span className="text-gray-600">{companyData.uniquePoints.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Мои опросы</h1>
                <Link
                  to="/create-survey"
                  className="btn-primary inline-flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Создать опрос
                </Link>
              </div>

              {/* Список опросов */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                {loading ? (
                  <div className="text-gray-500 text-center py-12">Загрузка...</div>
                ) : surveys.length === 0 ? (
                  <div className="text-gray-500 text-center py-12">
                    У вас пока нет опросов.<br />
                    <Link to="/create-survey" className="text-primary-600 underline">Создать первый опрос</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {surveys.map((survey) => (
                      <div
                        key={survey.id}
                        className="flex flex-col md:flex-row md:items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-xl p-4 border border-gray-100 transition"
                      >
                        <div>
                          <div className="text-lg font-semibold text-gray-900 mb-1">{survey.topic}</div>
                          <div className="text-sm text-gray-600 mb-2">
                            Вопросов: {survey.questions.length}
                          </div>
                          <ul className="list-disc pl-5 text-gray-700 text-sm">
                            {survey.questions.map((q, idx) => (
                              <li key={idx}>{q}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-4 md:mt-0 flex-shrink-0 flex flex-col items-end">
                          <span className="text-xs text-gray-400 mb-2">
                            Создан: {new Date(survey.created_at).toLocaleString('ru-RU')}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              className="btn-secondary text-xs px-4 py-2"
                              onClick={() => handleView(survey.id)}
                            >
                              Посмотреть
                            </button>
                            <button
                              className="btn-secondary text-xs px-4 py-2 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleDelete(survey.id)}
                            >
                              Удалить
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;