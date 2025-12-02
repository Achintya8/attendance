import React from 'react';

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

interface StudentDetailModalProps {
    student: Student | null;
    onClose: () => void;
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ student, onClose }) => {
    if (!student) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{student.name}</h2>
                        <p className="text-gray-600">Roll No: {student.rollNum}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{student.email}</p></div>
                    <div><p className="text-sm text-gray-500">Department</p><p className="font-medium">{student.department}</p></div>
                    <div><p className="text-sm text-gray-500">Semester</p><p className="font-medium">{student.semester}</p></div>
                    <div><p className="text-sm text-gray-500">Section</p><p className="font-medium">{student.section}</p></div>
                    <div><p className="text-sm text-gray-500">Admission Year</p><p className="font-medium">{student.admissionYear}</p></div>
                    <div><p className="text-sm text-gray-500">Current Batch</p><p className="font-medium">{student.currentBatch}</p></div>
                </div>
                <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Attendance Summary</h3>
                    <div className="flex items-center justify-center mb-4">
                        <div className="text-center">
                            <div className={`text-5xl font-bold ${student.attendancePercentage >= 75 ? 'text-green-600' :
                                student.attendancePercentage >= 65 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {student.attendancePercentage.toFixed(1)}%
                            </div>
                            <p className="text-gray-500 mt-2">Overall Attendance</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-6">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{student.attendanceBreakdown.P || 0}</div>
                            <div className="text-sm text-gray-600">Present</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{student.attendanceBreakdown.A || 0}</div>
                            <div className="text-sm text-gray-600">Absent</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{student.attendanceBreakdown.O || 0}</div>
                            <div className="text-sm text-gray-600">On Duty</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{student.attendanceBreakdown.M || 0}</div>
                            <div className="text-sm text-gray-600">Medical</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetailModal;
