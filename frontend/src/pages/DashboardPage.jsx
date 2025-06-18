import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, matchPath } from 'react-router-dom';
import { 
  Home, 
  FolderOpen, 
  HelpCircle, 
  Settings, 
  User, 
  Edit3,
  Building,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Trash2,
  Archive,
  BarChart3,
  Users,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from "../components/Modal";
import CreateSurveyModal from "../components/CreateSurveyModal";
import SurveyEditPage from "./SurveyEditPage";

function DashboardPage() {
  const [activeTab, setActiveTab] = useState('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedSurveyId, setSelectedSurveyId] = useState(null);
  const [surveyTab, setSurveyTab] = useState('current');
  const navigate = useNavigate();
  const location = useLocation();

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
      let url = 'http://localhost:8000/surveys/';
      if (surveyTab === 'archived') url += '?archived=true';
      if (surveyTab === 'current') url += '?archived=false';
      
      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login?expired=1';
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setSurveys(data);
        }
      } catch (error) {
        console.error('Error fetching surveys:', error);
      }
      setLoading(false);
    }
    fetchSurveys();
  }, [surveyTab]);

  const handleView = (surveyId) => {
    setSelectedSurveyId(surveyId);
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

  // Check for URL-based survey selection
  let urlSurveyId = null;
  const matchEdit = matchPath('/dashboard/surveys/:id/edit', location.pathname);
  const matchView = matchPath('/dashboard/surveys/:id', location.pathname);

  if (matchEdit) urlSurveyId = matchEdit.params.id;
  else if (matchView) urlSurveyId = matchView.params.id;

  const effectiveSurveyId = urlSurveyId || selectedSurveyId;
  
  const handlePanelClose = () => {
    if (urlSurveyId) navigate('/dashboard');
    else setSelectedSurveyId(null);
  };

  const filteredSurveys = surveys.filter(survey =>
    survey.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-64 bg-gray-900 text-white flex flex-col shadow-xl"
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl">
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
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    item.active 
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">MT</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Munara Tussubek...</p>
              <p className="text-xs text-gray-400 truncate">munaratus@yahoo.com</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-3xl font-bold text-gray-900">Company Summary</h1>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                  >
                    <Edit3 className="h-5 w-5" />
                  </motion.button>
                </div>

                {/* Company Info Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 mb-8 hover:shadow-lg transition-shadow duration-300"
                >
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
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'projects' && (
              <motion.div
                key="projects"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {effectiveSurveyId ? (
                  <SurveyEditPage id={effectiveSurveyId} onClose={handlePanelClose} />
                ) : (
                  <>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                      <h1 className="text-3xl font-bold text-gray-900">Мои опросы</h1>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setOpen(true)}
                        className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                      >
                        <Plus className="h-5 w-5" />
                        Создать опрос
                      </motion.button>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          placeholder="Поиск опросов..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200"
                        />
                      </div>
                      <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                        <Filter className="h-5 w-5 text-gray-400" />
                        Фильтры
                      </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-8 border-b border-gray-200 mb-6">
                      <button
                        className={`pb-3 font-semibold text-lg transition-all duration-200 border-b-2 ${
                          surveyTab === 'current' 
                            ? 'border-primary-600 text-primary-700' 
                            : 'border-transparent text-gray-400 hover:text-primary-600'
                        }`}
                        onClick={() => setSurveyTab('current')}
                      >
                        Текущие ({filteredSurveys.length})
                      </button>
                      <button
                        className={`pb-3 font-semibold text-lg transition-all duration-200 border-b-2 ${
                          surveyTab === 'archived' 
                            ? 'border-primary-600 text-primary-700' 
                            : 'border-transparent text-gray-400 hover:text-primary-600'
                        }`}
                        onClick={() => setSurveyTab('archived')}
                      >
                        Архив
                      </button>
                    </div>

                    {/* Surveys List */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                      {loading ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                          <p className="text-gray-500">Загрузка опросов...</p>
                        </div>
                      ) : filteredSurveys.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="text-gray-400 text-6xl mb-4">📋</div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {surveyTab === 'current' ? 'Нет активных опросов' : 'Архив пуст'}
                          </h3>
                          <p className="text-gray-600 mb-6">
                            {surveyTab === 'current' 
                              ? 'Создайте свой первый опрос, чтобы начать собирать отзывы'
                              : 'Здесь будут отображаться архивированные опросы'
                            }
                          </p>
                          {surveyTab === 'current' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              onClick={() => setOpen(true)}
                              className="btn-primary"
                            >
                              Создать первый опрос
                            </motion.button>
                          )}
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {filteredSurveys.map((survey, index) => (
                            <motion.div
                              key={survey.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="p-6 hover:bg-gray-50 transition-colors duration-200 group"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                      {survey.topic}
                                    </h3>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Активный
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-6 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <BarChart3 className="h-4 w-4" />
                                      {survey.questions?.length || 0} вопросов
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Users className="h-4 w-4" />
                                      {survey.answersCount || 0} ответов
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {new Date(survey.created_at).toLocaleDateString('ru-RU')}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => handleView(survey.id)}
                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                                    title="Просмотреть"
                                  >
                                    <Eye className="h-5 w-5" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                                    title="Архивировать"
                                  >
                                    <Archive className="h-5 w-5" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => handleDelete(survey.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                    title="Удалить"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                                  >
                                    <MoreHorizontal className="h-5 w-5" />
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Create Survey Modal */}
      <AnimatePresence>
        {open && (
          <Modal open={open} onClose={() => setOpen(false)}>
            <CreateSurveyModal onSuccess={() => setOpen(false)} />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DashboardPage;