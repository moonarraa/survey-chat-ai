import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthCallback from './pages/AuthCallback';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import CreateSurveyPage from './pages/CreateSurveyPage';
import SurveyDetailPage from './pages/SurveyDetailPage';
import SurveyPublicPage from './pages/SurveyPublicPage';

function AppLayout() {
  const location = useLocation();
  // Hide header/footer on public survey page
  const isPublicSurvey = /^\/s\//.test(location.pathname);
  return (
    <div className="min-h-screen flex flex-col">
      {!isPublicSurvey && <Header />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/auth/callback/google" element={<AuthCallback />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-survey" element={<ProtectedRoute><CreateSurveyPage /></ProtectedRoute>} />
          <Route path="/survey/:id" element={<ProtectedRoute><SurveyDetailPage /></ProtectedRoute>} />
          <Route path="/s/:public_id" element={<SurveyPublicPage />} />
        </Routes>
      </main>
      {!isPublicSurvey && <Footer />}
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