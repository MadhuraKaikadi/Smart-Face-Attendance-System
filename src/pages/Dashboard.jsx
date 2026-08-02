import { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useUser } from '@clerk/clerk-react';
import { getOrCreateTeacher } from '../lib/getTeacher';

function StatCard({ icon, title, value, color, bg }) {
  return (
    <div className="relative rounded-2xl p-6 shadow-sm border border-gray-100 bg-white hover:shadow-xl transition duration-300">
      <div className={`absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition ${bg}`}></div>

      <div className="relative z-10">
        <div className={`w-12 h-12 flex items-center justify-center rounded-xl text-white mb-4 ${color}`}>
          {icon}
        </div>

        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user } = useUser();

  const [teacherId, setTeacherId] = useState(null);
const [selectedClass, setSelectedClass] = useState(null);

console.log('Selected Class :', selectedClass);


  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0,
  });

  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 STEP 1: Get Teacher
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
  const updateClass = () => {
    const stored = localStorage.getItem('classId');
    setSelectedClass(stored || null);
  };

  updateClass(); // initial load

  window.addEventListener('storage', updateClass);

  return () => window.removeEventListener('storage', updateClass);
}, []);

  // 🔥 STEP 2: Load Data
useEffect(() => {
  if (teacherId && selectedClass) {
    loadDashboardData();
  } else {
    setStats({
      totalStudents: 0,
      presentToday: 0,
      absentToday: 0,
      attendanceRate: 0,
    });
    setRecentAttendance([]);
    setLoading(false);
  }
}, [teacherId, selectedClass]);

const loadDashboardData = async () => {
  try {
    setLoading(true);

    const today = new Date().toISOString().split('T')[0];

    // 🚀 PARALLEL QUERIES
    const [studentsRes, attendanceRes] = await Promise.all([

      // ✅ COUNT ONLY (FAST)
      supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', teacherId)
        .eq('class_id', selectedClass),

      // ✅ LIMITED DATA
      supabase
        .from('attendance')
        .select('student_id, time, status, students(name)')
        .eq('date', today)
        .eq('marked_by', teacherId)
        .eq('class_id', selectedClass)
        .order('time', { ascending: false })
        .limit(10)

    ]);

    const totalStudents = studentsRes.count || 0;
    const attendance = attendanceRes.data || [];

    const presentToday =
      attendance.filter(a => a.status === 'Present').length;

    const absentToday = totalStudents - presentToday;

    const attendanceRate =
      totalStudents > 0 ? (presentToday / totalStudents) * 100 : 0;

    setStats({
      totalStudents,
      presentToday,
      absentToday,
      attendanceRate,
    });

    setRecentAttendance(
      attendance.map(a => ({
        id: a.student_id,
        student_name: a.students?.name || 'Unknown',
        time: a.time,
        status: a.status,
      }))
    );

  } catch (error) {
    console.error('Dashboard Error:', error);
  } finally {
    setLoading(false);
  }
};

  // 🔥 LOADING UI
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* 🔥 HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of today's attendance</p>
        </div>

        <div className="text-sm text-gray-500">
          {todayFormatted}
        </div>
      </div>

      {/* 🔥 STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Users />} title="Total Students" value={stats.totalStudents} color="bg-blue-600" bg="bg-blue-50" />
        <StatCard icon={<UserCheck />} title="Present Today" value={stats.presentToday} color="bg-green-600" bg="bg-green-50" />
        <StatCard icon={<UserX />} title="Absent Today" value={stats.absentToday} color="bg-red-600" bg="bg-red-50" />
        <StatCard icon={<TrendingUp />} title="Attendance Rate" value={`${stats.attendanceRate.toFixed(1)}%`} color="bg-yellow-500" bg="bg-yellow-50" />
      </div>

      {/* 🔥 TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Recent Attendance
          </h2>
        </div>

        {recentAttendance.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <UserCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No attendance recorded today</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Student</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Time</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody>
                {recentAttendance.map((record, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {record.student_name}
                    </td>

                    <td className="px-4 py-3 text-gray-500">
                      {record.time}
                    </td>

                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
        )}
      </div>
    </div>
  );
}