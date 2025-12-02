import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === 'ADMIN') navigate('/admin');
            else if (user.role === 'TEACHER') navigate('/teacher');
            else navigate('/student');
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/api/auth/login', { username, password });
            const { token, role, userId, passwordChanged, username: responseUsername } = response.data;

            // Check if password change is required
            if (!passwordChanged && role !== 'ADMIN') {
                navigate('/change-password', {
                    state: { username: responseUsername, role, token, userId }
                });
                return;
            }

            // Store token in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);

            // Update auth context
            login(responseUsername, role);
        } catch (err: any) {
            setError(err.response?.data || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-96">
                <div className="text-center mb-6">
                    <img src="/logo.png" alt="Logo" className="h-24 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-gray-800">Attendance App</h2>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Logging in...' : 'Sign In'}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default Login;
