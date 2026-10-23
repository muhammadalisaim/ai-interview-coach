'use client';

import React, { useEffect, useState } from 'react';
import { Role } from '@/types';
import { Shield, Plus, Check, X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  // New role form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');

  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await fetch('/api/admin/roles');
        const data = await res.json();
        if (data.roles) {
          setRoles(data.roles);
        }
      } catch (err) {
        console.error('Failed to load roles:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRoles();
  }, []);

  const handleToggle = async (roleId: string | number, currentActive: boolean) => {
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', id: roleId, active: !currentActive }),
      });
      const data = await res.json();
      if (data.roles) {
        setRoles(data.roles);
        toast.success(`Role updated successfully`);
      }
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category,
          description: description.trim() || `Mock interview role for ${name}`,
          skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.roles) {
        setRoles(data.roles);
        setName('');
        setDescription('');
        setSkills('');
        toast.success(`New role "${name}" added!`);
      }
    } catch {
      toast.error('Failed to add role');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Admin Job Roles Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Enable or hide active job roles and configure new customized interview positions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Role Form */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-600" />
            Add New Job Role
          </h3>

          <form onSubmit={handleAddRole} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Role Title
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. AI Prompt Engineer"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Engineering">Engineering</option>
                <option value="Data & Analytics">Data & Analytics</option>
                <option value="Product & Design">Product & Design</option>
                <option value="Marketing & Sales">Marketing & Sales</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Customer Success">Customer Success</option>
                <option value="Custom Roles">Custom Roles</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of duties..."
                rows={2}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Skills (comma separated)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, Next.js, Architecture"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors"
            >
              Add Role
            </button>
          </form>
        </div>

        {/* Existing Roles Table */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            Configured Roles ({roles.length})
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
            {roles.map((r) => (
              <div key={r.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {r.name}
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {r.category} • {r.skills.slice(0, 3).join(', ')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle(r.id, r.active)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    r.active
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {r.active ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  {r.active ? 'Active' : 'Hidden'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
