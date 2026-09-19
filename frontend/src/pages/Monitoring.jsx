import React, { useState, useEffect, useRef } from 'react';
import CameraCard from '../components/CameraCard';
import RiskBadge from '../components/RiskBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../services/api';
import {
  Video,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Shield,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Layers,
  Sliders,
  Maximize2,
  Eye,
  Clock,
  Cpu,
  Film,
  Camera,
  Check,
  Zap,
  Crosshair,
  Gauge
} from 'lucide-react';

export default function Monitoring() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);

  // Video Analysis State
  const [videoSource, setVideoSource] = useState(null);
  const [videoName, setVideoName] = useState('Campus_Overwatch_Detection_CAM01.mp4');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  
  // Real-Time Motion Detection & Risk State
  const [currentRisk, setCurrentRisk] = useState('NO RISK DETECTED');
  const [confidence, setConfidence] = useState(96.4);
  const [motionEnergy, setMotionEnergy] = useState(0);
  const [motionVelocity, setMotionVelocity] = useState(0);
  const [motionStatus, setMotionStatus] = useState('Baseline Optical Scan (Zero Motion Detected)');
  const [maxRiskDetected, setMaxRiskDetected] = useState('NO RISK DETECTED');
  const [detectedEvents, setDetectedEvents] = useState([]);
  const [finalResult, setFinalResult] = useState(null);
  const [activeScenarioKey, setActiveScenarioKey] = useState('breach');

  const videoRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const prevFrameDataRef = useRef(null);
  const prevCentroidRef = useRef(null);
  const smoothedBoxRef = useRef(null);
  const motionHistoryRef = useRef([]);
  const animFrameIdRef = useRef(null);
  const lastStateUpdateRef = useRef(0);
  const lastEventLoggedTimeRef = useRef(0);

  // Preset demonstration scenarios
  const presetScenarios = {
    breach: {
      name: 'Demonstration 1: Perimeter Highway Breach Scenario',
      targetLabel: 'C-017 Trajectory',
      finalVerdict: 'High Risk: Restricted Perimeter Gate Breach Detected at 00:22 (Token C-017)',
      finalLevel: 'HIGH'
    },
    fall: {
      name: 'Demonstration 2: Playground Turf Fall & Posture Collapse',
      targetLabel: 'C-021 Posture',
      finalVerdict: 'Critical Risk: Sudden Posture Collapse & Fall Detected at 00:15 (Token C-021)',
      finalLevel: 'CRITICAL'
    },
    normal: {
      name: 'Demonstration 3: Academic Corridor Supervised Activity',
      targetLabel: 'C-001 Baseline',
      finalVerdict: 'No Risk Detected: Standard Campus Operations Verified (All Clear)',
      finalLevel: 'NO RISK'
    }
  };

  const loadCameras = async () => {
    try {
      const data = await api.getCameras();
      setCameras(data);
    } catch (e) {
      console.error('Error fetching cameras:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCameras();
  }, []);

  // Initialize offscreen analysis canvas at standard fixed resolution
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 120;
    offscreenCanvasRef.current = canvas;
  }, []);

  // Handle uploaded video file
  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSource(url);
      setVideoName(file.name);
      setCurrentTime(0);
      setIsPlaying(true);
      setFinalResult(null);
      setMaxRiskDetected('NO RISK DETECTED');
      smoothedBoxRef.current = null;
      prevFrameDataRef.current = null;
      prevCentroidRef.current = null;
      motionHistoryRef.current = [];

      setDetectedEvents([
        {
          time: '00:00',
          text: `Video loaded: "${file.name}". Frame differencing motion tracker active.`,
          risk: 'NO RISK DETECTED'
        }
      ]);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.muted = true;
          videoRef.current.play().catch((err) => {
            console.warn('Playback notice:', err);
          });
        }
      }, 150);
    }
  };

  // Play / Pause toggle
  const togglePlay = () => {
    if (videoSource && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch((err) => console.warn('Play notice:', err));
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Reset analysis
  const handleReset = () => {
    if (videoSource && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch((err) => console.warn('Play notice:', err));
    }
    setCurrentTime(0);
    setIsPlaying(true);
    setFinalResult(null);
    setMaxRiskDetected('NO RISK DETECTED');
    setDetectedEvents([]);
    prevFrameDataRef.current = null;
    prevCentroidRef.current = null;
    smoothedBoxRef.current = null;
    motionHistoryRef.current = [];
  };

  // Calculate actual rendered video dimensions inside the container (letterbox/pillarbox handling)
  const getVideoRenderBounds = (containerW, containerH, vidW, vidH) => {
    if (!vidW || !vidH) return { x: 0, y: 0, w: containerW, h: containerH };
    const videoAspect = vidW / vidH;
    const containerAspect = containerW / containerH;
    let renderW, renderH, offsetX, offsetY;

    if (videoAspect > containerAspect) {
      renderW = containerW;
      renderH = containerW / videoAspect;
      offsetX = 0;
      offsetY = (containerH - renderH) / 2;
    } else {
      renderH = containerH;
      renderW = containerH * videoAspect;
      offsetX = (containerW - renderW) / 2;
      offsetY = 0;
    }
    return { x: offsetX, y: offsetY, w: renderW, h: renderH };
  };

  // Real-Time Jitter-Free Computer Vision Motion Detection Loop
  useEffect(() => {
    const processFrame = () => {
      const overlayCanvas = overlayCanvasRef.current;
      const offscreen = offscreenCanvasRef.current;

      if (!overlayCanvas || !offscreen) {
        if (isPlaying) {
          animFrameIdRef.current = requestAnimationFrame(processFrame);
        }
        return;
      }

      // Jitter Prevention: Only resize canvas buffer if dimensions changed by more than 3px
      const targetW = Math.floor(overlayCanvas.clientWidth);
      const targetH = Math.floor(overlayCanvas.clientHeight);
      if (Math.abs(overlayCanvas.width - targetW) > 3 || Math.abs(overlayCanvas.height - targetH) > 3) {
        overlayCanvas.width = targetW;
        overlayCanvas.height = targetH;
      }

      const dispW = overlayCanvas.width;
      const dispH = overlayCanvas.height;
      if (dispW === 0 || dispH === 0) {
        if (isPlaying) animFrameIdRef.current = requestAnimationFrame(processFrame);
        return;
      }

      const overlayCtx = overlayCanvas.getContext('2d');
      const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
      const w = offscreen.width;
      const h = offscreen.height;

      // Clear overlay
      overlayCtx.clearRect(0, 0, dispW, dispH);

      // Compute exact video viewport (handles portrait & landscape videos without shaking)
      let vidBounds = { x: 0, y: 0, w: dispW, h: dispH };
      if (videoSource && videoRef.current && videoRef.current.videoWidth) {
        vidBounds = getVideoRenderBounds(
          dispW,
          dispH,
          videoRef.current.videoWidth,
          videoRef.current.videoHeight
        );
      }

      // Draw Geofence Guides aligned strictly with the video content
      drawGeofenceGuides(overlayCtx, vidBounds);

      let motionPixelsCount = 0;
      let minX = w, maxX = 0, minY = h, maxY = 0;
      let sumX = 0, sumY = 0;

      if (videoSource && videoRef.current && videoRef.current.readyState >= 2) {
        // Draw current video frame to offscreen analysis canvas
        offCtx.drawImage(videoRef.current, 0, 0, w, h);
        const currImageData = offCtx.getImageData(0, 0, w, h);
        const currData = currImageData.data;

        if (prevFrameDataRef.current) {
          const prevData = prevFrameDataRef.current;
          const len = currData.length;

          // Temporal Frame Differencing with high-pass noise filter
          for (let i = 0; i < len; i += 4) {
            const diff =
              Math.abs(currData[i] - prevData[i]) +
              Math.abs(currData[i + 1] - prevData[i + 1]) +
              Math.abs(currData[i + 2] - prevData[i + 2]);

            // Noise threshold: 55 filters out video sensor noise & compression flutter
            if (diff > 55) {
              motionPixelsCount++;
              const pixelIndex = i / 4;
              const px = pixelIndex % w;
              const py = Math.floor(pixelIndex / w);

              if (px < minX) minX = px;
              if (px > maxX) maxX = px;
              if (py < minY) minY = py;
              if (py > maxY) maxY = py;

              sumX += px;
              sumY += py;
            }
          }
        }

        prevFrameDataRef.current = new Uint8ClampedArray(currData);
      } else if (isPlaying && !videoSource) {
        // Synthetic Smooth Motion Simulator (for demo presets)
        const curT = videoRef.current ? videoRef.current.currentTime : 10;
        let simX = 0.35 + 0.012 * curT;
        let simY = 0.45 + 0.04 * Math.sin(curT * 1.5);

        if (activeScenarioKey === 'fall' && curT >= 12) {
          simY = Math.min(0.72, 0.45 + (curT - 12) * 0.08);
        } else if (activeScenarioKey === 'breach' && curT >= 15) {
          simX = Math.min(0.85, 0.5 + (curT - 15) * 0.025);
        }

        minX = simX * w - 15;
        maxX = simX * w + 15;
        minY = simY * h - 25;
        maxY = simY * h + 25;
        sumX = simX * w * 35;
        sumY = simY * h * 35;
        motionPixelsCount = 35;
      }

      // Calculate motion energy (percentage of moving pixels)
      const totalPixels = w * h;
      const energyPct = Math.min(100, Math.round((motionPixelsCount / (totalPixels * 0.25)) * 100));

      // Minimum cluster filter: at least 15 pixels to avoid noise flicker
      if (motionPixelsCount > 15) {
        const centroidX = sumX / motionPixelsCount;
        const centroidY = sumY / motionPixelsCount;

        // Calculate velocity
        let speed = 0;
        let deltaY = 0;
        if (prevCentroidRef.current) {
          const dx = centroidX - prevCentroidRef.current.x;
          const dy = centroidY - prevCentroidRef.current.y;
          deltaY = dy;
          speed = Math.sqrt(dx * dx + dy * dy);
        }
        prevCentroidRef.current = { x: centroidX, y: centroidY };

        // Map motion coordinates directly into the actual video viewport bounds
        const rawBoxX = vidBounds.x + (minX / w) * vidBounds.w;
        const rawBoxY = vidBounds.y + (minY / h) * vidBounds.h;
        const rawBoxW = Math.max(48, ((maxX - minX) / w) * vidBounds.w);
        const rawBoxH = Math.max(64, ((maxY - minY) / h) * vidBounds.h);

        // JITTER ELIMINATION: Exponential Moving Average (EMA) Smoothing
        if (!smoothedBoxRef.current) {
          smoothedBoxRef.current = { x: rawBoxX, y: rawBoxY, w: rawBoxW, h: rawBoxH };
        } else {
          const alpha = 0.24; // 76% previous + 24% current = perfectly smooth glide
          smoothedBoxRef.current.x += (rawBoxX - smoothedBoxRef.current.x) * alpha;
          smoothedBoxRef.current.y += (rawBoxY - smoothedBoxRef.current.y) * alpha;
          smoothedBoxRef.current.w += (rawBoxW - smoothedBoxRef.current.w) * alpha;
          smoothedBoxRef.current.h += (rawBoxH - smoothedBoxRef.current.h) * alpha;
        }

        const boxX = smoothedBoxRef.current.x;
        const boxY = smoothedBoxRef.current.y;
        const boxW = smoothedBoxRef.current.w;
        const boxH = smoothedBoxRef.current.h;

        // Motion trail tracking
        const dispCentroidX = vidBounds.x + (centroidX / w) * vidBounds.w;
        const dispCentroidY = vidBounds.y + (centroidY / h) * vidBounds.h;
        motionHistoryRef.current.push({ x: dispCentroidX, y: dispCentroidY });
        if (motionHistoryRef.current.length > 8) {
          motionHistoryRef.current.shift();
        }

        // Relative centroid inside the video bounds
        const normX = (centroidX / w);
        const normY = (centroidY / h);

        // Real-Time Risk Level Classification
        let detectedRisk = 'LOW RISK';
        let detectedStatus = 'Normal Gait / Active Motion';
        let strokeColor = '#10B981'; // Emerald
        let fillColor = 'rgba(16, 185, 129, 0.12)';

        // 1. Sudden Vertical Drop (Fall Detection)
        if (deltaY > 5.5 || normY > 0.74) {
          detectedRisk = 'CRITICAL RISK';
          detectedStatus = 'SUDDEN COLLAPSE / FALL DETECTED';
          strokeColor = '#EF4444';
          fillColor = 'rgba(239, 68, 68, 0.25)';
        }
        // 2. Restricted Geofence Traversal (Perimeter Highway Breach)
        else if (normX > 0.70) {
          detectedRisk = 'HIGH RISK';
          detectedStatus = 'RESTRICTED HIGHWAY PERIMETER BREACH';
          strokeColor = '#F43F5E';
          fillColor = 'rgba(244, 63, 94, 0.22)';
        }
        // 3. High Velocity Movement / Warning Buffer
        else if (speed > 7.5 || normX > 0.48) {
          detectedRisk = 'MEDIUM RISK';
          detectedStatus = 'HIGH VELOCITY / WARNING BUFFER';
          strokeColor = '#F59E0B';
          fillColor = 'rgba(245, 158, 11, 0.18)';
        } else if (energyPct < 4) {
          detectedRisk = 'NO RISK DETECTED';
          detectedStatus = 'Safe Stationary Presence';
          strokeColor = '#10B981';
          fillColor = 'rgba(16, 185, 129, 0.08)';
        }

        // Draw Bounding Box and Corner Targeting Brackets
        drawSmoothBoundingBox(overlayCtx, boxX, boxY, boxW, boxH, strokeColor, fillColor, detectedRisk);

        // Draw Centroid and Motion Trail
        drawCentroidAndTrail(overlayCtx, motionHistoryRef.current, strokeColor);

        // THROTTLED REACT STATE UPDATES (Run at max 4Hz / every 250ms to prevent React layout thrashing)
        const now = performance.now();
        if (now - lastStateUpdateRef.current > 250) {
          lastStateUpdateRef.current = now;
          setMotionEnergy(energyPct);
          setMotionVelocity(Math.round(speed * 10) / 10);
          setCurrentRisk(detectedRisk);
          setMotionStatus(detectedStatus);

          const riskWeights = { 'NO RISK DETECTED': 0, 'LOW RISK': 1, 'MEDIUM RISK': 2, 'HIGH RISK': 3, 'CRITICAL RISK': 4 };
          setMaxRiskDetected((prev) => (riskWeights[detectedRisk] > (riskWeights[prev] || 0) ? detectedRisk : prev));

          // Log anomaly to chronological feed (throttled to at most once per 2 seconds)
          if ((detectedRisk === 'HIGH RISK' || detectedRisk === 'CRITICAL RISK' || detectedRisk === 'MEDIUM RISK') && (now - lastEventLoggedTimeRef.current > 2000)) {
            lastEventLoggedTimeRef.current = now;
            const timeStr = formatSeconds(videoRef.current ? videoRef.current.currentTime : currentTime);
            setDetectedEvents((prev) => [
              {
                time: timeStr,
                text: `${detectedStatus} (Speed: ${(speed * 10).toFixed(0)} px/f)`,
                risk: detectedRisk
              },
              ...prev.slice(0, 15)
            ]);
          }
        }
      } else {
        // When motion stops, decay smoothed box gracefully
        if (smoothedBoxRef.current) {
          smoothedBoxRef.current = null;
        }
        const now = performance.now();
        if (now - lastStateUpdateRef.current > 300) {
          lastStateUpdateRef.current = now;
          setMotionEnergy(0);
          setMotionVelocity(0);
          setMotionStatus('Baseline Optical Scan (Zero Motion Detected)');
        }
      }

      if (isPlaying) {
        animFrameIdRef.current = requestAnimationFrame(processFrame);
      }
    };

    if (isPlaying) {
      animFrameIdRef.current = requestAnimationFrame(processFrame);
    } else {
      cancelAnimationFrame(animFrameIdRef.current);
    }

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPlaying, videoSource, activeScenarioKey]);

  // Canvas Drawing Helpers aligned with the active video viewport
  const drawGeofenceGuides = (ctx, b) => {
    ctx.save();
    // Safe Zone: Left 48%
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(b.x + 6, b.y + 6, b.w * 0.48, b.h - 12);

    ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';
    ctx.font = 'bold 9px JetBrains Mono, monospace';
    ctx.fillText('● SAFE AREA', b.x + 12, b.y + 20);

    // Warning Buffer: 48% to 70%
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
    ctx.strokeRect(b.x + b.w * 0.49, b.y + 6, b.w * 0.21, b.h - 12);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';
    ctx.fillText('▲ WARNING BUFFER', b.x + b.w * 0.50, b.y + 20);

    // Restricted Highway Gate: Right 30%
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.55)';
    ctx.strokeRect(b.x + b.w * 0.71, b.y + 6, b.w * 0.28, b.h - 12);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.fillText('🚨 HIGHWAY RESTRICTED', b.x + b.w * 0.72, b.y + 20);

    ctx.restore();
  };

  const drawSmoothBoundingBox = (ctx, x, y, w, h, strokeColor, fillColor, risk) => {
    ctx.save();
    // Background fill
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, w, h);

    // Border
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // High-tech CCTV Corner Targeting Brackets
    const cs = Math.min(12, w * 0.22);
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Top-Left
    ctx.moveTo(x, y + cs); ctx.lineTo(x, y); ctx.lineTo(x + cs, y);
    // Top-Right
    ctx.moveTo(x + w - cs, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cs);
    // Bottom-Left
    ctx.moveTo(x, y + h - cs); ctx.lineTo(x, y + h); ctx.lineTo(x + cs, y + h);
    // Bottom-Right
    ctx.moveTo(x + w - cs, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - cs);
    ctx.stroke();

    // Box HUD Tag Header
    const tagW = Math.max(150, Math.min(220, w));
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.fillRect(x, y - 20, tagW, 18);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y - 20, tagW, 18);

    ctx.fillStyle = strokeColor;
    ctx.font = 'bold 9px JetBrains Mono, monospace';
    ctx.fillText(`MOTION DETECTED [${risk}]`, x + 5, y - 7);
    ctx.restore();
  };

  const drawCentroidAndTrail = (ctx, history, color) => {
    if (!history || history.length === 0) return;
    ctx.save();

    // Draw smooth motion trail
    for (let i = 0; i < history.length; i++) {
      const pt = history[i];
      const alpha = (i + 1) / history.length;
      ctx.fillStyle = `rgba(34, 211, 238, ${alpha * 0.6})`;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Centroid reticle
    const last = history[history.length - 1];
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(last.x, last.y, 6, 0, Math.PI * 2);
    ctx.moveTo(last.x - 9, last.y); ctx.lineTo(last.x + 9, last.y);
    ctx.moveTo(last.x, last.y - 9); ctx.lineTo(last.x, last.y + 9);
    ctx.stroke();

    ctx.restore();
  };

  // Video time tracking
  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const c = videoRef.current.currentTime;
      setCurrentTime(c);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
      if (videoRef.current.ended) {
        setIsPlaying(false);
        setFinalResult({
          verdict: `Final Analysis Verdict: Maximum Risk Identified as ${maxRiskDetected}`,
          level: maxRiskDetected
        });
      }
    }
  };

  // Synthetic progress timer if running without uploaded video
  useEffect(() => {
    let interval = null;
    if (isPlaying && !videoSource) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.5;
          if (next >= duration) {
            setIsPlaying(false);
            setFinalResult({
              verdict: presetScenarios[activeScenarioKey]?.finalVerdict || `Analysis Complete: ${maxRiskDetected}`,
              level: maxRiskDetected
            });
            return duration;
          }
          return next;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, videoSource, duration, activeScenarioKey, maxRiskDetected]);

  const formatSeconds = (sec) => {
    const sInt = Math.floor(sec || 0);
    const m = Math.floor(sInt / 60);
    const s = Math.floor(sInt % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = Math.min(100, Math.round((currentTime / (duration || 30)) * 100));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Video className="w-7 h-7 text-indigo-600" />
            Optical Motion Detection & Risk Analysis Suite
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Real-time frame-differencing motion tracker, velocity vectors, geofence border checking, and automated risk scoring.
          </p>
        </div>

        {/* Upload Demo Video Button */}
        <div className="flex items-center gap-2">
          <label className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-bold text-white cursor-pointer transition flex items-center gap-2 shadow-md shadow-indigo-600/20">
            <Upload className="w-4 h-4" />
            <span>Upload Demo Video (MP4 / WebM)</span>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoUpload}
            />
          </label>
        </div>
      </div>

      {/* Main Video Analysis Suite Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Top Control Bar: Active Video & Scenario Picker */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 font-bold shadow-xs">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 truncate">{videoName}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  {videoSource ? 'Live Video File' : 'Optical Simulation'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>Computer Vision: <strong className="text-indigo-600 font-mono">Frame Differencing Active</strong></span>
                <span>•</span>
                <span className="truncate">Status: <strong className="text-slate-800">{motionStatus}</strong></span>
              </p>
            </div>
          </div>

          {/* Quick Scenario Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500">Presets:</span>
            <button
              onClick={() => {
                setActiveScenarioKey('breach');
                setVideoSource(null);
                setVideoName(presetScenarios.breach.name);
                handleReset();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                activeScenarioKey === 'breach'
                  ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              1. Perimeter Breach
            </button>

            <button
              onClick={() => {
                setActiveScenarioKey('fall');
                setVideoSource(null);
                setVideoName(presetScenarios.fall.name);
                handleReset();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                activeScenarioKey === 'fall'
                  ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              2. Fall & Posture Collapse
            </button>

            <button
              onClick={() => {
                setActiveScenarioKey('normal');
                setVideoSource(null);
                setVideoName(presetScenarios.normal.name);
                handleReset();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                activeScenarioKey === 'normal'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              3. Normal Safe Activity
            </button>
          </div>
        </div>

        {/* Video Player Container with Fixed Stable Height (Zero Layout Shaking) */}
        <div className="relative h-[400px] sm:h-[480px] w-full bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center select-none group border border-slate-300">
          {videoSource ? (
            <video
              ref={videoRef}
              src={videoSource}
              onTimeUpdate={handleVideoTimeUpdate}
              className="w-full h-full object-contain"
              playsInline
              muted
            />
          ) : (
            /* Synthetic Optical Backdrop if no file uploaded */
            <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E293B_1px,transparent_1px),linear-gradient(to_bottom,#1E293B_1px,transparent_1px)] bg-[size:32px_32px] opacity-40"></div>
              <div className="text-center space-y-2 z-10 px-4">
                <div className="inline-flex p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 mb-1 shadow-lg shadow-indigo-500/10">
                  <Crosshair className="w-8 h-8 text-indigo-400" />
                </div>
                <h4 className="font-black text-white text-base sm:text-lg tracking-tight">
                  {presetScenarios[activeScenarioKey]?.name}
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Upload any video file to test real pixel motion detection, or click Play to run the active demo scenario.
                </p>
              </div>
            </div>
          )}

          {/* REAL COMPUTER VISION OVERLAY CANVAS (Smooth Bounding Boxes, Centroids, Vectors, Geofences) */}
          <canvas
            ref={overlayCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
          />

          {/* Top Live Video Telemetry HUD */}
          <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none z-20">
            <span className="text-[10px] font-mono font-bold text-white bg-red-600 px-2.5 py-0.5 rounded-md flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              {isPlaying ? 'OPTICAL SCAN ACTIVE' : 'PAUSED'}
            </span>
            <span className="text-[10px] font-mono text-cyan-300 bg-black/70 px-2.5 py-0.5 rounded-md border border-cyan-800/40 backdrop-blur-xs">
              Motion Energy: {motionEnergy}%
            </span>
            <span className="text-[10px] font-mono text-indigo-300 bg-black/70 px-2.5 py-0.5 rounded-md border border-indigo-800/40 backdrop-blur-xs">
              Velocity: {motionVelocity} px/f
            </span>
          </div>

          <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-200 bg-black/70 px-2.5 py-0.5 rounded-md border border-slate-700 pointer-events-none z-20 backdrop-blur-xs">
            {formatSeconds(currentTime)} / {formatSeconds(duration)} ({progressPercent}%)
          </div>

          {/* Center Play/Pause Floating Action Button */}
          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-black/60 hover:bg-indigo-600 text-white flex items-center justify-center transition-all duration-200 backdrop-blur border border-white/20 shadow-xl cursor-pointer z-20 group-hover:scale-105"
            title={isPlaying ? 'Pause Analysis' : 'Play Analysis'}
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
          </button>
        </div>

        {/* Playback Controls & Progress Scrubber */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Timecode: <strong className="text-slate-800 font-mono">{formatSeconds(currentTime)} / {formatSeconds(duration)}</strong>
            </span>
            <span className="font-mono">
              Evaluated Frames: <strong className="text-indigo-700">{Math.round(currentTime * 30)}</strong> / {Math.round(duration * 30)}
            </span>
          </div>

          {/* Interactive Multi-Segment Risk Timeline Bar */}
          <div
            className="h-3.5 w-full bg-slate-200 rounded-full overflow-hidden flex cursor-pointer relative shadow-inner"
            title="Click anywhere on the timeline to inspect the video"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              const newTime = pct * duration;
              setCurrentTime(newTime);
              if (videoRef.current) videoRef.current.currentTime = newTime;
            }}
          >
            <div className="w-[35%] bg-emerald-500 h-full border-r border-white/30" title="Safe Recreation Area (00:00 - 00:10)"></div>
            <div className="w-[30%] bg-amber-400 h-full border-r border-white/30" title="Warning Buffer Area (00:10 - 00:20)"></div>
            <div className="w-[35%] bg-rose-500 h-full" title="Restricted Highway Gate (00:20 - 00:30)"></div>

            {/* Scrubber pointer */}
            <div
              style={{ left: `${progressPercent}%` }}
              className="absolute top-0 bottom-0 w-2 bg-slate-900 rounded-full shadow-md pointer-events-none transform -translate-x-1/2"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1.5 transition cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlaying ? 'Pause Analysis' : 'Resume Analysis'}
              </button>

              <button
                onClick={handleReset}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-600 flex items-center gap-1 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restart
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Safe (0-15)
              </span>
              <span className="flex items-center gap-1 text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Warning (16-60)
              </span>
              <span className="flex items-center gap-1 text-rose-700">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> High / Critical (61-100)
              </span>
            </div>
          </div>
        </div>

        {/* Real-Time Detection Telemetry Cards (Fixed min-height to prevent jitter) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* 1. Live Current Risk Level */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs min-h-[115px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Current AI Risk Level</span>
            <div className="my-2">
              <RiskBadge risk={currentRisk} size="lg" />
            </div>
            <p className="text-xs text-slate-500">
              Evaluated directly from pixel motion differencing, velocity vectors, and zone intersection.
            </p>
          </div>

          {/* 2. Motion Energy & Velocity Gauge */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs min-h-[115px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Motion Kinematics</span>
            <div className="flex items-baseline gap-2 my-2">
              <h4 className="text-3xl font-black text-indigo-700 font-mono">{motionVelocity} <span className="text-xs font-bold text-slate-400">px/f</span></h4>
              <span className="text-xs text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                Energy: {motionEnergy}%
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Centroid movement delta across consecutive video frames.
            </p>
          </div>

          {/* 3. Analysis Progress */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs min-h-[115px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Analysis Coverage</span>
            <div className="flex items-baseline gap-2 my-2">
              <h4 className="text-3xl font-black text-slate-900 font-mono">{progressPercent}%</h4>
              <span className="text-xs text-slate-500">({formatSeconds(currentTime)})</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div style={{ width: `${progressPercent}%` }} className="bg-indigo-600 h-full rounded-full transition-all duration-300"></div>
            </div>
          </div>
        </div>

        {/* Prominent Final Assessment Result Banner */}
        <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-all duration-500 ${
          (finalResult?.level || currentRisk).includes('NO')
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : (finalResult?.level || currentRisk).includes('MED')
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white shadow-xs shrink-0">
              {(finalResult?.level || currentRisk).includes('NO') ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-rose-600 animate-pulse" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {finalResult ? 'Final Assessment Verdict' : 'Active Real-Time Threat Evaluation'}
              </span>
              <h4 className="font-extrabold text-base sm:text-lg">
                {finalResult ? finalResult.verdict : `${currentRisk}: Real-time optical motion analysis active`}
              </h4>
            </div>
          </div>

          <div className="shrink-0">
            <RiskBadge risk={finalResult ? finalResult.level : currentRisk} size="lg" />
          </div>
        </div>

        {/* Detected Events Stream with Stable Fixed Container Height */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            Chronological Detected Events Feed ({detectedEvents.length})
          </h4>
          <div className="space-y-2 h-44 overflow-y-auto pr-1 border border-slate-100 rounded-xl p-2 bg-slate-50/50">
            {detectedEvents.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                No motion anomalies detected yet. Upload a video or play to start detection.
              </div>
            ) : (
              detectedEvents.map((ev, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                      {ev.time}
                    </span>
                    <span className="font-semibold text-slate-800">{ev.text}</span>
                  </div>
                  <RiskBadge risk={ev.risk} size="sm" showLabel={false} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Multi-Camera Live Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Synchronized Campus Camera Wall</h3>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            4 Active Feeds
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cameras.map((cam) => (
            <CameraCard
              key={cam.camera_code}
              camera={cam}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
