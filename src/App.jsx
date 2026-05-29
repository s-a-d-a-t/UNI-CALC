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
import Sidebar from './components/Sidebar';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen flex transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        profile={profile}
        currentCgpa={currentCgpa}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 min-h-screen">
        <div className="w-full h-full px-4 md:px-6 py-4 md:py-6">
          <div className="max-w-6xl mx-auto">
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
          </div>
        </div>
      </div>
    </div>
  );
}
