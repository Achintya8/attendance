import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const UPLOAD_TYPES = [
    { key: 'students', label: 'Students', icon: '👨‍🎓', color: '#60a5fa', endpoint: '/api/admin/import/students', format: 'rollNum, name, email, department, semester, section, admissionYear, currentBatch' },
    { key: 'teachers', label: 'Teachers', icon: '👨‍🏫', color: '#4ade80', endpoint: '/api/admin/import/teachers', format: 'name, email, department' },
    { key: 'timetable', label: 'Timetable', icon: '📅', color: '#f59e0b', endpoint: '/api/admin/import/timetable', format: 'day, period, courseCode, teacherEmail, section' },
    { key: 'electives', label: 'Electives', icon: '📚', color: '#c084fc', endpoint: '/api/admin/import/electives', format: 'studentRollNum, courseCode' },
];

const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [uploadType, setUploadType] = useState('students');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [dragOver, setDragOver] = useState(false);

    const selectedType = UPLOAD_TYPES.find(t => t.key === uploadType)!;

    const handleFileChange = (f: File | null) => {
        if (!f) return;
        if (!f.name.match(/\.(xlsx|xls)$/i)) { setMessage('✗ Please select an Excel file (.xlsx or .xls)'); return; }
        setFile(f);
        setMessage('');
    };

    const handleUpload = async () => {
        if (!file) { setMessage('✗ Please select a file first'); return; }
        setUploading(true); setMessage('');
        const form = new FormData();
        form.append('file', file);
        try {
            await api.post(selectedType.endpoint, form, { headers: { 'Content-Type': 'multipart/form-data' } });
            setMessage(`✓ ${selectedType.label} uploaded successfully!`);
            setFile(null);
            const fi = document.getElementById('fileInput') as HTMLInputElement;
            if (fi) fi.value = '';
        } catch (e: any) {
            setMessage(`✗ Error: ${e.response?.data || 'Upload failed'}`);
        }
        setUploading(false);
    };

    return (
        <div className="min-h-screen pb-6" style={{ background: '#0f0f1a' }}>
            {/* Header */}
            <div className="safe-top" style={{ background: 'linear-gradient(135deg, #1a1a35, #0f0f1a)', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
                <div className="px-4 pt-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Admin Portal</p>
                        <h1 className="text-lg font-bold text-white capitalize">{user?.username || 'Admin'}</h1>
                    </div>
                    <button onClick={() => { logout(); navigate('/login'); }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center press-effect"
                        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                        <svg width="16" height="16" fill="none" stroke="#f87171" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="px-4 pt-5 space-y-4 fade-in">
                {/* Upload Type Selection */}
                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Select Data Type</p>
                    <div className="grid grid-cols-2 gap-2">
                        {UPLOAD_TYPES.map(type => {
                            const active = uploadType === type.key;
                            return (
                                <button key={type.key} onClick={() => { setUploadType(type.key); setFile(null); setMessage(''); }}
                                    className="p-4 rounded-2xl text-left press-effect transition-all"
                                    style={active
                                        ? { background: `${type.color}18`, border: `1px solid ${type.color}50`, boxShadow: `0 4px 16px ${type.color}20` }
                                        : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }
                                    }
                                >
                                    <div className="text-2xl mb-1.5">{type.icon}</div>
                                    <div className="font-semibold text-sm" style={{ color: active ? type.color : '#94a3b8' }}>{type.label}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* File Drop Zone */}
                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Upload Excel File</p>
                    <label
                        htmlFor="fileInput"
                        className="block rounded-2xl p-6 text-center cursor-pointer transition-all"
                        style={{
                            background: dragOver ? `${selectedType.color}0d` : 'rgba(255,255,255,0.03)',
                            border: dragOver ? `2px dashed ${selectedType.color}80` : '2px dashed rgba(255,255,255,0.12)',
                        }}
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={e => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files[0]); }}
                    >
                        <input id="fileInput" type="file" accept=".xlsx,.xls" className="hidden" onChange={e => handleFileChange(e.target.files?.[0] || null)} />
                        {file ? (
                            <div>
                                <div className="text-3xl mb-2">📊</div>
                                <p className="font-semibold text-sm text-white">{file.name}</p>
                                <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                        ) : (
                            <div>
                                <div className="text-3xl mb-2">📤</div>
                                <p className="font-semibold text-sm text-slate-300">Tap to select file</p>
                                <p className="text-xs text-slate-500 mt-1">.xlsx or .xls format</p>
                            </div>
                        )}
                    </label>
                </div>

                {/* Message */}
                {message && (
                    <div className="p-3 rounded-xl text-sm" style={
                        message.startsWith('✓')
                            ? { background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }
                            : { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }
                    }>
                        {message}
                    </div>
                )}

                {/* Upload Button */}
                <button onClick={handleUpload} disabled={uploading || !file} className="btn-primary flex items-center justify-center gap-2">
                    {uploading ? (
                        <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Uploading...</>
                    ) : `Upload ${selectedType.label}`}
                </button>

                {/* Format Info */}
                <div className="card p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        📋 {selectedType.label} File Format
                    </p>
                    <code className="text-xs" style={{ color: selectedType.color, wordBreak: 'break-all' }}>{selectedType.format}</code>
                    <p className="text-xs text-slate-600 mt-3">
                        💡 Sample files are in the <code className="text-slate-400">sample_data/</code> folder. Open in Excel and save as .xlsx before uploading.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
