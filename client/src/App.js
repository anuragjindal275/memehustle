import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

// Context providers
import { AuthProvider } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import MemeDetailPage from './pages/MemeDetailPage';
import LeaderboardPage from './pages/LeaderboardPage';
import CreateMemePage from './pages/CreateMemePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast notifications */}
        <ToastContainer
          position="bottom-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          toastClassName="bg-cyber-dark border border-neon-blue/30"
        />
        
        {/* Application routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/meme/:id" element={<MemeDetailPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/create" element={<CreateMemePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
