import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Procedures from './pages/Procedures';
import Schedule from './pages/Schedule';
import Finance from './pages/Finance';
import ReportsList from './pages/reports/ReportsList';
import AppointmentsReport from './pages/reports/AppointmentsReport';
import StatisticsReport from './pages/reports/StatisticsReport';

import Login from './pages/Login';
import api from './utils/api';

const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        await api.get('/auth/me');
        setIsAuthenticated(true);
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error(err);
    }
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#2A2A35',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)'
          },
          success: {
            iconTheme: {
              primary: '#d946ef',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
        } />
        <Route path="/*" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background text-white">
              <Sidebar onLogout={handleLogout} />
              <main className="flex-1 overflow-y-auto p-4 md:p-8 relative pb-24 md:pb-8">
                <Header />
                <div className="md:hidden absolute top-4 left-4 z-20">
                  <span 
                    className="px-3 py-1 border border-primary/50 text-primary font-bold text-xs rounded-full bg-primary/10"
                  >
                    v 1.2.0
                  </span>
                </div>
                {/* Decorative background glow */}
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-secondary/20 rounded-full blur-[120px] pointer-events-none"></div>
                
                <div className="max-w-6xl mx-auto relative z-10 pt-12 md:pt-8">
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/procedures" element={<Procedures />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/finance" element={<Finance />} />
                    <Route path="/reports" element={<ReportsList />} />
                    <Route path="/reports/atendimentos" element={<AppointmentsReport />} />
                    <Route path="/reports/estatistico" element={<StatisticsReport />} />

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
