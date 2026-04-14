import React from 'react';

interface Student {
    id: number; rollNum: string; name: string; email: string;
    department: string; semester: number; section: string;
    admissionYear: number; currentBatch: string;
    attendancePercentage: number; attendanceBreakdown: { [key: string]: number };
}

interface StudentDetailModalProps { student: Student | null; onClose: () => void; }

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ student, onClose }) => {
    if (!student) return null;

    const pct = student.attendancePercentage;
    const color = pct >= 75 ? '#4ade80' : pct >= 65 ? '#facc15' : '#f87171';
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (pct / 100) * circumference;

    return (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
            <div className="w-full rounded-t-3xl pb-8 overflow-y-auto max-h-[85vh]" style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' }} onClick={e => e.stopPropagation()}>
                {/* Handle */}
                <div className="w-10 h-1 rounded-full bg-slate-600 mx-auto mt-4 mb-2" />

                {/* Header with close */}
                <div className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
                            {student.name[0].toUpperCase()}
                        </div>
                        <div>
                            <h2 className="font-bold text-white">{student.name}</h2>
                            <p className="text-xs text-slate-400">{student.rollNum}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center press-effect" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <svg width="14" height="14" fill="none" stroke="#94a3b8" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Attendance Ring */}
                <div className="flex flex-col items-center py-4">
                    <div className="relative">
                        <svg width="120" height="120" className="-rotate-90">
                            <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                            <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
                                strokeDasharray={circumference} strokeDashoffset={offset}
                                style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dashoffset 0.8s ease' }} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold" style={{ color }}>{pct.toFixed(1)}%</span>
                            <span className="text-xs text-slate-500">attendance</span>
                        </div>
                    </div>
                    <div className="text-xs mt-2" style={{ color: pct >= 75 ? '#4ade80' : '#f87171' }}>
                        {pct >= 75 ? '✓ Eligible' : '⚠ Below Required 75%'}
                    </div>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-4 gap-2 px-6 mb-4">
                    {[
                        { key: 'P', label: 'Present', color: '#4ade80', bg: 'rgba(34,197,94,0.1)' },
                        { key: 'A', label: 'Absent', color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
                        { key: 'O', label: 'On Duty', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
                        { key: 'M', label: 'Medical', color: '#c084fc', bg: 'rgba(192,132,252,0.1)' },
                    ].map(({ key, label, color, bg }) => (
                        <div key={key} className="rounded-2xl p-3 text-center" style={{ background: bg }}>
                            <div className="text-xl font-bold" style={{ color }}>{student.attendanceBreakdown[key] || 0}</div>
                            <div className="text-xs mt-0.5" style={{ color: `${color}99` }}>{label}</div>
                        </div>
                    ))}
                </div>

                {/* Info grid */}
                <div className="mx-6 rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                    {[
                        { label: 'Email', value: student.email },
                        { label: 'Department', value: student.department },
                        { label: 'Semester', value: `Semester ${student.semester}` },
                        { label: 'Section', value: student.section },
                        { label: 'Batch', value: student.currentBatch },
                        { label: 'Admission Year', value: student.admissionYear },
                    ].map(({ label, value }, i) => (
                        <div key={i} className="flex justify-between items-center px-4 py-3" style={{ borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                            <span className="text-xs text-slate-500">{label}</span>
                            <span className="text-xs font-medium text-slate-200 text-right">{value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentDetailModal;
