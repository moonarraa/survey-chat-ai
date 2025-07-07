import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      navigate("/dashboard"); // Redirect to home or dashboard
    } else {
      alert("Ошибка входа: токен не получен.");
      navigate("/login");
    }
  }, [location, navigate]);

  return <div>Вход через Google...</div>;
}
