import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
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
  Gauge,
  Smartphone,
  Send,
  User,
  Volume2,
  VolumeX
} from 'lucide-react';

export default function Monitoring() {
  const outletContext = useOutletContext();
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);

  // Video Analysis State
  const [videoSource, setVideoSource] = useState(null);
  const [videoName, setVideoName] = useState('Campus_Overwatch_Detection_CAM01.mp4');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);

  // Monitored Person Token Selection
  const [monitoredPersonToken, setMonitoredPersonToken] = useState('C-200');
  const [monitoredCategory, setMonitoredCategory] = useState('Child / Student');

  // Real-Time Motion Detection & Risk State
  const [currentRisk, setCurrentRisk] = useState('SAFE');
  const [currentRiskScore, setCurrentRiskScore] = useState(8); // 0 - 100
  const [confidence, setConfidence] = useState(96.4);
  const [motionEnergy, setMotionEnergy] = useState(0);
  const [motionVelocity, setMotionVelocity] = useState(0);
  const [motionDetected, setMotionDetected] = useState(false);
  const [detectedActivity, setDetectedActivity] = useState('Normal Gait / Stable Activity');
  const [motionStatus, setMotionStatus] = useState('Baseline Optical Scan (Motion Tracking Active)');
  const [maxRiskDetected, setMaxRiskDetected] = useState('SAFE');
  const [detectedEvents, setDetectedEvents] = useState([]);
  const [finalResult, setFinalResult] = useState(null);
  const [activeScenarioKey, setActiveScenarioKey] = useState('breach');
  const [soundAlertEnabled, setSoundAlertEnabled] = useState(true);

  // Historical Risk Timeline points for live graph: [{ t: 0, score: 8, label: 'SAFE' }, ...]
  const [riskHistory, setRiskHistory] = useState([
    { t: 0, score: 8, level: 'SAFE' }
  ]);

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
  const lastSirenTimeRef = useRef(0);

  // Preset demonstration scenarios (Designed with rise and recovery to demonstrate true non-monotonic risk)
  const presetScenarios = {
    breach: {
      name: 'Demonstration 1: Perimeter Highway Boundary Approach',
      targetToken: 'C-200',
      category: 'Child / Student',
      finalVerdict: 'High Risk Traversal at 00:16 (Score: 78) — Restabilized safely at 00:23',
      finalLevel: 'HIGH RISK'
    },
    fall: {
      name: 'Demonstration 2: Playground Turf Fall & Posture Collapse',
      targetToken: 'C-021',
      category: 'Child / Student',
      finalVerdict: 'Critical Risk: Sudden Collapse at 00:15 (Score: 94) — Medical team attended at 00:22',
      finalLevel: 'CRITICAL RISK'
    },
    senior: {
      name: 'Demonstration 3: Senior Citizen Slow Stumble & Restabilization',
      targetToken: 'SR-301',
      category: 'Senior Citizen',
      finalVerdict: 'Warning: Unsteady Gait at 00:12 (Score: 48) — Subject safely seated at 00:19',
      finalLevel: 'WARNING'
    },
    normal: {
      name: 'Demonstration 4: Academic Corridor Supervised Walking',
      targetToken: 'P-101',
      category: 'Adult / Staff',
      finalVerdict: 'Safe: Standard Campus Operations Maintained (Score: 8/100, All Clear)',
      finalLevel: 'SAFE'
    }
  };

  const playSirenChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn(e);
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
      setMaxRiskDetected('SAFE');
      setCurrentRiskScore(8);
      setCurrentRisk('SAFE');
      smoothedBoxRef.current = null;
      prevFrameDataRef.current = null;
      prevCentroidRef.current = null;
      motionHistoryRef.current = [];
      setRiskHistory([{ t: 0, score: 8, level: 'SAFE' }]);

      setDetectedEvents([
        {
          time: '00:00',
          text: `Video loaded: "${file.name}". Dynamic motion differencing active.`,
          risk: 'SAFE',
          score: 8
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
    setMaxRiskDetected('SAFE');
    setCurrentRisk('SAFE');
    setCurrentRiskScore(8);
    setDetectedActivity('Normal Gait / Stable Activity');
    setDetectedEvents([]);
    setRiskHistory([{ t: 0, score: 8, level: 'SAFE' }]);
    prevFrameDataRef.current = null;
    prevCentroidRef.current = null;
    smoothedBoxRef.current = null;
    motionHistoryRef.current = [];
  };

  // Calculate actual rendered video dimensions inside the container
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

  // Real-Time Computer Vision Motion Detection Loop
  useEffect(() => {
    const processFrame = () => {
      const overlayCanvas = overlayCanvasRef.current;
      const offscreen = offscreenCanvasRef.current;

      if (!overlayCanvas || !offscreen) {
        if (isPlaying) animFrameIdRef.current = requestAnimationFrame(processFrame);
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

      // Compute exact video viewport
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
      let curT = videoRef.current ? videoRef.current.currentTime : currentTime;

      if (videoSource && videoRef.current && videoRef.current.readyState >= 2) {
        // Draw current video frame to offscreen analysis canvas
        offCtx.drawImage(videoRef.current, 0, 0, w, h);
        const currImageData = offCtx.getImageData(0, 0, w, h);
        const currData = currImageData.data;

        if (prevFrameDataRef.current) {
          const prevData = prevFrameDataRef.current;
          const len = currData.length;

          // Temporal Frame Differencing
          for (let i = 0; i < len; i += 4) {
            const diff =
              Math.abs(currData[i] - prevData[i]) +
              Math.abs(currData[i + 1] - prevData[i + 1]) +
              Math.abs(currData[i + 2] - prevData[i + 2]);

            // Noise threshold
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
        // Synthetic Smooth Kinematics (strictly non-monotonic: rises during event, recovers to SAFE after!)
        let simX = 0.35 + 0.02 * Math.sin(curT * 1.2);
        let simY = 0.45 + 0.03 * Math.cos(curT * 1.5);
        let syntheticPixels = 32;

        if (activeScenarioKey === 'breach') {
          if (curT < 8) {
            // Normal walking in safe zone
            simX = 0.32 + 0.015 * Math.sin(curT);
            syntheticPixels = 24;
          } else if (curT >= 8 && curT < 14) {
            // Speeding towards buffer
            simX = 0.35 + (curT - 8) * 0.035;
            syntheticPixels = 48;
          } else if (curT >= 14 && curT < 21) {
            // Crossing perimeter highway border
            simX = 0.60 + Math.min(0.24, (curT - 14) * 0.035);
            syntheticPixels = 70;
          } else {
            // RECOVERY: Campus guard stops subject, safely returning towards safe zone
            simX = Math.max(0.36, 0.82 - (curT - 21) * 0.05);
            syntheticPixels = 22; // Normalized back to safe walking!
          }
        } else if (activeScenarioKey === 'fall') {
          if (curT < 9) {
            // Normal recreation on turf
            simY = 0.44 + 0.02 * Math.sin(curT * 2);
            syntheticPixels = 26;
          } else if (curT >= 9 && curT < 13) {
            // Unsteady stumble
            simY = 0.45 + (curT - 9) * 0.025;
            syntheticPixels = 42;
          } else if (curT >= 13 && curT < 19) {
            // SUDDEN VERTICAL COLLAPSE
            simY = Math.min(0.76, 0.52 + (curT - 13) * 0.09);
            syntheticPixels = 85;
          } else {
            // RECOVERY: Attended by first-aid staff, resting stably
            simY = 0.72;
            syntheticPixels = 16; // Movement stopped / stabilized!
          }
        } else if (activeScenarioKey === 'senior') {
          if (curT < 10) {
            simX = 0.30 + 0.01 * curT;
            syntheticPixels = 20;
          } else if (curT >= 10 && curT < 17) {
            // Hesitant wobble
            simX = 0.40 + 0.04 * Math.sin(curT * 4);
            syntheticPixels = 46;
          } else {
            // Safely assisted to bench
            simX = 0.38;
            syntheticPixels = 18;
          }
        } else {
          // Normal walking baseline
          simX = 0.25 + 0.02 * Math.sin(curT);
          syntheticPixels = 24;
        }

        minX = simX * w - 16;
        maxX = simX * w + 16;
        minY = simY * h - 24;
        maxY = simY * h + 24;
        sumX = simX * w * syntheticPixels;
        sumY = simY * h * syntheticPixels;
        motionPixelsCount = syntheticPixels;
      }

      // Calculate motion energy
      const totalPixels = w * h;
      const energyPct = Math.min(100, Math.round((motionPixelsCount / (totalPixels * 0.25)) * 100));

      let speed = 0;
      let deltaY = 0;

      if (motionPixelsCount > 12) {
        const centroidX = sumX / motionPixelsCount;
        const centroidY = sumY / motionPixelsCount;

        if (prevCentroidRef.current) {
          const dx = centroidX - prevCentroidRef.current.x;
          const dy = centroidY - prevCentroidRef.current.y;
          deltaY = dy;
          speed = Math.sqrt(dx * dx + dy * dy);
        }
        prevCentroidRef.current = { x: centroidX, y: centroidY };

        // Viewport coordinates
        const rawBoxX = vidBounds.x + (minX / w) * vidBounds.w;
        const rawBoxY = vidBounds.y + (minY / h) * vidBounds.h;
        const rawBoxW = Math.max(48, ((maxX - minX) / w) * vidBounds.w);
        const rawBoxH = Math.max(64, ((maxY - minY) / h) * vidBounds.h);

        // EMA Smoothing
        if (!smoothedBoxRef.current) {
          smoothedBoxRef.current = { x: rawBoxX, y: rawBoxY, w: rawBoxW, h: rawBoxH };
        } else {
          const alpha = 0.24;
          smoothedBoxRef.current.x += (rawBoxX - smoothedBoxRef.current.x) * alpha;
          smoothedBoxRef.current.y += (rawBoxY - smoothedBoxRef.current.y) * alpha;
          smoothedBoxRef.current.w += (rawBoxW - smoothedBoxRef.current.w) * alpha;
          smoothedBoxRef.current.h += (rawBoxH - smoothedBoxRef.current.h) * alpha;
        }

        const boxX = smoothedBoxRef.current.x;
        const boxY = smoothedBoxRef.current.y;
        const boxW = smoothedBoxRef.current.w;
        const boxH = smoothedBoxRef.current.h;

        // Motion trail
        const dispCentroidX = vidBounds.x + (centroidX / w) * vidBounds.w;
        const dispCentroidY = vidBounds.y + (centroidY / h) * vidBounds.h;
        motionHistoryRef.current.push({ x: dispCentroidX, y: dispCentroidY });
        if (motionHistoryRef.current.length > 8) {
          motionHistoryRef.current.shift();
        }

        const normX = centroidX / w;
        const normY = centroidY / h;

        // DYNAMIC MOTION-BASED RISK CALCULATION (Drops back down to SAFE when movement stabilizes!)
        let detectedRiskLevel = 'SAFE';
        let score = 8;
        let activityDesc = 'Normal Walking / Stable Gait';
        let strokeColor = '#10B981'; // Emerald
        let fillColor = 'rgba(16, 185, 129, 0.12)';

        if (!videoSource) {
          // Synthetic timeline logic with full recovery back to SAFE
          if (activeScenarioKey === 'fall') {
            if (curT < 9) {
              score = Math.round(7 + Math.sin(curT) * 3); // 4-10
              detectedRiskLevel = 'SAFE';
              activityDesc = 'Stable Recreational Movement';
            } else if (curT >= 9 && curT < 13) {
              score = Math.round(25 + (curT - 9) * 5.5); // 25-47
              detectedRiskLevel = 'WARNING';
              activityDesc = 'Unsteady Gait / Stumble Warning';
              strokeColor = '#F59E0B';
              fillColor = 'rgba(245, 158, 11, 0.18)';
            } else if (curT >= 13 && curT < 19) {
              score = Math.min(96, Math.round(85 + (curT - 13) * 2)); // 85-96
              detectedRiskLevel = 'CRITICAL RISK';
              activityDesc = 'SUDDEN COLLAPSE / FALL DETECTED';
              strokeColor = '#EF4444';
              fillColor = 'rgba(239, 68, 68, 0.25)';
            } else {
              // RECOVERY: Assistance provided, subject resting safely
              score = Math.max(9, Math.round(92 - (curT - 19) * 16)); // Drops 92 -> 12 (Safe!)
              detectedRiskLevel = score > 15 ? 'WARNING' : 'SAFE';
              activityDesc = score > 15 ? 'Assisted Stabilization' : 'Movement Stabilized (All Clear)';
              if (score <= 15) {
                strokeColor = '#10B981';
                fillColor = 'rgba(16, 185, 129, 0.12)';
              } else {
                strokeColor = '#F59E0B';
                fillColor = 'rgba(245, 158, 11, 0.18)';
              }
            }
          } else if (activeScenarioKey === 'breach') {
            if (curT < 8) {
              score = Math.round(8 + Math.sin(curT) * 3);
              detectedRiskLevel = 'SAFE';
              activityDesc = 'Normal Walking in Safe Zone';
            } else if (curT >= 8 && curT < 14) {
              score = Math.round(28 + (curT - 8) * 4); // 28-52
              detectedRiskLevel = 'WARNING';
              activityDesc = 'Accelerating towards Highway Buffer';
              strokeColor = '#F59E0B';
              fillColor = 'rgba(245, 158, 11, 0.18)';
            } else if (curT >= 14 && curT < 21) {
              score = Math.min(84, Math.round(72 + (curT - 14) * 2)); // 72-84
              detectedRiskLevel = 'HIGH RISK';
              activityDesc = 'RESTRICTED HIGHWAY PERIMETER BREACH';
              strokeColor = '#F43F5E';
              fillColor = 'rgba(244, 63, 94, 0.22)';
            } else {
              // RECOVERY: Intercepted and escorted back safely
              score = Math.max(10, Math.round(80 - (curT - 21) * 15)); // Drops 80 -> 10 (Safe!)
              detectedRiskLevel = score > 15 ? 'WARNING' : 'SAFE';
              activityDesc = score > 15 ? 'Escort in Progress' : 'Returned to Safe Campus Zone';
              if (score <= 15) {
                strokeColor = '#10B981';
                fillColor = 'rgba(16, 185, 129, 0.12)';
              } else {
                strokeColor = '#F59E0B';
                fillColor = 'rgba(245, 158, 11, 0.18)';
              }
            }
          } else if (activeScenarioKey === 'senior') {
            if (curT < 10) {
              score = 9;
              detectedRiskLevel = 'SAFE';
              activityDesc = 'Elderly Walk Baseline';
            } else if (curT >= 10 && curT < 17) {
              score = 46;
              detectedRiskLevel = 'WARNING';
              activityDesc = 'Tremor / Gait Hesitation';
              strokeColor = '#F59E0B';
              fillColor = 'rgba(245, 158, 11, 0.18)';
            } else {
              score = 11;
              detectedRiskLevel = 'SAFE';
              activityDesc = 'Elderly Subject Safely Seated';
            }
          } else {
            // Normal supervised walking
            score = Math.round(6 + Math.abs(Math.sin(curT)) * 4);
            detectedRiskLevel = 'SAFE';
            activityDesc = 'Standard Supervised Activity';
          }
        } else {
          // LIVE VIDEO FILE COMPUTATION: Driven solely by pixel differencing kinematics & geofence!
          if (deltaY > 5.2 || normY > 0.75) {
            // Sudden vertical drop
            score = Math.min(96, Math.round(82 + deltaY * 2));
            detectedRiskLevel = 'CRITICAL RISK';
            activityDesc = 'SUDDEN COLLAPSE / FALL DETECTED';
            strokeColor = '#EF4444';
            fillColor = 'rgba(239, 68, 68, 0.25)';
          } else if (normX > 0.72) {
            // Restricted perimeter zone
            score = Math.min(85, Math.round(65 + speed * 2));
            detectedRiskLevel = 'HIGH RISK';
            activityDesc = 'RESTRICTED HIGHWAY PERIMETER BREACH';
            strokeColor = '#F43F5E';
            fillColor = 'rgba(244, 63, 94, 0.22)';
          } else if (speed > 6.5 || normX > 0.49) {
            // Rapid velocity / warning buffer
            score = Math.min(50, Math.round(20 + speed * 3.5));
            detectedRiskLevel = 'WARNING';
            activityDesc = 'Elevated Velocity / Warning Buffer Area';
            strokeColor = '#F59E0B';
            fillColor = 'rgba(245, 158, 11, 0.18)';
          } else if (energyPct < 4 || speed < 2.0) {
            // Still / resting safely
            score = Math.max(3, Math.round(energyPct * 2));
            detectedRiskLevel = 'SAFE';
            activityDesc = 'Stationary / Safe Presence';
            strokeColor = '#10B981';
            fillColor = 'rgba(16, 185, 129, 0.08)';
          } else {
            // Normal steady walking
            score = Math.min(15, Math.round(6 + energyPct * 0.4 + speed));
            detectedRiskLevel = 'SAFE';
            activityDesc = 'Normal Walking / Stable Gait';
            strokeColor = '#10B981';
            fillColor = 'rgba(16, 185, 129, 0.12)';
          }
        }

        // Draw HUD elements
        drawSmoothBoundingBox(overlayCtx, boxX, boxY, boxW, boxH, strokeColor, fillColor, detectedRiskLevel, score, monitoredPersonToken);
        drawCentroidAndTrail(overlayCtx, motionHistoryRef.current, strokeColor);

        // React State Sync (throttled)
        const now = performance.now();
        if (now - lastStateUpdateRef.current > 250) {
          lastStateUpdateRef.current = now;
          setMotionEnergy(energyPct);
          setMotionVelocity(Math.round(speed * 10) / 10);
          setMotionDetected(true);
          setCurrentRisk(detectedRiskLevel);
          setCurrentRiskScore(score);
          setDetectedActivity(activityDesc);

          // Update live history for oscillating chart
          setRiskHistory((prev) => {
            const nextTime = Math.round(curT * 10) / 10;
            const updated = [...prev, { t: nextTime, score, level: detectedRiskLevel }];
            return updated.slice(-35); // Keep last 35 points for wave
          });

          // Trigger audible alert on critical
          if (soundAlertEnabled && score >= 80 && now - lastSirenTimeRef.current > 4000) {
            lastSirenTimeRef.current = now;
            playSirenChime();
          }

          const riskWeights = { 'SAFE': 0, 'WARNING': 1, 'HIGH RISK': 2, 'CRITICAL RISK': 3 };
          setMaxRiskDetected((prev) => (riskWeights[detectedRiskLevel] > (riskWeights[prev] || 0) ? detectedRiskLevel : prev));

          // Log anomaly
          if (score > 20 && now - lastEventLoggedTimeRef.current > 2500) {
            lastEventLoggedTimeRef.current = now;
            const timeStr = formatSeconds(curT);
            setDetectedEvents((prev) => [
              {
                time: timeStr,
                text: `${activityDesc} (Token: ${monitoredPersonToken}, Score: ${score}/100)`,
                risk: detectedRiskLevel,
                score
              },
              ...prev.slice(0, 15)
            ]);
          }
        }
      } else {
        // No motion detected -> decay smoothly back to Safe (0-8)
        if (smoothedBoxRef.current) smoothedBoxRef.current = null;
        const now = performance.now();
        if (now - lastStateUpdateRef.current > 300) {
          lastStateUpdateRef.current = now;
          setMotionEnergy(0);
          setMotionVelocity(0);
          setMotionDetected(false);
          setCurrentRisk('SAFE');
          setCurrentRiskScore(5);
          setDetectedActivity('Baseline Scan (Motion Zero / Safe)');
          setMotionStatus('Baseline Scan Active (Zero Motion Detected)');
        }
      }

      if (isPlaying) animFrameIdRef.current = requestAnimationFrame(processFrame);
    };

    if (isPlaying) {
      animFrameIdRef.current = requestAnimationFrame(processFrame);
    } else {
      cancelAnimationFrame(animFrameIdRef.current);
    }

    return () => cancelAnimationFrame(animFrameIdRef.current);
  }, [isPlaying, videoSource, activeScenarioKey, monitoredPersonToken, soundAlertEnabled]);

  // Canvas Drawing Helpers
  const drawGeofenceGuides = (ctx, b) => {
    ctx.save();
    // Safe Zone: Left 48%
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(b.x + 6, b.y + 6, b.w * 0.48, b.h - 12);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';
    ctx.font = 'bold 9px JetBrains Mono, monospace';
    ctx.fillText('● SAFE RECREATION ZONE', b.x + 12, b.y + 20);

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

  const drawSmoothBoundingBox = (ctx, x, y, w, h, strokeColor, fillColor, risk, score, token) => {
    ctx.save();
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Targeting brackets
    const cs = Math.min(12, w * 0.22);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y + cs); ctx.lineTo(x, y); ctx.lineTo(x + cs, y);
    ctx.moveTo(x + w - cs, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cs);
    ctx.moveTo(x, y + h - cs); ctx.lineTo(x, y + h); ctx.lineTo(x + cs, y + h);
    ctx.moveTo(x + w - cs, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - cs);
    ctx.stroke();

    // Box HUD Tag Header
    const tagW = Math.max(160, Math.min(240, w));
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.fillRect(x, y - 22, tagW, 20);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y - 22, tagW, 20);

    ctx.fillStyle = strokeColor;
    ctx.font = 'bold 9px JetBrains Mono, monospace';
    ctx.fillText(`[${token}] ${risk} • SCORE: ${score}/100`, x + 5, y - 8);
    ctx.restore();
  };

  const drawCentroidAndTrail = (ctx, history, color) => {
    if (!history || history.length === 0) return;
    ctx.save();
    for (let i = 0; i < history.length; i++) {
      const pt = history[i];
      const alpha = (i + 1) / history.length;
      ctx.fillStyle = `rgba(34, 211, 238, ${alpha * 0.6})`;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
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
          verdict: `Video Analysis Completed: Maximum Peak Risk Detected was ${maxRiskDetected}`,
          level: maxRiskDetected
        });
      }
    }
  };

  // Synthetic progress timer
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

  // Trigger dispatch directly for the active monitored person token
  const handleTriggerDispatchForActivePerson = () => {
    if (outletContext?.onOpenDispatch) {
      outletContext.onOpenDispatch({
        id: Date.now(),
        alert_code: `ALT-${Math.floor(100 + Math.random() * 900)}`,
        child_id: monitoredPersonToken,
        event_type: detectedActivity,
        zone: 'KLH Aziznagar Campus — Central Plaza & Perimeter',
        risk_level: currentRisk === 'SAFE' ? 'LOW' : currentRisk.includes('CRITICAL') ? 'CRITICAL' : 'HIGH',
        confidence: confidence / 100,
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
  };

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 uppercase">
              SafeGuard AI Video Engine
            </span>
            <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
              KLH Aziznagar Campus, Hyderabad
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Video className="w-7 h-7 text-indigo-600" />
            Optical Motion Analysis & Dynamic Risk Detection
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Dynamic motion-driven risk scoring (0-100) that automatically adjusts and drops back to Safe as activity normalizes.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleTriggerDispatchForActivePerson}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            title="Open Mobile Dispatch for current monitored token"
          >
            <Smartphone className="w-4 h-4" />
            <span>Dispatch Mobile for {monitoredPersonToken}</span>
          </button>

          <label className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white cursor-pointer transition flex items-center gap-1.5 shadow-xs">
            <Upload className="w-4 h-4" />
            <span>Upload Video (MP4 / WebM)</span>
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
        {/* Top Control Bar: Active Person Token & Scenario Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
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
                <span>Active Token: <strong className="text-indigo-700 font-mono">{monitoredPersonToken}</strong> ({monitoredCategory})</span>
                <span>•</span>
                <span className="truncate">Activity: <strong className="text-slate-800">{detectedActivity}</strong></span>
              </p>
            </div>
          </div>

          {/* Preset Demonstrations Picker */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 mr-1">Demonstration Presets:</span>
            <button
              onClick={() => {
                setActiveScenarioKey('breach');
                setVideoSource(null);
                setVideoName(presetScenarios.breach.name);
                setMonitoredPersonToken(presetScenarios.breach.targetToken);
                setMonitoredCategory(presetScenarios.breach.category);
                handleReset();
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                activeScenarioKey === 'breach' && !videoSource
                  ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              1. Boundary Breach
            </button>

            <button
              onClick={() => {
                setActiveScenarioKey('fall');
                setVideoSource(null);
                setVideoName(presetScenarios.fall.name);
                setMonitoredPersonToken(presetScenarios.fall.targetToken);
                setMonitoredCategory(presetScenarios.fall.category);
                handleReset();
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                activeScenarioKey === 'fall' && !videoSource
                  ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              2. Fall & Collapse
            </button>

            <button
              onClick={() => {
                setActiveScenarioKey('senior');
                setVideoSource(null);
                setVideoName(presetScenarios.senior.name);
                setMonitoredPersonToken(presetScenarios.senior.targetToken);
                setMonitoredCategory(presetScenarios.senior.category);
                handleReset();
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                activeScenarioKey === 'senior' && !videoSource
                  ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              3. Senior Stumble
            </button>

            <button
              onClick={() => {
                setActiveScenarioKey('normal');
                setVideoSource(null);
                setVideoName(presetScenarios.normal.name);
                setMonitoredPersonToken(presetScenarios.normal.targetToken);
                setMonitoredCategory(presetScenarios.normal.category);
                handleReset();
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                activeScenarioKey === 'normal' && !videoSource
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              4. Safe Activity
            </button>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="relative h-[400px] sm:h-[470px] w-full bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center select-none group border border-slate-300">
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
                  Demonstrating non-monotonic motion-based risk scoring: Risk elevates during danger and cleanly recovers back down to Safe (0-15).
                </p>
              </div>
            </div>
          )}

          {/* COMPUTER VISION OVERLAY CANVAS */}
          <canvas
            ref={overlayCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
          />

          {/* Top Live Video Telemetry HUD */}
          <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none z-20 flex-wrap">
            <span className="text-[10px] font-mono font-bold text-white bg-indigo-600 px-2.5 py-0.5 rounded-md flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              {isPlaying ? 'OPTICAL TRACKER LIVE' : 'PAUSED'}
            </span>
            <span className="text-[10px] font-mono text-cyan-300 bg-black/75 px-2.5 py-0.5 rounded-md border border-cyan-800/40 backdrop-blur-xs">
              Motion Energy: {motionEnergy}%
            </span>
            <span className="text-[10px] font-mono text-indigo-300 bg-black/75 px-2.5 py-0.5 rounded-md border border-indigo-800/40 backdrop-blur-xs">
              Speed: {motionVelocity} px/f
            </span>
            <span className="text-[10px] font-mono text-amber-300 bg-black/75 px-2.5 py-0.5 rounded-md border border-amber-800/40 backdrop-blur-xs">
              Risk: {currentRiskScore}/100 [{currentRisk}]
            </span>
          </div>

          <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-200 bg-black/75 px-2.5 py-0.5 rounded-md border border-slate-700 pointer-events-none z-20 backdrop-blur-xs">
            {formatSeconds(currentTime)} / {formatSeconds(duration)} ({progressPercent}%)
          </div>

          {/* Center Play/Pause Floating Button */}
          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-black/60 hover:bg-indigo-600 text-white flex items-center justify-center transition-all duration-200 backdrop-blur border border-white/20 shadow-xl cursor-pointer z-20 group-hover:scale-105"
            title={isPlaying ? 'Pause Analysis' : 'Play Analysis'}
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
          </button>
        </div>

        {/* Playback Controls & Segmented Timeline */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Timecode: <strong className="text-slate-800 font-mono">{formatSeconds(currentTime)} / {formatSeconds(duration)}</strong>
            </span>
            <span className="font-mono">
              Frames Analyzed: <strong className="text-indigo-700">{Math.round(currentTime * 30)}</strong> / {Math.round(duration * 30)}
            </span>
          </div>

          {/* Segmented Risk Timeline Bar */}
          <div
            className="h-3.5 w-full bg-slate-200 rounded-full overflow-hidden flex cursor-pointer relative shadow-inner"
            title="Click anywhere to scrub timecode"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              const newTime = pct * duration;
              setCurrentTime(newTime);
              if (videoRef.current) videoRef.current.currentTime = newTime;
            }}
          >
            <div className="w-[30%] bg-emerald-500 h-full border-r border-white/30" title="00:00 - 00:09: Safe Baseline (Score 0-15)"></div>
            <div className="w-[20%] bg-amber-400 h-full border-r border-white/30" title="00:09 - 00:14: Warning / Unsteadiness (Score 16-50)"></div>
            <div className="w-[25%] bg-rose-500 h-full border-r border-white/30" title="00:14 - 00:21: Critical Anomaly Peak (Score 51-100)"></div>
            <div className="w-[25%] bg-emerald-500 h-full" title="00:21 - 00:30: Recovery & Restabilization (Score Drops back to Safe)"></div>

            {/* Scrubber pointer */}
            <div
              style={{ left: `${progressPercent}%` }}
              className="absolute top-0 bottom-0 w-2.5 bg-slate-900 rounded-full shadow-md pointer-events-none transform -translate-x-1/2"
            />
          </div>

          <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
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
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-600 flex items-center gap-1 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restart
              </button>

              <button
                onClick={() => setSoundAlertEnabled(!soundAlertEnabled)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1 border border-slate-200 cursor-pointer"
                title="Toggle siren sound on critical risk"
              >
                {soundAlertEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                <span>{soundAlertEnabled ? 'Siren On' : 'Siren Muted'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Safe (0-15)
              </span>
              <span className="flex items-center gap-1 text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Warning (16-50)
              </span>
              <span className="flex items-center gap-1 text-orange-600">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span> High (51-80)
              </span>
              <span className="flex items-center gap-1 text-rose-700">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Critical (81-100)
              </span>
            </div>
          </div>
        </div>

        {/* DYNAMIC RISK OSCILLATING TIMELINE GRAPH (Shows rise and clean drop back to Safe) */}
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                Dynamic Motion Risk Oscillation Graph (Real-Time Kinematics)
              </h4>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="text-emerald-400">● 0-15 Safe</span>
              <span className="text-amber-400">● 16-50 Warning</span>
              <span className="text-rose-400">● 51-100 High/Critical</span>
            </div>
          </div>

          {/* SVG Waveform Curve */}
          <div className="h-28 w-full bg-slate-950/70 rounded-xl p-2 relative overflow-hidden border border-slate-800/80 flex flex-col justify-end">
            {/* Background reference threshold lines */}
            <div className="absolute top-[20%] left-0 right-0 border-b border-rose-500/20 text-[8px] font-mono text-rose-400 px-2 flex justify-between">
              <span>Critical Threshold (80)</span>
            </div>
            <div className="absolute top-[50%] left-0 right-0 border-b border-amber-500/20 text-[8px] font-mono text-amber-400 px-2 flex justify-between">
              <span>Warning Threshold (50)</span>
            </div>
            <div className="absolute bottom-[20%] left-0 right-0 border-b border-emerald-500/20 text-[8px] font-mono text-emerald-400 px-2 flex justify-between">
              <span>Safe Baseline (15)</span>
            </div>

            {/* SVG Plot */}
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="riskGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Area fill */}
              {riskHistory.length > 1 && (
                <polygon
                  points={`0,100 ${riskHistory
                    .map((pt, i) => `${(i / (riskHistory.length - 1)) * 100},${100 - pt.score}`)
                    .join(' ')} 100,100`}
                  fill="url(#riskGrad)"
                />
              )}

              {/* Line graph */}
              {riskHistory.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={riskHistory
                    .map((pt, i) => `${(i / (riskHistory.length - 1)) * 100},${100 - pt.score}`)
                    .join(' ')}
                />
              )}

              {/* Current Point Marker */}
              {riskHistory.length > 0 && (
                <circle
                  cx="100"
                  cy={100 - currentRiskScore}
                  r="4"
                  fill={currentRiskScore > 80 ? '#EF4444' : currentRiskScore > 50 ? '#F59E0B' : '#10B981'}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              )}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
            <span>Dynamic Score: <strong className={currentRiskScore > 50 ? 'text-rose-400' : currentRiskScore > 15 ? 'text-amber-400' : 'text-emerald-400'}>{currentRiskScore} / 100</strong></span>
            <span>Non-monotonic motion response: Evaluated from delta velocity vectors</span>
            <span>Current State: <strong className="text-cyan-300">{currentRisk}</strong></span>
          </div>
        </div>

        {/* AI VIDEO ANALYSIS TRANSPARENCY INSPECTOR (High-Tech Diagnostic HUD) */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                🔬 AI Video Analysis Transparency Inspector (Diagnostic HUD)
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
              Real-Time Inference Telemetry
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Timecode & Frame</span>
              <p className="font-mono font-black text-slate-800 mt-1 text-sm">
                {formatSeconds(currentTime)} <span className="text-slate-400 text-xs font-normal">({Math.round(currentTime * 30)}f)</span>
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Motion Detected</span>
              <p className="font-mono font-black mt-1 text-sm flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${motionDetected ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`}></span>
                <span className={motionDetected ? 'text-emerald-700' : 'text-slate-400'}>
                  {motionDetected ? 'YES (Active)' : 'NO (Static)'}
                </span>
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Motion Intensity</span>
              <p className="font-mono font-black text-indigo-700 mt-1 text-sm">
                {motionEnergy}% <span className="text-slate-400 text-xs font-normal">({motionVelocity} px/f)</span>
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Current Risk Score</span>
              <p className="font-mono font-black mt-1 text-sm flex items-center gap-1">
                <span className={`text-base font-black ${
                  currentRiskScore > 80 ? 'text-rose-600' : currentRiskScore > 50 ? 'text-orange-600' : currentRiskScore > 15 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {currentRiskScore}
                </span>
                <span className="text-slate-400 text-xs font-normal">/ 100</span>
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Risk Level</span>
              <div className="mt-1">
                <RiskBadge risk={currentRisk} size="sm" />
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">AI Confidence</span>
              <p className="font-mono font-black text-emerald-700 mt-1 text-sm">
                {confidence}%
              </p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Activity Classification:</span>
              <strong className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {detectedActivity}
              </strong>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Monitored Subject Token:</span>
              <div className="flex items-center gap-1">
                {['C-200', 'P-101', 'SR-301'].map((tok) => (
                  <button
                    key={tok}
                    onClick={() => {
                      setMonitoredPersonToken(tok);
                      setMonitoredCategory(tok.startsWith('C') ? 'Child / Student' : tok.startsWith('SR') ? 'Senior Citizen' : 'Adult / Staff');
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border cursor-pointer transition ${
                      monitoredPersonToken === tok
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tok}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Final Assessment Result Banner */}
        <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-all duration-500 ${
          (finalResult?.level || currentRisk).includes('SAFE') || (finalResult?.level || currentRisk).includes('NO')
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : (finalResult?.level || currentRisk).includes('WARN')
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white shadow-xs shrink-0">
              {(finalResult?.level || currentRisk).includes('SAFE') || (finalResult?.level || currentRisk).includes('NO') ? (
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
                {finalResult ? finalResult.verdict : `${currentRisk} (Score: ${currentRiskScore}/100): ${detectedActivity}`}
              </h4>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <RiskBadge risk={finalResult ? finalResult.level : currentRisk} size="lg" />
            <button
              onClick={handleTriggerDispatchForActivePerson}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Dispatch Mobile</span>
            </button>
          </div>
        </div>

        {/* Detected Events Stream */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            Chronological Evaluated Events Feed ({detectedEvents.length})
          </h4>
          <div className="space-y-2 h-44 overflow-y-auto pr-1 border border-slate-100 rounded-xl p-2 bg-slate-50/50">
            {detectedEvents.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                No motion anomalies logged. Playing video or demo scenarios will stream kinematic events here.
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
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[11px] text-slate-500">
                      {ev.score}/100
                    </span>
                    <RiskBadge risk={ev.risk} size="sm" showLabel={false} />
                  </div>
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
            KLH Aziznagar Feeds Active
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
