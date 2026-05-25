import React, { useState, useEffect } from 'react';
import { GraduationCap, LayoutDashboard, Calculator, User, Loader2 } from 'lucide-react';
import { db } from './services/db';
import Dashboard from './components/Dashboard';
import SemesterManager from './components/SemesterManager';
import ProfileSettings from './components/ProfileSettings';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [semesters, setSemesters] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data from the database
  useEffect(() => {
    async function loadData() {
      try {
        const [profileData, semestersData] = await Promise.all([
          db.getProfile(),
          db.getSemesters()
        ]);
        setProfile(profileData);
        setSemesters(semestersData);
      } catch (err) {
        console.error('Failed to load academic records', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleProfileUpdate = async (newProfile) => {
    setProfile(newProfile);
  };

  const handleSemestersUpdate = async (newSemesters) => {
    setSemesters(newSemesters);
    await db.saveSemesters(newSemesters);
  };

  // Helper to compute CGPA for the header badge
  const getHeaderCgpa = () => {
    if (!semesters || semesters.length === 0) return '0.00';
    let grandCredits = 0;
    let grandPoints = 0;
    
    semesters.forEach(sem => {
      sem.courses.forEach(course => {
        const credits = parseFloat(course.credits);
        const gradeVal = parseFloat(course.grade);
        
        if (!isNaN(credits) && credits > 0) {
          grandCredits += credits;
          grandPoints += (credits * gradeVal);
        }
      });
    });
    
    return grandCredits > 0 ? (grandPoints / grandCredits).toFixed(2) : '0.00';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="text-sm font-semibold text-slate-500">Loading UniCalc Ethio...</span>
      </div>
    );
  }

  const currentCgpa = getHeaderCgpa();

  return (
    <div className="bg-slate-50 min-h-screen pb-12 flex flex-col">
      {/* Sticky Premium Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md shadow-indigo-100 flex justify-center items-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-slate-900 tracking-tight leading-none">UniCalc Ethio</h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">Ethiopian standard university scale</p>
            </div>
          </div>

          {/* Navigation Tabs (Pill Style) */}
          <nav className="flex items-center bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" /> GPA Calculator
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Student Profile
            </button>
          </nav>

          {/* Student Status Quick Summary */}
          {profile && (
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right hidden sm:block">
                <span className="block text-xs font-bold text-slate-800">{profile.name}</span>
                <span className="block text-[10px] font-semibold text-slate-400">{profile.major}</span>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold text-sm px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">CGPA</span>
                {currentCgpa}
              </div>
            </div>
          )}
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
        </div>
      </main>
    </div>
  );
}
