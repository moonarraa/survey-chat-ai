import React, { useState } from "react";
import OAuthButtons from "../components/OAuthButtons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { User } from "lucide-react";

const BACKEND_URL = "http://localhost:8000";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const expired = new URLSearchParams(location.search).get("expired");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const body = new URLSearchParams();
      body.append("username", formData.email);
      body.append("password", formData.password);
      const res = await fetch(`${BACKEND_URL}/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Ошибка входа. Проверьте email и пароль.");
        setIsSubmitting(false);
        return;
      }
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError("Ошибка сети. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto h-16 w-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-6"
          >
            <User className="h-8 w-8 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Войти в SurveyChat AI</h2>
          <p className="text-gray-600">Используйте Google или email для входа</p>
        </div>

        {/* Email/Password Login Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-4"
        >
          {expired && (
            <div className="mb-4 text-red-600 text-center">
              Ваша сессия истекла. Пожалуйста, войдите снова.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 text-center"
              >
                {error}
              </motion.p>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 border-gray-300 hover:border-gray-400"
                placeholder="Введите email"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 border-gray-300 hover:border-gray-400"
                placeholder="Введите пароль"
                required
              />
            </div>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? "Вход..." : "Войти"}
            </motion.button>
          </form>
        </motion.div>

        {/* OAuth Login */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          <OAuthButtons />
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Нет аккаунта?{" "}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
