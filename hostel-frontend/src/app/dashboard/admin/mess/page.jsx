'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { UtensilsCrossed, Save, CheckCircle } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['breakfast', 'lunch', 'dinner'];

export default function AdminMessPage() {
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get('/admin/mess');
        if (res.data.success) {
          // Build a lookup: menu[day][meal_type] = items
          const map = {};
          res.data.data.forEach(row => {
            if (!map[row.day]) map[row.day] = {};
            map[row.day][row.meal_type] = row.items;
          });
          setMenu(map);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (day, meal_type) => {
    setSaving(`${day}-${meal_type}`);
    try {
      const items = menu[day]?.[meal_type] || '';
      await axios.post('/admin/mess', { day, meal_type, items });
      showToast(`${day} ${meal_type} menu saved!`);
    } catch (err) {
      showToast('Failed to save menu item', 'error');
    } finally {
      setSaving(null);
    }
  };

  const updateCell = (day, meal, value) => {
    setMenu(prev => ({
      ...prev,
      [day]: { ...(prev[day] || {}), [meal]: value },
    }));
  };

  const MEAL_COLORS = {
    breakfast: 'bg-amber-50 border-amber-200 text-amber-700',
    lunch:     'bg-sky-50 border-sky-200 text-sky-700',
    dinner:    'bg-indigo-50 border-indigo-200 text-indigo-700',
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      <Sidebar role="admin" activeItem="mess" />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-8">

          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mess Menu Management</h1>
            <p className="text-sm text-slate-500 font-medium">Edit and save weekly meal schedules. Changes are immediately visible to students.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {DAYS.map(day => (
                <div key={day} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
                  <h2 className="text-base font-extrabold text-slate-900 mb-4">{day}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {MEALS.map(meal => {
                      const key = `${day}-${meal}`;
                      const isSaving = saving === key;
                      return (
                        <div key={meal}>
                          <div className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider mb-2 ${MEAL_COLORS[meal]}`}>
                            <span>{meal}</span>
                            <UtensilsCrossed className="w-3.5 h-3.5" />
                          </div>
                          <textarea
                            rows={3}
                            placeholder={`Enter ${meal} items (comma separated)...`}
                            value={menu[day]?.[meal] || ''}
                            onChange={e => updateCell(day, meal, e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                          />
                          <button
                            onClick={() => handleSave(day, meal)}
                            disabled={isSaving}
                            className="mt-2 w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            {isSaving ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold text-white ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}>
          <CheckCircle className="w-4 h-4" />
          {toast.msg}
        </div>
      )}
    </div>
  );
}
