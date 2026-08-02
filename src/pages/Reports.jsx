import { useState, useEffect } from 'react';
import { FileDown, Calendar, TrendingUp, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';
import { useUser } from '@clerk/clerk-react';
import { getOrCreateTeacher } from '../lib/getTeacher';

export function Reports() {
const [selectedClass, setSelectedClass] = useState(
  localStorage.getItem('classId') || null
);

  const [reportType, setReportType] = useState('daily');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalRecords: 0,
    uniqueStudents: 0,
    averageAttendance: 0,
  });

const { user } = useUser();
const [teacherId, setTeacherId] = useState(null);
  
useEffect(() => {
  if (user) {
    initTeacher();
  }
}, [user]);

const initTeacher = async () => {
  const teacher = await getOrCreateTeacher(user);
  if (!teacher) return;

  setTeacherId(teacher.id);
};

  useEffect(() => {
    updateDateRange();
  }, [reportType]);

  const updateDateRange = () => {
    const today = new Date();
    let start = new Date();

    switch (reportType) {
      case 'daily':
        start = today;
        break;
      case 'weekly':
        start = new Date(today.setDate(today.getDate() - 7));
        break;
      case 'monthly':
        start = new Date(today.setMonth(today.getMonth() - 1));
        break;
      case 'yearly':
        start = new Date(today.setFullYear(today.getFullYear() - 1));
        break;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
  };

  const loadReport = async () => {
if (!teacherId || !selectedClass) {
  alert("Please select a class first");
  return;
}

setLoading(true);
setRecords([]);;

    

    try {
      const { data, error } = await supabase
  .from('attendance')
  .select(`
    date,
    status,
    time,
    students (
      name,
      roll_no,
      department
    )
  `)
  .eq('marked_by', teacherId) // ✅ IMPORTANT
  .eq('class_id', selectedClass) // ✅ filter by selected class
  .gte('date', startDate)
  .lte('date', endDate)
  .order('date', { ascending: false });

      if (error) throw error;

      const formattedRecords = (data || []).map(record => ({
        date: record.date,
        student_name: record.students?.name || 'Unknown',
        roll_no: record.students?.roll_no || 'N/A',
        department: record.students?.department || 'N/A',
        status: record.status,
        time: record.time,
      }));

      setRecords(formattedRecords);

      const uniqueStudents = new Set(formattedRecords.map(r => r.roll_no)).size;
      const presentCount = formattedRecords.filter(r => r.status === 'Present').length;

      setStats({
        totalRecords: formattedRecords.length,
        uniqueStudents,
        averageAttendance: formattedRecords.length > 0 ? (presentCount / formattedRecords.length) * 100 : 0,
      });
    } catch (err) {
      console.error('Error loading report:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (records.length === 0) {
      alert('No data to export');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      records.map(record => ({
        Date: record.date,
        'Student Name': record.student_name,
        'Roll Number': record.roll_no,
        Department: record.department,
        Status: record.status,
        Time: record.time,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

    const fileName = `attendance_${reportType}_${startDate}_to_${endDate}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FileDown className="w-8 h-8 mr-3 text-blue-600" />
          Attendance Reports
        </h1>
        <p className="text-gray-600 mt-2">Generate and export attendance reports</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Report Settings</h2>

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setReportType('daily')}
            className={`p-4 rounded-lg border-2 transition ${
              reportType === 'daily'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Calendar className="w-6 h-6 mx-auto mb-2" />
            <p className="font-semibold">Daily</p>
          </button>

          <button
            onClick={() => setReportType('weekly')}
            className={`p-4 rounded-lg border-2 transition ${
              reportType === 'weekly'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Calendar className="w-6 h-6 mx-auto mb-2" />
            <p className="font-semibold">Weekly</p>
          </button>

          <button
            onClick={() => setReportType('monthly')}
            className={`p-4 rounded-lg border-2 transition ${
              reportType === 'monthly'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Calendar className="w-6 h-6 mx-auto mb-2" />
            <p className="font-semibold">Monthly</p>
          </button>

          <button
            onClick={() => setReportType('yearly')}
            className={`p-4 rounded-lg border-2 transition ${
              reportType === 'yearly'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Calendar className="w-6 h-6 mx-auto mb-2" />
            <p className="font-semibold">Yearly</p>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={loadReport}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {records.length > 0 && (
        <>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Records</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalRecords}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileDown className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Unique Students</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.uniqueStudents}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Avg Attendance</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.averageAttendance.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Attendance Records</h2>
              <button
                onClick={exportToExcel}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
              >
                <FileDown className="w-5 h-5" />
                <span>Export to Excel</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Student Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Roll Number</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Department</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Time</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-3 px-4 text-gray-900">{record.date}</td>
                      <td className="py-3 px-4 text-gray-900">{record.student_name}</td>
                      <td className="py-3 px-4 text-gray-600">{record.roll_no}</td>
                      <td className="py-3 px-4 text-gray-600">{record.department}</td>
                      <td className="py-3 px-4 text-gray-600">{record.time}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          record.status === 'Present'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!loading && records.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <FileDown className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 text-lg">No attendance records found for the selected period</p>
          <p className="text-gray-500 text-sm mt-2">Try selecting a different date range or generate attendance first</p>
        </div>
      )}
    </div>
  );
}
