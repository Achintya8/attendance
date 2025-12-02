import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import TeacherSchedule from '../components/teacher/TeacherSchedule';
import TeacherStudents from '../components/teacher/TeacherStudents';

interface Course {
    id: number;
    code: string;
    name: string;
}

const TeacherDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('schedule');
    const [courses, setCourses] = useState<Course[]>([]);
    const [sections, setSections] = useState<string[]>([]);

    useEffect(() => {
        if (user?.id) {
            fetchCourses();
            fetchSections();
        }
    }, [user?.id]);

    const fetchCourses = async () => {
        try {
            const response = await api.get(`/api/teacher/courses?teacherId=${user?.id}`);
            setCourses(response.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchSections = async () => {
        try {
            const response = await api.get(`/api/teacher/sections?teacherId=${user?.id}`);
            setSections(response.data);
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 shadow-lg">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <img src="/logo.png" alt="Logo" className="h-16 bg-white rounded-full p-1" />
                        <div>
                            <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
                            <p className="mt-2">Welcome, {user?.username || 'User'}</p>
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

            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex space-x-8 border-b">
                        <button
                            onClick={() => setActiveTab('schedule')}
                            className={`py-4 px-2 font-medium border-b-2 transition-colors ${activeTab === 'schedule' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            My Schedule
                        </button>
                        <button
                            onClick={() => setActiveTab('students')}
                            className={`py-4 px-2 font-medium border-b-2 transition-colors ${activeTab === 'students' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Students
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {activeTab === 'schedule' && (
                    <TeacherSchedule user={user} courses={courses} sections={sections} />
                )}

                {activeTab === 'students' && (
                    <TeacherStudents user={user} courses={courses} sections={sections} />
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;
