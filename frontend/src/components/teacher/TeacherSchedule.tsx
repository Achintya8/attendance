import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface ClassSession {
    id: number; date: string; period: number;
    course: { id: number; name: string; code: string };
    teacher: { id: number; name: string };
    section: string; type: string; status: string;
}
interface Course { id: number; code: string; name: string; }
interface TeacherScheduleProps { user: any; courses: Course[]; sections: string[]; }

const PERIOD_TIMES: { [key: number]: string } = {
    1: "09:00 – 10:00", 2: "10:00 – 11:00", 3: "11:30 – 12:30",
    4: "12:30 – 01:30", 5: "02:30 – 03:30", 6: "03:30 – 04:30"
};

const TeacherSchedule: React.FC<TeacherScheduleProps> = ({ user, courses, sections }) => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [schedule, setSchedule] = useState<ClassSession[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSectionDropdown, setShowSectionDropdown] = useState(false);
    const [editingSession, setEditingSession] = useState<ClassSession | null>(null);
    const [newClassData, setNewClassData] = useState({ date: new Date().toISOString().split('T')[0], period: 1, courseId: '', section: '' });
    const [cancelConfirmId, setCancelConfirmId] = useState<number | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (user?.id) fetchSchedule();
    }, [selectedDate, user?.id]);

    const fetchSchedule = async () => {
        setLoading(true);
        try {
            const r = await api.get(`/api/teacher/schedule?date=${selectedDate}&teacherId=${user?.id}`);
            setSchedule(r.data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleAddClass = async () => {
        if (!newClassData.courseId || !newClassData.section) { alert('Select course and section'); return; }
        setActionLoading(true);
        try {
            await api.post('/api/teacher/session', { ...newClassData, teacherId: user?.id });
            setShowAddModal(false);
            setNewClassData({ date: new Date().toISOString().split('T')[0], period: 1, courseId: '', section: '' });
            fetchSchedule();
        } catch (e) { alert('Failed to add class'); }
        setActionLoading(false);
    };

    const saveEdit = async () => {
        if (!editingSession) return;
        setActionLoading(true);
        try {
            await api.put(`/api/teacher/session/${editingSession.id}`, editingSession);
            setEditingSession(null);
            fetchSchedule();
        } catch (e) { alert('Failed to update'); }
        setActionLoading(false);
    };

    const confirmCancel = async () => {
        if (!cancelConfirmId) return;
        setActionLoading(true);
        try {
            await api.delete(`/api/teacher/session/${cancelConfirmId}`);
            fetchSchedule();
        } catch (e) { alert('Failed to cancel'); }
        setCancelConfirmId(null);
        setActionLoading(false);
    };

    // Days for quick date picker
    const getDays = () => {
        const days = [];
        for (let i = -1; i <= 5; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            days.push({ iso: d.toISOString().split('T')[0], day: d.toLocaleDateString('en', { weekday: 'short' }), date: d.getDate() });
        }
        return days;
    };

    const statusBadge = (status: string) => {
        if (status === 'SCHEDULED') return { bg: 'rgba(34,197,94,0.12)', color: '#4ade80', border: 'rgba(34,197,94,0.25)', label: 'Scheduled' };
        if (status === 'CANCELLED') return { bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.25)', label: 'Cancelled' };
        return { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8', border: 'rgba(100,116,139,0.25)', label: status };
    };

    const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
            <div className="w-full rounded-t-3xl p-6 pb-8" style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' }} onClick={e => e.stopPropagation()}>
                <div className="w-10 h-1 rounded-full bg-slate-600 mx-auto mb-5" />
                <h2 className="text-lg font-bold text-white mb-4">{title}</h2>
                {children}
            </div>
        </div>
    );

    return (
        <div className="fade-in">
            {/* Horizontal date scroller */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-0" style={{ scrollbarWidth: 'none' }}>
                {getDays().map(({ iso, day, date }) => {
                    const active = iso === selectedDate;
                    return (
                        <button key={iso} onClick={() => setSelectedDate(iso)} className="flex-shrink-0 flex flex-col items-center py-2 px-3 rounded-2xl transition-all press-effect" style={active
                            ? { background: 'linear-gradient(135deg, #6366f1, #818cf8)', minWidth: 52, boxShadow: '0 4px 12px rgba(99,102,241,0.4)' }
                            : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', minWidth: 52 }
                        }>
                            <span className="text-xs font-medium" style={{ color: active ? '#c7d2fe' : '#64748b' }}>{day}</span>
                            <span className="text-base font-bold" style={{ color: active ? 'white' : '#e2e8f0' }}>{date}</span>
                        </button>
                    );
                })}
                {/* Custom date input */}
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                    className="flex-shrink-0 rounded-2xl px-3 text-xs text-slate-400 press-effect"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', minWidth: 44 }}
                />
            </div>

            {/* Add Class FAB */}
            <button onClick={() => setShowAddModal(true)} className="w-full mb-4 py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm press-effect"
                style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Add Extra Class
            </button>

            {/* Sessions */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map(i => <div key={i} className="shimmer h-28 rounded-2xl" />)}
                </div>
            ) : schedule.length === 0 ? (
                <div className="card p-8 text-center">
                    <p className="text-3xl mb-2">📅</p>
                    <p className="text-slate-400 text-sm">No classes for this day</p>
                    <p className="text-slate-600 text-xs mt-1">Tap "Add Extra Class" to create one</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {schedule.map(session => {
                        const badge = statusBadge(session.status);
                        return (
                            <div key={session.id} className="card-elevated p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-semibold rounded-lg px-2 py-0.5" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
                                                P{session.period} · {PERIOD_TIMES[session.period]}
                                            </span>
                                            <span className="text-xs rounded-lg px-2 py-0.5" style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                                                {badge.label}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-white text-sm">{session.course.name}</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">{session.course.code} · Section {session.section}</p>
                                    </div>
                                </div>

                                {session.status === 'SCHEDULED' && (
                                    <div className="flex gap-2 mt-3">
                                        <button onClick={() => navigate('/attendance', { state: { session } })}
                                            className="flex-1 py-2 rounded-xl text-xs font-bold press-effect"
                                            style={{ background: 'linear-gradient(135deg, #4ade80, #16a34a)', color: 'white', boxShadow: '0 2px 8px rgba(74,222,128,0.3)' }}>
                                            Take Attendance
                                        </button>
                                        <button onClick={() => setEditingSession(session)}
                                            className="px-4 py-2 rounded-xl text-xs font-semibold press-effect"
                                            style={{ background: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.25)' }}>
                                            Edit
                                        </button>
                                        <button onClick={() => setCancelConfirmId(session.id)}
                                            className="px-4 py-2 rounded-xl text-xs font-semibold press-effect"
                                            style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Class Modal */}
            {showAddModal && (
                <Modal title="Add Extra Class" onClose={() => setShowAddModal(false)}>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">Date</label>
                            <input type="date" value={newClassData.date} onChange={e => setNewClassData({ ...newClassData, date: e.target.value })} className="input-field" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">Period</label>
                            <select value={newClassData.period} onChange={e => setNewClassData({ ...newClassData, period: parseInt(e.target.value) })} className="input-field">
                                {Object.entries(PERIOD_TIMES).map(([p, t]) => <option key={p} value={p} style={{ background: '#1a1a2e' }}>Period {p} ({t})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">Course</label>
                            <select value={newClassData.courseId} onChange={e => setNewClassData({ ...newClassData, courseId: e.target.value })} className="input-field">
                                <option value="" style={{ background: '#1a1a2e' }}>Select Course</option>
                                {courses.map(c => <option key={c.id} value={c.id} style={{ background: '#1a1a2e' }}>{c.name} ({c.code})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">Section(s)</label>
                            <div className="relative">
                                <button onClick={() => setShowSectionDropdown(!showSectionDropdown)} className="input-field text-left flex justify-between items-center">
                                    <span className={newClassData.section ? 'text-slate-200' : 'text-slate-500'}>{newClassData.section || 'Select Section(s)'}</span>
                                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {showSectionDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-1 rounded-2xl overflow-hidden z-10 shadow-2xl" style={{ background: '#252540', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        {sections.map(sec => (
                                            <label key={sec} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer">
                                                <input type="checkbox"
                                                    checked={newClassData.section.split(',').filter(Boolean).includes(sec)}
                                                    onChange={e => {
                                                        const curr = newClassData.section ? newClassData.section.split(',').filter(Boolean) : [];
                                                        const updated = e.target.checked ? [...curr, sec] : curr.filter(s => s !== sec);
                                                        setNewClassData({ ...newClassData, section: updated.join(',') });
                                                    }}
                                                    className="w-4 h-4 rounded accent-indigo-500"
                                                />
                                                <span className="text-sm text-slate-200">{sec}</span>
                                            </label>
                                        ))}
                                        <button onClick={() => setShowSectionDropdown(false)} className="w-full py-2 text-xs font-semibold text-indigo-400" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>Done</button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl text-sm font-semibold press-effect" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>Cancel</button>
                            <button onClick={handleAddClass} disabled={actionLoading} className="flex-1 py-3 rounded-xl text-sm font-bold press-effect" style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: 'white' }}>
                                {actionLoading ? 'Adding...' : 'Add Class'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Edit Modal */}
            {editingSession && (
                <Modal title="Edit Session" onClose={() => setEditingSession(null)}>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">Course</label>
                            <input type="text" value={editingSession.course.name} disabled className="input-field opacity-50" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">Date</label>
                            <input type="date" value={editingSession.date} onChange={e => setEditingSession({ ...editingSession, date: e.target.value })} className="input-field" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">Period</label>
                            <select value={editingSession.period} onChange={e => setEditingSession({ ...editingSession, period: parseInt(e.target.value) })} className="input-field">
                                {Object.entries(PERIOD_TIMES).map(([p, t]) => <option key={p} value={p} style={{ background: '#1a1a2e' }}>Period {p} ({t})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">Section</label>
                            <input type="text" value={editingSession.section} onChange={e => setEditingSession({ ...editingSession, section: e.target.value })} className="input-field" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">Status</label>
                            <select value={editingSession.status} onChange={e => setEditingSession({ ...editingSession, status: e.target.value })} className="input-field">
                                <option value="SCHEDULED" style={{ background: '#1a1a2e' }}>Scheduled</option>
                                <option value="COMPLETED" style={{ background: '#1a1a2e' }}>Completed</option>
                                <option value="CANCELLED" style={{ background: '#1a1a2e' }}>Cancelled</option>
                            </select>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setEditingSession(null)} className="flex-1 py-3 rounded-xl text-sm font-semibold press-effect" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>Cancel</button>
                            <button onClick={saveEdit} disabled={actionLoading} className="flex-1 py-3 rounded-xl text-sm font-bold press-effect" style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: 'white' }}>
                                {actionLoading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Cancel Confirm Modal */}
            {cancelConfirmId && (
                <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
                    <div className="w-full rounded-t-3xl p-6 pb-8" style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="w-10 h-1 rounded-full bg-slate-600 mx-auto mb-5" />
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.15)' }}>
                            <svg width="24" height="24" fill="none" stroke="#f87171" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h2 className="text-lg font-bold text-white text-center mb-2">Cancel Class?</h2>
                        <p className="text-sm text-slate-400 text-center mb-6">This cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setCancelConfirmId(null)} className="flex-1 py-3 rounded-xl text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>Keep It</button>
                            <button onClick={confirmCancel} disabled={actionLoading} className="flex-1 py-3 rounded-xl text-sm font-bold" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white' }}>
                                {actionLoading ? 'Cancelling...' : 'Yes, Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherSchedule;
