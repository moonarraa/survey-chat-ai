import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function LogoutButton() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
    >
      {t('Logout')}
    </button>
  );
}
