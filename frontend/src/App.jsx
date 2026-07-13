import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Procedures from './pages/Procedures';
import Schedule from './pages/Schedule';
import Finance from './pages/Finance';
import Login from './pages/Login';

const ProtectedRoute = ({ children, token }) => {
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          token ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
        } />
        <Route path="/*" element={
          <ProtectedRoute token={token}>
            <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background text-white">
              <Sidebar onLogout={handleLogout} />
              <main className="flex-1 overflow-y-auto p-4 md:p-8 relative pb-24 md:pb-8">
                <Header />
                {/* Decorative background glow */}
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-secondary/20 rounded-full blur-[120px] pointer-events-none"></div>
                
                <div className="max-w-6xl mx-auto relative z-10 pt-4 md:pt-8">
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/procedures" element={<Procedures />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/finance" element={<Finance />} />
                  </Routes>
                </div>
              </main>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
