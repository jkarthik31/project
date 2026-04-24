import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import HODDashboard from './pages/HODDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Jobs from './pages/Jobs';
import Applications from './pages/Applications';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
          <Router>
            <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100vw' }}>
              <Navbar />
              <main style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<Login />} />
                  
                  {/* Dashboards */}
                  <Route path="/dashboard" element={<StudentDashboard />} />
                  <Route path="/hod" element={<HODDashboard />} />
                  <Route path="/teacher" element={<TeacherDashboard />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  
                  {/* Features */}
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/applications" element={<Applications />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
