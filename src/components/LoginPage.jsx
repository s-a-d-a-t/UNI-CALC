import React, { useState } from 'react';
import { db } from '../services/db';
import { Mail, Lock, User, BookOpen, IdCard, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import logoImage from '../assets/logo1.png';

export default function LoginPage({ onBack, onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    major: '',
    studentId: ''
  });

  const handleLoginChange = (e) => {
    setLoginData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignupChange = (e) => {
    setSignupData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await db.loginUser(loginData.email, loginData.password);
      onAuthSuccess(user);
    } catch (err) {
      setError(err.message || 'Failed to sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await db.registerUser(signupData);
      onAuthSuccess(user);
    } catch (err) {
      setError(err.message || 'Failed to register account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF6EE] dark:bg-[#08080A] text-[#2A2723] dark:text-[#F3F3F5] min-h-screen flex flex-col justify-center items-center px-4 py-12 transition-colors duration-200">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-xs font-bold text-[#6E685F] hover:text-[#B45309] dark:text-[#A1A1A5] dark:hover:text-[#EAB308] transition-colors self-center cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Homepage
      </button>

      {/* Auth Card Container */}
      <div className="w-full max-w-md bg-[#FAF6EE] dark:bg-[#0C0C0E] border border-[#E5DCCE] dark:border-[#212124] rounded-3xl shadow-xl overflow-hidden p-6 md:p-8 space-y-6 transition-all duration-200">
        
        {/* Logo and title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl shadow-md flex justify-center items-center mx-auto overflow-hidden bg-white dark:bg-[#121216] border border-[#E5DCCE] dark:border-[#212124]">
            <img src={logoImage} alt="UniCalc Ethio logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-xl font-black text-[#2A2723] dark:text-[#F3F3F5] tracking-tight">UniCalc Ethio Profile</h2>
          <p className="text-xs text-[#6E685F] dark:text-[#A1A1A5] font-black uppercase tracking-wider">Scope your academic data safely</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-[#F4EFE6] dark:bg-[#121216] p-1.5 rounded-2xl border border-[#E5DCCE]/50 dark:border-[#212124]/50">
          <button
            onClick={() => { setActiveTab('login'); setError(''); }}
            className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white dark:bg-[#0C0C0E] text-[#B45309] dark:text-[#EAB308] border border-[#E5DCCE]/50 dark:border-[#212124]/50 shadow-sm'
                : 'text-[#6E685F] dark:text-[#A1A1A5] hover:text-[#2A2723] dark:hover:text-[#F3F3F5]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('signup'); setError(''); }}
            className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'signup'
                ? 'bg-white dark:bg-[#0C0C0E] text-[#B45309] dark:text-[#EAB308] border border-[#E5DCCE]/50 dark:border-[#212124]/50 shadow-sm'
                : 'text-[#6E685F] dark:text-[#A1A1A5] hover:text-[#2A2723] dark:hover:text-[#F3F3F5]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-450 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#6E685F] dark:text-[#A1A1A5] uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                placeholder="you@university.edu"
                className="w-full bg-white hover:bg-slate-50/50 dark:bg-[#121216] dark:hover:bg-[#121216]/80 border border-[#E5DCCE] dark:border-[#212124] rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-[#121216] focus:border-[#B45309] dark:focus:border-[#EAB308] focus:ring-1 focus:ring-[#B45309] dark:focus:ring-[#EAB308] outline-none transition-all duration-200 font-medium text-[#2A2723] dark:text-[#F3F3F5]"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#6E685F] dark:text-[#A1A1A5] uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> Password
              </label>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                placeholder="••••••••"
                className="w-full bg-white hover:bg-slate-50/50 dark:bg-[#121216] dark:hover:bg-[#121216]/80 border border-[#E5DCCE] dark:border-[#212124] rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-[#121216] focus:border-[#B45309] dark:focus:border-[#EAB308] focus:ring-1 focus:ring-[#B45309] dark:focus:ring-[#EAB308] outline-none transition-all duration-200 font-semibold text-[#2A2723] dark:text-[#F3F3F5]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#B45309] hover:bg-[#92400E] dark:bg-[#EAB308] dark:hover:bg-[#CA8A04] disabled:opacity-50 text-white dark:text-[#08080A] font-bold text-sm py-3.5 rounded-xl transition-all duration-200 flex justify-center items-center gap-2 shadow-sm cursor-pointer mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                </>
              ) : (
                'Sign In to Account'
              )}
            </button>

          </form>
        )}

        {/* Signup Form */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#6E685F] dark:text-[#A1A1A5] uppercase tracking-wider flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={signupData.name}
                onChange={handleSignupChange}
                placeholder="Abebe Kebede"
                className="w-full bg-white hover:bg-slate-50/50 dark:bg-[#121216] dark:hover:bg-[#121216]/80 border border-[#E5DCCE] dark:border-[#212124] rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-[#121216] focus:border-[#B45309] dark:focus:border-[#EAB308] focus:ring-1 focus:ring-[#B45309] dark:focus:ring-[#EAB308] outline-none transition-all duration-200 font-medium text-[#2A2723] dark:text-[#F3F3F5]"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#6E685F] dark:text-[#A1A1A5] uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={signupData.email}
                onChange={handleSignupChange}
                placeholder="you@university.edu"
                className="w-full bg-white hover:bg-slate-50/50 dark:bg-[#121216] dark:hover:bg-[#121216]/80 border border-[#E5DCCE] dark:border-[#212124] rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-[#121216] focus:border-[#B45309] dark:focus:border-[#EAB308] focus:ring-1 focus:ring-[#B45309] dark:focus:ring-[#EAB308] outline-none transition-all duration-200 font-medium text-[#2A2723] dark:text-[#F3F3F5]"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#6E685F] dark:text-[#A1A1A5] uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> Password
              </label>
              <input
                type="password"
                name="password"
                value={signupData.password}
                onChange={handleSignupChange}
                placeholder="Create a strong password"
                className="w-full bg-white hover:bg-slate-50/50 dark:bg-[#121216] dark:hover:bg-[#121216]/80 border border-[#E5DCCE] dark:border-[#212124] rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-[#121216] focus:border-[#B45309] dark:focus:border-[#EAB308] focus:ring-1 focus:ring-[#B45309] dark:focus:ring-[#EAB308] outline-none transition-all duration-200 font-semibold text-[#2A2723] dark:text-[#F3F3F5]"
                required
              />
            </div>

            {/* Major */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#6E685F] dark:text-[#A1A1A5] uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" /> Department / Major
              </label>
              <input
                type="text"
                name="major"
                value={signupData.major}
                onChange={handleSignupChange}
                placeholder="e.g. Software Engineering"
                className="w-full bg-white hover:bg-slate-50/50 dark:bg-[#121216] dark:hover:bg-[#121216]/80 border border-[#E5DCCE] dark:border-[#212124] rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-[#121216] focus:border-[#B45309] dark:focus:border-[#EAB308] focus:ring-1 focus:ring-[#B45309] dark:focus:ring-[#EAB308] outline-none transition-all duration-200 font-medium text-[#2A2723] dark:text-[#F3F3F5]"
                required
              />
            </div>

            {/* Student ID */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#6E685F] dark:text-[#A1A1A5] uppercase tracking-wider flex items-center gap-2">
                <IdCard className="w-3.5 h-3.5" /> Student ID (Optional)
              </label>
              <input
                type="text"
                name="studentId"
                value={signupData.studentId}
                onChange={handleSignupChange}
                placeholder="e.g. UGR/1234/18"
                className="w-full bg-white hover:bg-slate-50/50 dark:bg-[#121216] dark:hover:bg-[#121216]/80 border border-[#E5DCCE] dark:border-[#212124] rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-[#121216] focus:border-[#B45309] dark:focus:border-[#EAB308] focus:ring-1 focus:ring-[#B45309] dark:focus:ring-[#EAB308] outline-none transition-all duration-200 font-medium text-[#2A2723] dark:text-[#F3F3F5]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#B45309] hover:bg-[#92400E] dark:bg-[#EAB308] dark:hover:bg-[#CA8A04] disabled:opacity-50 text-white dark:text-[#08080A] font-bold text-sm py-3.5 rounded-xl transition-all duration-200 flex justify-center items-center gap-2 shadow-sm cursor-pointer mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Registering...
                </>
              ) : (
                'Create Account & Start'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
