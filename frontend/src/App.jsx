import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar.jsx';
import Feed from './pages/Feed.jsx';
import Report from './pages/Report.jsx';
import Group from './pages/Group.jsx';
import Statistics from './pages/Statistics.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import AlertDetails from './pages/AlertDetails.jsx';
import Chat from './pages/Chat.jsx';
import ChatWindow from './pages/ChatWindow.jsx';
import Notifications from './pages/Notifications.jsx';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
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
                <Route path="/chat" element={<Chat />} />
                <Route path="/chat/:conversationId" element={<ChatWindow />} />
                <Route path="/notifications" element={<Notifications />} />
              </Routes>
            </div>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;