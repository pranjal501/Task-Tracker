import React, { useState } from 'react';

const AuthModal = ({ mode, setMode }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', mobile: '', gender: 'Male', password: '', confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return alert("Please enter a valid email address.");
    
    // Only check password matching during signup
    if (mode === 'signup' && formData.password !== formData.confirmPassword) {
      return alert("Passwords do not match!");
    }

    setIsLoading(true);

    try {
      // Send only necessary data based on mode
      const payload = mode === 'signup' ? formData : { email: formData.email, password: formData.password };
      
      const response = await fetch(`http://localhost:5000/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (response.ok) {
        alert(data.message + (mode === 'signup' ? "\n\n⚠️ If you don't see the email, check your SPAM folder." : ""));
        if (mode === 'signup') setMode('login'); // Auto-redirect to login
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Server connection failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 bg-white rounded-xl shadow-lg w-96">
      <h2 className="text-xl font-bold text-center">{mode === 'signup' ? 'Create Account' : 'Login'}</h2>
      
      {mode === 'signup' && (
        <input type="text" required placeholder="Full Name" onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 border rounded-xl" />
      )}
      
      {/* Email and Password appear in BOTH modes */}
      <input type="email" required placeholder="Email Address" onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3 border rounded-xl" />
      <input type="password" required placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-3 border rounded-xl" />
      
      {mode === 'signup' && (
        <input type="password" required placeholder="Confirm Password" onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="w-full p-3 border rounded-xl" />
      )}

      <button disabled={isLoading} className="bg-blue-600 text-white p-3 rounded-xl">
        {isLoading ? 'Processing...' : (mode === 'signup' ? 'Sign Up' : 'Login')}
      </button>

      <button type="button" onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')} className="text-blue-600 text-sm">
        {mode === 'signup' ? 'Already have an account? Login' : 'Need an account? Sign Up'}
      </button>
    </form>
  );
};

export default AuthModal;