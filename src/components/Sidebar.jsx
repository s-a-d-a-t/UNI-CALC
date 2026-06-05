import React from 'react';
import { LayoutDashboard, Calculator, User, LogOut, Sun, Moon, Sparkles, CalendarClock, X } from 'lucide-react';
import logoImage from '../assets/logo1.png';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  theme, 
  toggleTheme, 
  profile, 
  currentCgpa, 
  onLogout,
  isOpen,
  setIsOpen
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calculator', label: 'GPA Calculator', icon: Calculator },
    { id: 'profile', label: 'Student Profile', icon: User },
    { id: 'planning', label: 'Planning', icon: Sparkles },
    { id: 'planner', label: 'Planner', icon: CalendarClock },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:fixed inset-y-0 left-0 z-50
        w-64 bg-[#FAF6EE]/95 dark:bg-[#0C0C0E]/95 border-r border-[#E5DCCE] dark:border-[#212124] backdrop-blur
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-[#E5DCCE] dark:border-[#212124]">
          <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl shadow-md flex justify-center items-center overflow-hidden bg-white dark:bg-[#121216] border border-[#E5DCCE] dark:border-[#212124]">
              <img src={logoImage} alt="UniCalc Ethio logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-[#2A2723] dark:text-[#F3F3F5] tracking-tight leading-none">UniCalc Ethio</h1>
              <p className="text-[9px] text-[#6E685F] dark:text-[#A1A1A5] font-black tracking-wider uppercase mt-0.5">Ethiopian standard</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 rounded-lg text-[#6E685F] dark:text-[#A1A1A5] hover:bg-[#F4EFE6] dark:hover:bg-[#121216] shrink-0"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border border-transparent
                  ${isActive 
                    ? 'bg-[#F4EFE6] dark:bg-[#121216] text-[#B45309] dark:text-[#EAB308] border-[#E5DCCE] dark:border-[#212124] shadow-sm' 
                    : 'text-[#6E685F] dark:text-[#A1A1A5] hover:bg-[#F4EFE6]/60 dark:hover:bg-[#121216]/60 hover:text-[#2A2723] dark:hover:text-[#F3F3F5]'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                <span className="font-medium text-sm">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#B45309] dark:bg-[#EAB308]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-[#E5DCCE] dark:border-[#212124]">
          {profile && (
            <div className="mb-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F4EFE6]/70 dark:bg-[#121216]/50 border border-[#E5DCCE] dark:border-[#212124]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B45309] to-[#D97706] dark:from-[#EAB308] dark:to-[#CA8A04] flex items-center justify-center text-white dark:text-[#08080A] font-bold text-sm shadow-sm">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#2A2723] dark:text-[#F3F3F5] truncate">{profile.name}</p>
                  <p className="text-[10px] text-[#6E685F] dark:text-[#A1A1A5] truncate">{profile.major}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between px-2">
                <span className="text-[10px] font-bold text-[#6E685F] dark:text-[#A1A1A5] uppercase tracking-wider">Current CGPA</span>
                <span className="bg-[#F4EFE6] dark:bg-[#121216] text-[#B45309] dark:text-[#EAB308] border border-[#E5DCCE] dark:border-[#212124] font-bold text-sm px-2.5 py-1 rounded-lg">
                  {currentCgpa}
                </span>
              </div>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5DCCE] dark:border-[#212124] hover:bg-[#F4EFE6] dark:hover:bg-[#121216] text-[#6E685F] dark:text-[#A1A1A5] transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-bold">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-bold">Dark Mode</span>
              </>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-bold">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
