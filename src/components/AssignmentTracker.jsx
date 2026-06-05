import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Calendar, Bell } from 'lucide-react';

const ASSIGNMENT_TYPES = [
  { value: 'assignment', label: 'Assignment' },
  { value: 'exam', label: 'Exam' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'project', label: 'Project' },
];

function getCountdown(dueDate) {
  if (!dueDate) return null;
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due - now;
  if (diff < 0) return { text: 'Overdue', urgent: true, overdue: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return { text: `${days}d ${hours}h left`, urgent: days <= 2, overdue: false };
  if (hours > 0) return { text: `${hours}h left`, urgent: true, overdue: false };
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { text: `${mins}m left`, urgent: true, overdue: false };
}

export default function AssignmentTracker({ assignments, onAssignmentsUpdate }) {
  const [items, setItems] = useState(assignments || []);

  useEffect(() => {
    setItems(assignments || []);
  }, [assignments]);

  useEffect(() => {
    if (!('Notification' in window)) return;
    const upcoming = items.filter((a) => {
      if (a.completed || !a.dueDate) return false;
      const diff = new Date(a.dueDate) - new Date();
      return diff > 0 && diff < 24 * 60 * 60 * 1000;
    });
    if (upcoming.length > 0 && Notification.permission === 'granted') {
      upcoming.forEach((a) => {
        new Notification(`Due soon: ${a.title}`, {
          body: `${a.courseName || 'General'} — ${getCountdown(a.dueDate)?.text}`,
        });
      });
    }
  }, [items]);

  const persist = (updated) => {
    setItems(updated);
    onAssignmentsUpdate(updated);
  };

  const addItem = () => {
    const due = new Date();
    due.setDate(due.getDate() + 7);
    persist([
      ...items,
      {
        id: `asgn-${Date.now()}`,
        title: '',
        courseName: '',
        type: 'assignment',
        dueDate: due.toISOString(),
        completed: false,
        notes: '',
      },
    ]);
  };

  const updateItem = (id, field, value) => {
    persist(items.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const toggleComplete = (id) => {
    persist(items.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a)));
  };

  const removeItem = (id) => {
    persist(items.filter((a) => a.id !== id));
  };

  const requestNotifications = () => {
    if ('Notification' in window) Notification.requestPermission();
  };

  const pending = items.filter((a) => !a.completed);
  const completed = items.filter((a) => a.completed);

  return (
    <div className="space-y-6">
      <div className="flex flex-col max-md:flex-col sm:flex-row justify-between items-stretch max-md:items-stretch sm:items-center gap-3">
        <div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" /> Assignment & Exam Tracker
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {pending.length} pending · {completed.length} completed
          </p>
        </div>
        <div className="flex gap-2 max-md:w-full sm:w-auto">
          <button
            onClick={requestNotifications}
            className="border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5"
            title="Enable browser notifications"
          >
            <Bell className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={addItem}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
          >
            <Plus className="w-3.5 h-3.5" /> Add Item
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center text-slate-400 text-sm">
          No assignments or exams yet. Add your first deadline.
        </div>
      ) : (
        <div className="space-y-3">
          {[...pending, ...completed].map((item) => {
            const countdown = getCountdown(item.dueDate);
            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-sm transition-all ${
                  item.completed
                    ? 'border-slate-200 dark:border-slate-800 opacity-60'
                    : countdown?.overdue
                      ? 'border-rose-200 dark:border-rose-900/50'
                      : countdown?.urgent
                        ? 'border-amber-200 dark:border-amber-900/50'
                        : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col max-md:flex-col sm:flex-row items-start gap-3">
                  <div className="flex items-start gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => toggleComplete(item.id)}
                    className="mt-1 shrink-0 text-slate-400 hover:text-emerald-500"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 w-full min-w-0">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                      placeholder="Title (e.g. Midterm Exam)"
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold"
                    />
                    <input
                      type="text"
                      value={item.courseName}
                      onChange={(e) => updateItem(item.id, 'courseName', e.target.value)}
                      placeholder="Course name"
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
                    />
                    <select
                      value={item.type}
                      onChange={(e) => updateItem(item.id, 'type', e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold"
                    >
                      {ASSIGNMENT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="datetime-local"
                      value={item.dueDate ? item.dueDate.slice(0, 16) : ''}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          'dueDate',
                          e.target.value ? new Date(e.target.value).toISOString() : null
                        )
                      }
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
                    />
                  </div>
                  </div>
                  <div className="flex flex-row max-md:flex-row sm:flex-col items-center max-md:items-center sm:items-end justify-between max-md:justify-between sm:justify-start gap-2 w-full sm:w-auto sm:shrink-0">
                    {countdown && !item.completed && (
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          countdown.overdue
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                            : countdown.urgent
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                              : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400'
                        }`}
                      >
                        {countdown.text}
                      </span>
                    )}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
