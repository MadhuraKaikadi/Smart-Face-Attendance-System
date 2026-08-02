import { Routes, Route } from 'react-router-dom';
import { Landing } from '../pages/Landing';
import { Dashboard } from '../pages/Dashboard';
import { AddStudent } from '../pages/AddStudent';
import { TakeAttendance } from '../pages/TakeAttendance';
import { Reports } from '../pages/Reports';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/students" element={<AddStudent />} />
      <Route path="/attendance" element={<TakeAttendance />} />
      <Route path="/reports" element={<Reports />} />
    </Routes>
  );
}