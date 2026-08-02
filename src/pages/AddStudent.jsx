import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, UserPlus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { detectFace, loadModels } from '../lib/faceDetection';
import { useUser } from '@clerk/clerk-react';
import { getOrCreateTeacher } from '../lib/getTeacher';

export function AddStudent() {
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [capturedImages, setCapturedImages] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modelsLoading, setModelsLoading] = useState(true);


const [selectedClass, setSelectedClass] = useState(
  localStorage.getItem('classId') || null
);

const { user } = useUser();
const [teacherId, setTeacherId] = useState(null);
  
const [students, setStudents] = useState([]); // ✅ NEW
const [editingStudent, setEditingStudent] = useState(null); // ✅ NEW


  const videoRef = useRef(null);
  const streamRef = useRef(null);

useEffect(() => {
  loadModels().then(() => setModelsLoading(false));

  if (teacherId && selectedClass) {
    loadStudents();
  }

  return () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };
}, [teacherId, selectedClass]);


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


    // ✅ LOAD STUDENTS
  const loadStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
.select('*')
.eq('created_by', teacherId)
.eq('class_id', selectedClass)
      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true
    });

    streamRef.current = stream;

    setShowCamera(true); // 👈 render video FIRST

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }
    }, 300); // 👈 small delay is VERY important

  } catch (err) {
    console.error(err);
    setError('Failed to access camera. Please grant camera permissions.');
  }
};

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const captureImage = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    const imageUrl = canvas.toDataURL('image/jpeg');

    const img = new Image();
    img.src = imageUrl;

    img.onload = async () => {
      try {
        const detection = await detectFace(img);

        if (!detection) {
          setError('No face detected. Please ensure your face is clearly visible.');
          return;
        }

        setCapturedImages(prev => [...prev, {
          url: imageUrl,
          descriptor: Array.from(detection.descriptor)
        }]);

        setError('');
      } catch (err) {
        console.error('Face detection error:', err);
        setCapturedImages(prev => [...prev, {
          url: imageUrl,
          descriptor: null
        }]);
      }
    };
  };

  const removeImage = (index) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };

    // ✅ EDIT
  const handleEdit = (student) => {
    setName(student.name);
    setRollNo(student.roll_no);
    setDepartment(student.department);
    setYear(student.year.toString());
    setEditingStudent(student);
  };

  // ✅ DELETE
  const handleDelete = async (id) => {
    if (!confirm("Delete student?")) return;

    await supabase.from('students').delete().eq('id', id);
    loadStudents();
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (capturedImages.length < 3 && !editingStudent) {
      setError('Capture at least 3 images');
      return;
    }
  
  if (!selectedClass) {
    setError("Please select a class first");
    return;
  }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let student;

      if (editingStudent) {
        const { data, error } = await supabase
          .from('students')
          .update({
            name,
            roll_no: rollNo,
            department,
            year: parseInt(year),
          })
          .eq('id', editingStudent.id)
          .select()
          .single();

        if (error) throw error;
        student = data;

      } else {
        const { data, error } = await supabase
          .from('students')
          .insert([{
            name,
            roll_no: rollNo,
            department,
            year: parseInt(year),
            created_by: teacherId, // ✅ associate with teacher
            class_id: selectedClass // ✅ NEW
          }])
          .select()
          .single();

        if (error) throw error;
        student = data;

        const faceEncodings = capturedImages.map(img => ({
          student_id: student.id,
          encoding_data: img.descriptor,
          image_url: img.url,
        }));

        await supabase.from('face_encodings').insert(faceEncodings);
      }

      setSuccess("Saved successfully");
      setEditingStudent(null);
      setCapturedImages([]);
      setName('');
      setRollNo('');
      setDepartment('');
      setYear('');
      stopCamera();
      loadStudents();

    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  if (modelsLoading) {
    return <p className="text-center">Loading models...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <UserPlus className="w-8 h-8 mr-3 text-blue-600" />
          Add New Student
        </h1>
        <p className="text-gray-600 mt-2">Register a student with face recognition</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Suresh Kumar"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Roll Number
            </label>
            <input
              type="text"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="23410091"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Electronics"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Face Images (Capture at least 3 images)
          </label>

          <div className="flex gap-3 mb-4">
            {!showCamera ? (
              <button
                type="button"
                onClick={startCamera}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <Camera className="w-5 h-5" />
                <span>Open Camera</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={captureImage}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  <Camera className="w-5 h-5" />
                  <span>Capture Face</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  <X className="w-5 h-5" />
                  <span>Close Camera</span>
                </button>
              </>
            )}
          </div>


{showCamera && (
  <video
    ref={videoRef}
    autoPlay
    muted
    playsInline
    className="w-full max-w-lg rounded-lg border-2 border-gray-300 bg-black"
  />
)}

          {capturedImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {capturedImages.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img.url}
                    alt={`Capture ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {img.descriptor && (
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Face Detected
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || capturedImages.length < 3}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Registering Student...' : 'Register Student'}
        </button>
      </form>
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Students List</h2>

        {students.length === 0 ? (
          <p>No students yet</p>
        ) : (
          students.map(s => (
            <div key={s.id} className="flex justify-between border-b py-2">
              <span>{s.name} ({s.roll_no})</span>

              <div className="space-x-3">
                <button onClick={()=>handleEdit(s)} className="text-blue-600">Edit</button>
                <button onClick={()=>handleDelete(s.id)} className="text-red-600">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}







