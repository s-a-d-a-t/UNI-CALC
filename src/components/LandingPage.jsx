import React from 'react';
import { GraduationCap, LayoutDashboard, Calculator, Target, ArrowRight, ShieldCheck, Sun, Moon } from 'lucide-react';
import heroImage from '../assets/landing_hero.png';

export default function LandingPage({ onGetStarted, onLogin, theme, toggleTheme }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen transition-colors duration-200">
      
      {/* Landing Navbar */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md flex justify-center items-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight leading-none">UniCalc Ethio</h1>
              <p className="text-[9px] text-slate-400 font-bold tracking-wider uppercase mt-1">GPA Tracker & Analytics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle in landing page */}
            <button
              onClick={toggleTheme}
              className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>

            <button
              onClick={onLogin}
              className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl transition-all duration-200 shadow-sm shadow-indigo-100 dark:shadow-none cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Hero Left */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-extrabold text-[11px] px-3.5 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-900/30 uppercase tracking-widest inline-block">
            Standard Ethiopian scale (4.0)
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.15] tracking-tight">
            Master Your Academic <span className="text-indigo-600 dark:text-indigo-400">GPA Journey</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
            A comprehensive academic tracking dashboard built for Ethiopian university students. Organize your semesters, forecast your graduation targets, inspect detailed trends, and plan your path to distinction.
          </p>
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-2">
            <button
              onClick={onGetStarted}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-indigo-100 dark:shadow-none cursor-pointer group"
            >
              Start Free Tracking <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onLogin}
              className="border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold text-sm px-6 py-3.5 rounded-xl transition-all duration-200 cursor-pointer"
            >
              Access Existing Profile
            </button>
          </div>
        </div>

        {/* Hero Right / Illustration */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200/60 dark:border-slate-850 shadow-2xl transition-all duration-200">
            <div className="absolute -left-4 -top-4 w-12 h-12 bg-indigo-500/10 rounded-full blur-xl"></div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl"></div>
            <img
              src={heroImage}
              alt="UniCalc Ethio Dashboard Demonstration"
              className="w-full h-auto rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-850 py-16 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">Smart Tools for High Achievers</h3>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Everything you need to track credits, calculate semester averages, and forecast your academic standings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Live Calculator */}
            <div className="bg-slate-50/50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-2xl hover:shadow-md transition-all duration-200 text-center md:text-left space-y-4">
              <div className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 w-12 h-12 rounded-xl flex items-center justify-center mx-auto md:mx-0 border border-indigo-100 dark:border-indigo-900/30">
                <Calculator className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Dynamic Semester Calculator</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Add semesters and courses, specify credit weights, and map standard letter grades. Live calculations compute SGPA and CGPA instantly as you type.
              </p>
            </div>

            {/* Feature 2: Analytics Dashboard */}
            <div className="bg-slate-50/50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-2xl hover:shadow-md transition-all duration-200 text-center md:text-left space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 w-12 h-12 rounded-xl flex items-center justify-center mx-auto md:mx-0 border border-emerald-100 dark:border-emerald-900/30">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Visual Analytics & Standing</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Analyze your performance using interactive trend lines, credit distribution charts, and grade percentages. View your status dynamically updated against standard rules.
              </p>
            </div>

            {/* Feature 3: Target Planner */}
            <div className="bg-slate-50/50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-2xl hover:shadow-md transition-all duration-200 text-center md:text-left space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-450 w-12 h-12 rounded-xl flex items-center justify-center mx-auto md:mx-0 border border-amber-100 dark:border-amber-900/30">
                <Target className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Graduation Goal Planner</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Specify your dream target CGPA. The algorithm figures out the remaining credit hours and computes the exact average GPA you need to sustain to cross the line.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Banner / University standard description */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <ShieldCheck className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Standard Grading Integrity</h3>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          UniCalc Ethio aligns directly with standard policies used across public and private universities in Ethiopia. The default mapping follows standard scale rules where A/A+ equals 4.0, A- equals 3.75, B+ equals 3.5, and F results in 0.0 points. Rest assured that calculations are exact.
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-850 py-8 bg-white dark:bg-slate-950 text-slate-400 text-center text-xs font-semibold tracking-wider transition-colors duration-200">
        <p>© {new Date().getFullYear()} UniCalc Ethio. Built with Vite, React, and Tailwind CSS. Scoped locally in your browser.</p>
      </footer>
    </div>
  );
}
