import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StudentDetailModal from './StudentDetailModal';

interface Student {
    id: number;
    rollNum: string;
    name: string;
    email: string;
    department: string;
    semester: number;
    section: string;
    admissionYear: number;
    currentBatch: string;
    attendancePercentage: number;
    attendanceBreakdown: { [key: string]: number };
}

interface Course {
    id: number;
    code: string;
    name: string;
}

interface TeacherStudentsProps {
    user: any;
    courses: Course[];
    sections: string[];
}

const TeacherStudents: React.FC<TeacherStudentsProps> = ({ user, courses, sections }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    useEffect(() => {
        if (user?.id) {
            fetchStudents();
        }
    }, [selectedSection, selectedCourse, user?.id]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            let url = `/api/teacher/students?teacherId=${user?.id}`;
            const params = [];
            if (selectedSection) params.push(`section=${selectedSection}`);
            if (selectedCourse) params.push(`courseId=${selectedCourse}`);
            if (params.length > 0) url += `&${params.join('&')}`; // Note: changed ? to & because teacherId is already first param

            const response = await api.get(url);
            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const searchStudents = async () => {
        if (!searchQuery.trim()) {
            fetchStudents();
            return;
        }
        try {
            setLoading(true);
            const response = await api.get(`/api/teacher/students/search?query=${searchQuery}`);
            setStudents(response.data);
        } catch (error) {
            console.error('Error searching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const viewStudentDetail = async (studentId: number) => {
        try {
            const response = await api.get(`/api/teacher/students/${studentId}`);
            setSelectedStudent(response.data);
        } catch (error) {
            console.error('Error fetching student details:', error);
        }
    };

    return (
        <div>
            <div className="mb-6 space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <label className="font-medium">Course:</label>
                        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="border rounded-lg px-4 py-2">
                            <option value="">All Courses</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="font-medium">Section:</label>
                        <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} className="border rounded-lg px-4 py-2">
                            <option value="">All Sections</option>
                            {sections.map(section => (
                                <option key={section} value={section}>{section}</option>
                            ))}
                        </select>
                    </div>

                    {(selectedSection || selectedCourse) && (
                        <span className="text-sm text-gray-600">
                            Showing students
                            {selectedCourse && ` for ${courses.find(c => c.id.toString() === selectedCourse)?.name}`}
                            {selectedSection && ` in Section ${selectedSection}`}
                        </span>
                    )}
                </div>
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Search by name or roll number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && searchStudents()}
                        className="flex-1 border rounded-lg px-4 py-2"
                    />
                    <button onClick={searchStudents} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Search</button>
                    <button onClick={() => { setSearchQuery(''); fetchStudents(); }} className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600">Clear</button>
                </div>
            </div>

            {loading ? (
                <p className="text-center py-12 text-gray-500">Loading students...</p>
            ) : students.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500 text-lg">
                        {selectedSection ? `No students found in Section ${selectedSection}` : 'No students found.'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sem</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.rollNum}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.department}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.semester}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.section}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.currentBatch}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${student.attendancePercentage >= 75 ? 'bg-green-100 text-green-800' :
                                            student.attendancePercentage >= 65 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                            {student.attendancePercentage.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button onClick={() => viewStudentDetail(student.id)} className="text-blue-600 hover:text-blue-800 font-medium">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <StudentDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
        </div>
    );
};

export default TeacherStudents;
