import { useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';
import { AuthProvider, useAuth } from './context/AuthContext';
import Admin from './pages/Admin';
import ComplaintDetails from './pages/ComplaintDetails';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import MyComplaints from './pages/MyComplaints';
import Profile from './pages/Profile';
import Register from './pages/Register';
import SubmitComplaint from './pages/SubmitComplaint';

function AppShell() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isPublicRoute = ['/', '/login', '/register'].includes(location.pathname);

  if (!isAuthenticated || isPublicRoute) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <div className="relative isolate min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),transparent_32%),linear-gradient(180deg,#f8fafc_0%,#f8fafc_100%)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.18),transparent_55%)]" />

          <main className="relative z-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['reporter', 'technician', 'supervisor', 'admin']}><Dashboard /></ProtectedRoute>} />
              <Route path="/submit-complaint" element={<ProtectedRoute allowedRoles={['reporter']}><SubmitComplaint /></ProtectedRoute>} />
              <Route path="/my-complaints" element={<ProtectedRoute allowedRoles={['reporter']}><MyComplaints /></ProtectedRoute>} />
              <Route path="/complaint/:id" element={<ProtectedRoute allowedRoles={['reporter', 'technician', 'supervisor', 'admin']}><ComplaintDetails /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute allowedRoles={['reporter', 'technician', 'supervisor', 'admin']}><Profile /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />

              <Route path="*" element={<Home />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar open={sidebarOpen} onToggle={setSidebarOpen} />

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-xl md:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen((value) => !value)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm"
                  aria-label="Toggle sidebar"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                    <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                  </svg>
                </button>
                <div className="text-sm font-semibold text-slate-900">CampusCare</div>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['reporter', 'technician', 'supervisor', 'admin']}><Dashboard /></ProtectedRoute>} />
              <Route path="/submit-complaint" element={<ProtectedRoute allowedRoles={['reporter']}><SubmitComplaint /></ProtectedRoute>} />
              <Route path="/my-complaints" element={<ProtectedRoute allowedRoles={['reporter']}><MyComplaints /></ProtectedRoute>} />
              <Route path="/complaint/:id" element={<ProtectedRoute allowedRoles={['reporter', 'technician', 'supervisor', 'admin']}><ComplaintDetails /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute allowedRoles={['reporter', 'technician', 'supervisor', 'admin']}><Profile /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />

              <Route path="*" element={<Home />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;