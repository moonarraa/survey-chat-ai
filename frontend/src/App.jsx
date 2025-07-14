import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PricingPage from './pages/PricingPage';
import AuthCallback from './pages/AuthCallback';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import CreateSurveyPage from './pages/CreateSurveyPage';
import SurveyDetailPage from './pages/SurveyDetailPage';
import SurveyPublicPage from './pages/SurveyPublicPage';
import TemplateSurveyPage from './pages/TemplateSurveyPage';
import './i18n';
import LanguageSwitcher from './components/LanguageSwitcher';
import Navbar from './components/Navbar';
import Hero from './components/Hero';

function AppLayout() {
  const location = useLocation();
  // Hide navbar/footer on public survey page and dashboard
  const isPublicSurvey = /^\/s\//.test(location.pathname);
  const isDashboard = location.pathname.startsWith('/dashboard');
  
  return (
    <div className="min-h-screen flex flex-col">
      {!isPublicSurvey && !isDashboard && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/surveys/:id" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/surveys/:id/edit" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/create-survey" element={<ProtectedRoute><CreateSurveyPage /></ProtectedRoute>} />
          <Route path="/create-template-survey" element={<ProtectedRoute><TemplateSurveyPage /></ProtectedRoute>} />
          <Route path="/survey/:id" element={<ProtectedRoute><SurveyDetailPage /></ProtectedRoute>} />
          <Route path="/s/:public_id" element={<SurveyPublicPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;