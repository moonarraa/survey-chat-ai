import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PricingPage from './pages/PricingPage';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthCallback from './pages/AuthCallback';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import CreateSurveyPage from './pages/CreateSurveyPage';
import SurveyDetailPage from './pages/SurveyDetailPage';
import SurveyPublicPage from './pages/SurveyPublicPage';
import TemplateSurveyPage from './pages/TemplateSurveyPage';
import LeaderboardPage from './pages/LeaderboardPage';

function AppLayout() {
  const location = useLocation();
  // Hide header/footer on public survey page and dashboard
  const isPublicSurvey = /^\/s\//.test(location.pathname);
  const isDashboard = location.pathname.startsWith('/dashboard');
  
  return (
    <div className="min-h-screen flex flex-col">
      {!isPublicSurvey && !isDashboard && <Header />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/surveys/:id" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/surveys/:id/edit" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/auth/callback/google" element={<AuthCallback />} />
          <Route path="/create-survey" element={<ProtectedRoute><CreateSurveyPage /></ProtectedRoute>} />
          <Route path="/create-template-survey" element={<ProtectedRoute><TemplateSurveyPage /></ProtectedRoute>} />
          <Route path="/survey/:id" element={<ProtectedRoute><SurveyDetailPage /></ProtectedRoute>} />
          <Route path="/s/:public_id" element={<SurveyPublicPage />} />
        </Routes>
      </main>
      {!isPublicSurvey && !isDashboard && <Footer />}
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