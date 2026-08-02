import { useUser } from '@clerk/clerk-react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { AddStudent } from './pages/AddStudent';
import { TakeAttendance } from './pages/TakeAttendance';
import { Reports } from './pages/Reports';

function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/" />;
  }

  return children;
}

function App() {
  const { isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* Navbar */}
      <Navbar />

      {/* Routes */}
      <main className="flex-grow">
        <Routes>

          {/* Public Route */}
          <Route path="/" element={<Landing />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <AddStudent />
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <TakeAttendance />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;