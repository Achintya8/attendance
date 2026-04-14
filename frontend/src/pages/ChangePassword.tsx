import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ChangePassword: React.FC = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const { username, role, token, userId } = location.state || {};

    React.useEffect(() => {
        if (!username) navigate('/login');
    }, [username, navigate]);

    if (!username) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (newPassword !== confirmPassword) { setError("Passwords don't match"); return; }
        if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
        setLoading(true);
        try {
            await api.post('/api/auth/change-password', { username, oldPassword, newPassword });
            setSuccess('Password changed! Redirecting...');
            setTimeout(() => {
                localStorage.setItem('token', token);
                localStorage.setItem('userId', userId);
                login(username, role);
                if (role === 'ADMIN') navigate('/admin');
                else if (role === 'TEACHER') navigate('/teacher');
                else navigate('/student');
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const EyeIcon = ({ show }: { show: boolean }) => show ? (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
    ) : (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
    );

    return (
        <div className="min-h-screen flex flex-col justify-center px-6 py-10" style={{ background: 'linear-gradient(160deg, #0f0f1a, #1a0f2e)' }}>
            <div className="text-center mb-8 fade-in">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', boxShadow: '0 8px 24px rgba(245,158,11,0.4)' }}>
                    <svg width="28" height="28" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                </div>
                <h1 className="text-2xl font-bold text-white">Set New Password</h1>
                <p className="text-slate-400 text-sm mt-1">Required for first-time login, {username}</p>
            </div>

            <div className="card-elevated p-6 fade-in">
                {error && <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>{error}</div>}
                {success && <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}>{success}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {[
                        { label: 'Current Password', val: oldPassword, set: setOldPassword, show: showOld, toggle: () => setShowOld(!showOld) },
                        { label: 'New Password', val: newPassword, set: setNewPassword, show: showNew, toggle: () => setShowNew(!showNew) },
                        { label: 'Confirm New Password', val: confirmPassword, set: setConfirmPassword, show: showNew, toggle: () => {} },
                    ].map(({ label, val, set, show, toggle }, i) => (
                        <div key={i}>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</label>
                            <div className="relative">
                                <input
                                    type={show ? 'text' : 'password'}
                                    value={val}
                                    onChange={(e) => set(e.target.value)}
                                    className="input-field pr-12"
                                    placeholder={`Enter ${label.toLowerCase()}`}
                                    required
                                />
                                <button type="button" onClick={toggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                                    <EyeIcon show={show} />
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="pt-1 p-3 rounded-xl text-xs" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
                        🔒 Min 6 characters. Choose something strong.
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2">
                        {loading ? (<><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Updating...</>) : 'Change Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
