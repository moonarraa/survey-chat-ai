import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
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
      Выйти
    </button>
  );
}
