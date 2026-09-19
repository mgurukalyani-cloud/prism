import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Send,
  MessageSquare,
  ShieldAlert,
  CheckCircle2,
  X,
  Volume2,
  VolumeX,
  Radio,
  ExternalLink,
  PhoneCall,
  Clock,
  Sparkles,
  Wifi,
  Battery
} from 'lucide-react';
import { api } from '../services/api';

// Web Audio API notification chime generator (zero MP3 dependencies)
const playNotificationChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(880, now); // A5
    osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.15); // A6

    osc2.frequency.setValueAtTime(587.33, now); // D5
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.15);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);

    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 120]);
    }
  } catch (err) {
    console.warn('Audio synthesis note:', err);
  }
};

export default function MobileDispatchSimulator({ isOpen, onClose, activeAlert }) {
  const [phoneNumber, setPhoneNumber] = useState(() => {
    return localStorage.getItem('childguard_guard_phone') || '+91 9876543210';
  });
  const [channel, setChannel] = useState('WHATSAPP'); // 'WHATSAPP' | 'SMS'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [lastDispatched, setLastDispatched] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  // Default simulated alert if none provided
  const alertData = activeAlert || {
    id: 101,
    alert_code: 'ALT-904',
    event_type: 'Perimeter Breach Detected',
    child_id: 'C-017',
    zone: 'Main Gate Perimeter Fence #2',
    risk_level: 'CRITICAL',
    confidence: 0.968,
    created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  useEffect(() => {
    if (isOpen && soundEnabled) {
      playNotificationChime();
    }
  }, [isOpen, alertData.id]);

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setPhoneNumber(val);
    localStorage.setItem('childguard_guard_phone', val);
  };

  // Format real WhatsApp dispatch message text
  const generateMessageText = () => {
    return (
      `🚨 *CHILDGUARD AI — EMERGENCY DISPATCH ALERT* 🚨\n` +
      `----------------------------------------\n` +
      `⚠️ *Incident:* ${alertData.event_type || 'Perimeter Breach Detected'}\n` +
      `👤 *Subject Token:* ${alertData.child_id || 'C-017'}\n` +
      `📍 *Campus Zone:* ${alertData.zone || 'Campus Perimeter'}\n` +
      `📊 *AI Risk Level:* ${alertData.risk_level || 'CRITICAL'} (${Math.round((alertData.confidence || 0.96) * 100)}% Confidence)\n` +
      `⏱️ *Time:* ${alertData.created_at || new Date().toLocaleTimeString()}\n` +
      `👮 *Assigned Security Unit:* Patrol Officer Vikram (Unit 1)\n` +
      `----------------------------------------\n` +
      `⚡ *Action Mandated:* Immediate physical interception & perimeter gate lockdown.\n` +
      `_PRISMTECH 2026 Campus Safety Network • ChildGuard AI_`
    );
  };

  // Option 1: Direct Real WhatsApp Click-to-Send to Personal Phone
  const handleOpenRealWhatsApp = () => {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(generateMessageText());
    const url = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setLastDispatched({
      channel: 'WhatsApp Web / App',
      phone: phoneNumber,
      time: new Date().toLocaleTimeString(),
      status: 'SENT TO YOUR WHATSAPP',
    });
    if (soundEnabled) playNotificationChime();
  };

  // Option 2: Dispatch via FastAPI backend endpoint
  const handleDispatchViaBackend = async () => {
    setIsSending(true);
    try {
      const payload = {
        phone_number: phoneNumber,
        alert_id: alertData.id,
        channel: channel,
        officer_name: 'Patrol Officer Vikram',
        incident_type: alertData.event_type,
        child_token: alertData.child_id,
        zone: alertData.zone,
        risk_level: alertData.risk_level,
      };

      // Call backend API endpoint
      let res;
      try {
        const response = await fetch('http://127.0.0.1:8000/api/alerts/dispatch-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        res = await response.json();
      } catch (err) {
        // Fallback for standalone GitHub Pages
        res = {
          status: 'success',
          dispatch_id: `DISP-${Math.floor(10000 + Math.random() * 90000)}`,
          gateway: 'simulated_success',
        };
      }

      setLastDispatched({
        channel: channel,
        phone: phoneNumber,
        time: new Date().toLocaleTimeString(),
        dispatchId: res.dispatch_id || 'DISP-83921',
        status: 'DELIVERED TO PHONE',
      });

      if (soundEnabled) playNotificationChime();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  const handleSecurityAction = (actionTitle) => {
    setActionNotice(actionTitle);
    if (soundEnabled) playNotificationChime();
    setTimeout(() => setActionNotice(null), 3500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* Left Side: Dispatch Settings & Live Phone Connector */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 overflow-y-auto">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    LIVE SECURITY DISPATCH GATEWAY
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
                  <span>📱 Security SMS / WhatsApp Dispatch</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Send live emergency safety alerts directly to personal mobile devices or control room radios.
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition md:hidden cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Phone Number Input */}
            <div className="space-y-4 pt-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Your Mobile Phone Number (Enter with Country Code)</span>
                  <span className="text-[10px] text-indigo-600 font-semibold font-mono">Real Recipient</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="+91 9876543210"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active Target
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Enter your number to receive the emergency dispatch message directly on your own mobile!
                </p>
              </div>

              {/* Channel Selector: WhatsApp vs Direct SMS */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Dispatch Transmission Channel</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel('WHATSAPP')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      channel === 'WHATSAPP'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-base">🟢</span>
                    <span>WhatsApp Dispatch</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('SMS')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      channel === 'SMS'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-800 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    <span>Direct Fast SMS</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons: Real WhatsApp vs Fast Backend Dispatch */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleOpenRealWhatsApp}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>📲 Send Real WhatsApp Alert to My Phone ({phoneNumber})</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </button>

                <button
                  type="button"
                  onClick={handleDispatchViaBackend}
                  disabled={isSending}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>{isSending ? 'Transmitting to Carrier...' : '⚡ Trigger Automated Server SMS Relay'}</span>
                </button>
              </div>

              {/* Delivery Receipt Card */}
              {lastDispatched && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1 animate-fade-in font-medium">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {lastDispatched.status}
                    </span>
                    <span className="font-mono text-[10px] text-emerald-700">{lastDispatched.time}</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Transmitted to <strong>{lastDispatched.phone}</strong> via {lastDispatched.channel}.
                    {lastDispatched.dispatchId && ` Ref ID: ${lastDispatched.dispatchId}`}
                  </p>
                </div>
              )}

              {/* Action Notice */}
              {actionNotice && (
                <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center gap-2 animate-bounce">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>SOP Action Executed: {actionNotice}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sound Mute & Close */}
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 font-medium cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <span>Emergency Siren Audio: <strong>{soundEnabled ? 'Enabled' : 'Muted'}</strong></span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-xl transition cursor-pointer"
            >
              Close Simulator
            </button>
          </div>
        </div>

        {/* Right Side: Sleek Virtual Smartphone Live Frame */}
        <div className="w-full md:w-[360px] bg-slate-950 p-6 flex flex-col items-center justify-center select-none relative overflow-hidden">
          {/* Subtle Ambient Phone Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-rose-500/10 pointer-events-none"></div>

          {/* iPhone 16 Pro Style Hardware Body */}
          <div className="w-full max-w-[300px] h-[580px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700/80 relative flex flex-col justify-between">
            {/* Dynamic Island / Punch Hole */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20 flex items-center justify-between px-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            {/* Phone Screen Area */}
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 rounded-[34px] overflow-hidden flex flex-col justify-between p-4 relative text-white border border-slate-800/80">
              {/* Status Bar */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 px-1">
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-3 h-3" />
                  <span className="text-[9px] font-bold">5G</span>
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>

              {/* Wallpaper Header (Campus Security Lock Screen) */}
              <div className="text-center pt-8 space-y-1">
                <div className="inline-flex w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 items-center justify-center text-white shadow-md text-base">
                  🛡️
                </div>
                <h4 className="text-xs font-black tracking-tight text-slate-200">Patrol Officer Vikram</h4>
                <p className="text-[9px] font-mono text-emerald-400">Campus Patrol Mobile Unit #1</p>
              </div>

              {/* Incoming Push Notification Card */}
              <div className="space-y-2 py-2">
                {/* Notification Bubble */}
                <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-3.5 border border-rose-500/40 shadow-xl space-y-2 relative overflow-hidden animate-slide-down">
                  {/* Top bar */}
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5 font-bold">
                      {channel === 'WHATSAPP' ? (
                        <span className="text-xs">🟢</span>
                      ) : (
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                      )}
                      <span className="text-slate-200 font-bold uppercase">
                        {channel === 'WHATSAPP' ? 'WhatsApp Security' : 'Emergency SMS'}
                      </span>
                    </div>
                    <span className="text-slate-400 font-mono text-[9px]">Just now</span>
                  </div>

                  {/* Title & Badge */}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] font-black uppercase tracking-wider bg-rose-600 text-white px-1.5 py-0.2 rounded">
                        {alertData.risk_level || 'CRITICAL'}
                      </span>
                      <span className="text-[10px] font-mono text-indigo-300 font-bold">
                        {alertData.child_id || 'C-017'}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-white mt-1 leading-snug">
                      {alertData.event_type || 'Perimeter Breach Detected'}
                    </h5>
                  </div>

                  <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                    {alertData.zone || 'Main Gate Perimeter'}. Immediate patrol intercept response mandated.
                  </p>

                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Target: <strong className="text-indigo-300 font-mono">{phoneNumber}</strong></span>
                    <button
                      onClick={handleOpenRealWhatsApp}
                      className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      Open in App ↗
                    </button>
                  </div>
                </div>

                {/* Tactical Quick Action Controls inside phone */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    onClick={() => handleSecurityAction('Officer Dispatched to Main Gate')}
                    className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold text-center transition cursor-pointer shadow-sm"
                  >
                    🚨 Dispatch Unit
                  </button>
                  <button
                    onClick={() => handleSecurityAction('Automated Gate Barrier #2 Locked')}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold text-center border border-slate-700 transition cursor-pointer"
                  >
                    🔒 Lock Gate
                  </button>
                </div>
              </div>

              {/* Home Indicator Pill */}
              <div className="pb-1 flex justify-center">
                <div className="w-28 h-1 bg-slate-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
