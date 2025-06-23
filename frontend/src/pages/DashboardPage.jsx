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
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Users,
  Clock,
  ChartBar,
  PieChart,
  Activity,
  MessageCircle,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from "../components/Modal";
import CreateSurveyModal from "../components/CreateSurveyModal";
import SurveyEditPage from "./SurveyEditPage";
import { BACKEND_URL, getApiUrl } from '../config';

function DashboardPage() {
  const [activeTab, setActiveTab] = useState('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedSurveyId, setSelectedSurveyId] = useState(null);
  const [surveyTab, setSurveyTab] = useState('current');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState(null);
  const [errorModal, setErrorModal] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [summaryStats, setSummaryStats] = useState({
    totalSurveys: 0,
    activeSurveys: 0,
    totalResponses: 0,
    averageResponseRate: 0,
    questionTypes: {},
    recentResponses: []
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Mock data for company summary
  const companyData = {
    name: 'Survey AI',
    category: 'B2B SaaS',
    summary: 'Survey AI - это революционная платформа для проведения опросов в формате живого диалога. Используя силу искусственного интеллекта, мы помогаем компаниям получать более качественные и детальные ответы от участников опросов.',
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

  const fetchSurveys = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    const params = new URLSearchParams();
    if (surveyTab === 'current') {
      params.append('archived', 'false');
    } else if (surveyTab === 'archived') {
      params.append('archived', 'true');
    }
    
    let url = getApiUrl(`surveys?${params.toString()}`);

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
      } else {
        setSurveys([]); // Clear surveys on error
      }
    } catch (error) {
      console.error('Error fetching surveys:', error);
      setSurveys([]); // Clear surveys on network error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, [surveyTab]);

  useEffect(() => {
    if (activeTab === 'summary') {
      const stats = {
        totalSurveys: surveys.length,
        activeSurveys: surveys.filter(s => !s.archived).length,
        totalResponses: surveys.reduce((sum, s) => sum + (s.answersCount || 0), 0),
        averageResponseRate: surveys.length ? 
          (surveys.reduce((sum, s) => sum + (s.answersCount || 0), 0) / surveys.length).toFixed(1) : 0,
        questionTypes: {},
        recentResponses: []
      };

      surveys.forEach(survey => {
        if (survey.questions) {
          survey.questions.forEach(q => {
            stats.questionTypes[q.type] = (stats.questionTypes[q.type] || 0) + 1;
          });
        }
      });

      setSummaryStats(stats);
    }
  }, [activeTab, surveys]);

  const handleView = (surveyId) => {
    setSelectedSurveyId(surveyId);
  };

  const handleDelete = async (surveyId) => {
    setSurveyToDelete(surveyId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!surveyToDelete) return;
    const token = localStorage.getItem('token');
    const res = await fetch(getApiUrl(`surveys/${surveyToDelete}`), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      fetchSurveys(); // Refetch surveys instead of filtering
    }
    setShowDeleteModal(false);
    setSurveyToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSurveyToDelete(null);
  };

  const handleArchive = async (surveyId) => {
    const token = localStorage.getItem('token');
    const res = await fetch(getApiUrl(`surveys/${surveyId}/archive`), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      fetchSurveys(); // Refetch surveys
    } else {
      setErrorModal({
        open: true,
        title: 'Ошибка архивации',
        message: 'Не удалось архивировать опрос. Попробуйте позже.'
      });
    }
  };

  const handleRestore = async (surveyId) => {
    const token = localStorage.getItem('token');
    const res = await fetch(getApiUrl(`surveys/${surveyId}/restore`), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      fetchSurveys(); // Refetch surveys
    } else {
      const data = await res.json();
      setErrorModal({
        open: true,
        title: 'Ошибка восстановления',
        message: data.detail || 'Не удалось восстановить опрос. Попробуйте позже.'
      });
    }
  };

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

  const hasActiveSurvey = surveys.some(survey => !survey.archived);
  const activeSurveysCount = surveys.filter(s => !s.archived).length;
  const isArchiveTab = surveyTab === 'archived';

  const handleCreateSurveyClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for Desktop */}
      <div className="w-64 bg-gray-900 text-white flex-col shadow-xl hidden md:flex">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl">
              <span className="text-white font-bold text-sm">SC</span>
            </div>
            <span className="text-xl font-bold">Survey AI</span>
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
      </div>

      {/* Mobile Sidebar (Overlay) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white flex flex-col shadow-xl z-50 md:hidden"
            >
              {/* Logo */}
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl">
                    <span className="text-white font-bold text-sm">SC</span>
                  </div>
                  <span className="text-xl font-bold">Survey AI</span>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 py-6">
                <ul className="space-y-2 px-4">
                  {sidebarItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          item.active 
                            ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg' 
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
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600 md:hidden">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1" /> {/* Spacer */}
          <button
            className="btn-secondary text-sm px-4 py-2"
            onClick={() => navigate("/")}
          >
            ← На главную
          </button>
        </div>

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-3xl font-bold text-gray-900">Сводка по опросам</h1>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary-100 rounded-xl">
                        <ChartBar className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-gray-900">{summaryStats.totalSurveys}</div>
                        <div className="text-sm text-gray-500">Всего опросов</div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <Activity className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-gray-900">{summaryStats.activeSurveys}</div>
                        <div className="text-sm text-gray-500">Активных опросов</div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <MessageCircle className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <div className="text-3xl font-bold text-gray-900">{summaryStats.totalResponses}</div>
                          {summaryStats.totalResponses > 0 && (
                            <div className="text-sm font-medium text-green-600">
                              {summaryStats.totalSurveys > 0 
                                ? `${Math.round((summaryStats.totalResponses / summaryStats.totalSurveys) * 100)}%`
                                : '0%'} 
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">Всего ответов</div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-yellow-100 rounded-xl">
                        <PieChart className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <div className="text-3xl font-bold text-gray-900">{summaryStats.averageResponseRate}</div>
                          <div className="text-sm font-medium text-gray-500">/ опрос</div>
                        </div>
                        <div className="text-sm text-gray-500">Среднее кол-во ответов</div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Response Analysis */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
                >
                  {/* Question Types Distribution */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Распределение типов вопросов</h2>
                    <div className="space-y-4">
                      {Object.entries(summaryStats.questionTypes).map(([type, count]) => (
                        <div key={type} className="flex items-center gap-4">
                          <div className="w-12 text-lg font-semibold text-gray-900">{count}</div>
                          <div className="flex-1">
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary-600 rounded-full"
                                style={{ 
                                  width: `${Math.round((count / Object.values(summaryStats.questionTypes)
                                    .reduce((a, b) => a + b, 0)) * 100)}%` 
                                }}
                              />
                            </div>
                          </div>
                          <div className="w-32 text-sm text-gray-600">
                            {type === 'multiple_choice' && 'С выбором ответа'}
                            {type === 'rating' && 'Оценка'}
                            {type === 'open_ended' && 'Открытые'}
                            {type === 'long_text' && 'Развёрнутые'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Response Rate Over Time */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Статистика ответов</h2>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div>Среднее время заполнения:</div>
                        <div className="font-medium text-gray-900">~4.5 мин</div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div>Самый популярный день:</div>
                        <div className="font-medium text-gray-900">Вторник</div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div>Пик активности:</div>
                        <div className="font-medium text-gray-900">14:00 - 16:00</div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div>Завершаемость:</div>
                        <div className="font-medium text-green-600">92%</div>
                      </div>
                      <div className="pt-4 border-t border-gray-100">
                        <div className="text-sm font-medium text-gray-900 mb-2">Качество ответов</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }} />
                          </div>
                          <div className="text-sm font-medium text-green-600">85%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Active vs Archived */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
                >
                  <h2 className="text-xl font-semibold mb-4">Статус опросов</h2>
                  <div className="flex items-center gap-8">
                    <div className="flex-1 bg-gray-50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-primary-600">{summaryStats.activeSurveys}</div>
                      <div className="text-sm text-gray-500">Активные</div>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-gray-600">
                        {summaryStats.totalSurveys - summaryStats.activeSurveys}
                      </div>
                      <div className="text-sm text-gray-500">В архиве</div>
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
                      <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-gray-900">Мои опросы</h1>
                      </div>
                      <motion.button
                        whileHover={{ scale: hasActiveSurvey || isArchiveTab ? 1 : 1.05 }}
                        whileTap={{ scale: hasActiveSurvey || isArchiveTab ? 1 : 0.95 }}
                        onClick={handleCreateSurveyClick}
                        className={`${
                          hasActiveSurvey || isArchiveTab
                            ? 'bg-gray-400' 
                            : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:shadow-xl'
                        } text-white px-4 py-2 rounded-xl font-semibold shadow-lg transition-all duration-200 flex items-center gap-2`}
                        title={
                          isArchiveTab 
                            ? 'Создание опросов недоступно в архиве' 
                            : hasActiveSurvey 
                              ? 'У вас уже есть активный опрос' 
                              : 'Создать новый опрос'
                        }
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
                    <div className="flex items-center gap-8 border-b border-gray-200 mb-6 px-2">
                      <button
                        className={`pb-2 font-semibold text-lg transition-colors duration-200 ${surveyTab === 'current' ? 'border-b-2 border-primary-600 text-primary-700' : 'text-gray-400 hover:text-primary-600'}`}
                        onClick={() => setSurveyTab('current')}
                      >
                        Текущие
                      </button>
                      <button
                        className={`pb-2 font-semibold text-lg transition-colors duration-200 ${surveyTab === 'archived' ? 'border-b-2 border-primary-600 text-primary-700' : 'text-gray-400 hover:text-primary-600'}`}
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
                          {surveyTab === 'current' && !hasActiveSurvey && !isArchiveTab && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              onClick={handleCreateSurveyClick}
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
                              className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-200 group cursor-pointer relative"
                              onClick={() => handleView(survey.id)}
                              tabIndex={0}
                              role="button"
                              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleView(survey.id); }}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start gap-3 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors break-words">
                                      {survey.topic}
                                    </h3>
                                    {surveyTab === 'archived' ? (
                                      <span className="flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                                        Архивирован
                                      </span>
                                    ) : (
                                      <span className="flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Активный
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-1.5">
                                      <BarChart3 className="h-4 w-4" />
                                      <span>{survey.questions?.length || 0} вопросов</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <Users className="h-4 w-4" />
                                      <span>{survey.answersCount || 0} ответов</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <Clock className="h-4 w-4" />
                                      <span>{new Date(survey.created_at).toLocaleDateString('ru-RU')}</span>
                                    </div>
                                  </div>
                                </div>
                                <div onClick={e => e.stopPropagation()} className="self-start sm:self-center flex-shrink-0">
                                  <div className="flex items-center gap-1 sm:gap-2">
                                    {surveyTab === 'archived' ? (
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        onClick={() => handleRestore(survey.id)}
                                        className="p-2 text-primary-600 hover:text-white hover:bg-primary-600 rounded-lg transition-all duration-200 border border-primary-200 text-sm font-semibold px-3"
                                        title="Вернуть из архива"
                                      >
                                        Вернуть
                                      </motion.button>
                                    ) : (
                                      <>
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
                                          onClick={() => handleArchive(survey.id)}
                                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                                          title="Архивировать"
                                        >
                                          <Archive className="h-5 w-5" />
                                        </motion.button>
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(survey.id);
                                          }}
                                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                          title="Удалить"
                                        >
                                          <Trash2 className="h-5 w-5" />
                                        </motion.button>
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 hidden sm:block"
                                          title="Дополнительно"
                                        >
                                          <MoreHorizontal className="h-5 w-5" />
                                        </motion.button>
                                      </>
                                    )}
                                  </div>
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

      {/* Modals */}
      <AnimatePresence>
        {open && (
          <Modal open={open} onClose={() => setOpen(false)}>
            <CreateSurveyModal
              onSuccess={() => {
                fetchSurveys(); // Refetch surveys after successful creation
                setOpen(false);
              }}
            />
          </Modal>
        )}
        {showDeleteModal && (
          <Modal open={showDeleteModal} onClose={cancelDelete}>
            <div className="p-4 text-center">
              <h2 className="text-xl font-bold mb-4">Удалить опрос?</h2>
              <p className="mb-6 text-gray-600">Вы уверены, что хотите удалить этот опрос? Это действие необратимо.</p>
              <div className="flex gap-4 justify-center">
                <button className="btn-secondary px-6" onClick={cancelDelete}>Отмена</button>
                <button className="btn-primary px-6" onClick={confirmDelete}>Удалить</button>
              </div>
            </div>
          </Modal>
        )}
        {errorModal && (
          <Modal open={errorModal.open} onClose={() => setErrorModal(null)}>
            <div className="p-4 text-center">
              <h2 className="text-xl font-bold mb-4">{errorModal.title}</h2>
              <p className="mb-6 text-gray-600">{errorModal.message}</p>
              <div className="flex gap-4 justify-center">
                <button className="btn-secondary px-6" onClick={() => setErrorModal(null)}>Закрыть</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DashboardPage;