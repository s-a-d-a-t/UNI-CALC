import React, { useState } from 'react';
import { db } from '../services/db';
import { Mail, Lock, User, BookOpen, IdCard, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import logoImage from '../assets/logo1.png';

export default function LoginPage({ onBack, onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
  const [error, setError] = useState('');
  const [retryAfter, setRetryAfter] = useState(null); // Retry time in seconds
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

  // Countdown timer effect for rate limiting
  React.useEffect(() => {
    if (retryAfter === null || retryAfter <= 0) return;
    
    const timer = setInterval(() => {
      setRetryAfter(prev => {
        if (prev <= 1) {
          setError('');
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [retryAfter]);

  const handleLoginChange = (e) => {
    setLoginData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignupChange = (e) => {
    setSignupData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setRetryAfter(null);
    setIsLoading(true);
    try {
      const user = await db.loginUser(loginData.email, loginData.password);
      onAuthSuccess(user);
    } catch (err) {
      const errorMsg = err.message || 'Failed to sign in.';
      setError(errorMsg);
      if (err.retryAfter) {
        setRetryAfter(err.retryAfter);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setRetryAfter(null);
    setIsLoading(true);
    try {
      const user = await db.registerUser(signupData);
      onAuthSuccess(user);
    } catch (err) {
      const errorMsg = err.message || 'Failed to register account.';
      setError(errorMsg);
      if (err.retryAfter) {
        setRetryAfter(err.retryAfter);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF6EE] dark:bg-[#0D1117] text-[#2A2723] dark:text-[#E6EDF3] min-h-screen flex flex-col justify-center items-center px-3 max-md:px-3 md:px-4 py-8 max-md:py-8 md:py-12 transition-colors duration-200 safe-bottom">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-xs font-bold text-[#6E685F] hover:text-[#B45309] dark:text-[#8B949E] dark:hover:text-[#EAB308] transition-colors self-center cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Homepage
      </button>

      {/* Auth Card Container */}
      <div className="w-full max-w-md bg-[#FAF6EE] dark:bg-[#161B22] border border-[#E5DCCE] dark:border-[#30363D] rounded-3xl shadow-xl overflow-hidden p-6 md:p-8 space-y-6 transition-all duration-200">
        
        {/* Logo and title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl shadow-md flex justify-center items-center mx-auto overflow-hidden bg-white dark:bg-[#161B22] border border-[#E5DCCE] dark:border-[#30363D]">
            <img src={logoImage} alt="UniCalc Ethio logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-xl font-black text-[#2A2723] dark:text-[#E6EDF3] tracking-tight">UniCalc Ethio Profile</h2>
          <p className="text-xs text-[#6E685F] dark:text-[#8B949E] font-black uppercase tracking-wider">Scope your academic data safely</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-[#F4EFE6] dark:bg-[#161B22] p-1.5 rounded-2xl border border-[#E5DCCE]/50 dark:border-[#30363D]/50">
          <button
            onClick={() => { setActiveTab('login'); setError(''); }}
            className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white dark:bg-[#161B22] text-[#B45309] dark:text-[#22C55E] border border-[#E5DCCE]/50 dark:border-[#30363D]/50 shadow-sm'
                : 'text-[#6E685F] dark:text-[#8B949E] hover:text-[#2A2723] dark:hover:text-[#F3F3F5]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('signup'); setError(''); }}
            className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'signup'
                ? 'bg-white dark:bg-[#161B22] text-[#B45309] dark:text-[#22C55E] border border-[#E5DCCE]/50 dark:border-[#30363D]/50 shadow-sm'
                : 'text-[#6E685F] dark:text-[#8B949E] hover:text-[#2A2723] dark:hover:text-[#F3F3F5]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className={`border px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold animate-fadeIn ${
            retryAfter ? 
              'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-[#22C55E]' :
              'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-450'
          }`}>
            <AlertCircle className={`w-5 h-5 shrink-0 ${
              retryAfter ? 'text-amber-600 dark:text-[#22C55E]' : 'text-rose-600 dark:text-rose-400'
            }`} />
            <div className="flex-1">
              <p>{error}</p>
              {retryAfter && retryAfter > 0 && (
                <p className="text-xs mt-1 font-bold">
                  Try again in: <span className="font-black text-sm">{retryAfter}s</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#6E685F] dark:text-[#8B949E] uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                placeholder="you@university.edu"
                className="w-full bg-white hover:bg-slate-50/50 dark:bg-[#161B22] dark:hover:bg-[#121216]/80 border border-[#E5DCCE] dark:border-[#30363D] rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-[#121216] focus:border-[#B45309] dark:focus:border-[#EAB308] focus:ring-1 focus:ring-[#B45309] dark:focus:ring-[#EAB308] outline-none transition-all duration-200 font-medium text-[#2A2723] dark:text-[#E6EDF3]"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#6E685F] dark:text-[#8B949E] uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> Password
              </label>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                placeholder="••••••••"
                className="w-full bg-white hover:bg-slate-50/50 dark:bg-[#161B22] dark:hover:bg-[#121216]/80 border border-[#E5DCCE] dark:border-[#30363D] rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-[#121216] focus:border-[#B45309] dark:focus:border-[#EAB308] focus:ring-1 focus:ring-[#B45309] dark:focus:ring-[#EAB308] outline-none transition-all duration-200 font-semibold text-[#2A2723] dark:text-[#E6EDF3]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || (retryAfter && retryAfter > 0)}
              className="w-full bg-[#B45309] hover:bg-[#92400E] dark:bg-[#22C55E] dark:hover:bg-[#CA8A04] disabled:opacity-50 text-white dark:text-[#08080A] font-bold text-sm py-3.5 rounded-xl transition-all duration-200 flex justify-center items-center gap-2 shadow-sm cursor-pointer mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                </>
              ) : retryAfter && retryAfter > 0 ? (
                `Please wait ${retryAfter}s`
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
              <label className="block text-xs font-bold text-[#6E685F] dark:text-[#8B949E] uppercase tracking-wider flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={signupData.name}
                onChange={handleSignupChange}
                placeholder="Abebe Kebede"
                className="w-full bg-white hover:bg-slate-50/50 dark:bg-[#161B22] dark:hover:bg-[#121216]/80 border border-[#E5DCCE] dark:border-[#30363D] rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-[#121216] focus:border-[#B45309] dark:focus:border-[#EAB308] focus:ring-1 focus:ring-[#B45309] dark:focus:ring-[#EAB308] outline-none transition-all duration-200 font-medium text-[#2A2723] dark:text-[#E6EDF3]"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#6E685F] dark:text-[#8B949E] uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={signupData.email}
                onChange={handleSignupChange}
                placeholder="you@university.edu"
                className="w-full bg-white hover:bg-slate-50/50 dark:bg-[#161B22] dark:hover:bg-[#121216]/80 border border-[#E5DCCE] dark:border-[#30363D] rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-[#121216] focus:border-[#B45309] dark:focus:border-[#EAB308] focus:ring-1 focus:ring-[#B45309] dark:focus:ring-[#EAB308] outline-none transition-all duration-200 font-medium text-[#2A2723] dark:text-[#E6EDF3]"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#6E685F] dark:text-[#8B949E] uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> Password
              </label>
              <input
                type="password"
                name="password"
                value={signupData.password}
                onChange={handleSignupChange}
                placeholder="Create a strong password"
                className="w-full bg-white hover:bg-slate-50/50 dark:bg-[#161B22] dark:hover:bg-[#121216]/80 border border-[#E5DCCE] dark:border-[#30363D] rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-[#121216] focus:border-[#B45309] dark:focus:border-[#EAB308] focus:ring-1 focus:ring-[#B45309] dark:focus:ring-[#EAB308] outline-none transition-all duration-200 font-semibold text-[#2A2723] dark:text-[#E6EDF3]"
                required
              />
            </div>

            {/* Major */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#6E685F] dark:text-[#8B949E] uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" /> Department / Major
              </label>
              <input
                type="text"
                name="major"
                value={signupData.major}
                onChange={handleSignupChange}
                placeholder="e.g. Software Engineering"
                className="w-full bg-white hover:bg-slate-50/50 dark:bg-[#161B22] dark:hover:bg-[#121216]/80 border border-[#E5DCCE] dark:border-[#30363D] rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-[#121216] focus:border-[#B45309] dark:focus:border-[#EAB308] focus:ring-1 focus:ring-[#B45309] dark:focus:ring-[#EAB308] outline-none transition-all duration-200 font-medium text-[#2A2723] dark:text-[#E6EDF3]"
                required
              />
            </div>

            {/* Student ID */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#6E685F] dark:text-[#8B949E] uppercase tracking-wider flex items-center gap-2">
                <IdCard className="w-3.5 h-3.5" /> Student ID (Optional)
              </label>
              <input
                type="text"
                name="studentId"
                value={signupData.studentId}
                onChange={handleSignupChange}
                placeholder="e.g. UGR/1234/18"
                className="w-full bg-white hover:bg-slate-50/50 dark:bg-[#161B22] dark:hover:bg-[#121216]/80 border border-[#E5DCCE] dark:border-[#30363D] rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-[#121216] focus:border-[#B45309] dark:focus:border-[#EAB308] focus:ring-1 focus:ring-[#B45309] dark:focus:ring-[#EAB308] outline-none transition-all duration-200 font-medium text-[#2A2723] dark:text-[#E6EDF3]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || (retryAfter && retryAfter > 0)}
              className="w-full bg-[#B45309] hover:bg-[#92400E] dark:bg-[#22C55E] dark:hover:bg-[#CA8A04] disabled:opacity-50 text-white dark:text-[#08080A] font-bold text-sm py-3.5 rounded-xl transition-all duration-200 flex justify-center items-center gap-2 shadow-sm cursor-pointer mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Registering...
                </>
              ) : retryAfter && retryAfter > 0 ? (
                `Please wait ${retryAfter}s`
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
