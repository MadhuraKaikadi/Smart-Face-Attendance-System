import { Camera, Zap, BarChart3, FileDown, Users, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser, SignInButton, SignUpButton } from '@clerk/clerk-react';

export function Landing() {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  function FancyCard({ icon, title }) {
    return (
      <div className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition duration-300 hover:-translate-y-2 border border-gray-100">
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 bg-blue-50 transition"></div>

        <div className="relative z-10 text-center">
          <div className="w-12 h-12 mx-auto flex items-center justify-center bg-blue-100 text-blue-600 rounded-xl mb-4 group-hover:scīale-110 transition">
            {icon}
          </div>

          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
        </div>
      </div>
    );
  }

  function StepCard({ number, title }) {
    return (
      <div className="relative p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition border border-gray-100 text-center">
        <div className="text-blue-600 text-3xl font-bold mb-2">
          {number}
        </div>

        <h3 className="text-lg font-semibold text-gray-900">
          {title}
        </h3>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">

      <main className="flex-grow">

        {/* 🔥 HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-200 rounded-full blur-3xl opacity-30"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 leading-tight">
              Smart Attendance
              <span className="block text-blue-600">Made Effortless</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Fast, accurate, and seamless attendance tracking using face recognition.
            </p>

            <div className="mt-8 flex justify-center gap-4">

              {isSignedIn ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition font-semibold"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <button className="px-8 py-4 bg-blue-600 text-white rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition font-semibold">
                      Sign In
                    </button>
                  </SignInButton>

                  {/* <SignUpButton mode="modal">
                    <button className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition font-semibold">
                      Sign Up
                    </button>
                  </SignUpButton> */}
                </>
              )}

            </div>
          </div>
        </section>

        {/* 🔥 FEATURES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

            <FancyCard icon={<Camera />} title="Face Recognition" />
            <FancyCard icon={<Zap />} title="Real-time Processing" />
            <FancyCard icon={<BarChart3 />} title="Analytics" />
            <FancyCard icon={<FileDown />} title="Excel Export" />
            <FancyCard icon={<Users />} title="Bulk Management" />
            <FancyCard icon={<Lock />} title="Secure System" />

          </div>
        </section>

        {/* 🔥 HOW IT WORKS */}
        <section className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-4 text-center">

            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12">
              Simple Workflow
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

              <StepCard number="01" title="Register" />
              <StepCard number="02" title="Start Camera" />
              <StepCard number="03" title="Detect Faces" />
              <StepCard number="04" title="Save Attendance" />

            </div>
          </div>
        </section>

        {/* 🔥 CTA */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-12 text-center text-white shadow-xl">

            <h2 className="text-3xl font-bold mb-4">
              Start Tracking Today
            </h2>

            <p className="text-blue-100 mb-6">
              Quick setup. Reliable performance.
            </p>

            {isSignedIn ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3 bg-white text-blue-600 rounded-xl hover:bg-gray-100 font-semibold shadow-md"
              >
                Go to Dashboard
              </button>
            ) : (
              <SignInButton mode="modal">
                <button className="px-8 py-3 bg-white text-blue-600 rounded-xl hover:bg-gray-100 font-semibold shadow-md">
                  Get Started
                </button>
              </SignInButton>
            )}

          </div>
        </section>

      </main>
    </div>
  );
}