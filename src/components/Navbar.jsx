import {
  LayoutDashboard,
  UserPlus,
  Video,
  FileText,
  Menu,
  Plus,
  Pencil,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserButton, useUser, SignInButton } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import { getOrCreateTeacher } from '../lib/getTeacher';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { isSignedIn, user } = useUser();

  const [classes, setClasses] = useState([]);
  const [teacherId, setTeacherId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [editingClass, setEditingClass] = useState(null);
  const [loading, setLoading] = useState(false);


  const [selectedClass, setSelectedClass] = useState(() => {
  return localStorage.getItem('classId');
});

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/students', label: 'Students', icon: UserPlus },
    { path: '/attendance', label: 'Attendance', icon: Video },
    { path: '/reports', label: 'Reports', icon: FileText },
  ];

  // 🔥 Redirect
  useEffect(() => {
    if (isSignedIn) navigate('/dashboard');
  }, [isSignedIn]);

  // 🔥 Init teacher
  useEffect(() => {
    if (user) initTeacher();
  }, [user]);

  const initTeacher = async () => {
    const teacher = await getOrCreateTeacher(user);
    if (!teacher) return;
    setTeacherId(teacher.id);
  };

  // 🔥 Load classes
  useEffect(() => {
    if (teacherId) loadClasses();
  }, [teacherId]);

const loadClasses = async () => {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('created_by', teacherId);

  if (error) {
    console.error(error);
    return;
  }

  const classList = data || [];
  setClasses(classList);

  const saved = localStorage.getItem('classId');

  if (saved && classList.some(c => c.id === saved)) {
    setSelectedClass(saved);
  }
};



  // 🔥 Sync localStorage + force refresh
useEffect(() => {
  if (selectedClass !== null) {
    localStorage.setItem('classId', selectedClass);
    window.dispatchEvent(new Event("storage"));
  }
}, [selectedClass]);

  // 🔥 CREATE CLASS
  const handleCreateClass = async () => {
    if (!className || !subject || !teacherId) return;

    setLoading(true);

    const { data } = await supabase
      .from('classes')
      .insert([{ name: className, subject, created_by: teacherId }])
      .select()
      .single();

    await loadClasses();

    setSelectedClass(data.id);

    setClassName('');
    setSubject('');
    setShowModal(false);
    setLoading(false);
  };

  // 🔥 EDIT CLASS
const handleEditClass = async () => {
  if (!editingClass) return;

  setLoading(true);

  const { error } = await supabase
    .from('classes')
    .update({
      name: className,
      subject: subject
    })
    .eq('id', editingClass.id);

  if (error) {
    console.error("UPDATE ERROR:", error);
    setLoading(false);
    return;
  }

  setEditingClass(null);
  setShowModal(false);
  setLoading(false);

  await loadClasses();
};

  // 🔥 DELETE CLASS
const handleDeleteClass = async (id) => {
  const confirmDelete = confirm("Delete class and all students?");
  if (!confirmDelete) return;

  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('id', id);
  if (error) {
    console.error("DELETE ERROR:", error);
    return;
  }

  if (selectedClass === id) {
    setSelectedClass(null);
  }

  await loadClasses();
};

  // 🔥 GET SELECTED CLASS OBJECT
  const selectedClassObj = classes.find(c => c.id === selectedClass);

  return (
    <nav className="bg-white border-b shadow-sm px-4 py-2">

      {/* TOP */}
      <div className="flex justify-between items-center">

        {/* LEFT */}
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            className="w-24 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          />

          <div className="hidden md:flex gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* CLASS DROPDOWN */}
          {isSignedIn && (
            <div className="relative">

              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50 text-sm"
              >
                {selectedClassObj ? selectedClassObj.name : "No Class"}
                <ChevronDown size={16} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50">

                  {/* NO CLASS */}
                  <div
                    onClick={() => {
                      setSelectedClass(null);
                      setDropdownOpen(false);
                    }}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    No Class
                  </div>

                  {classes.map(c => (
                    <div
                      key={c.id}
                      className="flex justify-between items-center px-3 py-2 hover:bg-gray-100"
                    >
                      <span
onClick={() => {
  setSelectedClass(c.id);
  localStorage.setItem('classId', c.id); // 🔥 immediate save
  setDropdownOpen(false);
}}
                        className="cursor-pointer text-sm"
                      >
                        {c.name}, {c.subject}
                      </span>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingClass(c);
                            setClassName(c.name);
                            setSubject(c.subject);
                            setShowModal(true);
                            setDropdownOpen(false);
                          }}
                          className="text-blue-600"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          onClick={() => handleDeleteClass(c.id)}
                          className="text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ADD CLASS */}
          {isSignedIn && (
            <button
              onClick={() => {
                setEditingClass(null);
                setShowModal(true);
              }}
              className="p-2 bg-blue-600 text-white rounded-lg"
            >
              <Plus size={16} />
            </button>
          )}

          {/* AUTH */}
          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <SignInButton mode="modal">
              <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">
                Sign In
              </button>
            </SignInButton>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden"
          >
            <Menu />
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden mt-3 space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-100"
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-80">

            <h2 className="text-lg font-semibold mb-4">
              {editingClass ? "Edit Class" : "Create Class"}
            </h2>

            <input
              placeholder="Class Name"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full mb-3 px-3 py-2 border rounded-lg"
            />

            <input
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full mb-4 px-3 py-2 border rounded-lg"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="border px-3 py-2 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={editingClass ? handleEditClass : handleCreateClass}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                {loading ? "Saving..." : editingClass ? "Update" : "Create"}
              </button>
            </div>

          </div>
        </div>
      )}
    </nav>
  );
}