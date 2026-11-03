import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Footer from './components/layout/Footer';
import Navbar from './components/layout/Navbar';
import ComplaintDetails from './pages/ComplaintDetails';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import MyComplaints from './pages/MyComplaints';
import Register from './pages/Register';
import SubmitComplaint from './pages/SubmitComplaint';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/submit-complaint" element={<SubmitComplaint />} />
            <Route path="/my-complaints" element={<MyComplaints />} />
            <Route path="/complaint/:id" element={<ComplaintDetails />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;