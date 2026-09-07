'use client';

import { useState } from 'react';
import Sidebar from '@/components/navigation/Sidebar';
import TopNav from '@/components/navigation/TopNav';
import {
  Settings,
  User,
  Lock,
  Moon,
  Sun,
  Laptop,
  Bell,
  HardDrive,
  Key,
  AlertTriangle,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'appearance' | 'api' | 'storage'>('profile');

  // Profile Form
  const [name, setName] = useState('Alex Rivera');
  const [email, setEmail] = useState('demo@editflow.ai');

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Preferences
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [renderCompletionAlerts, setRenderCompletionAlerts] = useState(true);

  // API Keys
  const [openaiKey, setOpenaiKey] = useState('');
  const [cloudinaryCloud, setCloudinaryCloud] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile settings updated successfully!');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    toast.success('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
  };

  const handleSaveAPIKeys = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('API configurations saved to project environment.');
  };

  return (
    <div className="min-h-screen bg-[#080B14] text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 pl-64">
        <TopNav />

        <main className="pt-20 px-8 pb-16 max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="border-b border-white/[0.08] pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-1">
              <Settings className="w-3.5 h-3.5 text-cyan-400" /> Account Preferences
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Studio Settings</h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage your personal profile, security credentials, storage, and API integrations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Nav */}
            <div className="md:col-span-4 space-y-1">
              {[
                { id: 'profile', label: 'Profile Information', icon: User },
                { id: 'security', label: 'Password & Security', icon: Lock },
                { id: 'appearance', label: 'Theme & Notifications', icon: Moon },
                { id: 'storage', label: 'Storage & Usage', icon: HardDrive },
                { id: 'api', label: 'AI & Cloud APIs', icon: Key },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-medium transition-all text-left ${
                      activeSection === item.id
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Active Form Area */}
            <div className="md:col-span-8">
              {/* PROFILE */}
              {activeSection === 'profile' && (
                <div className="p-8 rounded-3xl glass-panel border border-white/[0.08] space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white">Profile Details</h3>
                    <p className="text-xs text-slate-400">Update your account name and email address.</p>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all flex items-center gap-2"
                      >
                        <Save className="w-3.5 h-3.5" /> Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* SECURITY */}
              {activeSection === 'security' && (
                <div className="p-8 rounded-3xl glass-panel border border-white/[0.08] space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white">Security & Password</h3>
                    <p className="text-xs text-slate-400">Ensure your account is protected with a secure password.</p>
                  </div>

                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Current Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">New Password</label>
                      <input
                        type="password"
                        placeholder="Minimum 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all flex items-center gap-2"
                      >
                        <Lock className="w-3.5 h-3.5" /> Update Password
                      </button>
                    </div>
                  </form>

                  {/* Danger Zone */}
                  <div className="pt-6 border-t border-rose-500/20 space-y-3">
                    <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Danger Zone
                    </h4>
                    <p className="text-xs text-slate-400">
                      Permanently delete your account and all associated video renders.
                    </p>
                    <button
                      onClick={() => toast.error('Account deletion disabled in demo environment.')}
                      className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

              {/* APPEARANCE & NOTIFICATIONS */}
              {activeSection === 'appearance' && (
                <div className="p-8 rounded-3xl glass-panel border border-white/[0.08] space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white">Theme & Display</h3>
                    <p className="text-xs text-slate-400">Customize the aesthetic appearance of your studio.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'dark', label: 'Dark Neon (Default)', icon: Moon },
                      { id: 'light', label: 'Light Studio', icon: Sun },
                      { id: 'system', label: 'System Sync', icon: Laptop },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setTheme(item.id as any);
                            toast.info(`Theme set to ${item.label}`);
                          }}
                          className={`p-4 rounded-2xl border text-center text-xs flex flex-col items-center gap-2 transition-all ${
                            theme === item.id
                              ? 'bg-purple-600/20 border-purple-500 text-white font-bold'
                              : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-6 border-t border-white/[0.06] space-y-3">
                    <h4 className="text-xs font-bold text-white">Notification Preferences</h4>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                      <span className="text-xs text-slate-300">Email updates on completed renders</span>
                      <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="accent-purple-500"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                      <span className="text-xs text-slate-300">In-browser toast completion alerts</span>
                      <input
                        type="checkbox"
                        checked={renderCompletionAlerts}
                        onChange={(e) => setRenderCompletionAlerts(e.target.checked)}
                        className="accent-purple-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STORAGE */}
              {activeSection === 'storage' && (
                <div className="p-8 rounded-3xl glass-panel border border-white/[0.08] space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white">Cloud Storage Allocation</h3>
                    <p className="text-xs text-slate-400">View and manage video upload capacity and cache.</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Allocated Storage</span>
                      <span className="text-cyan-400 font-mono font-bold">4.2 GB / 10.0 GB</span>
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full w-[42%]" />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      5.8 GB free for high-resolution 4K video cuts and audio tracks.
                    </p>
                  </div>

                  <button
                    onClick={() => toast.success('Cleared 850 MB temporary render cache!')}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-200 transition-all"
                  >
                    Clear Render Cache
                  </button>
                </div>
              )}

              {/* API INTEGRATIONS */}
              {activeSection === 'api' && (
                <div className="p-8 rounded-3xl glass-panel border border-white/[0.08] space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white">AI & Storage API Keys</h3>
                    <p className="text-xs text-slate-400">
                      Connect your OpenAI API key or Cloudinary bucket for customized production limits.
                    </p>
                  </div>

                  <form onSubmit={handleSaveAPIKeys} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        OpenAI API Key (Optional)
                      </label>
                      <input
                        type="password"
                        placeholder="sk-proj-..."
                        value={openaiKey}
                        onChange={(e) => setOpenaiKey(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                      />
                      <span className="text-[11px] text-slate-400 block mt-1">
                        If left blank, EditFlow AI uses its built-in rule parser engine seamlessly.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Cloudinary Cloud Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. editflow-prod"
                        value={cloudinaryCloud}
                        onChange={(e) => setCloudinaryCloud(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all flex items-center gap-2"
                      >
                        <Save className="w-3.5 h-3.5" /> Save API Settings
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
