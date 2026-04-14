import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Student { id: number; rollNum: string; name: string; email: string; department: string; semester: number; section: string; }
interface ClassSession { id: number; date: string; period: number; course: { id: number; name: string; code: string }; teacher: { id: number; name: string }; section: string; type: string; status: string; }

const STATUSES = [
    { key: 'P', label: 'Present', color: '#4ade80', bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)' },
    { key: 'A', label: 'Absent', color: '#f87171', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)' },
    { key: 'O', label: 'OD', color: '#60a5fa', bg: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.4)' },
    { key: 'M', label: 'Med', color: '#c084fc', bg: 'rgba(192,132,252,0.15)', border: 'rgba(192,132,252,0.4)' },
];

const AttendancePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const session: ClassSession = location.state?.session;

    const [students, setStudents] = useState<Student[]>([]);
    const [records, setRecords] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (!session) { navigate('/teacher'); return; }
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const teacherId = user?.id || session.teacher.id;
            const r = await api.get(`/api/teacher/students?section=${session.section}&courseId=${session.course.id}&teacherId=${teacherId}`);
            const list: Student[] = r.data;
            const init: Record<number, string> = {};
            list.forEach(s => init[s.id] = 'P');
            setRecords(init);
            setStudents(list);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const submitAttendance = async () => {
        setSubmitting(true);
        try {
            const data = Object.entries(records).map(([id, status]) => ({ studentId: parseInt(id), status, remarks: '' }));
            await api.post(`/api/teacher/attendance/${session.id}`, data);
            setSubmitted(true);
            setTimeout(() => navigate('/teacher'), 1500);
        } catch (e) { alert('Error marking attendance'); }
        setSubmitting(false);
    };

    // Summary counts
    const counts = STATUSES.reduce((acc, s) => {
        acc[s.key] = Object.values(records).filter(v => v === s.key).length;
        return acc;
    }, {} as Record<string, number>);

    if (!session) return null;

    if (submitted) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#0f0f1a' }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.4)' }}>
                    <svg width="36" height="36" fill="none" stroke="#4ade80" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="text-xl font-bold text-white mb-2">Attendance Submitted!</p>
                <p className="text-slate-400 text-sm">Redirecting back...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-28" style={{ background: '#0f0f1a' }}>
            {/* Header */}
            <div className="safe-top" style={{ background: 'linear-gradient(135deg, #1a1a35, #0f0f1a)', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
                <div className="px-4 pt-4 flex items-start gap-3">
                    <button onClick={() => navigate('/teacher')} className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 press-effect" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <svg width="16" height="16" fill="none" stroke="#94a3b8" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="font-bold text-white text-base leading-tight">Mark Attendance</h1>
                        <p className="text-xs text-indigo-300 mt-0.5 truncate">{session.course.name} · {session.course.code}</p>
                        <p className="text-xs text-slate-500">Section {session.section} · Period {session.period} · {new Date(session.date).toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                    </div>
                </div>

                {/* Summary pills */}
                <div className="flex gap-2 px-4 mt-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                    {STATUSES.map(s => (
                        <div key={s.key} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                            <span className="text-xs font-bold" style={{ color: s.color }}>{s.key}</span>
                            <span className="text-xs font-bold" style={{ color: s.color }}>{counts[s.key] || 0}</span>
                        </div>
                    ))}
                    <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <span className="text-xs text-slate-400">Total</span>
                        <span className="text-xs font-bold text-slate-200">{students.length}</span>
                    </div>
                </div>
            </div>

            {/* Students */}
            <div className="px-4 pt-4">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="shimmer h-20 rounded-2xl" />)}
                    </div>
                ) : students.length === 0 ? (
                    <div className="card p-8 text-center">
                        <p className="text-3xl mb-2">👥</p>
                        <p className="text-slate-400 text-sm">No students in this section</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {students.map((student) => {
                            const currentStatus = records[student.id] || 'P';
                            const currentStatusObj = STATUSES.find(s => s.key === currentStatus)!;
                            return (
                                <div key={student.id} className="card-elevated p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                                            style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
                                            {student.name[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-white text-sm truncate">{student.name}</p>
                                            <p className="text-xs text-slate-500">{student.rollNum}</p>
                                        </div>
                                        {/* Current status indicator */}
                                        <div className="px-2 py-1 rounded-lg text-xs font-bold" style={{ background: currentStatusObj.bg, color: currentStatusObj.color }}>
                                            {currentStatusObj.label}
                                        </div>
                                    </div>

                                    {/* Status buttons */}
                                    <div className="grid grid-cols-4 gap-2">
                                        {STATUSES.map(s => {
                                            const selected = currentStatus === s.key;
                                            return (
                                                <button
                                                    key={s.key}
                                                    onClick={() => setRecords(prev => ({ ...prev, [student.id]: s.key }))}
                                                    className="status-btn w-full"
                                                    style={selected
                                                        ? { background: s.bg, color: s.color, border: `2px solid ${s.border}`, boxShadow: `0 0 12px ${s.color}40` }
                                                        : { background: 'rgba(255,255,255,0.04)', color: '#475569', border: '2px solid rgba(255,255,255,0.06)' }
                                                    }
                                                >
                                                    {s.key}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Submit Bar */}
            <div className="fixed bottom-0 left-0 right-0 px-4 py-4 safe-bottom" style={{ background: 'rgba(15,15,26,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/teacher')} className="py-4 px-5 rounded-2xl font-semibold text-sm press-effect" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                        Cancel
                    </button>
                    <button
                        onClick={submitAttendance}
                        disabled={submitting || students.length === 0}
                        className="flex-1 py-4 rounded-2xl font-bold text-sm press-effect flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #4ade80, #16a34a)', color: 'white', boxShadow: '0 4px 16px rgba(74,222,128,0.3)' }}
                    >
                        {submitting ? (
                            <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Submitting...</>
                        ) : `Submit Attendance (${students.length})`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AttendancePage;
