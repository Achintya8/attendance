import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

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

const StudentDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState<AttendanceStats | null>(null);
    const [courseAttendance, setCourseAttendance] = useState<CourseAttendance[]>([]);
    const [loading, setLoading] = useState(true);

    const studentId = localStorage.getItem('userId');

    useEffect(() => {
        fetchStats();
        fetchCourseAttendance();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/student/stats/${studentId}`);
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
        setLoading(false);
    };

    const fetchCourseAttendance = async () => {
        try {
            const response = await api.get(`/api/student/attendance/courses/${studentId}`);
            setCourseAttendance(response.data);
        } catch (error) {
            console.error('Error fetching course attendance:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-xl text-gray-600">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white p-6 shadow-lg">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <img src="/logo.png" alt="Logo" className="h-16 bg-white rounded-full p-1" />
                        <div>
                            <h1 className="text-3xl font-bold">Student Dashboard</h1>
                            <p className="mt-2">Welcome, {user?.username || 'Student'}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {/* Overall Attendance Card */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Overall Attendance</h2>

                    {stats ? (
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="flex items-center justify-center">
                                <div className="text-center">
                                    <div className={`text-7xl font-bold mb-4 ${stats.percentage >= 75 ? 'text-green-600' :
                                        stats.percentage >= 65 ? 'text-yellow-600' :
                                            'text-red-600'
                                        }`}>
                                        {stats.percentage.toFixed(1)}%
                                    </div>
                                    <p className="text-gray-600 text-lg">
                                        {stats.presentCount} / {stats.totalClasses} classes attended
                                    </p>
                                    {stats.percentage < 75 && (
                                        <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                                            <p className="text-red-700 text-sm font-medium">
                                                ⚠️ Attendance below 75%
                                            </p>
                                            <p className="text-red-600 text-xs mt-1">
                                                You need to attend more classes
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50 p-6 rounded-lg text-center">
                                    <div className="text-4xl font-bold text-green-600">{stats.breakdown.P || 0}</div>
                                    <div className="text-gray-600 mt-2">Present</div>
                                </div>
                                <div className="bg-red-50 p-6 rounded-lg text-center">
                                    <div className="text-4xl font-bold text-red-600">{stats.breakdown.A || 0}</div>
                                    <div className="text-gray-600 mt-2">Absent</div>
                                </div>
                                <div className="bg-blue-50 p-6 rounded-lg text-center">
                                    <div className="text-4xl font-bold text-blue-600">{stats.breakdown.O || 0}</div>
                                    <div className="text-gray-600 mt-2">On Duty</div>
                                </div>
                                <div className="bg-purple-50 p-6 rounded-lg text-center">
                                    <div className="text-4xl font-bold text-purple-600">{stats.breakdown.M || 0}</div>
                                    <div className="text-gray-600 mt-2">Medical</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No attendance data available yet</p>
                            <p className="text-gray-400 mt-2">Your teacher will mark attendance for classes</p>
                        </div>
                    )}
                </div>

                {/* Tips Card */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 Attendance Tips</h3>
                        <ul className="space-y-2 text-blue-700 text-sm">
                            <li>• Maintain at least 75% attendance for eligibility</li>
                            <li>• Medical leave requires proper documentation</li>
                            <li>• On-duty attendance counts as present</li>
                            <li>• Check your attendance regularly</li>
                        </ul>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-purple-800 mb-3">📋 Quick Stats</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-purple-700">Total Classes:</span>
                                <span className="font-bold text-purple-900">{stats?.totalClasses || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-purple-700">Classes to Attend:</span>
                                <span className="font-bold text-purple-900">
                                    {stats ? Math.max(0, Math.ceil((0.75 * stats.totalClasses) - stats.presentCount)) : 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-purple-700">Status:</span>
                                <span className={`font-bold ${(stats?.percentage || 0) >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                                    {(stats?.percentage || 0) >= 75 ? '✓ Eligible' : '✗ At Risk'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attendance Graph */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">📈 Attendance Analysis</h2>
                    {courseAttendance.length > 0 ? (
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={courseAttendance}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="courseCode" />
                                    <YAxis />
                                    <Tooltip
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-white p-4 border rounded shadow-lg">
                                                        <p className="font-bold">{data.courseName}</p>
                                                        <p className="text-sm text-gray-600">Code: {label}</p>
                                                        <p className="text-sm text-blue-600">Total: {data.totalClasses}</p>
                                                        <p className="text-sm text-green-600">Present: {data.presentCount}</p>
                                                        <p className="text-sm font-bold mt-1">
                                                            {data.percentage}% Attendance
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="totalClasses" name="Total Classes" fill="#94a3b8" />
                                    <Bar dataKey="presentCount" name="Classes Attended" fill="#16a34a">
                                        {courseAttendance.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.percentage >= 75 ? '#16a34a' : entry.percentage >= 65 ? '#ca8a04' : '#dc2626'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No data available for graph
                        </div>
                    )}
                </div>

                {/* Course-wise Attendance */}
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">📚 Attendance by Course</h2>

                    {courseAttendance.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-4">
                            {courseAttendance.map((course) => (
                                <div key={course.courseId} className="bg-white rounded-lg shadow p-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">{course.courseName}</h3>
                                            <p className="text-sm text-gray-600">{course.courseCode}</p>
                                        </div>
                                        <div className={`text-3xl font-bold ${course.percentage >= 75 ? 'text-green-600' :
                                            course.percentage >= 65 ? 'text-yellow-600' :
                                                'text-red-600'
                                            }`}>
                                            {course.percentage}%
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-3 border-t">
                                        <p className="text-sm text-gray-600">
                                            {course.presentCount} / {course.totalClasses} classes attended
                                        </p>

                                        {course.percentage < 75 && (
                                            <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                                                <p className="text-xs text-red-700">
                                                    ⚠️ Need {Math.ceil((0.75 * course.totalClasses) - course.presentCount)} more classes
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow p-8 text-center">
                            <p className="text-gray-500">No course attendance data available yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
