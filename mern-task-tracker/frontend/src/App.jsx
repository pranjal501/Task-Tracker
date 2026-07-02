import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// --- Custom Logo Component ---
const TaskFlowLogo = () => (
  <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600">
    <rect width="100" height="100" rx="24" fill="currentColor" fillOpacity="0.1"/>
    <path d="M30 55L45 70L75 35" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M30 55C30 55 45 40 75 40" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 8"/>
  </svg>
);

// ==========================================
// 1. AUTHENTICATION MODAL (Real Backend Auth)
// ==========================================
const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'otp'
  const [formData, setFormData] = useState({ name: '', mobile: '', gender: 'Male', email: '', password: '' });
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  if (!isOpen) return null;

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-focus next box
    if (value !== '' && index < 3) otpRefs[index + 1].current.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        await axios.post(`${API_URL}/auth/signup`, formData);
        toast.success("OTP sent to your email!");
        setMode('otp');
      } else if (mode === 'otp') {
        const otpString = otp.join('');
        if (otpString.length !== 4) return toast.error("Enter full OTP");
        
        const res = await axios.post(`${API_URL}/auth/verify-otp`, { email: formData.email, otp: otpString });
        onLoginSuccess(res.data.user, res.data.token);
        toast.success("Account created successfully!");
        onClose();
      } else if (mode === 'login') {
        const res = await axios.post(`${API_URL}/auth/login`, { email: formData.email, password: formData.password });
        onLoginSuccess(res.data.user, res.data.token);
        toast.success(`Welcome back, ${res.data.user.name}!`);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-full">
          ✕
        </button>
        
        <div className="p-8">
          <div className="flex justify-center mb-6"><TaskFlowLogo /></div>
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-1">
            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Check Your Email'}
          </h2>
          <p className="text-sm text-center text-slate-500 mb-8">
            {mode === 'login' ? 'Log in to access your workspace.' : mode === 'signup' ? 'Enter your details to get started.' : `We sent a 4-digit code to ${formData.email}`}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <input type="text" required placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600" />
                <div className="flex gap-4">
                  <input type="tel" required placeholder="Mobile Number" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-2/3 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600" />
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-1/3 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 bg-white">
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
              </>
            )}

            {(mode === 'signup' || mode === 'login') && (
              <>
                <input type="email" required placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600" />
                <input type="password" required placeholder={mode === 'signup' ? "Create Password" : "Password"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600" />
              </>
            )}

            {mode === 'otp' && (
              <div className="flex gap-3 justify-center mb-6">
                {otp.map((digit, index) => (
                  <input key={index} ref={otpRefs[index]} type="text" maxLength="1" value={digit} onChange={(e) => handleOtpChange(index, e.target.value)} onKeyDown={(e) => handleKeyDown(index, e)} className="w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:outline-none" />
                ))}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30 disabled:opacity-70">
              {loading ? 'Processing...' : mode === 'login' ? 'Log In' : mode === 'signup' ? 'Continue' : 'Verify & Create Account'}
            </button>
          </form>

          {mode !== 'otp' && (
            <div className="mt-6 text-center text-sm text-slate-500">
              {mode === 'login' ? "New here? " : "Already have an account? "}
              <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="font-bold text-indigo-600 hover:underline">
                {mode === 'login' ? 'Create an account' : 'Log in instead'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. LANDING PAGE
// ==========================================
const LandingPage = ({ user, openAuth }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Real Navbar */}
      <nav className="fixed w-full z-40 top-0 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 font-extrabold text-2xl text-slate-800 tracking-tight">
            <TaskFlowLogo /> TaskFlow
          </div>
          
          <div className="hidden md:flex items-center gap-10 font-medium text-slate-500">
            <a href="#about" className="hover:text-indigo-600 transition-colors">The Story</a>
            <a href="#features" className="hover:text-indigo-600 transition-colors">Benefits</a>
            <a href="#contact" className="hover:text-indigo-600 transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <button onClick={() => navigate('/app')} className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-indigo-600/20 hover:scale-105 transition-transform">
                Go to Dashboard
              </button>
            ) : (
              <>
                <button onClick={openAuth} className="text-slate-600 font-bold hover:text-indigo-600 hidden md:block">Log In</button>
                <button onClick={openAuth} className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-indigo-600/20 hover:scale-105 transition-transform">
                  Get Started Free
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center min-h-[90vh]">
        <div>
          <span className="inline-block py-1.5 px-4 rounded-full bg-indigo-50 text-indigo-700 text-sm font-bold mb-6 border border-indigo-100">
            Your Digital Sanctuary
          </span>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-slate-900">
            Conquer your day. <br />
            <span className="text-indigo-600">Free your mind.</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-lg font-medium">
            TaskFlow is the elegant, beautifully designed workspace built to help you prioritize your life, hit your deadlines, and achieve absolute focus.
          </p>
          <button onClick={() => user ? navigate('/app') : openAuth()} className="bg-slate-900 text-white px-8 py-4 rounded-full text-lg font-bold hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2">
            Start organizing now
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
        
        {/* Right Image */}
        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-900/10 aspect-[4/3] border-8 border-white">
          <img src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=1200" alt="Productive Workspace" className="object-cover w-full h-full" />
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="rounded-[2.5rem] overflow-hidden shadow-xl aspect-square lg:aspect-[4/3]">
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000" alt="Creative Team" className="object-cover w-full h-full" />
          </div>
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight mb-6 text-slate-900">Built for humans, by humans.</h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-6 font-medium">
              Software shouldn't feel like a spreadsheet. We designed TaskFlow to feel like a natural extension of your workflow—calm, intuitive, and highly capable.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              Whether you are managing a massive project or just trying to remember your groceries, TaskFlow gives you the mental clarity to focus on what actually matters.
            </p>
          </div>
        </div>
      </section>

      {/* Customer Benefit Features */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-extrabold tracking-tight mb-4 text-slate-900">Everything you need to thrive.</h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: "Crystal Clear Focus", desc: "A clutter-free, aesthetic interface that respects your attention and reduces cognitive load.", icon: "🧘‍♂️" },
            { title: "Never Miss a Deadline", desc: "Set intuitive due dates and get smart, timely reminders right on your dashboard.", icon: "⏰" },
            { title: "Access Anywhere", desc: "Your data is securely synced to the cloud instantly. Pick up exactly where you left off.", icon: "☁️" },
            { title: "Military-Grade Security", desc: "Real OTP email verification and encrypted passwords keep your personal data completely private.", icon: "🔐" },
            { title: "Organize Your Way", desc: "Filter by pending, sort by oldest, or view everything at once with lightning-fast controls.", icon: "🗂️" },
            { title: "Instant Gratification", desc: "Checking off a task feels amazing with our smooth, human-designed micro-interactions.", icon: "✨" }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="text-4xl mb-6 bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center border border-indigo-100">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-white pt-24 pb-8 px-6 rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <div className="flex items-center gap-3 font-extrabold text-2xl tracking-tight mb-4 text-white">
              <TaskFlowLogo /> TaskFlow
            </div>
            <p className="text-slate-400 max-w-sm font-medium leading-relaxed">
              Your digital sanctuary for productivity. Free your mind, conquer your day, and achieve your biggest goals.
            </p>
          </div>
          <div className="md:justify-self-end">
            <h3 className="font-bold text-xl mb-6 text-white">Get in touch</h3>
            <div className="space-y-4">
              <p className="text-slate-400 flex items-center gap-3"><span className="text-indigo-400">✉️</span> pranjaljaiswal501@gmail.com</p>
              <p className="text-slate-400 flex items-center gap-3"><span className="text-indigo-400">📞</span> +91 6392190031</p>
              <p className="text-slate-400 flex items-center gap-3"><span className="text-indigo-400">📍</span> Lucknow, Uttar Pradesh, India</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 font-medium text-sm">© 2026 TaskFlow Inc. All rights reserved.</p>
          <div className="bg-slate-800/50 border border-slate-700 px-6 py-3 rounded-full flex items-center gap-2">
            <span className="text-slate-400 text-sm font-medium">Designed & Built by</span>
            <span className="text-white font-bold tracking-wide">Pranjal Jaiswal</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ==========================================
// 3. TASK TRACKER (Protected)
// ==========================================
const TaskTracker = ({ user, token, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Configure axios to send the auth token
  const authAxios = axios.create({
    headers: { Authorization: `Bearer ${token}` }
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await authAxios.get(`${API_URL}/tasks`);
      setTasks(response.data);
    } catch (error) {
      toast.error("Failed to load tasks");
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    try {
      const response = await authAxios.post(`${API_URL}/tasks`, { title, dueDate });
      setTasks([response.data, ...tasks]);
      setTitle(''); setDueDate('');
    } catch (error) {}
  };

  const toggleStatus = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      const response = await authAxios.put(`${API_URL}/tasks/${task._id}`, { ...task, status: newStatus });
      setTasks(tasks.map(t => t._id === task._id ? response.data : t));
    } catch (error) {}
  };

  const deleteTask = async (id) => {
    try {
      await authAxios.delete(`${API_URL}/tasks/${id}`);
      setTasks(tasks.filter(task => task._id !== id));
    } catch (error) {}
  };

  if (!user) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pt-24 pb-20 px-6">
      <nav className="fixed w-full z-40 top-0 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-extrabold text-lg flex items-center gap-2"><TaskFlowLogo/> TaskFlow</Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-slate-600">Hey, {user.name}</span>
            <button onClick={onLogout} className="text-sm font-bold text-red-500 hover:text-red-700 bg-red-50 px-4 py-2 rounded-full">Log out</button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto mt-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Your Dashboard</h1>
          <p className="text-slate-500 font-medium">Clear your mind. Organize your tasks.</p>
        </header>

        <form onSubmit={addTask} className="bg-white border-2 border-slate-100 rounded-[2rem] overflow-hidden mb-10 shadow-lg shadow-slate-200/50 focus-within:border-indigo-500 transition-all">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" className="w-full bg-transparent px-8 py-6 text-xl focus:outline-none font-medium" />
          <div className="px-8 py-4 border-t border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="bg-transparent text-sm font-bold text-slate-500 focus:outline-none" />
            <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-indigo-700 shadow-md">Add Task</button>
          </div>
        </form>

        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task._id} className={`group flex justify-between items-center p-5 rounded-2xl border-2 transition-all ${task.status === 'Completed' ? 'bg-slate-50 border-transparent opacity-60' : 'bg-white border-slate-100 hover:border-indigo-200'}`}>
              <div className="flex items-center gap-5">
                <button onClick={() => toggleStatus(task)} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${task.status === 'Completed' ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 hover:border-indigo-400'}`}>
                  {task.status === 'Completed' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </button>
                <div>
                  <p className={`font-bold text-lg ${task.status === 'Completed' ? 'line-through text-slate-500' : 'text-slate-900'}`}>{task.title}</p>
                </div>
              </div>
              <button onClick={() => deleteTask(task._id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 bg-red-50 p-2.5 rounded-xl transition-all">
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <Router>
      <Toaster position="top-center" toastOptions={{ className: 'font-sans font-bold rounded-2xl shadow-xl' }} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLoginSuccess={(userData, authToken) => { setUser(userData); setToken(authToken); }} />
      <Routes>
        <Route path="/" element={<LandingPage user={user} openAuth={() => setIsAuthModalOpen(true)} />} />
        <Route path="/app" element={<TaskTracker user={user} token={token} onLogout={() => { setUser(null); setToken(null); }} />} />
      </Routes>
    </Router>
  );
}