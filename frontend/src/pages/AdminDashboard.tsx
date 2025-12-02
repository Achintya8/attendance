import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [uploadType, setUploadType] = useState('students');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setMessage('');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage('Please select a file first');
            return;
        }

        setUploading(true);
        setMessage('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            let endpoint = '';
            if (uploadType === 'students') endpoint = '/api/admin/import/students';
            else if (uploadType === 'teachers') endpoint = '/api/admin/import/teachers';
            else if (uploadType === 'timetable') endpoint = '/api/admin/import/timetable';
            else if (uploadType === 'electives') endpoint = '/api/admin/import/electives';

            await api.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setMessage(`✓ ${uploadType.charAt(0).toUpperCase() + uploadType.slice(1)} uploaded successfully!`);
            setFile(null);

            // Reset file input
            const fileInput = document.getElementById('fileInput') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        } catch (error: any) {
            setMessage(`✗ Error: ${error.response?.data || 'Upload failed'}`);
        }

        setUploading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 shadow-lg">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <img src="/logo.png" alt="Logo" className="h-16 bg-white rounded-full p-1" />
                        <div>
                            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                            <p className="mt-2">Manage Users and Data</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6">
                {/* Upload Card */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">📤 Upload Data</h2>

                    {/* Upload Type Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Select Data Type</label>
                        <div className="grid grid-cols-4 gap-4">
                            <button
                                onClick={() => setUploadType('students')}
                                className={`p-4 rounded-lg border-2 transition-all ${uploadType === 'students'
                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="text-3xl mb-2">👨‍🎓</div>
                                <div className="font-medium">Students</div>
                            </button>
                            <button
                                onClick={() => setUploadType('teachers')}
                                className={`p-4 rounded-lg border-2 transition-all ${uploadType === 'teachers'
                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="text-3xl mb-2">👨‍🏫</div>
                                <div className="font-medium">Teachers</div>
                            </button>
                            <button
                                onClick={() => setUploadType('timetable')}
                                className={`p-4 rounded-lg border-2 transition-all ${uploadType === 'timetable'
                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="text-3xl mb-2">📅</div>
                                <div className="font-medium">Timetable</div>
                            </button>
                            <button
                                onClick={() => setUploadType('electives')}
                                className={`p-4 rounded-lg border-2 transition-all ${uploadType === 'electives'
                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="text-3xl mb-2">📚</div>
                                <div className="font-medium">Electives</div>
                            </button>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Excel File (.xlsx)</label>
                        <input
                            id="fileInput"
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {file && (
                            <p className="mt-2 text-sm text-gray-600">Selected: {file.name}</p>
                        )}
                    </div>

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={uploading || !file}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {uploading ? 'Uploading...' : `Upload ${uploadType.charAt(0).toUpperCase() + uploadType.slice(1)}`}
                    </button>

                    {/* Message */}
                    {message && (
                        <div className={`mt-4 p-4 rounded-lg ${message.startsWith('✓')
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {message}
                        </div>
                    )}
                </div>

                {/* Instructions Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Upload Instructions</h3>

                    <div className="space-y-4 text-sm text-gray-700">
                        <div>
                            <h4 className="font-semibold mb-2">Students File Format:</h4>
                            <p className="text-gray-600 font-mono text-xs bg-white p-2 rounded">
                                rollNum, name, email, department, semester, section, admissionYear, currentBatch
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Teachers File Format:</h4>
                            <p className="text-gray-600 font-mono text-xs bg-white p-2 rounded">
                                name, email, department
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Timetable File Format:</h4>
                            <p className="text-gray-600 font-mono text-xs bg-white p-2 rounded">
                                day, period, courseCode, teacherEmail, section
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Electives File Format:</h4>
                            <p className="text-gray-600 font-mono text-xs bg-white p-2 rounded">
                                studentRollNum, courseCode
                            </p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-300">
                            <p className="text-xs text-gray-500">
                                💡 <strong>Tip:</strong> Sample CSV files are available in the <code className="bg-white px-1 rounded">sample_data</code> folder.
                                Open them in Excel and save as .xlsx before uploading.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
