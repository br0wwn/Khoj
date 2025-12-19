import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar.jsx';
import Feed from './pages/Feed.jsx';
import Report from './pages/Report.jsx';
import Group from './pages/Group.jsx';
import Statistics from './pages/Statistics.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import AlertDetails from './pages/AlertDetails.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-primary">
          <Navbar />
          <div className="pt-16">
            <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/alerts/:id" element={<AlertDetails />} />
            <Route path="/report" element={<Report />} />
            <Route path="/group" element={<Group />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

