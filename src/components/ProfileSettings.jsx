import React, { useState, useEffect } from 'react';
import { User, IdCard, BookOpen, Target, Award, Save, CheckCircle } from 'lucide-react';
import { db } from '../services/db';

export default function ProfileSettings({ profile, onProfileUpdate }) {
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    major: '',
    targetCgpa: 3.5,
    graduationCredits: 145,
    coreCreditsRequired: 100,
    electiveCreditsRequired: 45,
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        studentId: profile.studentId || '',
        major: profile.major || '',
        targetCgpa: profile.targetCgpa || 3.5,
        graduationCredits: profile.graduationCredits || 145,
        coreCreditsRequired: profile.coreCreditsRequired || 100,
        electiveCreditsRequired: profile.electiveCreditsRequired || 45,
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'targetCgpa' ? parseFloat(value) || 0 : 
              ['graduationCredits', 'coreCreditsRequired', 'electiveCreditsRequired'].includes(name) ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Validate target GPA
    let verifiedCgpa = Math.min(Math.max(formData.targetCgpa, 0), 4.0);
    
    const updated = await db.updateProfile({
      ...formData,
      targetCgpa: verifiedCgpa
    });
    
    onProfileUpdate(updated);
    setIsSaving(false);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden max-w-2xl mx-auto transition-all duration-200 hover:shadow-md">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">Student Profile</h2>
            <p className="text-xs text-slate-500 dark:text-slate-450 font-medium">Configure your academic details and targets</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {showSuccess && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-3 animate-fadeIn">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-sm font-semibold">Profile saved successfully! Data is synchronized locally.</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Student Name */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Abebe Kebede"
              className="w-full bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200 font-medium text-slate-850 dark:text-slate-100"
              required
            />
          </div>

          {/* Student ID */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <IdCard className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Student ID / Registration
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="e.g. UGR/1234/18"
              className="w-full bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200 font-medium text-slate-850 dark:text-slate-100"
            />
          </div>

          {/* Department / Major */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Department / Major Program
            </label>
            <input
              type="text"
              name="major"
              value={formData.major}
              onChange={handleChange}
              placeholder="e.g. Software Engineering"
              className="w-full bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200 font-medium text-slate-850 dark:text-slate-100"
              required
            />
          </div>

          {/* Target CGPA */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Target CGPA Goal
            </label>
            <input
              type="number"
              name="targetCgpa"
              value={formData.targetCgpa}
              onChange={handleChange}
              step="0.01"
              min="0.0"
              max="4.0"
              placeholder="3.50"
              className="w-full bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200 font-semibold text-slate-850 dark:text-slate-100"
              required
            />
            <p className="text-[10px] text-slate-450 dark:text-slate-500">Aim high! Enter a target on the standard 4.0 scale.</p>
          </div>

          {/* Graduation Credits Goal */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Graduation Credits Load
            </label>
            <input
              type="number"
              name="graduationCredits"
              value={formData.graduationCredits}
              onChange={handleChange}
              min="30"
              max="280"
              placeholder="145"
              className="w-full bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200 font-semibold text-slate-850 dark:text-slate-100"
              required
            />
            <p className="text-[10px] text-slate-450 dark:text-slate-500">Total credit hours needed to complete your degree.</p>
          </div>
          
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Core Credits Required
            </label>
            <input
              type="number"
              name="coreCreditsRequired"
              value={formData.coreCreditsRequired}
              onChange={handleChange}
              min="0"
              max="280"
              className="w-full bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200 font-semibold text-slate-850 dark:text-slate-100"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Elective Credits Required
            </label>
            <input
              type="number"
              name="electiveCreditsRequired"
              value={formData.electiveCreditsRequired}
              onChange={handleChange}
              min="0"
              max="280"
              className="w-full bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200 font-semibold text-slate-850 dark:text-slate-100"
              required
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all duration-205 flex items-center gap-2 shadow-sm shadow-indigo-100 dark:shadow-none cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Profile Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
