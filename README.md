# Smart Face Attendance System

A modern face recognition-based attendance system designed for schools, colleges, and organizations to automate attendance tracking with speed, accuracy, and minimal manual effort.

## Overview

This project helps teachers and administrators manage student attendance digitally by using face detection and recognition technology. Instead of taking attendance manually, the system can identify students in real time and record attendance automatically.

## Features

- Student registration with details and images
- Real-time face detection and recognition
- Automatic attendance marking
- Teacher-friendly dashboard
- Attendance reports and summaries
- Database-backed data storage with Supabase
- Responsive interface for desktop and web usage

## Tech Stack

- React
- Vite
- JavaScript
- Tailwind CSS
- Supabase
- Face-api.js
- Xlsx

## Project Goals

- Reduce manual attendance errors
- Save time for teachers and staff
- Improve accuracy and reliability
- Provide a digital attendance management experience

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/smart-face-attendance-system.git
cd smart-face-attendance-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the app

```bash
npm run dev
```

## Environment Setup

Create a `.env` file in the project root and add your Supabase configuration if needed:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Usage

1. Open the application in your browser.
2. Add students and upload their face images.
3. Start attendance capture.
4. The system detects and recognizes faces automatically.
5. View and export attendance records from the dashboard.

## Project Structure

```bash
src/
  components/
  pages/
  routes/
  lib/
public/
supabase/
```

## Contributing

Pull requests are welcome. Please open an issue first if you want to make a significant change.

## License

This project is licensed under the MIT License.

## Author

Your Name / Team Name
