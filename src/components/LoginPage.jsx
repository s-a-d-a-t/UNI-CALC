import React, { useState } from 'react';
import { db } from '../services/db';
import { GraduationCap, Mail, Lock, User, BookOpen, IdCard, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

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
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen flex flex-col justify-center items-center px-4 py-12 transition-colors duration-200">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-650 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors self-center cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Homepage
      </button>

      {/* Auth Card Container */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden p-6 md:p-8 space-y-6 transition-all duration-200">
        
        {/* Logo and title */}
        <div className="text-center space-y-2">
          <div className="bg-indigo-600 text-white w-12 h-12 rounded-2xl shadow-md flex justify-center items-center mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">UniCalc Ethio Profile</h2>
          <p className="text-xs text-slate-500 dark:text-slate-450 font-semibold uppercase tracking-wider">Scope your academic data safely</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200/40 dark:border-slate-800/30">
          <button
            onClick={() => { setActiveTab('login'); setError(''); }}
            className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('signup'); setError(''); }}
            className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'signup'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
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
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                placeholder="you@university.edu"
                className="w-full bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200 font-medium text-slate-800 dark:text-slate-100"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> Password
              </label>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                placeholder="••••••••"
                className="w-full bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200 font-semibold text-slate-800 dark:text-slate-100"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-sm py-3.5 rounded-xl transition-all duration-200 flex justify-center items-center gap-2 shadow-sm cursor-pointer mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                </>
              ) : (
                'Sign In to Account'
              )}
            </button>
            <div className="text-center pt-2">
              <span className="text-[10px] text-slate-400 font-semibold">
                Demo Account: sadat / sadat123
              </span>
            </div>
          </form>
        )}

        {/* Signup Form */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={signupData.name}
                onChange={handleSignupChange}
                placeholder="Abebe Kebede"
                className="w-full bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200 font-medium text-slate-800 dark:text-slate-100"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={signupData.email}
                onChange={handleSignupChange}
                placeholder="you@university.edu"
                className="w-full bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200 font-medium text-slate-800 dark:text-slate-100"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> Password
              </label>
              <input
                type="password"
                name="password"
                value={signupData.password}
                onChange={handleSignupChange}
                placeholder="Create a strong password"
                className="w-full bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200 font-semibold text-slate-800 dark:text-slate-100"
                required
              />
            </div>

            {/* Major */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" /> Department / Major
              </label>
              <input
                type="text"
                name="major"
                value={signupData.major}
                onChange={handleSignupChange}
                placeholder="e.g. Software Engineering"
                className="w-full bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200 font-medium text-slate-800 dark:text-slate-100"
                required
              />
            </div>

            {/* Student ID */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <IdCard className="w-3.5 h-3.5" /> Student ID (Optional)
              </label>
              <input
                type="text"
                name="studentId"
                value={signupData.studentId}
                onChange={handleSignupChange}
                placeholder="e.g. UGR/1234/18"
                className="w-full bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200 font-medium text-slate-800 dark:text-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-sm py-3.5 rounded-xl transition-all duration-200 flex justify-center items-center gap-2 shadow-sm cursor-pointer mt-6"
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
