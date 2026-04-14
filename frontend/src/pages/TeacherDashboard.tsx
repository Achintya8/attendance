import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import TeacherSchedule from '../components/teacher/TeacherSchedule';
import TeacherStudents from '../components/teacher/TeacherStudents';

interface Course { id: number; code: string; name: string; }

const TeacherDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'schedule' | 'students'>('schedule');
    const [courses, setCourses] = useState<Course[]>([]);
    const [sections, setSections] = useState<string[]>([]);

    useEffect(() => {
        if (user?.id) {
            api.get(`/api/teacher/courses?teacherId=${user.id}`).then(r => setCourses(r.data)).catch(() => {});
            api.get(`/api/teacher/sections?teacherId=${user.id}`).then(r => setSections(r.data)).catch(() => {});
        }
    }, [user?.id]);

    return (
        <div className="min-h-screen pb-nav" style={{ background: '#0f0f1a' }}>
            {/* Header */}
            <div className="safe-top" style={{ background: 'linear-gradient(135deg, #1a1a35, #0f0f1a)', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
                <div className="px-4 pt-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Teacher Portal</p>
                        <h1 className="text-lg font-bold text-white capitalize">{user?.username || 'Teacher'}</h1>
                    </div>
                    <button onClick={logout} className="w-9 h-9 rounded-xl flex items-center justify-center press-effect" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                        <svg width="16" height="16" fill="none" stroke="#f87171" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </button>
                </div>

                {/* Quick stats row */}
                <div className="px-4 mt-3 flex gap-2">
                    <div className="flex-1 rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                        <div className="text-lg font-bold text-indigo-300">{courses.length}</div>
                        <div className="text-xs text-slate-500">Courses</div>
                    </div>
                    <div className="flex-1 rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                        <div className="text-lg font-bold text-green-300">{sections.length}</div>
                        <div className="text-xs text-slate-500">Sections</div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pt-4">
                {activeTab === 'schedule' && <TeacherSchedule user={user} courses={courses} sections={sections} />}
                {activeTab === 'students' && <TeacherStudents user={user} courses={courses} sections={sections} />}
            </div>

            {/* Bottom Nav */}
            <nav className="bottom-nav">
                <div className="flex">
                    {[
                        {
                            tab: 'schedule', label: 'Schedule',
                            icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        },
                        {
                            tab: 'students', label: 'Students',
                            icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        },
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
        </div>
    );
};

export default TeacherDashboard;
