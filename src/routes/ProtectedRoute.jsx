import { Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

export function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useUser();

  // 🔄 Wait until auth loads
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  // ❌ Not logged in → redirect
  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  // ✅ Logged in → show page
  return children;
}