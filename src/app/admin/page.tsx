'use client';

import React, { useState, useEffect } from 'react';
import { useStore, hydrateStore } from '../../store/useStore';
import { UserProfile, DietaryPreference, HealthGoal } from '../../types';
import { FOOD_DATABASE } from '../../lib/foodData';
import { 
  Users, Database, Bell, BarChart3, Shield, ShieldAlert, Plus, Check, 
  RefreshCw, LogIn, Lock, Mail, LayoutDashboard, KeyRound, Cpu, 
  Settings, CreditCard, Activity, LogOut, Moon, Sun, ArrowLeft
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  CartesianGrid, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

// Mock users database inside admin portal
interface AdminUser {
  id: string;
  name: string;
  email: string;
  goal: HealthGoal;
  dailyCalories: number;
  consumed: number;
  activeDays: number;
  role: 'user' | 'admin' | 'super_admin';
  status: 'active' | 'suspended';
}

const INITIAL_MOCK_USERS: AdminUser[] = [
  { id: 'u-1', name: 'John Doe', email: 'john@example.com', goal: 'weight_loss', dailyCalories: 1850, consumed: 1720, activeDays: 12, role: 'user', status: 'active' },
  { id: 'u-2', name: 'Priya Sharma', email: 'priya@example.com', goal: 'muscle_building', dailyCalories: 2500, consumed: 2610, activeDays: 24, role: 'user', status: 'active' },
  { id: 'u-3', name: 'Rohan Mehta', email: 'rohan@example.com', goal: 'fat_loss', dailyCalories: 2000, consumed: 1950, activeDays: 8, role: 'user', status: 'suspended' },
  { id: 'u-4', name: 'Sarah Connor', email: 'sarah@example.com', goal: 'weight_maintenance', dailyCalories: 2200, consumed: 2150, activeDays: 45, role: 'user', status: 'active' },
  { id: 'u-5', name: 'Dev Admin', email: 'admin@nutritrack.ai', goal: 'muscle_building', dailyCalories: 2700, consumed: 1500, activeDays: 60, role: 'admin', status: 'active' }
];

export default function AdminPortal() {
  const { 
    isHydrated, userSession, profile, activeTab, theme, customFoods,
    addCustomFood, loginUser, logoutUser, toggleTheme
  } = useStore();

  // Load state from localStorage on initial render
  useEffect(() => {
    hydrateStore();
  }, []);

  // Admin login states
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Portal tab navigation
  const [adminTab, setAdminTab] = useState<'users' | 'ai_usage' | 'analytics' | 'subscriptions' | 'settings'>('users');
  
  // Interactive mock states
  const [usersList, setUsersList] = useState<AdminUser[]>(INITIAL_MOCK_USERS);
  const [customFoodSuccess, setCustomFoodSuccess] = useState(false);
  const [notifStatus, setNotifStatus] = useState('');

  // Setting states
  const [defaultModel, setDefaultModel] = useState('gemini-1.5-pro');
  const [ocrEngine, setOcrEngine] = useState('cloud-vision-api');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Broadcast fields
  const [notifTitle, setNotifTitle] = useState('Drink Water Reminder');
  const [notifBody, setNotifBody] = useState('Keep your hydration levels high! Drink a glass of water now.');

  // Food add fields
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodCategory, setNewFoodCategory] = useState('Indian');
  const [newFoodServing, setNewFoodServing] = useState('100g');
  const [newFoodCal, setNewFoodCal] = useState('');
  const [newFoodProt, setNewFoodProt] = useState('');
  const [newFoodCarb, setNewFoodCarb] = useState('');
  const [newFoodFat, setNewFoodFat] = useState('');

  // Handle local storage updates to sync simulated user actions
  useEffect(() => {
    const saved = localStorage.getItem('nt_admin_users');
    if (saved) {
      try {
        setUsersList(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveUsersState = (updatedList: AdminUser[]) => {
    setUsersList(updatedList);
    localStorage.setItem('nt_admin_users', JSON.stringify(updatedList));
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    await new Promise(r => setTimeout(r, 1200));

    if (!adminEmail.toLowerCase().includes('admin')) {
      setAuthError('Access Denied: Email address does not possess Administrator privileges.');
      setAuthLoading(false);
      return;
    }

    if (adminPassword.length < 6) {
      setAuthError('Invalid Credentials: Password must be at least 6 characters.');
      setAuthLoading(false);
      return;
    }

    await loginUser(adminEmail);
    setAuthLoading(false);
  };

  const toggleUserStatus = (userId: string) => {
    const updated = usersList.map(u => {
      if (u.id === userId) {
        const nextStatus: 'active' | 'suspended' = u.status === 'active' ? 'suspended' : 'active';
        return { ...u, status: nextStatus };
      }
      return u;
    });
    saveUsersState(updated);
  };

  const promoteUserRole = (userId: string) => {
    const updated = usersList.map(u => {
      if (u.id === userId) {
        const nextRole: 'user' | 'admin' = u.role === 'user' ? 'admin' : 'user';
        return { ...u, role: nextRole };
      }
      return u;
    });
    saveUsersState(updated);
  };

  const handleBroadcastNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifBody) return;

    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(notifTitle, {
          body: notifBody,
          icon: '/favicon.ico'
        });
        setNotifStatus('Notification broadcasted to all connected web containers!');
      } else {
        setNotifStatus('Notification permission blocked by system.');
      }
    } else {
      setNotifStatus('System alert triggered (API mocks sent).');
    }
    setTimeout(() => setNotifStatus(''), 4500);
  };

  const handleAddGlobalFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFoodName || !newFoodCal) return;

    addCustomFood({
      name: newFoodName,
      category: newFoodCategory,
      servingSize: newFoodServing,
      calories: Math.round(parseFloat(newFoodCal)) || 0,
      protein: parseFloat(newFoodProt) || 0,
      carbs: parseFloat(newFoodCarb) || 0,
      fat: parseFloat(newFoodFat) || 0
    });

    setNewFoodName('');
    setNewFoodCal('');
    setNewFoodProt('');
    setNewFoodCarb('');
    setNewFoodFat('');
    setCustomFoodSuccess(true);
    setTimeout(() => setCustomFoodSuccess(false), 3000);
  };

  // Hydration Loader Gate
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-zinc-500 font-medium">Hydrating admin console...</p>
        </div>
      </div>
    );
  }

  // 1. Auth Gate (Not Logged In)
  if (!userSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-radial from-slate-900 via-zinc-950 to-black relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10 glass-card p-8 rounded-2xl border-emerald-500/20">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
              <Shield className="w-6 h-6 text-zinc-950" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase">
              Admin <span className="text-emerald-400">Portal</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1.5 font-medium">
              NutriTrack AI Global System Infrastructure
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            {authError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold leading-relaxed flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="admin@nutritrack.ai"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                Security Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-emerald-500/15 hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer"
            >
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Sign In to Console <LogIn className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-zinc-900 pt-4 flex justify-between items-center text-[10px] text-zinc-500 font-semibold">
            <span>Security: AES-256 Enabled</span>
            <a href="/" className="hover:underline flex items-center gap-1 text-emerald-400">
              <ArrowLeft className="w-3 h-3" /> Back to user app
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 2. Role Authorization Check
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
        <div className="w-full max-w-md text-center space-y-6 glass-card p-8 rounded-2xl border-rose-500/20">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-white">403 - Access Forbidden</h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your account (<strong className="text-zinc-200">{userSession.email}</strong>) does not have authorization to view the global administrator dashboard routes.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={logoutUser}
              className="px-6 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-500/20 hover:bg-rose-400 transition-colors"
            >
              Log Out of Account
            </button>
            <a
              href="/"
              className="block mt-4 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
            >
              Navigate to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Admin Charts Data
  const aiUsageData = [
    { day: 'Mon', queries: 240, scans: 140, audio: 80, tokens: 4200 },
    { day: 'Tue', queries: 320, scans: 180, audio: 110, tokens: 5100 },
    { day: 'Wed', queries: 280, scans: 160, audio: 95, tokens: 4800 },
    { day: 'Thu', queries: 410, scans: 250, audio: 150, tokens: 6800 },
    { day: 'Fri', queries: 380, scans: 220, audio: 130, tokens: 6200 },
    { day: 'Sat', queries: 480, scans: 310, audio: 190, tokens: 8100 },
    { day: 'Sun', queries: 520, scans: 340, audio: 210, tokens: 8900 }
  ];

  const systemDAUData = [
    { name: 'Mon', active: 1100, logged: 840 },
    { name: 'Tue', active: 1450, logged: 1120 },
    { name: 'Wed', active: 1380, logged: 1040 },
    { name: 'Thu', active: 1600, logged: 1290 },
    { name: 'Fri', active: 1510, logged: 1200 },
    { name: 'Sat', active: 1850, logged: 1420 },
    { name: 'Sun', active: 2100, logged: 1680 }
  ];

  const subRevenueData = [
    { month: 'Jan', free: 2100, premium: 4500 },
    { month: 'Feb', free: 2300, premium: 5200 },
    { month: 'Mar', free: 2500, premium: 6100 },
    { month: 'Apr', free: 2900, premium: 7800 },
    { month: 'May', free: 3200, premium: 9400 }
  ];

  const pieColors = ['#10b981', '#3b82f6', '#f59e0b'];
  const pieData = [
    { name: 'Premium Monthly ($9.99)', value: 55 },
    { name: 'Premium Yearly ($79.99)', value: 35 },
    { name: 'Free Tier ($0.00)', value: 10 }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative overflow-hidden">
      {/* Background ambient grids */}
      <div className="absolute top-0 right-0 w-[50%] h-[40%] rounded-full bg-emerald-500/5 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[40%] rounded-full bg-teal-500/5 blur-[130px] pointer-events-none z-0" />

      {/* Main Console Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-zinc-900 bg-zinc-950/40 backdrop-blur-md shrink-0 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Shield className="w-5 h-5 text-zinc-950" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-tight leading-none uppercase">
              NutriTrack Console
            </h1>
            <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase">
              Server Host Cluster #01
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg bg-zinc-900/60 border border-zinc-850 hover:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Toggle App Theme"
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 py-1 px-3 rounded-lg text-emerald-400 text-xs font-black">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>SYSTEM ACTIVE</span>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[9px] font-bold text-zinc-550 block uppercase tracking-wider">Console Admin</span>
            <span className="text-xs font-bold text-white capitalize">{profile.name} ({profile.role})</span>
          </div>

          <button
            onClick={logoutUser}
            className="w-8 h-8 rounded-lg bg-zinc-900/60 border border-zinc-850 hover:border-rose-900/30 hover:bg-rose-950/20 flex items-center justify-center text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 relative z-10">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-900 bg-zinc-950/20 backdrop-blur-xl p-4 shrink-0 flex flex-row md:flex-col justify-between">
          <div className="w-full space-y-1 flex flex-row md:flex-col flex-wrap gap-2 md:gap-1">
            <button
              onClick={() => setAdminTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all justify-start ${
                adminTab === 'users' ? 'bg-emerald-500 text-zinc-950 shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <Users className="w-4.5 h-4.5" />
              <span className="hidden md:inline">User Directory</span>
            </button>

            <button
              onClick={() => setAdminTab('ai_usage')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all justify-start ${
                adminTab === 'ai_usage' ? 'bg-emerald-500 text-zinc-950 shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <Cpu className="w-4.5 h-4.5" />
              <span className="hidden md:inline">AI Engine Usage</span>
            </button>

            <button
              onClick={() => setAdminTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all justify-start ${
                adminTab === 'analytics' ? 'bg-emerald-500 text-zinc-950 shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <BarChart3 className="w-4.5 h-4.5" />
              <span className="hidden md:inline">System Analytics</span>
            </button>

            <button
              onClick={() => setAdminTab('subscriptions')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all justify-start ${
                adminTab === 'subscriptions' ? 'bg-emerald-500 text-zinc-950 shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <CreditCard className="w-4.5 h-4.5" />
              <span className="hidden md:inline">Billing & Revenue</span>
            </button>

            <button
              onClick={() => setAdminTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all justify-start ${
                adminTab === 'settings' ? 'bg-emerald-500 text-zinc-950 shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <Settings className="w-4.5 h-4.5" />
              <span className="hidden md:inline">System Config</span>
            </button>
          </div>

          <div className="hidden md:block text-[10px] text-zinc-650 font-bold text-center border-t border-zinc-900 pt-4 w-full">
            Console Terminal v1.0.0
          </div>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-none">
          
          {/* USER DIRECTORY TAB */}
          {adminTab === 'users' && (
            <div className="space-y-6">
              {/* Stats overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 rounded-xl">
                  <span className="text-[10px] text-zinc-500 uppercase font-black">Total Registered Users</span>
                  <p className="text-xl font-black text-white mt-1">{usersList.length}</p>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <span className="text-[10px] text-zinc-500 uppercase font-black">Active Accounts</span>
                  <p className="text-xl font-black text-emerald-400 mt-1">
                    {usersList.filter(u => u.status === 'active').length}
                  </p>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <span className="text-[10px] text-zinc-500 uppercase font-black">Suspended Accounts</span>
                  <p className="text-xl font-black text-rose-500 mt-1">
                    {usersList.filter(u => u.status === 'suspended').length}
                  </p>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <span className="text-[10px] text-zinc-500 uppercase font-black">Administrator Accounts</span>
                  <p className="text-xl font-black text-amber-500 mt-1">
                    {usersList.filter(u => u.role === 'admin').length}
                  </p>
                </div>
              </div>

              {/* Users Table */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">User Directory Registry</h3>
                  <p className="text-xs text-zinc-400 mt-1">Review active goals, calorie distribution counts, and apply roles or flags.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-zinc-400 text-left">
                    <thead className="border-b border-zinc-900 uppercase font-bold text-[10px] text-zinc-500">
                      <tr>
                        <th className="py-3 px-2">Account Owner</th>
                        <th className="py-3 px-2">Goal Target</th>
                        <th className="py-3 px-2">Calorie Budget</th>
                        <th className="py-3 px-2">Role Status</th>
                        <th className="py-3 px-2">Status</th>
                        <th className="py-3 px-2 text-right">Administrative Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {usersList.map((u) => (
                        <tr key={u.id} className="hover:bg-zinc-900/20">
                          <td className="py-3 px-2">
                            <div className="font-bold text-white">{u.name}</div>
                            <div className="text-[10px] text-zinc-500">{u.email}</div>
                          </td>
                          <td className="py-3 px-2 capitalize">{u.goal.replace('_', ' ')}</td>
                          <td className="py-3 px-2">
                            <div className="font-semibold text-zinc-300">{u.dailyCalories} kcal/day</div>
                            <div className="text-[10px] text-zinc-500">{u.activeDays} active logging days</div>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              u.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-zinc-900 text-zinc-400'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-500'
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right space-x-2">
                            <button
                              onClick={() => promoteUserRole(u.id)}
                              className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] hover:border-zinc-700 font-bold transition-all text-zinc-300 hover:text-white"
                            >
                              Toggle Role
                            </button>
                            <button
                              onClick={() => toggleUserStatus(u.id)}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                                u.status === 'active' 
                                  ? 'bg-rose-950/20 border border-rose-900/20 text-rose-400 hover:bg-rose-950/40' 
                                  : 'bg-emerald-950/20 border border-emerald-900/20 text-emerald-400 hover:bg-emerald-950/40'
                              }`}
                            >
                              {u.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* AI USAGE MONITORING TAB */}
          {adminTab === 'ai_usage' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 rounded-xl">
                  <span className="text-[10px] text-zinc-500 uppercase font-black">AI Coach Queries (Today)</span>
                  <p className="text-xl font-black text-white mt-1">2,490</p>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <span className="text-[10px] text-zinc-500 uppercase font-black">OCR Image Scans (Today)</span>
                  <p className="text-xl font-black text-white mt-1">1,510</p>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <span className="text-[10px] text-zinc-500 uppercase font-black">Audio Transcription runs</span>
                  <p className="text-xl font-black text-white mt-1">810</p>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <span className="text-[10px] text-zinc-500 uppercase font-black">Token Consumption</span>
                  <p className="text-xl font-black text-emerald-400 mt-1">48.2k tokens</p>
                </div>
              </div>

              {/* AI Requests Over Time */}
              <div className="glass-card p-6 rounded-2xl">
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-emerald-400" /> AI Engine API Requests (7 Days)
                  </h3>
                </div>
                <div className="h-64 w-full text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={aiUsageData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="day" stroke="#71717a" />
                      <YAxis stroke="#71717a" />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="queries" name="Coach Chat Qs" stroke="#10b981" strokeWidth={2.5} />
                      <Line type="monotone" dataKey="scans" name="Photo Food Scans" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="audio" name="Voice Logging logs" stroke="#f59e0b" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* SYSTEM ANALYTICS TAB */}
          {adminTab === 'analytics' && (
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-2xl">
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" /> Daily Active Users (DAU) vs Calorie Logs
                  </h3>
                </div>
                <div className="h-64 w-full text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={systemDAUData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="name" stroke="#71717a" />
                      <YAxis stroke="#71717a" />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} />
                      <Bar dataKey="active" name="Active Users" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="logged" name="Logged Meal entries" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* SUBSCRIPTIONS TAB */}
          {adminTab === 'subscriptions' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                
                {/* Revenue card */}
                <div className="glass-card p-6 rounded-2xl md:col-span-2 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-400" /> Subscription Revenue Growth
                    </h3>
                  </div>
                  <div className="h-56 w-full text-[10px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={subRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="month" stroke="#71717a" />
                        <YAxis stroke="#71717a" />
                        <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} />
                        <Area type="monotone" dataKey="premium" name="Premium MMR ($)" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie Chart card */}
                <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">User Tier Distribution</h3>
                  
                  <div className="h-44 w-full flex items-center justify-center text-[10px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-1 text-[10px] text-zinc-400">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Monthly Sub</div>
                      <span className="font-bold text-white">55%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full" /> Yearly Sub</div>
                      <span className="font-bold text-white">35%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full" /> Free Users</div>
                      <span className="font-bold text-white">10%</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SYSTEM CONFIG / SETTINGS TAB */}
          {adminTab === 'settings' && (
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Broadcast Alert */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Broadcast Alert Banner</h3>
                  <p className="text-xs text-zinc-400">Distribute dynamic alerts, water reminders, or critical notices globally.</p>
                </div>

                <form onSubmit={handleBroadcastNotification} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Notification Title</label>
                    <input
                      type="text"
                      required
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Alert Message</label>
                    <textarea
                      rows={3}
                      required
                      value={notifBody}
                      onChange={(e) => setNotifBody(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 leading-relaxed resize-none"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-bold text-emerald-400">{notifStatus}</span>
                    <button
                      type="submit"
                      className="bg-emerald-500 text-zinc-950 py-2.5 px-5 rounded-xl font-bold text-xs shadow-lg shadow-emerald-500/10 hover:bg-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Bell className="w-3.5 h-3.5" /> Broadcast Now
                    </button>
                  </div>
                </form>
              </div>

              {/* Add global food */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Global Database Addition</h3>
                  <p className="text-xs text-zinc-400">Append items directly to the shared auto-completion food catalog database.</p>
                </div>

                <form onSubmit={handleAddGlobalFood} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Item Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Oats Porridge"
                        value={newFoodName}
                        onChange={(e) => setNewFoodName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Category</label>
                      <select
                        value={newFoodCategory}
                        onChange={(e) => setNewFoodCategory(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Indian">Indian</option>
                        <option value="North Indian">North Indian</option>
                        <option value="South Indian">South Indian</option>
                        <option value="International">International</option>
                        <option value="Packaged">Packaged</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Serving Size</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 1 bowl (150g)"
                        value={newFoodServing}
                        onChange={(e) => setNewFoodServing(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Calories (kcal)</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 210"
                        value={newFoodCal}
                        onChange={(e) => setNewFoodCal(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Protein (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={newFoodProt}
                        onChange={(e) => setNewFoodProt(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Carbs (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={newFoodCarb}
                        onChange={(e) => setNewFoodCarb(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Fat (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={newFoodFat}
                        onChange={(e) => setNewFoodFat(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    {customFoodSuccess ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Added to global catalog database!
                      </span>
                    ) : (
                      <div />
                    )}
                    
                    <button
                      type="submit"
                      className="bg-emerald-500 text-zinc-950 py-2.5 px-5 rounded-xl font-bold text-xs shadow-lg shadow-emerald-500/10 hover:bg-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Food Item
                    </button>
                  </div>
                </form>
              </div>

              {/* API and System Config Toggles */}
              <div className="glass-card p-6 rounded-2xl md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Cpu className="w-4.5 h-4.5 text-emerald-400" /> API System Engine & Maintenance Toggles
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">Configure global default AI parameters and system security status.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 pt-2">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase font-bold text-zinc-500">Default AI Model</label>
                    <select
                      value={defaultModel}
                      onChange={(e) => setDefaultModel(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                      <option value="gpt-4o">GPT-4o (OpenAI)</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase font-bold text-zinc-500">OCR Scan Engine Provider</label>
                    <select
                      value={ocrEngine}
                      onChange={(e) => setOcrEngine(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="cloud-vision-api">Google Cloud Vision API</option>
                      <option value="local-ocr-tesseract">Local WebAssembly Tesseract OCR</option>
                      <option value="openai-vision">OpenAI Vision Model API</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase font-bold text-zinc-500">Maintenance Window Mode</label>
                    <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-xl justify-between">
                      <span className="text-xs font-medium text-zinc-400">Offline Gate</span>
                      <button
                        type="button"
                        onClick={() => setMaintenanceMode(!maintenanceMode)}
                        className={`w-12 h-6 rounded-full transition-all relative flex items-center p-0.5 cursor-pointer ${
                          maintenanceMode ? 'bg-rose-500 justify-end' : 'bg-zinc-800 justify-start'
                        }`}
                      >
                        <span className="w-5 h-5 bg-white rounded-full shadow-md" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
