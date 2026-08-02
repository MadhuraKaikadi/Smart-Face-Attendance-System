import { useState, useRef, useEffect } from 'react';
import { Camera, X, UserCheck, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { detectAllFaces, compareFaces, isFaceMatch, loadModels } from '../lib/faceDetection';
import { useUser } from '@clerk/clerk-react';
import { getOrCreateTeacher } from '../lib/getTeacher';

export function TakeAttendance() {
  const { user } = useUser();
  const [students, setStudents] = useState([]);
  const [detectedStudents, setDetectedStudents] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modelsLoading, setModelsLoading] = useState(true);

  const [selectedClass, setSelectedClass] = useState(
  localStorage.getItem('classId') || null
);

  const [teacherId, setTeacherId] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

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


  const loadStudents = async () => {
    try {
      const { data: studentsData, error: studentsError } = await supabase
.from('students')
.select('id, name, roll_no')
.eq('created_by', teacherId)
.eq('class_id', selectedClass) // ✅ IMPORTANT
      if (studentsError) throw studentsError;

      const { data: encodingsData, error: encodingsError } = await supabase
        .from('face_encodings')
        .select('student_id, encoding_data');

      if (encodingsError) throw encodingsError;

      const studentsWithEncodings = (studentsData || []).map(student => {
        const studentEncodings = (encodingsData || [])
          .filter(enc => enc.student_id === student.id)
          .map(enc => new Float32Array(enc.encoding_data));

        return {
          ...student,
          encodings: studentEncodings,
        };
      }).filter(s => s.encodings.length > 0);

      setStudents(studentsWithEncodings);
    } catch (err) {
      setError('Failed to load students');
      console.error(err);
    }
  };

 
  const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: 1280, height: 720 }
    });

    streamRef.current = stream;
    setShowCamera(true);
    setDetectedStudents([]);

    // ✅ wait for video to render
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }
    }, 300);

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

  const recognizeFaces = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setProcessing(true);
    setError('');

    try {
      const detections = await detectAllFaces(videoRef.current);

      if (!detections || detections.length === 0) {
        setError('No faces detected. Please ensure students are clearly visible in the camera.');
        setProcessing(false);
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx && videoRef.current) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);

        detections.forEach(detection => {
          const box = detection.detection.box;
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 3;
          ctx.strokeRect(box.x, box.y, box.width, box.height);
        });
      }

      const recognized = [];

      for (const detection of detections) {
        let bestMatch = null;
        let bestDistance = Infinity;

        for (const student of students) {
          for (const encoding of student.encodings) {
            const distance = compareFaces(detection.descriptor, encoding);
            if (distance < bestDistance) {
              bestDistance = distance;
              bestMatch = student;
            }
          }
        }

        if (bestMatch && isFaceMatch(bestDistance)) {
          if (!recognized.find(s => s.id === bestMatch.id)) {
            recognized.push({
              id: bestMatch.id,
              name: bestMatch.name,
              roll_no: bestMatch.roll_no,
              matched: true,
            });
          }
        }
      }

      setDetectedStudents(recognized);
    } catch (err) {
      setError('Face recognition failed. Please try again.');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };


const markAttendance = async () => {
  if (!selectedClass) {
  setError("Please select a class first");
  return;
}

  if (detectedStudents.length === 0) {
    setError('No students detected.');
    return;
  }

  if (!teacherId) {
    setError('Teacher not initialized');
    return;
  }

  setLoading(true);

  try {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0];

    const attendanceRecords = detectedStudents.map(student => ({
      student_id: student.id,
      date: today,
      time: now,
      status: 'Present',
      marked_by: teacherId, // ✅ correct
      class_id: selectedClass,
    }));

    const { error } = await supabase
      .from('attendance')
      .insert(attendanceRecords);

    if (error) throw error;

    setSuccess("Attendance marked!");
    setDetectedStudents([]);
    stopCamera();

  } catch (err) {
    console.error(err);
    setError("Failed to mark attendance");
  } finally {
    setLoading(false);
  }
};

  if (modelsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading face detection models...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <UserCheck className="w-8 h-8 mr-3 text-blue-600" />
          Take Attendance
        </h1>
        <p className="text-gray-600 mt-2">
          Use face recognition to automatically mark attendance
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Camera Feed</h2>

          <div className="space-y-4">
            {!showCamera ? (
              <button
                onClick={startCamera}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-lg"
              >
                <Camera className="w-6 h-6" />
                <span>Start Camera</span>
              </button>
            ) : (
              <>
                <div className="relative">
                  {/* <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg border-2 border-gray-300"
                  /> */}
  <video
  ref={videoRef}
  autoPlay
  muted
  playsInline
  className="w-full rounded-lg border-2 border-gray-300 bg-black"
/>
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={recognizeFaces}
                    disabled={processing}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
                  >
                    <UserCheck className="w-5 h-5" />
                    <span>{processing ? 'Scanning...' : 'Scan Faces'}</span>
                  </button>

                  <button
                    onClick={stopCamera}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Detected Students ({detectedStudents.length})
          </h2>

          {detectedStudents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <UserCheck className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No students detected yet</p>
              <p className="text-sm mt-1">Click "Scan Faces" to detect students</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {detectedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-600">Roll No: {student.roll_no}</p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                ))}
              </div>

              <button
                onClick={markAttendance}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Marking Attendance...' : `Mark ${detectedStudents.length} Student(s) Present`}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
          <li>Click "Start Camera" to begin</li>
          <li>Ensure students are clearly visible in the camera frame</li>
          <li>Click "Scan Faces" to detect and recognize students</li>
          <li>Review the detected students list</li>
          <li>Click "Mark Attendance" to save the records</li>
        </ol>
      </div>
    </div>
  );
}
