import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import './index.css'; // Ensure Tailwind is loaded

// --- LOGIN COMPONENT ---
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    
    setTimeout(() => {
      console.log('Logging in with:', { email, password });
      setIsLoading(false);
      // For now, just alert or log success since we don't have a dashboard yet
      alert("Login Successful!"); 
    }, 1500);
  };

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* LEFT SIDE - FORM */}
      <div className="flex w-full flex-col justify-center px-8 sm:w-1/2 lg:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Logo / Header */}
          <div className="mb-8 flex items-center gap-2 text-blue-600">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              <CheckCircle2 size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight">InvoiceAI</span>
          </div>

          <h2 className="mb-2 text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mb-8 text-gray-500">
            Please enter your details to access the reconciliation dashboard.
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  required
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-white transition-all hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:bg-blue-400"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
              {!isLoading && <ArrowRight size={20} />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <a href="#" className="font-medium text-blue-600 hover:underline">
              Contact Admin
            </a>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - IMAGE (Hidden on Mobile) */}
      <div className="hidden w-1/2 bg-blue-600 lg:block relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-900 opacity-90" />
        <img
          src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80"
          alt="Finance Background"
          className="h-full w-full object-cover mix-blend-overlay"
        />
        <div className="absolute bottom-0 left-0 p-12 text-white">
          <h3 className="mb-4 text-3xl font-bold">Automated Reconciliation</h3>
          <p className="text-blue-100 text-lg max-w-md">
            Streamline your invoice processing with AI-powered data extraction and real-time validation.
          </p>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;