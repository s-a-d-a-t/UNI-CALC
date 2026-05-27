import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Calculator, User, Loader2, LogOut, Sun, Moon, Sparkles, CalendarClock } from 'lucide-react';
import { db } from './services/db';
import Dashboard from './components/Dashboard';
import SemesterManager from './components/SemesterManager';
import ProfileSettings from './components/ProfileSettings';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Planning from './components/Planning';
import Planner from './components/Planner';
import { calculateGlobalStats } from './utils/gpa';
import logoImage from './assets/logo1.png';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('landing'); // 'landing' | 'login' | 'app'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'calculator' | 'planning' | 'planner' | 'profile'
  const [profile, setProfile] = useState(null);
  const [semesters, setSemesters] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [studyLogs, setStudyLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  // 1. Initialize Authentication Session & Theme
  useEffect(() => {
    async function initializeApp() {
      try {
        // Theme initialization
        const savedTheme = localStorage.getItem('unicalc_theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        setTheme(initialTheme);
        if (initialTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

        // Session initialization
        const session = await db.getCurrentSession();
        if (session) {
          setCurrentUser(session);
          const [profileData, semestersData, assignmentsData, studyLogsData] = await Promise.all([
            db.getProfile(),
            db.getSemesters(),
            db.getAssignments(),
            db.getStudyLogs(),
          ]);
          setProfile(profileData);
          setSemesters(semestersData);
          setAssignments(assignmentsData);
          setStudyLogs(studyLogsData);
          setView('app');
        } else {
          setView('landing');
        }
      } catch (err) {
        console.error('Failed to initialize UniCalc application', err);
      } finally {
        setIsLoading(false);
      }
    }
    initializeApp();
  }, []);

  // 2. Theme Toggle Controller
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('unicalc_theme', nextTheme);
    
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 3. Auth callbacks
  const handleAuthSuccess = async (user) => {
    setIsLoading(true);
    try {
      setCurrentUser(user);
      const [profileData, semestersData, assignmentsData, studyLogsData] = await Promise.all([
        db.getProfile(),
        db.getSemesters(),
        db.getAssignments(),
        db.getStudyLogs(),
      ]);
      setProfile(profileData);
      setSemesters(semestersData);
      setAssignments(assignmentsData);
      setStudyLogs(studyLogsData);
      setView('app');
      setActiveTab('dashboard');
    } catch (err) {
      console.error('Failed to fetch records after sign in', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await db.logoutUser();
      setCurrentUser(null);
      setProfile(null);
      setSemesters(null);
      setAssignments([]);
      setStudyLogs([]);
      setView('landing');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (newProfile) => {
    setProfile(newProfile);
  };

  const handleSemestersUpdate = async (newSemesters) => {
    setSemesters(newSemesters);
    await db.saveSemesters(newSemesters);
  };

  const handleAssignmentsUpdate = async (newAssignments) => {
    setAssignments(newAssignments);
    await db.saveAssignments(newAssignments);
  };

  const handleStudyLogsUpdate = async (newStudyLogs) => {
    setStudyLogs(newStudyLogs);
    await db.saveStudyLogs(newStudyLogs);
  };

  // Helper to compute CGPA for the header badge
  const getHeaderCgpa = () => {
    if (!semesters || semesters.length === 0) return '0.00';
    return calculateGlobalStats(semesters).cgpa.toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center gap-3 transition-colors duration-200">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading UniCalc Ethio...</span>
      </div>
    );
  }

  // Render Landing Page
  if (view === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => setView('login')}
        onLogin={() => setView('login')}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  // Render Login Page
  if (view === 'login') {
    return (
      <LoginPage
        onBack={() => setView('landing')}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  const currentCgpa = getHeaderCgpa();

  // Render main application shell
  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen pb-12 flex flex-col transition-colors duration-200">
      
      {/* Sticky Premium Navbar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl shadow-md flex justify-center items-center overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <img src={logoImage} alt="UniCalc Ethio logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight leading-none">UniCalc Ethio</h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">Ethiopian standard scale</p>
            </div>
          </div>

          {/* Navigation Tabs (Pill Style) */}
          <nav className="flex items-center bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/30 transition-colors">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" /> GPA Calculator
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Student Profile
            </button>
            <button
              onClick={() => setActiveTab('planning')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'planning'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Planning
            </button>
            <button
              onClick={() => setActiveTab('planner')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'planner'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <CalendarClock className="w-3.5 h-3.5" /> Planner
            </button>
          </nav>

          {/* User controls and Profile badge */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>

            {/* Profile summary */}
            {profile && (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">{profile.name}</span>
                  <span className="block text-[10px] font-semibold text-slate-400">{profile.major}</span>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-extrabold text-sm px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-indigo-450 dark:text-indigo-400 uppercase tracking-wider">CGPA</span>
                  {currentCgpa}
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-955/20 text-slate-450 hover:text-rose-600 dark:text-slate-450 dark:hover:text-rose-400 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Render Area */}
      <main className="max-w-6xl w-full mx-auto px-4 mt-8 flex-grow">
        <div className="animate-fadeIn">
          {activeTab === 'dashboard' && (
            <Dashboard semesters={semesters} profile={profile} />
          )}
          
          {activeTab === 'calculator' && (
            <SemesterManager
              semesters={semesters}
              onSemestersUpdate={handleSemestersUpdate}
              profile={profile}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileSettings
              profile={profile}
              onProfileUpdate={handleProfileUpdate}
            />
          )}
          {activeTab === 'planning' && (
            <Planning semesters={semesters} profile={profile} />
          )}
          {activeTab === 'planner' && (
            <Planner
              assignments={assignments}
              onAssignmentsUpdate={handleAssignmentsUpdate}
              studyLogs={studyLogs}
              onStudyLogsUpdate={handleStudyLogsUpdate}
              semesters={semesters}
            />
          )}
        </div>
      </main>
    </div>
  );
}
