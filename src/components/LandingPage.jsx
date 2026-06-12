import React from 'react';
import { LayoutDashboard, Calculator, Target, ArrowRight, ShieldCheck, Sun, Moon } from 'lucide-react';
import heroImage from '../assets/landing_hero.png';
import logoImage from '../assets/logo1.png';

export default function LandingPage({ onGetStarted, onLogin, theme, toggleTheme }) {
  return (
    <div className="landing-page bg-[#FAF6EE] dark:bg-[#0D1117] text-[#2A2723] dark:text-[#E6EDF3] min-h-screen transition-colors duration-300 relative overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/10 dark:bg-yellow-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-500/5 dark:bg-amber-600/5 blur-[150px] pointer-events-none" />

      {/* Landing Navbar */}
      <nav className="bg-[#FAF6EE]/80 dark:bg-[#0D1117]/80 backdrop-blur border-b border-[#E5DCCE] dark:border-[#30363D] sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-3 max-md:px-3 md:px-4 py-3 max-md:py-3 md:py-4 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 max-md:gap-2 md:gap-3 min-w-0">
            <div className="w-10 h-10 max-md:w-10 max-md:h-10 md:w-12 md:h-12 rounded-xl shadow-sm flex justify-center items-center overflow-hidden bg-white dark:bg-[#161B22] border border-[#E5DCCE] dark:border-[#30363D] shrink-0">
              <img src={logoImage} alt="UniCalc Ethio logo" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-lg max-md:text-lg md:text-xl text-[#2A2723] dark:text-[#E6EDF3] tracking-tight leading-none font-landing truncate">UniCalc Ethio</h1>
              <p className="hidden sm:block text-[11px] text-[#6E685F] dark:text-[#8B949E] font-black tracking-wider uppercase mt-1">GPA Tracker & Analytics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 max-md:gap-2 md:gap-4 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 border border-[#E5DCCE] dark:border-[#30363D] rounded-xl hover:bg-[#F4EFE6] dark:hover:bg-[#121216] text-[#6E685F] dark:text-[#8B949E] transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            <button
              onClick={onLogin}
              className="hidden sm:inline text-sm font-extrabold text-[#6E685F] dark:text-[#8B949E] hover:text-[#B45309] dark:hover:text-[#EAB308] transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="bg-[#B45309] hover:bg-[#92400E] dark:bg-[#22C55E] dark:hover:bg-[#CA8A04] text-white dark:text-[#08080A] font-extrabold text-xs max-md:text-xs md:text-sm px-3 max-md:px-3 md:px-5 py-2 max-md:py-2 md:py-2.5 rounded-xl transition-all duration-200 shadow-sm cursor-pointer whitespace-nowrap"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-3 max-md:px-3 md:px-4 py-12 max-md:py-12 md:py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-8 max-md:gap-8 md:gap-12 items-center relative z-10">
        {/* Hero Left */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <span className="bg-[#F4EFE6] dark:bg-[#161B22] text-[#B45309] dark:text-[#22C55E] font-extrabold text-xs px-4 py-2 rounded-full border border-[#E5DCCE] dark:border-[#30363D] uppercase tracking-widest inline-block">
            Standard Ethiopian Scale (4.0)
          </span>
          {/* Headline - unchanged style and size as requested */}
          <h2 className="text-3xl max-md:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#2A2723] dark:text-[#E6EDF3] leading-[1.12] tracking-tight font-landing">
            Empower Your Academic Path with <span className="text-[#B45309] dark:text-[#22C55E]">Precision Analytics</span>
          </h2>
          {/* scaled paragraph to a highly readable professional size */}
          <p className="text-[#6E685F] dark:text-[#8B949E] text-sm max-md:text-sm md:text-base lg:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
            A sophisticated academic management platform tailored for university students in Ethiopia. Seamlessly organize semesters, project future credit hours, analyze academic performance curves, and chart a structured path to graduation honours.
          </p>
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-2">
            <button
              onClick={onGetStarted}
              className="bg-[#B45309] hover:bg-[#92400E] dark:bg-[#22C55E] dark:hover:bg-[#CA8A04] text-white dark:text-[#08080A] font-extrabold text-base px-7 py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md cursor-pointer group"
            >
              Start Free Tracking <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onLogin}
              className="border border-[#E5DCCE] dark:border-[#30363D] hover:bg-[#F4EFE6] dark:hover:bg-[#121216] text-[#2A2723] dark:text-[#E6EDF3] font-bold text-base px-7 py-4 rounded-xl transition-all duration-200 cursor-pointer"
            >
              Access Existing Profile
            </button>
          </div>
        </div>

        {/* Hero Right / Illustration */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-full max-w-lg bg-[#F4EFE6] dark:bg-[#0F0F12] rounded-3xl p-4 border border-[#E5DCCE] dark:border-[#30363D] shadow-2xl transition-all duration-300 group">
            {/* Browser-like window header */}
            <div className="flex items-center gap-1.5 mb-3 px-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[#E5DCCE] dark:bg-[#212124]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#E5DCCE] dark:bg-[#212124]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#E5DCCE] dark:bg-[#212124]" />
              <div className="flex-1 bg-white/40 dark:bg-white/5 rounded-lg py-1 px-4 text-xs text-center text-[#6E685F] dark:text-[#8B949E] font-bold border border-[#E5DCCE]/50 dark:border-[#30363D]/50 select-none">
                unicalc-ethio.org/dashboard
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[#E5DCCE] dark:border-[#30363D] shadow-sm">
              <img
                src={heroImage}
                alt="UniCalc Ethio Dashboard Demonstration"
                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-102"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-[#F4EFE6]/50 dark:bg-[#161B22]/40 border-y border-[#E5DCCE] dark:border-[#30363D] py-12 max-md:py-12 md:py-20 transition-colors duration-300 relative z-10">
        <div className="max-w-6xl mx-auto px-3 max-md:px-3 md:px-4">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10 max-md:mb-10 md:mb-16">
            <h3 className="text-2xl max-md:text-2xl md:text-3xl lg:text-4xl font-black text-[#2A2723] dark:text-[#E6EDF3] tracking-tight font-landing">Engineered for Academic Excellence</h3>
            <p className="text-sm md:text-base text-[#6E685F] dark:text-[#8B949E] font-semibold">
              A suite of sophisticated, real-time tools built to help you measure, forecast, and elevate your performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-md:gap-5 md:gap-8">
            {/* Feature 1: Live Calculator */}
            <div className="bg-[#FAF6EE] dark:bg-[#161B22] border border-[#E5DCCE] dark:border-[#30363D] p-5 max-md:p-5 md:p-8 rounded-3xl hover:border-[#B45309] dark:hover:border-[#EAB308] max-md:hover:translate-y-0 md:hover:-translate-y-1 transition-all duration-300 text-left space-y-5 group cursor-pointer relative overflow-hidden shadow-sm hover:shadow-md">
              <div className="bg-[#F4EFE6] dark:bg-[#161B22] border border-[#E5DCCE] dark:border-[#30363D] text-[#B45309] dark:text-[#22C55E] w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                <Calculator className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-lg md:text-xl text-[#2A2723] dark:text-[#E6EDF3] font-landing">Precision GPA Engine</h4>
              <p className="text-sm md:text-base text-[#6E685F] dark:text-[#8B949E] font-medium leading-relaxed">
                Input course modules, configure credit weightings, and select grade values. Our reactive parser calculates semester SGPA and cumulative CGPA instantly as you type.
              </p>
            </div>

            {/* Feature 2: Analytics Dashboard */}
            <div className="bg-[#FAF6EE] dark:bg-[#161B22] border border-[#E5DCCE] dark:border-[#30363D] p-5 max-md:p-5 md:p-8 rounded-3xl hover:border-[#B45309] dark:hover:border-[#EAB308] max-md:hover:translate-y-0 md:hover:-translate-y-1 transition-all duration-300 text-left space-y-5 group cursor-pointer relative overflow-hidden shadow-sm hover:shadow-md">
              <div className="bg-[#F4EFE6] dark:bg-[#161B22] border border-[#E5DCCE] dark:border-[#30363D] text-[#B45309] dark:text-[#22C55E] w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-lg md:text-xl text-[#2A2723] dark:text-[#E6EDF3] font-landing">Advanced Trend Analysis</h4>
              <p className="text-sm md:text-base text-[#6E685F] dark:text-[#8B949E] font-medium leading-relaxed">
                Visualize your progress with interactive charting, credit density distributions, and historical performance tracking. Instantly view your official academic standing.
              </p>
            </div>

            {/* Feature 3: Target Planner */}
            <div className="bg-[#FAF6EE] dark:bg-[#161B22] border border-[#E5DCCE] dark:border-[#30363D] p-5 max-md:p-5 md:p-8 rounded-3xl hover:border-[#B45309] dark:hover:border-[#EAB308] max-md:hover:translate-y-0 md:hover:-translate-y-1 transition-all duration-300 text-left space-y-5 group cursor-pointer relative overflow-hidden shadow-sm hover:shadow-md">
              <div className="bg-[#F4EFE6] dark:bg-[#161B22] border border-[#E5DCCE] dark:border-[#30363D] text-[#B45309] dark:text-[#22C55E] w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                <Target className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-lg md:text-xl text-[#2A2723] dark:text-[#E6EDF3] font-landing">Target & Graduation Planner</h4>
              <p className="text-sm md:text-base text-[#6E685F] dark:text-[#8B949E] font-medium leading-relaxed">
                Define your goal graduation honours. The predictive planner reverse-engineers the remaining semesters to compute the exact target GPA path required to achieve it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Banner / University standard description */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center relative z-10">
        <div className="bg-white/40 dark:bg-[#161B22]/30 border border-[#E5DCCE] dark:border-[#30363D] rounded-3xl p-8 md:p-12 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 border border-dashed border-[#E5DCCE]/60 dark:border-[#30363D]/60 rounded-3xl pointer-events-none m-1.5" />
          <ShieldCheck className="w-14 h-14 text-[#B45309] dark:text-[#22C55E] mx-auto filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.2)] mb-6" />
          <span className="text-xs uppercase tracking-widest font-black text-[#B45309] dark:text-[#22C55E] bg-[#F4EFE6] dark:bg-[#1C1C20] px-4 py-1.5 rounded-full border border-[#E5DCCE] dark:border-[#2B2B30]">
            Official Scale Compliance
          </span>
          <h3 className="text-3xl font-black text-[#2A2723] dark:text-[#E6EDF3] mt-4 mb-4 tracking-tight font-landing">Standard Grading Integrity</h3>
          <p className="text-sm md:text-base text-[#6E685F] dark:text-[#8B949E] leading-relaxed font-medium max-w-2xl mx-auto">
            UniCalc Ethio is built in direct compliance with the official grading harmonizations of Ethiopian higher education institutions. Supporting standard 4.0 credit scales (where A/A+ = 4.0, A- = 3.75, B+ = 3.5, etc.), calculations reflect exact academic standings with complete mathematical integrity.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5DCCE] dark:border-[#30363D] py-10 bg-[#FAF6EE] dark:bg-[#060608] text-[#6E685F] dark:text-[#8B949E] text-sm font-medium tracking-wider transition-colors duration-300 relative z-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} UniCalc Ethio. Built with Vite, React, and Tailwind CSS.</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs font-bold">
            <span>Developed by <a href="https://github.com/s-a-d-a-t" target="_blank" rel="noopener noreferrer" className="text-[#B45309] dark:text-[#22C55E] hover:underline">Sadat</a></span>
            <span className="hidden md:inline">•</span>
            <a href="mailto:sdrkk66@gmail.com" className="hover:text-[#B45309] dark:hover:text-[#EAB308] transition-colors">sdrkk66@gmail.com</a>
            <span>•</span>
            <a href="https://t.me/sdrk_66" target="_blank" rel="noopener noreferrer" className="hover:text-[#B45309] dark:hover:text-[#EAB308] transition-colors">Telegram</a>
            <span>•</span>
            <a href="https://github.com/s-a-d-a-t" target="_blank" rel="noopener noreferrer" className="hover:text-[#B45309] dark:hover:text-[#EAB308] transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
