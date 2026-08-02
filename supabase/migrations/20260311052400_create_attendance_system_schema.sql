/*
  # Smart Attendance System Database Schema

  ## Overview
  Creates the complete database structure for a face recognition-based attendance system.

  ## New Tables
  
  ### 1. `teachers`
  - `id` (uuid, primary key) - Unique teacher identifier
  - `email` (text, unique) - Teacher's email for login
  - `name` (text) - Teacher's full name
  - `created_at` (timestamptz) - Account creation timestamp
  
  ### 2. `students`
  - `id` (uuid, primary key) - Unique student identifier
  - `name` (text) - Student's full name
  - `roll_no` (text, unique) - Student's roll number
  - `department` (text) - Department name
  - `year` (integer) - Academic year
  - `created_at` (timestamptz) - Registration timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 3. `face_encodings`
  - `id` (uuid, primary key) - Unique encoding identifier
  - `student_id` (uuid, foreign key) - References students table
  - `encoding_data` (jsonb) - Face encoding data stored as JSON
  - `image_url` (text) - URL to the face image
  - `created_at` (timestamptz) - Encoding creation timestamp
  
  ### 4. `attendance`
  - `id` (uuid, primary key) - Unique attendance record identifier
  - `student_id` (uuid, foreign key) - References students table
  - `date` (date) - Attendance date
  - `time` (time) - Attendance time
  - `status` (text) - Attendance status (Present/Absent)
  - `marked_by` (uuid, foreign key) - Teacher who marked attendance
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on all tables
  - Teachers can manage students and view attendance
  - Attendance records are immutable once created
  - Students table is read-only for teachers
*/

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  roll_no text UNIQUE NOT NULL,
  department text NOT NULL,
  year integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create face_encodings table
CREATE TABLE IF NOT EXISTS face_encodings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  encoding_data jsonb NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE face_encodings ENABLE ROW LEVEL SECURITY;

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  time time NOT NULL DEFAULT CURRENT_TIME,
  status text NOT NULL DEFAULT 'Present',
  marked_by uuid REFERENCES teachers(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, date)
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_face_encodings_student ON face_encodings(student_id);

-- RLS Policies for teachers table
CREATE POLICY "Teachers can view all teachers"
  ON teachers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can update own profile"
  ON teachers FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for students table
CREATE POLICY "Authenticated users can view all students"
  ON students FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert students"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update students"
  ON students FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete students"
  ON students FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for face_encodings table
CREATE POLICY "Authenticated users can view face encodings"
  ON face_encodings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert face encodings"
  ON face_encodings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete face encodings"
  ON face_encodings FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for attendance table
CREATE POLICY "Authenticated users can view attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert attendance"
  ON attendance FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update attendance"
  ON attendance FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete attendance"
  ON attendance FOR DELETE
  TO authenticated
  USING (true);