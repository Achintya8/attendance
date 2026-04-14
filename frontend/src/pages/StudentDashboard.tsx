import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AttendanceStats {
    totalClasses: number;
    presentCount: number;
    percentage: number;
    breakdown: { [key: string]: number };
}

interface CourseAttendance {
    courseId: number;
    courseName: string;
    courseCode: string;
    totalClasses: number;
    presentCount: number;
    percentage: number;
    breakdown: { [key: string]: number };
}

// Helper: first day of current academic year (June 1)
const academicStart = () => {
    const now = new Date();
    const year = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
    return `${year}-06-01`;
};
const today = () => new Date().toISOString().split('T')[0];

const CircularProgress: React.FC<{ percentage: number; size?: number }> = ({ percentage, size = 110 }) => {
    const radius = (size - 18) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;
    const color = percentage >= 75 ? '#4ade80' : percentage >= 65 ? '#facc15' : '#f87171';

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="9"
                    strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 6px ${color})` }} />
            </svg>
            <div className="absolute text-center">
                <div className="text-xl font-bold leading-tight" style={{ color }}>{percentage.toFixed(0)}%</div>
                <div className="text-xs text-slate-500">Overall</div>
            </div>
        </div>
    );
};

const StudentDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const studentId = localStorage.getItem('userId');

    const [stats, setStats] = useState<AttendanceStats | null>(null);
    const [courseAttendance, setCourseAttendance] = useState<CourseAttendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'chart'>('overview');

    // Date range state
    const [fromDate, setFromDate] = useState(academicStart());
    const [toDate, setToDate] = useState(today());
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [filterApplied, setFilterApplied] = useState(false);

    const fetchData = useCallback(async (from?: string, to?: string) => {
        setLoading(true);
        const dateParams = from && to ? `&from=${from}&to=${to}` : '';
        try {
            const [statsRes, coursesRes] = await Promise.all([
                api.get(`/api/student/stats/${studentId}?dummy=1${dateParams}`),
                api.get(`/api/student/attendance/courses/${studentId}?dummy=1${dateParams}`),
            ]);
            setStats(statsRes.data);
            setCourseAttendance(coursesRes.data);
        } catch (e) { console.error(e); }
        setLoading(false);
    }, [studentId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const applyFilter = () => {
        setFilterApplied(true);
        setShowDateFilter(false);
        fetchData(fromDate, toDate);
    };

    const clearFilter = () => {
        setFilterApplied(false);
        setFromDate(academicStart());
        setToDate(today());
        fetchData();
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload?.length) {
            const d = payload[0].payload;
            return (
                <div className="card p-3 text-xs shadow-xl">
                    <p className="font-bold text-slate-200 mb-1">{d.courseCode}</p>
                    <p className="text-slate-400">{d.courseName}</p>
                    <p className="mt-1" style={{ color: d.percentage >= 75 ? '#4ade80' : '#f87171' }}>{d.percentage}%</p>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#0f0f1a' }}>
                <svg className="animate-spin w-10 h-10 mb-4" fill="none" viewBox="0 0 24 24" style={{ color: '#6366f1' }}>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-slate-500 text-sm">Loading attendance...</p>
            </div>
        );
    }

    const pct = stats?.percentage || 0;
    const statusColor = pct >= 75 ? '#4ade80' : pct >= 65 ? '#facc15' : '#f87171';

    return (
        <div className="min-h-screen pb-nav" style={{ background: '#0f0f1a' }}>
            {/* Header */}
            <div className="safe-top" style={{ background: 'linear-gradient(135deg, #1a1a35, #0f0f1a)', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
                <div className="px-4 pt-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Welcome back,</p>
                        <h1 className="text-lg font-bold text-white capitalize">{user?.username || 'Student'}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Date Filter Toggle */}
                        <button onClick={() => setShowDateFilter(true)}
                            className="h-9 px-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold press-effect"
                            style={filterApplied
                                ? { background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.5)', color: '#818cf8' }
                                : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b' }
                            }>
                            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" /><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" /></svg>
                            {filterApplied ? `${fromDate.slice(5)} – ${toDate.slice(5)}` : 'Filter'}
                            {filterApplied && (
                                <span onClick={e => { e.stopPropagation(); clearFilter(); }} className="ml-1 text-indigo-300 hover:text-white">✕</span>
                            )}
                        </button>
                        <div className="text-right">
                            <div className="text-xs text-slate-500">Status</div>
                            <div className="text-xs font-bold" style={{ color: statusColor }}>
                                {pct >= 75 ? '✓ Eligible' : '⚠ At Risk'}
                            </div>
                        </div>
                        <button onClick={logout} className="w-9 h-9 rounded-xl flex items-center justify-center press-effect" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                            <svg width="16" height="16" fill="none" stroke="#f87171" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Bar */}
            <div className="flex px-4 pt-4 gap-2">
                {(['overview', 'courses', 'chart'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className="flex-1 py-2 text-xs font-semibold rounded-xl capitalize transition-all press-effect"
                        style={activeTab === tab
                            ? { background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: 'white', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }
                            : { background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.07)' }
                        }
                    >{tab}</button>
                ))}
            </div>

            {/* Date Filter active banner */}
            {filterApplied && (
                <div className="mx-4 mt-3 p-2.5 rounded-xl flex items-center gap-2 text-xs" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}>
                    <svg width="13" height="13" fill="none" stroke="#818cf8" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" /></svg>
                    <span className="text-indigo-300 font-medium">Showing: {fromDate} to {toDate}</span>
                    <button onClick={clearFilter} className="ml-auto text-slate-400 hover:text-white">Clear</button>
                </div>
            )}

            {/* Content */}
            <div className="px-4 pt-4 fade-in">
                {activeTab === 'overview' && (
                    <div className="space-y-4">
                        <div className="card-elevated p-5 flex items-center gap-5">
                            <CircularProgress percentage={pct} size={100} />
                            <div className="flex-1">
                                <p className="text-xs text-slate-400 mb-1">Classes Attended</p>
                                <p className="text-2xl font-bold text-white">{stats?.presentCount || 0}
                                    <span className="text-slate-500 text-base font-normal"> / {stats?.totalClasses || 0}</span>
                                </p>
                                {pct < 75 && stats && (
                                    <div className="mt-2 text-xs rounded-lg px-2 py-1 inline-block" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                                        Need {Math.max(0, Math.ceil(0.75 * stats.totalClasses - stats.presentCount))} more classes
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { key: 'P', label: 'Present', color: '#4ade80', bg: 'rgba(34,197,94,0.1)' },
                                { key: 'A', label: 'Absent', color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
                                { key: 'O', label: 'On Duty', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
                                { key: 'M', label: 'Medical', color: '#c084fc', bg: 'rgba(192,132,252,0.1)' },
                            ].map(({ key, label, color, bg }) => (
                                <div key={key} className="rounded-2xl p-3 text-center" style={{ background: bg, border: `1px solid ${color}30` }}>
                                    <div className="text-2xl font-bold" style={{ color }}>{stats?.breakdown[key] || 0}</div>
                                    <div className="text-xs mt-1" style={{ color: `${color}aa` }}>{label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="card p-4">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">💡 Tips</p>
                            <ul className="space-y-2">
                                {['Maintain at least 75% for exam eligibility', 'Medical leave requires documentation', 'On-duty counts as present'].map((tip, i) => (
                                    <li key={i} className="flex gap-2 text-xs text-slate-400">
                                        <span className="text-indigo-400 mt-0.5">•</span>
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'courses' && (
                    <div className="space-y-3">
                        {courseAttendance.length === 0 ? (
                            <div className="card p-8 text-center"><p className="text-3xl mb-2">📚</p><p className="text-slate-400 text-sm">No course data</p></div>
                        ) : courseAttendance.map(course => {
                            const p = course.percentage;
                            const color = p >= 75 ? '#4ade80' : p >= 65 ? '#facc15' : '#f87171';
                            const bgColor = p >= 75 ? 'rgba(34,197,94,0.08)' : p >= 65 ? 'rgba(234,179,8,0.08)' : 'rgba(239,68,68,0.08)';
                            return (
                                <div key={course.courseId} className="card-elevated p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 pr-4">
                                            <h3 className="font-semibold text-white text-sm">{course.courseName}</h3>
                                            <p className="text-xs text-slate-500 mt-0.5">{course.courseCode}</p>
                                        </div>
                                        <div className="text-2xl font-bold" style={{ color }}>{p}%</div>
                                    </div>
                                    <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${p}%`, background: color, boxShadow: `0 0 8px ${color}60` }} />
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-xs text-slate-500">{course.presentCount}/{course.totalClasses} classes</p>
                                        {p < 75 && (
                                            <span className="text-xs rounded-lg px-2 py-0.5" style={{ background: bgColor, color }}
                                            >Need {Math.ceil(0.75 * course.totalClasses - course.presentCount)} more</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'chart' && (
                    <div>
                        {courseAttendance.length === 0 ? (
                            <div className="card p-8 text-center"><p className="text-3xl mb-2">📈</p><p className="text-slate-400 text-sm">No chart data</p></div>
                        ) : (
                            <div className="card-elevated p-4">
                                <p className="text-sm font-semibold text-slate-300 mb-4">Attendance by Course</p>
                                <div style={{ height: 240 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={courseAttendance} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                            <XAxis dataKey="courseCode" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                            <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                                                {courseAttendance.map((entry, i) => (
                                                    <Cell key={i} fill={entry.percentage >= 75 ? '#4ade80' : entry.percentage >= 65 ? '#facc15' : '#f87171'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex gap-4 justify-center mt-3">
                                    {[['#4ade80', '≥75%'], ['#facc15', '65-74%'], ['#f87171', '<65%']].map(([color, label]) => (
                                        <div key={label} className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                                            <span className="text-xs text-slate-500">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Nav */}
            <nav className="bottom-nav">
                <div className="flex">
                    {[
                        { tab: 'overview', label: 'Overview', icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
                        { tab: 'courses', label: 'Courses', icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
                        { tab: 'chart', label: 'Chart', icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
                    ].map(({ tab, label, icon }) => {
                        const active = activeTab === tab;
                        return (
                            <button key={tab} onClick={() => setActiveTab(tab as any)} className="flex-1 flex flex-col items-center py-3 gap-1 transition-all press-effect">
                                <span style={{ color: active ? '#818cf8' : '#475569' }}>{icon}</span>
                                <span className="text-xs font-medium" style={{ color: active ? '#818cf8' : '#475569' }}>{label}</span>
                                {active && <span className="w-1 h-1 rounded-full" style={{ background: '#818cf8' }} />}
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Date Filter Bottom Sheet */}
            {showDateFilter && (
                <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={() => setShowDateFilter(false)}>
                    <div className="w-full rounded-t-3xl p-6 pb-8" style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' }} onClick={e => e.stopPropagation()}>
                        <div className="w-10 h-1 rounded-full bg-slate-600 mx-auto mb-5" />
                        <h2 className="text-base font-bold text-white mb-5">📅 Filter by Date Range</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">From</label>
                                <input type="date" value={fromDate} max={toDate}
                                    onChange={e => setFromDate(e.target.value)}
                                    className="input-field" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">To</label>
                                <input type="date" value={toDate} min={fromDate} max={today()}
                                    onChange={e => setToDate(e.target.value)}
                                    className="input-field" />
                            </div>

                            {/* Quick presets */}
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Quick Presets</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { label: 'This Month', from: () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`; }, to: today },
                                        { label: 'Last 30 Days', from: () => { const d = new Date(); d.setDate(d.getDate()-30); return d.toISOString().split('T')[0]; }, to: today },
                                        { label: 'Academic Year', from: academicStart, to: today },
                                    ].map(preset => (
                                        <button key={preset.label} onClick={() => { setFromDate(preset.from()); setToDate(preset.to()); }}
                                            className="py-2 rounded-xl text-xs font-semibold press-effect"
                                            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}>
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowDateFilter(false)} className="flex-1 py-3 rounded-xl text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>Cancel</button>
                            <button onClick={applyFilter} className="flex-1 py-3 rounded-xl text-sm font-bold" style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: 'white' }}>Apply Filter</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
