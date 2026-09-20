import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, UserCheck, Eye, EyeOff, CheckCircle2, KeyRound } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@safeguard.ai');
  const [password, setPassword] = useState('admin123');
  const [role, setRole] = useState('Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Strictly Administrator and Campus Security (Teacher & Parent removed)
  const demoPresets = [
    {
      role: 'Admin',
      email: 'admin@safeguard.ai',
      password: 'admin123',
      route: '/dashboard',
      label: 'System Administrator',
      desc: 'Full campus security configuration, policy tuning & telemetry'
    },
    {
      role: 'Security',
      email: 'security@safeguard.ai',
      password: 'security123',
      route: '/monitoring',
      label: 'Campus Security',
      desc: 'Real-time CCTV optical monitoring, incident dispatch & response'
    },
  ];

  const handleSelectPreset = (preset) => {
    setEmail(preset.email);
    setPassword(preset.password);
    setRole(preset.role);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (onLoginSuccess) {
        onLoginSuccess(role);
      }
      const targetPreset = demoPresets.find((p) => p.role === role);
      navigate(targetPreset ? targetPreset.route : '/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-indigo-50/30 flex flex-col items-center justify-center p-4 sm:p-6 relative font-sans antialiased text-slate-900">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Branding Header */}
        <div className="text-center">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 items-center justify-center shadow-lg shadow-indigo-600/25 mb-3.5 text-white">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            SafeGuard <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent font-mono">AI</span>
          </h1>
          <p className="text-xs text-indigo-700 font-bold uppercase tracking-wider mt-1 font-mono">
            Detect • Assess • Alert • Protect
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            AI-Powered Universal Safety & Threat Detection System • PRISMTECH 2026
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-700 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                Authorized Personnel Sign In
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 2FA Ready
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-2">Sign in to Safety Console</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a 1-click authorized persona below or enter your security credentials:
            </p>
          </div>

          {/* 1-Click Persona Presets (Admin & Security) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {demoPresets.map((p) => {
              const isSelected = role === p.role;
              return (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`p-3.5 rounded-xl border text-left text-xs transition cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-br from-indigo-50 to-violet-50/50 border-indigo-500 text-indigo-900 shadow-sm'
                      : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <UserCheck className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                      {p.label}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono truncate">
                    {p.email}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                    {p.desc}
                  </p>
                  {isSelected && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-violet-600"></div>
                  )}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Authorized Personnel Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@safeguard.ai"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-xs sm:text-sm text-slate-900 font-medium transition shadow-xs focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Security Passcode
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-xs sm:text-sm text-slate-900 font-medium transition shadow-xs focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 hover:from-indigo-500 hover:to-violet-700 text-white shadow-md shadow-indigo-600/25 transition flex items-center justify-center gap-2 text-xs sm:text-sm mt-4 cursor-pointer group"
            >
              {isLoading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Sign In as {role === 'Security' ? 'Campus Security' : 'Administrator'}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500 font-medium">
              Zero Facial Recognition • Anonymized Token Telemetry Only
            </p>
          </div>
        </div>

        {/* Quick Return to Console */}
        <div className="text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
          >
            ← Return to Dashboard Console
          </button>
        </div>
      </div>
    </div>
  );
}
