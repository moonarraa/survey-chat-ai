import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, TrendingUp, Users, Crown, Medal, Award } from 'lucide-react';
import { BACKEND_URL } from '../config';

const LeaderboardPage = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/leaderboard`);
                if (!response.ok) {
                    throw new Error('Failed to fetch leaderboard');
                }
                const data = await response.json();
                setLeaderboard(data);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();

        const backendUrl = new URL(BACKEND_URL);
        const wsProtocol = backendUrl.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${backendUrl.host}/ws/leaderboard`;

        const ws = new WebSocket(wsUrl);
        
        ws.onmessage = (event) => {
            const updatedLeaderboard = JSON.parse(event.data);
            setLeaderboard(updatedLeaderboard);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
        };

        return () => {
            ws.close();
        };

    }, []);

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return <Crown className="w-6 h-6 text-yellow-500" />;
            case 2:
                return <Medal className="w-6 h-6 text-gray-400" />;
            case 3:
                return <Award className="w-6 h-6 text-orange-500" />;
            default:
                return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">{rank}</span>;
        }
    };

    const getRankStyle = (rank) => {
        switch (rank) {
            case 1:
                return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
            case 2:
                return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
            case 3:
                return "bg-gradient-to-r from-orange-400 to-orange-600 text-white";
            default:
                return "bg-white text-gray-800 border border-gray-200";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-6 animate-pulse">
                            <Trophy className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-xl text-gray-600">Loading leaderboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center py-20">
                        <div className="text-red-500 text-xl mb-4">Error: {error}</div>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mb-6 shadow-lg">
                        <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                        MVP <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">Leaderboard</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        See how the projects rank based on real-time feedback! Competition is live and updates instantly.
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                >
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center shadow-lg">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">{leaderboard.length}</h3>
                        <p className="text-gray-600">Projects Competing</p>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center shadow-lg">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Star className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">
                            {leaderboard.length > 0 ? leaderboard[0]?.average_rating?.toFixed(1) || '0.0' : '0.0'}
                        </h3>
                        <p className="text-gray-600">Top Rating</p>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center shadow-lg">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">Live</h3>
                        <p className="text-gray-600">Real-time Updates</p>
                    </div>
                </motion.div>

                {/* Leaderboard Table */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Trophy className="w-6 h-6" />
                            Rankings
                        </h2>
                    </div>

                    {leaderboard.length === 0 ? (
                        <div className="text-center py-16">
                            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Projects Yet</h3>
                            <p className="text-gray-500">Be the first to create an MVP survey and claim the top spot!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/80">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                            Rank
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                            Project Name
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                            Average Rating
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                            Helpful Score
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {leaderboard.map((project, index) => (
                                        <motion.tr
                                            key={project.rank}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                            className={`hover:bg-gray-50/50 transition-colors duration-200 ${getRankStyle(project.rank).includes('gradient') ? 'bg-gradient-to-r' : ''}`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {getRankIcon(project.rank)}
                                                    <span className={`text-lg font-bold ${project.rank <= 3 ? 'text-white' : 'text-gray-800'}`}>
                                                        #{project.rank}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`font-semibold text-lg ${project.rank <= 3 ? 'text-white' : 'text-gray-800'}`}>
                                                    {project.app_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Star className={`w-5 h-5 ${project.rank <= 3 ? 'text-white' : 'text-yellow-500'}`} fill="currentColor" />
                                                    <span className={`text-lg font-semibold ${project.rank <= 3 ? 'text-white' : 'text-gray-800'}`}>
                                                        {project.average_rating.toFixed(1)}/10
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${project.helpful_percentage >= 80 ? 'bg-green-500' : project.helpful_percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                                    <span className={`text-lg font-semibold ${project.rank <= 3 ? 'text-white' : 'text-gray-800'}`}>
                                                        {project.helpful_percentage.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>

                {/* Live Update Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="text-center mt-8"
                >
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Live updates enabled
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LeaderboardPage; 