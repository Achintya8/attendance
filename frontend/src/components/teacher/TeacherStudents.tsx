import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StudentDetailModal from './StudentDetailModal';

interface Student {
    id: number; rollNum: string; name: string; email: string;
    department: string; semester: number; section: string;
    admissionYear: number; currentBatch: string;
    attendancePercentage: number; attendanceBreakdown: { [key: string]: number };
}
interface Course { id: number; code: string; name: string; }
interface TeacherStudentsProps { user: any; courses: Course[]; sections: string[]; }

const today = () => new Date().toISOString().split('T')[0];
const academicStart = () => {
    const now = new Date();
    const year = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
    return `${year}-06-01`;
};

const TeacherStudents: React.FC<TeacherStudentsProps> = ({ user, courses, sections }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    // Date filter state
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [filterApplied, setFilterApplied] = useState(false);

    useEffect(() => {
        if (user?.id) fetchStudents();
    }, [selectedSection, selectedCourse, user?.id]);

    const buildUrl = (base: string, extraParams?: Record<string, string>) => {
        let url = `${base}?teacherId=${user?.id}`;
        if (selectedSection) url += `&section=${selectedSection}`;
        if (selectedCourse) url += `&courseId=${selectedCourse}`;
        if (filterApplied && fromDate && toDate) {
            url += `&from=${fromDate}&to=${toDate}`;
        }
        if (extraParams) {
            Object.entries(extraParams).forEach(([k, v]) => { url += `&${k}=${v}`; });
        }
        return url;
    };

    const fetchStudents = async (from?: string, to?: string, applyDates = false) => {
        setLoading(true);
        try {
            let url = `/api/teacher/students?teacherId=${user?.id}`;
            if (selectedSection) url += `&section=${selectedSection}`;
            if (selectedCourse) url += `&courseId=${selectedCourse}`;
            if (applyDates && from && to) url += `&from=${from}&to=${to}`;
            else if (filterApplied && fromDate && toDate) url += `&from=${fromDate}&to=${toDate}`;
            const r = await api.get(url);
            setStudents(r.data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const applyFilter = () => {
        setFilterApplied(true);
        setShowDateFilter(false);
        fetchStudents(fromDate, toDate, true);
    };

    const clearFilter = () => {
        setFilterApplied(false);
        setFromDate('');
        setToDate('');
        fetchStudents('', '', false);
    };

    const searchStudents = async () => {
        if (!searchQuery.trim()) { fetchStudents(); return; }
        setLoading(true);
        try {
            const r = await api.get(`/api/teacher/students/search?query=${searchQuery}`);
            setStudents(r.data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const viewDetail = async (id: number) => {
        try {
            const r = await api.get(`/api/teacher/students/${id}`);
            setSelectedStudent(r.data);
        } catch (e) { console.error(e); }
    };

    const downloadCsv = async () => {
        setDownloading(true);
        try {
            let url = `/api/teacher/students/export?teacherId=${user?.id}`;
            if (selectedSection) url += `&section=${selectedSection}`;
            if (selectedCourse) url += `&courseId=${selectedCourse}`;
            if (filterApplied && fromDate && toDate) url += `&from=${fromDate}&to=${toDate}`;

            const response = await api.get(url, { responseType: 'blob' });
            const blob = new Blob([response.data], { type: 'text/csv' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            const dateLabel = filterApplied ? `_${fromDate}_to_${toDate}` : '';
            link.download = `attendance_report${dateLabel}.csv`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (e) { alert('Download failed'); }
        setDownloading(false);
    };

    const AttBadge = ({ pct }: { pct: number }) => {
        const cls = pct >= 75 ? 'attendance-good' : pct >= 65 ? 'attendance-warn' : 'attendance-bad';
        return <span className={`${cls} text-xs font-bold px-2 py-1 rounded-lg`}>{pct.toFixed(1)}%</span>;
    };

    return (
        <div className="fade-in">
            {/* Filters row */}
            <div className="space-y-3 mb-4">
                <div className="flex gap-2">
                    <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="flex-1 input-field py-2.5 text-sm">
                        <option value="" style={{ background: '#1a1a2e' }}>All Courses</option>
                        {courses.map(c => <option key={c.id} value={c.id} style={{ background: '#1a1a2e' }}>{c.code}</option>)}
                    </select>
                    <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="flex-1 input-field py-2.5 text-sm">
                        <option value="" style={{ background: '#1a1a2e' }}>All Sections</option>
                        {sections.map(s => <option key={s} value={s} style={{ background: '#1a1a2e' }}>{s}</option>)}
                    </select>
                </div>

                <div className="flex gap-2">
                    <input
                        type="text" placeholder="Search by name or roll no..."
                        value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && searchStudents()}
                        className="input-field flex-1 py-2.5 text-sm"
                    />
                    <button onClick={searchStudents} className="px-4 rounded-xl press-effect" style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: 'white' }}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" /></svg>
                    </button>
                    {searchQuery && (
                        <button onClick={() => { setSearchQuery(''); fetchStudents(); }} className="px-4 rounded-xl press-effect" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>✕</button>
                    )}
                </div>

                {/* Date filter + Download row */}
                <div className="flex gap-2">
                    <button onClick={() => setShowDateFilter(true)}
                        className="flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold press-effect"
                        style={filterApplied
                            ? { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', color: '#818cf8' }
                            : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b' }
                        }>
                        <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" /><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" /></svg>
                        {filterApplied ? `${fromDate.slice(5)} – ${toDate.slice(5)}` : 'Date Range'}
                        {filterApplied && (
                            <span onClick={e => { e.stopPropagation(); clearFilter(); }} className="text-indigo-300">✕</span>
                        )}
                    </button>
                    <button onClick={downloadCsv} disabled={downloading}
                        className="h-10 px-4 rounded-xl flex items-center gap-2 text-xs font-bold press-effect"
                        style={{ background: 'linear-gradient(135deg, #059669, #34d399)', color: 'white', boxShadow: '0 2px 12px rgba(52,211,153,0.3)', opacity: downloading ? 0.7 : 1 }}>
                        {downloading ? (
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        ) : (
                            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        )}
                        {downloading ? '...' : 'CSV'}
                    </button>
                </div>
            </div>

            {/* Active filter info */}
            {filterApplied && (
                <div className="mb-3 p-2.5 rounded-xl flex items-center gap-2 text-xs" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <svg width="12" height="12" fill="none" stroke="#818cf8" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" /></svg>
                    <span className="text-indigo-300">Filtered: {fromDate} → {toDate}</span>
                    <button onClick={clearFilter} className="ml-auto text-slate-400">Clear</button>
                </div>
            )}

            {/* Count row */}
            {!loading && students.length > 0 && (
                <div className="mb-3 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-500">{students.length} students</span>
                    {selectedCourse && <span className="text-xs px-2 py-0.5 rounded-full text-indigo-300" style={{ background: 'rgba(99,102,241,0.15)' }}>{courses.find(c => c.id.toString() === selectedCourse)?.code}</span>}
                    {selectedSection && <span className="text-xs px-2 py-0.5 rounded-full text-indigo-300" style={{ background: 'rgba(99,102,241,0.15)' }}>Sec {selectedSection}</span>}
                </div>
            )}

            {/* Students List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="shimmer h-20 rounded-2xl" />)}
                </div>
            ) : students.length === 0 ? (
                <div className="card p-8 text-center">
                    <p className="text-3xl mb-2">👥</p>
                    <p className="text-slate-400 text-sm">No students found</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {students.map(s => (
                        <button key={s.id} onClick={() => viewDetail(s.id)} className="w-full card-elevated p-4 text-left press-effect">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold text-white"
                                        style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
                                        {s.name[0].toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-white text-sm truncate">{s.name}</p>
                                        <p className="text-xs text-slate-500">{s.rollNum} · Sem {s.semester} · {s.section}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <AttBadge pct={s.attendancePercentage} />
                                    <svg width="14" height="14" fill="none" stroke="#475569" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            <StudentDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />

            {/* Date Filter Bottom Sheet */}
            {showDateFilter && (
                <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={() => setShowDateFilter(false)}>
                    <div className="w-full rounded-t-3xl p-6 pb-8" style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' }} onClick={e => e.stopPropagation()}>
                        <div className="w-10 h-1 rounded-full bg-slate-600 mx-auto mb-5" />
                        <h2 className="text-base font-bold text-white mb-5">📅 Filter Date Range</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">From</label>
                                <input type="date" value={fromDate} max={toDate || today()}
                                    onChange={e => setFromDate(e.target.value)} className="input-field" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">To</label>
                                <input type="date" value={toDate} min={fromDate} max={today()}
                                    onChange={e => setToDate(e.target.value)} className="input-field" />
                            </div>

                            {/* Quick presets */}
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Quick Presets</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { label: 'This Month', from: () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`; }, to: today },
                                        { label: 'Last 30 Days', from: () => { const d = new Date(); d.setDate(d.getDate()-30); return d.toISOString().split('T')[0]; }, to: today },
                                        { label: 'This Semester', from: () => { const d = new Date(); const m = d.getMonth(); return m >= 5 && m <= 10 ? `${d.getFullYear()}-06-01` : `${m <= 4 ? d.getFullYear() : d.getFullYear()+1}-11-01`; }, to: today },
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
                            <button onClick={applyFilter} disabled={!fromDate || !toDate}
                                className="flex-1 py-3 rounded-xl text-sm font-bold"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: 'white', opacity: (!fromDate || !toDate) ? 0.5 : 1 }}>
                                Apply Filter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherStudents;
