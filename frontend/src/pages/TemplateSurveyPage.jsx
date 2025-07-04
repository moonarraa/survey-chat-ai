import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Rocket, Target, Zap, ArrowRight, Lightbulb } from 'lucide-react';
import { getApiUrl } from '../config';

export default function TemplateSurveyPage() {
    const [appName, setAppName] = useState('');
    const [appPurpose, setAppPurpose] = useState('');
    const [appFunctionality, setAppFunctionality] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(getApiUrl('api/surveys/from-template'), {
                 method: 'POST',
                 headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                 body: JSON.stringify({ app_name: appName, app_purpose: appPurpose, app_functionality: appFunctionality }),
             });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Something went wrong!');
            }

            const data = await response.json();
            navigate(`/dashboard/surveys/${data.id}/edit`);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-6 shadow-lg">
                        <Rocket className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                        Create a Survey for Your <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">MVP</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Provide some details about your project, and we'll generate a tailored survey powered by AI to help you get valuable feedback from your users.
                    </p>
                </motion.div>

                {/* Main Form */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-white" />
                            <h2 className="text-2xl font-bold text-white">Project Details</h2>
                        </div>
                        <p className="text-purple-100 mt-2">Tell us about your amazing project!</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* App Name */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                                <Target className="w-5 h-5 text-purple-600" />
                                Application Name
                            </label>
                            <input
                                type="text"
                                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 text-lg placeholder-gray-400 bg-white/70 backdrop-blur-sm"
                                value={appName}
                                onChange={(e) => setAppName(e.target.value)}
                                required
                                placeholder="e.g., TaskMaster Pro, FoodieConnect, StudyBuddy..."
                            />
                        </motion.div>

                        {/* App Purpose */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                                <Lightbulb className="w-5 h-5 text-purple-600" />
                                Purpose of the Application
                            </label>
                            <textarea
                                rows={4}
                                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 text-lg placeholder-gray-400 bg-white/70 backdrop-blur-sm resize-none"
                                value={appPurpose}
                                onChange={(e) => setAppPurpose(e.target.value)}
                                required
                                placeholder="Describe what problem your application solves or what value it provides to users. What makes it special?"
                            />
                        </motion.div>

                        {/* App Functionality */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                                <Zap className="w-5 h-5 text-purple-600" />
                                Key Functionality
                            </label>
                            <textarea
                                rows={5}
                                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 text-lg placeholder-gray-400 bg-white/70 backdrop-blur-sm resize-none"
                                value={appFunctionality}
                                onChange={(e) => setAppFunctionality(e.target.value)}
                                required
                                placeholder="List the main features or actions a user can take in your application. What can users do with your app?"
                            />
                        </motion.div>
                        
                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg"
                            >
                                <div className="flex">
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700 font-medium">{error}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="flex justify-center pt-4"
                        >
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: loading ? 1 : 1.02 }}
                                whileTap={{ scale: loading ? 1 : 0.98 }}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-lg min-w-[200px] justify-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-6 h-6" />
                                        Generate Survey
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </motion.button>
                        </motion.div>
                    </form>
                </motion.div>

                {/* Features Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">AI-Powered Questions</h3>
                        <p className="text-gray-600">Get intelligent, relevant questions generated specifically for your project</p>
                    </div>
                    
                    <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Targeted Feedback</h3>
                        <p className="text-gray-600">Collect focused insights that help improve your MVP effectively</p>
                    </div>
                    
                    <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Real-time Results</h3>
                        <p className="text-gray-600">See your project climb the leaderboard as feedback comes in</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
} 