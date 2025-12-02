import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Student {
    id: number;
    rollNum: string;
    name: string;
    email: string;
    department: string;
    semester: number;
    section: string;
}

interface ClassSession {
    id: number;
    date: string;
    period: number;
    course: { id: number; name: string; code: string };
    teacher: { id: number; name: string };
    section: string;
    type: string;
    status: string;
}

const AttendancePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const session: ClassSession = location.state?.session;

    const [students, setStudents] = useState<Student[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!session) {
            navigate('/teacher');
            return;
        }
        fetchStudents();
    }, [session]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const teacherId = user?.id || session.teacher.id;
            const response = await api.get(`/api/teacher/students?section=${session.section}&courseId=${session.course.id}&teacherId=${teacherId}`);
            const studentList = response.data;

            // Initialize all as Present
            const records: Record<number, string> = {};
            studentList.forEach((s: Student) => {
                records[s.id] = 'P';
            });
            setAttendanceRecords(records);
            setStudents(studentList);
        } catch (error) {
            console.error('Error fetching students for attendance:', error);
        }
        setLoading(false);
    };

    const submitAttendance = async () => {
        try {
            const attendanceData = Object.entries(attendanceRecords).map(([studentId, status]) => ({
                studentId: parseInt(studentId),
                status,
                remarks: ''
            }));

            await api.post(`/api/teacher/attendance/${session.id}`, attendanceData);
            alert('Attendance marked successfully!');
            navigate('/teacher');
        } catch (error) {
            alert('Error marking attendance');
            console.error(error);
        }
    };

    if (!session) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 shadow-lg">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Mark Attendance</h1>
                        <p className="mt-2">{session.course.name} ({session.course.code}) - Section {session.section} - Period {session.period}</p>
                        <p className="text-sm mt-1">{new Date(session.date).toLocaleDateString()}</p>
                    </div>
                    <button
                        onClick={() => navigate('/teacher')}
                        className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {loading ? (
                    <p className="text-center py-12 text-gray-500">Loading students...</p>
                ) : (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="mb-6 flex gap-6 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 bg-green-500 rounded-full"></span>
                                <span className="text-sm font-medium">P - Present</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 bg-red-500 rounded-full"></span>
                                <span className="text-sm font-medium">A - Absent</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
                                <span className="text-sm font-medium">O - On Duty</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 bg-purple-500 rounded-full"></span>
                                <span className="text-sm font-medium">M - Medical</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {students.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.rollNum}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex gap-2">
                                                    {['P', 'A', 'O', 'M'].map((status) => (
                                                        <button
                                                            key={status}
                                                            onClick={() => setAttendanceRecords(prev => ({ ...prev, [student.id]: status }))}
                                                            className={`px-5 py-2 rounded-lg font-medium transition-all ${attendanceRecords[student.id] === status
                                                                ? status === 'P' ? 'bg-green-500 text-white shadow-lg scale-105' :
                                                                    status === 'A' ? 'bg-red-500 text-white shadow-lg scale-105' :
                                                                        status === 'O' ? 'bg-blue-500 text-white shadow-lg scale-105' :
                                                                            'bg-purple-500 text-white shadow-lg scale-105'
                                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                                }`}
                                                        >
                                                            {status}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={submitAttendance}
                                className="flex-1 bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 shadow-lg transition-all transform hover:scale-105"
                            >
                                Submit Attendance
                            </button>
                            <button
                                onClick={() => navigate('/teacher')}
                                className="flex-1 bg-gray-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-gray-600 shadow-lg transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendancePage;
