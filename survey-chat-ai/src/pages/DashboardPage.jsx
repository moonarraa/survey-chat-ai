import { useState } from 'react';
import { Link } from 'react-router-dom';
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

  // Mock data for projects
  const projects = [
    {
      id: 1,
      type: 'NPS',
      title: 'How likely are you to recommend SurveyChat AI to a friend or colleague?',
      responses: 1,
      newResponses: 1,
      lastResponse: 'Today',
      tags: [],
      isActive: true
    },
    {
      id: 2,
      type: 'Interview',
      title: '[Sample] Onboarding Interview - How easy was it to get started with our platform?',
      responses: 30,
      newResponses: 30,
      lastResponse: 'Apr 2',
      tags: [],
      isActive: true
    }
  ];

  const sidebarItems = [
    { id: 'summary', icon: Home, label: 'Company Summary', active: activeTab === 'summary' },
    { id: 'projects', icon: FolderOpen, label: 'Projects', active: activeTab === 'projects' },
    { id: 'help', icon: HelpCircle, label: 'Help Docs', active: false },
    { id: 'settings', icon: Settings, label: 'Settings', active: false }
  ];

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
                <h1 className="text-3xl font-bold text-gray-900">AI Projects</h1>
                <button className="btn-primary inline-flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Add project
                </button>
              </div>

              {/* Tabs and Search */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  {/* Tabs */}
                  <div className="flex space-x-8">
                    <button className="text-primary-600 font-medium border-b-2 border-primary-600 pb-2">
                      Current
                    </button>
                    <button className="text-gray-500 hover:text-gray-700 pb-2">
                      Archived
                    </button>
                  </div>

                  {/* Search and Filter */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">All Tags</span>
                    </button>
                  </div>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 py-3 border-b border-gray-200 text-sm font-medium text-gray-700">
                  <div className="col-span-5">Project</div>
                  <div className="col-span-2 text-center">Responses</div>
                  <div className="col-span-2 text-center">Last Response</div>
                  <div className="col-span-2 text-center">Tags</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Project Rows */}
                <div className="space-y-4 mt-4">
                  {projects.map((project) => (
                    <div key={project.id} className="grid grid-cols-12 gap-4 py-4 items-center hover:bg-gray-50 rounded-lg transition-colors">
                      {/* Project Info */}
                      <div className="col-span-5 flex items-center space-x-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {project.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 font-medium">{project.title}</p>
                        </div>
                      </div>

                      {/* Responses */}
                      <div className="col-span-2 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-sm text-gray-900">{project.responses}</span>
                          <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                            {project.newResponses} New
                          </span>
                        </div>
                      </div>

                      {/* Last Response */}
                      <div className="col-span-2 text-center">
                        <span className="text-sm text-gray-600">{project.lastResponse}</span>
                      </div>

                      {/* Tags */}
                      <div className="col-span-2 text-center">
                        <button className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                          <Tag className="h-4 w-4 inline mr-1" />
                          Add tag
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 text-right">
                        <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600">1-2 of 2</span>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;