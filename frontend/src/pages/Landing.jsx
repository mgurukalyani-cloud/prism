import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Eye,
  Radio,
  Brain,
  AlertTriangle,
  Lock,
  ArrowRight,
  Activity,
  CheckCircle2,
  Play,
  Layers,
  MapPin,
  Cpu
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const workflowSteps = [
    { title: 'Detect', desc: 'Ingests camera, drone, and IoT feeds with YOLO computer vision', icon: Eye, color: 'text-blue-600 bg-blue-50' },
    { title: 'Track', desc: 'Maintains anonymized tracking IDs (C-001..C-041) via Centroid/ByteTrack', icon: Radio, color: 'text-indigo-600 bg-indigo-50' },
    { title: 'Understand', desc: 'Analyzes body pose, posture shifts, velocity, and spatial zones', icon: Brain, color: 'text-purple-600 bg-purple-50' },
    { title: 'Assess', desc: 'Calculates multi-factor risk score (0-100: LOW, MEDIUM, HIGH, CRITICAL)', icon: Activity, color: 'text-amber-600 bg-amber-50' },
    { title: 'Alert', desc: 'Dispatches real-time WebSocket notifications to security personnel', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50' },
    { title: 'Protect', desc: 'Empowers proactive human response to prevent safety incidents', icon: Shield, color: 'text-emerald-600 bg-emerald-50' },
  ];

  const demoScenarios = [
    {
      title: 'Restricted Zone Entry',
      child: 'C-017',
      location: 'Main Gate / Arterial Road',
      risk: 'HIGH RISK',
      desc: 'Perimeter geofence breached toward vehicular traffic. Real-time optical lock and audio alert trigger immediate campus gatekeeper intervention.'
    },
    {
      title: 'Fall & Posture Collapse',
      child: 'C-021',
      location: 'Main Playground Surface',
      risk: 'CRITICAL RISK',
      desc: 'Sudden vertical drop and prolonged recumbent ground posture detected via keypoint aspect ratio analysis, dispatching an immediate safety alert.'
    },
    {
      title: 'School Bus Left Behind',
      child: 'C-034',
      location: 'School Bus Zone (Transit)',
      risk: 'HIGH RISK',
      desc: 'Vehicle trip status marked complete while human presence persists inside the vehicle, preventing dangerous vehicular hyperthermia incidents.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                ChildGuard <span className="text-blue-600 font-mono">AI</span>
              </span>
              <span className="ml-2 text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold hidden sm:inline">
                PRISMTECH 2026
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              Launch Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            Social Stream • AI-Powered Campus Safety Ecosystem
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            AI-Assisted Child Monitoring & <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              Campus Safety Decision Support
            </span>
          </h1>

          <p className="text-xl sm:text-2xl font-mono text-slate-700 font-bold">
            Detect. Assess. Alert. Protect.
          </p>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            ChildGuard AI transforms fragmented campus CCTV, GPS, and geofencing feeds into an intelligent, early-warning safety workflow without relying on invasive facial recognition.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/25 flex items-center gap-2 text-sm transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              View Live Demo Dashboard
            </button>

            <button
              onClick={() => navigate('/monitoring')}
              className="px-6 py-3.5 rounded-xl font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 shadow-sm flex items-center gap-2 text-sm transition cursor-pointer"
            >
              AI Video Monitoring Suite
            </button>
          </div>
        </div>
      </section>

      {/* Visual Workflow Pipeline */}
      <section className="py-16 px-6 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xs uppercase font-mono font-bold text-blue-600 tracking-wider">
              System Architecture
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              End-to-End Safety Decision Pipeline
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col items-center text-center relative group hover:border-blue-400 hover:shadow-sm transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${step.color} shadow-xs`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 mb-1 font-bold">0{idx + 1}</span>
                  <h3 className="font-bold text-base text-slate-900">{step.title}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Scenarios Demonstration */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs uppercase font-mono font-bold text-rose-600 tracking-wider">
            Critical Safety Use Cases
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
            Real-World Hackathon Demonstration Scenarios
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">
            Test and observe each safety incident running in real time through the simulation engine and video analyzer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {demoScenarios.map((sc) => (
            <div
              key={sc.title}
              className="bg-white border border-slate-200 hover:border-rose-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    {sc.risk}
                  </span>
                  <span className="font-mono text-xs text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                    {sc.child}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">{sc.title}</h3>
                <p className="text-xs text-slate-500 font-mono mb-3 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" /> {sc.location}
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">{sc.desc}</p>
              </div>

              <button
                onClick={() => navigate('/monitoring')}
                className="mt-6 w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 rounded-xl border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Inspect Scenario in Video Player <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy by Design Highlights */}
      <section className="py-16 px-6 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto rounded-2xl border border-blue-200 bg-blue-50/50 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
              <Lock className="w-10 h-10 text-blue-700" />
            </div>

            <div className="space-y-3">
              <span className="text-xs uppercase font-mono font-bold text-blue-700 tracking-wider">
                Ethical AI & Compliance
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                Privacy by Design: Zero Biometric Profiling
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                ChildGuard AI strictly relies on anonymized tracking tokens (<code className="text-blue-700 font-mono font-bold">C-001</code>..<code className="text-blue-700 font-mono font-bold">C-041</code>) and posture kinematics. No facial recognition models are stored, trained, or deployed, completely eliminating personal biometric vulnerability.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Authorized school campus feeds only
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Role-based access control (Admin / Security)
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Transparent rule-based risk audit trail
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Human supervision required disclaimer
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-xs text-slate-500 border-t border-slate-200 bg-slate-50">
        <p>
          ChildGuard AI — PRISMTECH 2026 Social Stream • AI-assisted safety monitoring. Human supervision remains essential.
        </p>
      </footer>
    </div>
  );
}
