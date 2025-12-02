import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

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

interface Course {
    id: number;
    code: string;
    name: string;
}

interface TeacherScheduleProps {
    user: any;
    courses: Course[];
    sections: string[];
}

const PERIOD_TIMES: { [key: number]: string } = {
    1: "09:00 - 10:00",
    2: "10:00 - 11:00",
    3: "11:30 - 12:30",
    4: "12:30 - 01:30",
    5: "02:30 - 03:30",
    6: "03:30 - 04:30"
};

const TeacherSchedule: React.FC<TeacherScheduleProps> = ({ user, courses, sections }) => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [schedule, setSchedule] = useState<ClassSession[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddClass, setShowAddClass] = useState(false);
    const [editingSession, setEditingSession] = useState<ClassSession | null>(null);
    const [newClassData, setNewClassData] = useState({
        date: new Date().toISOString().split('T')[0],
        period: 1,
        courseId: '',
        section: ''
    });

    useEffect(() => {
        if (user?.id) {
            fetchSchedule();
        }
    }, [selectedDate, user?.id]);

    const fetchSchedule = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/teacher/schedule?date=${selectedDate}&teacherId=${user?.id}`);
            setSchedule(response.data);
        } catch (error) {
            console.error('Error fetching schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClass = async () => {
        if (!newClassData.courseId || !newClassData.section) {
            alert("Please select a course and section");
            return;
        }
        try {
            // Include teacherId in the request body
            const payload = {
                ...newClassData,
                teacherId: user?.id
            };
            await api.post('/api/teacher/session', payload);
            setShowAddClass(false);
            setNewClassData({ date: new Date().toISOString().split('T')[0], period: 1, courseId: '', section: '' });
            fetchSchedule();
        } catch (error) {
            console.error('Error adding class:', error);
            alert('Failed to add class');
        }
    };

    const saveSessionEdit = async () => {
        if (!editingSession) return;
        try {
            await api.put(`/api/teacher/session/${editingSession.id}`, editingSession);
            setEditingSession(null);
            fetchSchedule();
        } catch (error) {
            console.error('Error updating session:', error);
            alert('Failed to update session');
        }
    };

    const cancelSession = async (sessionId: number) => {
        if (!confirm('Are you sure you want to cancel this class?')) return;
        try {
            await api.put(`/api/teacher/session/${sessionId}`, { status: 'CANCELLED' });
            fetchSchedule();
        } catch (error) {
            console.error('Error cancelling session:', error);
            alert('Failed to cancel session');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border rounded-lg px-4 py-2"
                />
                <button onClick={() => setShowAddClass(true)} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                    Add Extra Class
                </button>
            </div>

            {loading ? (
                <p className="text-center py-12 text-gray-500">Loading schedule...</p>
            ) : schedule.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500 text-lg">No classes scheduled for this date</p>
                    <p className="text-gray-400 mt-2">Click "Add Class" to create a new session</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {schedule.map((session) => (
                        <div key={session.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                            Period {session.period} ({PERIOD_TIMES[session.period] || 'Unknown Time'})
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${session.status === 'SCHEDULED' ? 'bg-green-100 text-green-800' :
                                            session.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {session.status}
                                        </span>
                                        {session.type !== 'REGULAR' && (
                                            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">{session.type}</span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800">{session.course.name}</h3>
                                    <p className="text-gray-600">Course Code: {session.course.code}</p>
                                    <p className="text-gray-600">Section: {session.section}</p>
                                </div>
                                <div className="flex gap-2">
                                    {session.status === 'SCHEDULED' && (
                                        <>
                                            <button onClick={() => navigate('/attendance', { state: { session } })} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm">
                                                Take Attendance
                                            </button>
                                            <button onClick={() => setEditingSession(session)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm">
                                                Edit
                                            </button>
                                            <button onClick={() => cancelSession(session.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm">
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Class Modal */}
            {showAddClass && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddClass(false)}>
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold mb-6">Add Extra Class</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Date</label>
                                <input
                                    type="date"
                                    value={newClassData.date}
                                    onChange={(e) => setNewClassData({ ...newClassData, date: e.target.value })}
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Period</label>
                                <select
                                    value={newClassData.period}
                                    onChange={(e) => setNewClassData({ ...newClassData, period: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded"
                                >
                                    {Object.entries(PERIOD_TIMES).map(([period, time]) => (
                                        <option key={period} value={period}>Period {period} ({time})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Course</label>
                                <select
                                    value={newClassData.courseId}
                                    onChange={(e) => setNewClassData({ ...newClassData, courseId: e.target.value })}
                                    className="w-full px-3 py-2 border rounded"
                                >
                                    <option value="">Select Course</option>
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Section</label>
                                <select
                                    value={newClassData.section}
                                    onChange={(e) => setNewClassData({ ...newClassData, section: e.target.value })}
                                    className="w-full px-3 py-2 border rounded"
                                >
                                    <option value="">Select Section</option>
                                    {sections.map(section => (
                                        <option key={section} value={section}>{section}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-6">
                            <button onClick={handleAddClass} className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">Add Class</button>
                            <button onClick={() => setShowAddClass(false)} className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Session Modal */}
            {editingSession && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setEditingSession(null)}>
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold mb-6">Edit Class Session</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Course</label>
                                <input type="text" value={editingSession.course.name} disabled className="w-full px-3 py-2 border rounded bg-gray-100" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Date</label>
                                <input type="date" value={editingSession.date} onChange={(e) => setEditingSession({ ...editingSession, date: e.target.value })} className="w-full px-3 py-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Period</label>
                                <select
                                    value={editingSession.period}
                                    onChange={(e) => setEditingSession({ ...editingSession, period: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded"
                                >
                                    {Object.entries(PERIOD_TIMES).map(([period, time]) => (
                                        <option key={period} value={period}>Period {period} ({time})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Section</label>
                                <input type="text" value={editingSession.section} onChange={(e) => setEditingSession({ ...editingSession, section: e.target.value })} className="w-full px-3 py-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select value={editingSession.status} onChange={(e) => setEditingSession({ ...editingSession, status: e.target.value })} className="w-full px-3 py-2 border rounded">
                                    <option value="SCHEDULED">Scheduled</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-6">
                            <button onClick={saveSessionEdit} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Save Changes</button>
                            <button onClick={() => setEditingSession(null)} className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherSchedule;
