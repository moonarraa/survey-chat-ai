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
import { BarChart as RBarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart as RPieChart, Pie, Cell } from 'recharts';
import { saveAs } from "file-saver";
import LogoutButton from "./LogoutButton";

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
  const [currentUser, setCurrentUser] = useState(null);
  const [summaryStats, setSummaryStats] = useState({
    totalSurveys: 0,
    activeSurveys: 0,
    totalResponses: 0,
    averageResponseRate: 0,
    questionTypes: {},
    recentResponses: []
  });
  const [selectedAnalyticsSurveyId, setSelectedAnalyticsSurveyId] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(getApiUrl('auth/me'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setCurrentUser(await res.json());
        } else {
           // Handle error, e.g. redirect to login if 401
           if (res.status === 401) {
             navigate('/login');
           }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchCurrentUser();
  }, [navigate]);

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
    { id: 'analytics', icon: Home, label: 'Аналитика', active: activeTab === 'analytics' },
    { id: 'profile', icon: User, label: 'Личный кабинет', active: activeTab === 'profile' },
    { id: 'help', icon: HelpCircle, label: 'Справка', active: false },
    { id: 'settings', icon: Settings, label: 'Настройки', active: false }
  ];

  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length > 1 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const fetchSurveys = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    const params = new URLSearchParams();
    if (surveyTab === 'current') {
      params.append('archived', 'false');
    } else if (surveyTab === 'archived') {
      params.append('archived', 'true');
    }
    
    let url = getApiUrl(`api/surveys?${params.toString()}`);

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
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
    if (activeTab === 'analytics') {
      const activeSurvey = surveys.find(s => !s.archived);
      if (activeSurvey) {
        setSelectedAnalyticsSurveyId(activeSurvey.id);
        fetchAnalytics(activeSurvey.id);
      } else {
        setAnalytics(null);
      }
    }
    // eslint-disable-next-line
  }, [activeTab, surveys]);

  useEffect(() => {
    if (activeTab === 'analytics' && selectedAnalyticsSurveyId) {
      fetchAnalytics(selectedAnalyticsSurveyId);
    }
  }, [activeTab, selectedAnalyticsSurveyId]);

  const fetchAnalytics = async (surveyId) => {
    setLoadingAnalytics(true);
    setAnalytics(null);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(getApiUrl(`api/surveys/${surveyId}/analytics`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setAnalytics(await res.json());
      } else {
        setAnalytics(null);
      }
    } catch {
      setAnalytics(null);
    }
    setLoadingAnalytics(false);
  };

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
    const res = await fetch(getApiUrl(`api/surveys/${surveyToDelete}`), {
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
    const res = await fetch(getApiUrl(`api/surveys/${surveyId}/archive`), {
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
    const res = await fetch(getApiUrl(`api/surveys/${surveyId}/restore`), {
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
    
    if (isArchiveTab) {
      setErrorModal({
        open: true,
        title: 'Действие недоступно',
        message: 'Вы не можете создавать опросы, находясь на вкладке "Архив".'
      });
      return;
    }
    
    if (hasActiveSurvey) {
      setErrorModal({
        open: true,
        title: 'У вас уже есть активный опрос',
        message: 'Чтобы создать новый опрос, пожалуйста, сначала архивируйте текущий активный.'
      });
      return;
    }

    setOpen(true);
  };

  function handleExportCSV() {
    if (!analytics) return;
    const rows = [];
    rows.push(["Вопрос", "Тип", "Ответ", "Количество"]);
    Object.entries(analytics.question_analytics).forEach(([question, data]) => {
      if (data.type === "multiple_choice" || data.type === "image_choice") {
        Object.entries(data.answers).forEach(([opt, count]) => {
          rows.push([question, data.type, opt, count]);
        });
      } else if (data.type === "rating") {
        Object.entries(data.distribution).forEach(([score, count]) => {
          rows.push([question, data.type, score, count]);
        });
        rows.push([question, data.type, "Среднее", data.average]);
      } else if (data.type === "text") {
        data.answers.forEach((ans, idx) => {
          rows.push([question, data.type, ans, ""]);
        });
      } else if (data.type === "ranking") {
        data.answers.forEach((ans, idx) => {
          rows.push([question, data.type, JSON.stringify(ans), ""]);
        });
      } else {
        (data.answers || []).forEach((ans) => {
          rows.push([question, data.type, ans, ""]);
        });
      }
    });
    // Формируем CSV-строку
    const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    // Скачиваем файл
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const filename = `survey-analytics-${selectedAnalyticsSurveyId || 'all'}.csv`;
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // После получения surveys и analytics, вычисляем summaryStats
  useEffect(() => {
    const totalSurveys = surveys.length;
    const activeSurveys = surveys.filter(s => !s.archived).length;
    // Если есть аналитика по выбранному опросу, используем её для "Всего ответов"
    let totalResponses = 0;
    if (analytics && typeof analytics.total_responses === 'number') {
      totalResponses = analytics.total_responses;
    } else {
      // Fallback: сумма по всем опросам
      totalResponses = surveys.reduce((acc, s) => acc + (s.answersCount || 0), 0);
    }
    // Среднее кол-во ответов на опрос
    const averageResponseRate = totalSurveys > 0 ? Math.round(totalResponses / totalSurveys) : 0;
    setSummaryStats(prev => ({
      ...prev,
      totalSurveys,
      activeSurveys,
      totalResponses,
      averageResponseRate
    }));
  }, [surveys, analytics]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for Desktop */}
      <div className="w-64 bg-gray-900 text-white flex-col shadow-xl hidden md:flex">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl">
              <span className="text-white font-bold text-sm">SC</span>
            </div>
            <span className="text-xl font-bold">Survey AI</span>
          </Link>
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
              <span className="text-white text-sm font-semibold">{currentUser ? getInitials(currentUser.name) : ''}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentUser ? currentUser.name : 'Загрузка...'}</p>
              <p className="text-xs text-gray-400 truncate">{currentUser ? currentUser.email : ''}</p>
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
                <Link to="/" className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl">
                    <span className="text-white font-bold text-sm">SC</span>
                  </div>
                  <span className="text-xl font-bold">Survey AI</span>
                </Link>
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
                    <span className="text-white text-sm font-semibold">{currentUser ? getInitials(currentUser.name) : ''}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{currentUser ? currentUser.name : 'Загрузка...'}</p>
                    <p className="text-xs text-gray-400 truncate">{currentUser ? currentUser.email : ''}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 bg-white shadow-sm border-b">
          <div className="flex items-center gap-4">
            {/* Place for logo or title */}
            <span className="text-xl font-bold text-primary-700">Survey AI</span>
          </div>
          <div>
            <LogoutButton />
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative px-0 sm:px-0"
              >
                {/* Фон секции аналитики */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-purple-100 opacity-90" />
                <div className="flex items-center justify-between mb-10">
                  <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight drop-shadow-sm">Аналитика по опросам</h1>
                  {analytics && (
                    <button
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg transition-all duration-200 text-lg"
                      onClick={handleExportCSV}
                    >
                      <BarChart3 className="h-6 w-6" /> Экспорт CSV
                    </button>
                  )}
                </div>
                {/* Карточки-метрики */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-blue-100 flex items-center gap-6 overflow-hidden group hover:scale-[1.03] transition-transform"
                  >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-t-3xl" />
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 shadow-inner">
                      <ChartBar className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-4xl font-extrabold text-gray-900 drop-shadow-sm">{summaryStats.totalSurveys}</div>
                      <div className="text-base text-gray-500 font-medium mt-1">Всего опросов</div>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-green-100 flex items-center gap-6 overflow-hidden group hover:scale-[1.03] transition-transform"
                  >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-blue-400 rounded-t-3xl" />
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-blue-100 shadow-inner">
                      <Activity className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <div className="text-4xl font-extrabold text-gray-900 drop-shadow-sm">{summaryStats.activeSurveys}</div>
                      <div className="text-base text-gray-500 font-medium mt-1">Активных опросов</div>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-blue-100 flex items-center gap-6 overflow-hidden group hover:scale-[1.03] transition-transform"
                  >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-green-400 rounded-t-3xl" />
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-green-100 shadow-inner">
                      <MessageCircle className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-4xl font-extrabold text-gray-900 drop-shadow-sm">{summaryStats.totalResponses}</div>
                      </div>
                      <div className="text-base text-gray-500 font-medium mt-1">Всего ответов</div>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-yellow-100 flex items-center gap-6 overflow-hidden group hover:scale-[1.03] transition-transform"
                  >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-t-3xl" />
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-100 to-pink-100 shadow-inner">
                      <PieChart className="w-8 h-8 text-yellow-600" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-4xl font-extrabold text-gray-900 drop-shadow-sm">{summaryStats.averageResponseRate}</div>
                        <div className="text-lg font-medium text-gray-500">/ опрос</div>
                      </div>
                      <div className="text-base text-gray-500 font-medium mt-1">Среднее кол-во ответов</div>
                    </div>
                  </motion.div>
                </div>
                {/* Аналитика по выбранному опросу */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-200 mb-12"
                >
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                    <BarChart3 className="h-7 w-7 text-primary-600" /> Аналитика по опросу
                  </h2>
                  {loadingAnalytics && <div className="p-4 text-center text-lg">Загрузка аналитики...</div>}
                  {!loadingAnalytics && analytics && (
                    <div className="space-y-10">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl flex flex-col sm:flex-row gap-6 items-center shadow-inner">
                        <div className="flex-1">
                          <p className="text-xl font-semibold text-gray-800">Всего ответов: <span className="font-extrabold text-3xl text-blue-700">{analytics.total_responses}</span></p>
                        </div>
                        <div className="flex-1 flex flex-col gap-2 text-gray-600 text-base">
                          <span>Первый ответ: <span className="font-medium text-gray-900">{analytics.first_response_date ? new Date(analytics.first_response_date).toLocaleString('ru-RU') : '-'}</span></span>
                          <span>Последний ответ: <span className="font-medium text-gray-900">{analytics.last_response_date ? new Date(analytics.last_response_date).toLocaleString('ru-RU') : '-'}</span></span>
                          <span>Уникальных респондентов: <span className="font-medium text-gray-900">{analytics.unique_respondents || '-'}</span></span>
                          <span>Среднее время между ответами: <span className="font-medium text-gray-900">{analytics.avg_time_between_responses ? analytics.avg_time_between_responses + ' мин' : '-'}</span></span>
                        </div>
                      </div>
                      {/* Остальная аналитика по вопросам */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {Object.entries(analytics.question_analytics).map(([question, data], idx) => {
                          const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19AF'];
                          return (
                            <motion.div
                              key={question}
                              initial={{ opacity: 0, y: 30 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 * idx }}
                              className="border border-gray-100 rounded-2xl p-6 bg-white/90 shadow-lg flex flex-col gap-4"
                            >
                              <h3 className="text-lg font-bold mb-2 text-gray-900 flex items-center gap-2">
                                <PieChart className="h-5 w-5 text-primary-500" /> {question}
                              </h3>
                              {data.type === 'rating' && (
                                <div>
                                  <div className="flex gap-4 mb-2">
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">Средняя: {data.average}</span>
                                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">Медиана: {data.median}</span>
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">Мода: {data.mode}</span>
                                  </div>
                                  <div className="mt-2">
                                    <strong className="text-gray-700">Распределение:</strong>
                                    <ul className="pl-4 mt-1 text-gray-600">
                                      {Object.entries(data.distribution).map(([score, count]) => (
                                        <li key={score}>{score}: <span className="font-bold text-gray-900">{count}</span></li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              )}
                              {data.type === 'ranking' && (
                                <div>
                                  <p className="mb-2 font-medium text-gray-700">Средний ранг по каждому элементу:</p>
                                  <ul className="pl-4">
                                    {data.items && Object.entries(data.average_ranks || {}).map(([item, avg]) => (
                                      <li key={item}><span className="font-semibold text-gray-900">{item}</span>: <span className="text-blue-700 font-bold">{avg ? avg : '—'}</span></li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {data.type === 'multiple_choice' && (
                                <ResponsiveContainer width="100%" height={220}>
                                  <RBarChart data={Object.entries(data.answers).map(([name, value]) => ({ name, value }))}>
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]}>
                                      {Object.entries(data.answers).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      ))}
                                    </Bar>
                                  </RBarChart>
                                </ResponsiveContainer>
                              )}
                              {data.type === 'text' && data.sentiment && (
                                <ResponsiveContainer width="100%" height={220}>
                                  <RPieChart>
                                    <Pie
                                      data={Object.entries(data.sentiment).map(([name, value]) => ({ name, value: value * 100 }))}
                                      cx="50%"
                                      cy="50%"
                                      labelLine={false}
                                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                      outerRadius={70}
                                      fill="#6366f1"
                                      dataKey="value"
                                    >
                                      {Object.entries(data.sentiment).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                                    <Legend />
                                  </RPieChart>
                                </ResponsiveContainer>
                              )}
                              {/* Для текстовых и других типов — просто список ответов */}
                              {data.type === 'text' && !data.sentiment && data.answers && (
                                <div className="mt-2">
                                  <strong className="text-gray-700">Ответы:</strong>
                                  <ul className="pl-4 mt-1 text-gray-600 max-h-32 overflow-y-auto custom-scrollbar">
                                    {data.answers.map((ans, idx) => (
                                      <li key={idx} className="mb-1">{ans}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {data.type === 'ranking' && data.answers && (
                                <div className="mt-2">
                                  <strong className="text-gray-700">Ответы:</strong>
                                  <ul className="pl-4 mt-1 text-gray-600 max-h-32 overflow-y-auto custom-scrollbar">
                                    {data.answers.map((ans, idx) => (
                                      <li key={idx} className="mb-1">{JSON.stringify(ans)}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
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
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: hasActiveSurvey || isArchiveTab ? 1 : 1.05 }}
                          whileTap={{ scale: hasActiveSurvey || isArchiveTab ? 1 : 0.95 }}
                          onClick={handleCreateSurveyClick}
                          className={`${
                            hasActiveSurvey || isArchiveTab
                              ? 'bg-gray-400 cursor-not-allowed' 
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

            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-200"
              >
                <h2 className="text-2xl font-bold mb-4">Личный кабинет</h2>
                <ProfileSection currentUser={currentUser} surveys={surveys} />
              </motion.div>
            )}

            {activeTab === 'help' && (
              <motion.div
                key="help"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-200 text-center"
              >
                <h2 className="text-2xl font-bold mb-4">Справка</h2>
                <p className="text-gray-500 text-lg">Раздел в процессе разработки.</p>
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-200 text-center"
              >
                <h2 className="text-2xl font-bold mb-4">Настройки</h2>
                <p className="text-gray-500 text-lg">Раздел в процессе разработки.</p>
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

function ProfileSection({ currentUser, surveys }) {
  return (
    <div>
      <div className="mb-4">
        <div className="font-semibold">Email:</div>
        <div>{currentUser?.email || "-"}</div>
      </div>
    </div>
  );
}

export default DashboardPage;