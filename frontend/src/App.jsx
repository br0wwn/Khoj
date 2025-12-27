import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar.jsx';
import Homepage from './pages/Homepage.jsx';
import Feed from './pages/Feed.jsx';
import Report from './pages/Report.jsx';
import Group from './pages/Group.jsx';
import Statistics from './pages/Statistics.jsx';
import Profile from './pages/Profile.jsx';
import UserProfile from './pages/UserProfile.jsx';
import ViewProfile from './pages/ViewProfile.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import AlertDetails from './pages/AlertDetails.jsx';
import Search from './pages/Search.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminSignup from './pages/admin/AdminSignup.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';
import AdminReportsPage from './pages/admin/AdminReportsPage.jsx';
import AdminAlertsPage from './pages/admin/AdminAlertsPage.jsx';
import AdminViewAlertPage from './pages/admin/AdminViewAlertPage.jsx';
import AdminPolicePage from './pages/admin/AdminPolicePage.jsx';
import AdminAdminsPage from './pages/admin/AdminAdminsPage.jsx';
import AdminSettingsPage from './pages/admin/AdminSettingsPage.jsx';
import AdminUserProfile from './pages/admin/AdminUserProfile.jsx';
import AdminPoliceProfile from './pages/admin/AdminPoliceProfile.jsx';
import AdminProtectedRoute from './components/AdminProtectedRoute.jsx';
import Chat from './pages/Chat.jsx';
import ChatWindow from './pages/ChatWindow.jsx';
import Notifications from './pages/Notifications.jsx';

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <SocketProvider>
          <Router>
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/signup" element={<AdminSignup />} />
              <Route 
                path="/admin/dashboard" 
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <AdminProtectedRoute>
                    <AdminUsersPage />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users/:id" 
                element={
                  <AdminProtectedRoute>
                    <AdminUserProfile />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/reports" 
                element={
                  <AdminProtectedRoute>
                    <AdminReportsPage />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/alerts" 
                element={
                  <AdminProtectedRoute>
                    <AdminAlertsPage />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/alerts/:id" 
                element={
                  <AdminProtectedRoute>
                    <AdminViewAlertPage />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/police" 
                element={
                  <AdminProtectedRoute>
                    <AdminPolicePage />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/police/:id" 
                element={
                  <AdminProtectedRoute>
                    <AdminPoliceProfile />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/admins" 
                element={
                  <AdminProtectedRoute>
                    <AdminAdminsPage />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/settings" 
                element={
                  <AdminProtectedRoute>
                    <AdminSettingsPage />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                } 
              />

              {/* Main Website Routes */}
              <Route path="/*" element={
                <div className="min-h-screen bg-primary">
                  <Navbar />
                  <div className="pt-16">
                    <Routes>
                      <Route path="/" element={<Homepage />} />
                      <Route path="/feed" element={<Feed />} />
                      <Route path="/alerts/:id" element={<AlertDetails />} />
                      <Route path="/report" element={<Report />} />
                      <Route path="/group" element={<Group />} />
                      <Route path="/statistics" element={<Statistics />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/profile/:type/:id" element={<UserProfile />} />
                      <Route path="/view-profile/:type/:id" element={<ViewProfile />} />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/chat/:chatId" element={<ChatWindow />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/search" element={<Search />} />
            <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                    </Routes>
                  </div>
                </div>
              } />
            </Routes>
          </Router>
        </SocketProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;