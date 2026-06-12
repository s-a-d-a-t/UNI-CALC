import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, Loader2 } from 'lucide-react';
import { db } from './services/db';
import Dashboard from './components/Dashboard';
import SemesterManager from './components/SemesterManager';
import ProfileSettings from './components/ProfileSettings';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Planning from './components/Planning';
import Planner from './components/Planner';
import Sidebar from './components/Sidebar';
import { calculateGlobalStats, formatGpa } from './utils/gpa';
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

  const saveQueueRef = useRef(Promise.resolve());

  const handleSemestersUpdate = useCallback((updaterOrValue) => {
    setSemesters((prev) => {
      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
      saveQueueRef.current = saveQueueRef.current
        .then(() => db.saveSemesters(next))
        .catch((err) => console.error('Failed to save semesters', err));
      return next;
    });
  }, []);

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
    return formatGpa(calculateGlobalStats(semesters).cgpa);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] dark:bg-[#0D1117] flex flex-col justify-center items-center gap-3 transition-colors duration-200">
        <Loader2 className="w-8 h-8 text-[#B45309] dark:text-[#22C55E] animate-spin" />
        <span className="text-sm font-semibold text-[#6E685F] dark:text-[#8B949E]">Loading UniCalc Ethio...</span>
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

  const tabLabels = {
    dashboard: 'Dashboard',
    calculator: 'GPA Calculator',
    profile: 'Student Profile',
    planning: 'Planning',
    planner: 'Planner',
  };

  // Render main application shell
  return (
    <div className="bg-[#FAF6EE] dark:bg-[#0D1117] text-[#2A2723] dark:text-[#E6EDF3] min-h-screen flex transition-colors duration-200">
      
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
      <div className="flex-1 md:ml-64 min-h-screen w-full min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 bg-[#FAF6EE]/95 dark:bg-[#0D1117]/95 backdrop-blur border-b border-[#E5DCCE] dark:border-[#30363D] px-3 py-3 flex items-center gap-3 safe-bottom">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 bg-white dark:bg-[#161B22] border border-[#E5DCCE] dark:border-[#30363D] rounded-xl text-[#6E685F] dark:text-[#8B949E] shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-sm text-[#2A2723] dark:text-[#E6EDF3] truncate">{tabLabels[activeTab]}</h1>
            {profile && (
              <p className="text-[10px] text-[#6E685F] dark:text-[#8B949E] font-semibold truncate">{profile.name}</p>
            )}
          </div>
          <span className="shrink-0 bg-[#F4EFE6] dark:bg-[#161B22] text-[#B45309] dark:text-[#22C55E] border border-[#E5DCCE] dark:border-[#30363D] font-bold text-xs px-2.5 py-1 rounded-lg">
            {currentCgpa}
          </span>
        </header>

        <div className="w-full h-full px-3 max-md:px-3 md:px-6 py-3 max-md:py-4 md:py-6 safe-bottom">
          <div className="max-w-6xl mx-auto w-full min-w-0">
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
