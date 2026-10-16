/**
 * ERDENIS Tactical Radar & Autonomous UAV Evasion Simulator
 * High-performance 2D Canvas Engine simulating Reinforcement Learning
 * vs Conventional Potential Field evasion maneuvers.
 */

(function () {
  'use strict';

  // Audio Synthesizer via Web Audio API
  class TacticalAudio {
    constructor() {
      this.enabled = true;
      this.ctx = null;
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContextClass();
      }
    }

    playRadarPing() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
      } catch (e) {
        // Audio error suppression
      }
    }

    playThreatWarning() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(750, this.ctx.currentTime);
        osc.frequency.setValueAtTime(950, this.ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.16);
      } catch (e) {
        // Audio error suppression
      }
    }

    playEvasionWhoosh() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.4);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
      } catch (e) {
        // Audio error suppression
      }
    }

    playSuccessChime() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.06);

          gain.gain.setValueAtTime(0.05, now + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.06);
          osc.stop(now + i * 0.06 + 0.25);
        });
      } catch (e) {
        // Audio error suppression
      }
    }

    playHitExplosion() {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.5);

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
      } catch (e) {
        // Audio error suppression
      }
    }
  }

  // Simulation State
  const audio = new TacticalAudio();

  const SIM_CONFIG = {
    canvasWidth: 800,
    canvasHeight: 560,
    rangeKm: 15.0,
    radarSweepSpeed: 0.025,
    uavBaseSpeed: 2.2,
    missileSpeed: 4.8,
    droneSpeed: 3.2,
    maxGLoadRL: 8.4,
    maxGLoadConventional: 11.2 // Violates envelope!
  };

  let canvas, ctx;
  let sweepAngle = 0;
  let currentMode = 'rl'; // 'rl' or 'conventional'
  let lastTime = performance.now();

  // Statistics
  let stats = {
    total: 0,
    success: 0,
    hits: 0
  };

  // Entities
  let uav = {
    x: 400,
    y: 280,
    vx: 0,
    vy: -SIM_CONFIG.uavBaseSpeed,
    angle: -Math.PI / 2,
    targetAngle: -Math.PI / 2,
    baseY: 280,
    evading: false,
    evasionTimer: 0,
    trail: [],
    flares: [],
    currentG: 1.2
  };

  let threats = [];
  let explosions = [];

  // DOM Elements
  let elThreatAlert, elSuccessAlert, elModeLabel;
  let telThreatDist, telClosingSpeed, telUavSpeed, telGLoad, telEnvelope, telChaff;
  let scoreTotal, scoreSuccess, scoreHits;

  // Initialize Canvas & Event Listeners
  function initSimulator() {
    canvas = document.getElementById('radarCanvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Cache DOM Elements
    elThreatAlert = document.getElementById('radarThreatAlert');
    elSuccessAlert = document.getElementById('radarSuccessAlert');
    elModeLabel = document.getElementById('current-mode-label');

    telThreatDist = document.getElementById('tel-threat-dist');
    telClosingSpeed = document.getElementById('tel-closing-speed');
    telUavSpeed = document.getElementById('tel-uav-speed');
    telGLoad = document.getElementById('tel-gload');
    telEnvelope = document.getElementById('tel-envelope');
    telChaff = document.getElementById('tel-chaff');

    scoreTotal = document.getElementById('score-total');
    scoreSuccess = document.getElementById('score-success');
    scoreHits = document.getElementById('score-hits');

    setupControls();

    // Start Simulation Loop
    requestAnimationFrame(renderLoop);
  }

  function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width || 800;
    canvas.height = rect.height || 560;
    SIM_CONFIG.canvasWidth = canvas.width;
    SIM_CONFIG.canvasHeight = canvas.height;
    if (uav) {
      uav.x = canvas.width / 2;
      uav.y = canvas.height / 2;
      uav.baseY = canvas.height / 2;
    }
  }

  function setupControls() {
    // Mode Buttons
    const btnRl = document.getElementById('btn-mode-rl');
    const btnConv = document.getElementById('btn-mode-conventional');

    if (btnRl && btnConv) {
      btnRl.addEventListener('click', () => {
        audio.init();
        currentMode = 'rl';
        btnRl.classList.add('active');
        btnConv.classList.remove('active');
        if (elModeLabel) elModeLabel.textContent = 'DEEP REINFORCEMENT LEARNING';
      });

      btnConv.addEventListener('click', () => {
        audio.init();
        currentMode = 'conventional';
        btnConv.classList.add('active');
        btnRl.classList.remove('active');
        if (elModeLabel) elModeLabel.textContent = 'CONVENTIONAL POTENTIAL FIELD';
      });
    }

    // Threat Spawners
    const btnSam = document.getElementById('btn-spawn-sam');
    const btnUav = document.getElementById('btn-spawn-interceptor');
    const btnPincer = document.getElementById('btn-spawn-pincer');
    const btnReset = document.getElementById('btn-sim-reset');

    if (btnSam) {
      btnSam.addEventListener('click', () => {
        audio.init();
        spawnSAM();
      });
    }

    if (btnUav) {
      btnUav.addEventListener('click', () => {
        audio.init();
        spawnInterceptor();
      });
    }

    if (btnPincer) {
      btnPincer.addEventListener('click', () => {
        audio.init();
        spawnPincerAttack();
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        resetSimulation();
      });
    }

    // Sound Toggle
    const btnSound = document.getElementById('btn-toggle-sound');
    const soundState = document.getElementById('sound-state');
    if (btnSound && soundState) {
      btnSound.addEventListener('click', () => {
        audio.init();
        audio.enabled = !audio.enabled;
        soundState.textContent = audio.enabled ? 'ON' : 'OFF';
        btnSound.style.opacity = audio.enabled ? '1' : '0.6';
      });
    }

    // Canvas click to spawn threat at designated coordinate
    canvas.addEventListener('click', (e) => {
      audio.init();
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      spawnThreatAt(clickX, clickY, 'SAM Missile', SIM_CONFIG.missileSpeed, '#ef4444');
    });
  }

  // Threat Spawning Logic
  function spawnSAM() {
    // Spawns from random perimeter corner
    const side = Math.floor(Math.random() * 4);
    let x, y;
    if (side === 0) { x = Math.random() * canvas.width; y = 20; }
    else if (side === 1) { x = canvas.width - 20; y = Math.random() * canvas.height; }
    else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height - 20; }
    else { x = 20; y = Math.random() * canvas.height; }

    spawnThreatAt(x, y, 'SAM Mach 3.5', SIM_CONFIG.missileSpeed, '#ef4444');
  }

  function spawnInterceptor() {
    const x = Math.random() > 0.5 ? 40 : canvas.width - 40;
    const y = Math.random() * (canvas.height * 0.6) + 40;
    spawnThreatAt(x, y, 'Adversarial Drone', SIM_CONFIG.droneSpeed, '#f59e0b');
  }

  function spawnPincerAttack() {
    // Spawns two threats from opposing quadrants
    spawnThreatAt(40, 60, 'Pincer Lead (SAM)', SIM_CONFIG.missileSpeed, '#ef4444');
    setTimeout(() => {
      spawnThreatAt(canvas.width - 40, canvas.height - 60, 'Pincer Flank (UAV)', SIM_CONFIG.droneSpeed, '#f59e0b');
    }, 450);
  }

  function spawnThreatAt(x, y, name, speed, color) {
    stats.total++;
    updateScores();

    const threat = {
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      x: x,
      y: y,
      speed: speed,
      color: color,
      radius: 6,
      trail: [],
      active: true,
      spoofed: false,
      lockTimer: 0
    };

    threats.push(threat);
    audio.playThreatWarning();
    showThreatAlert(`WARNING: INCOMING ${name.toUpperCase()} THREAT VECTOR`);
  }

  function showThreatAlert(text) {
    if (!elThreatAlert) return;
    const textEl = document.getElementById('threatAlertText');
    if (textEl) textEl.textContent = text;
    elThreatAlert.classList.remove('hidden');
    if (elSuccessAlert) elSuccessAlert.classList.add('hidden');
  }

  function showSuccessAlert(text) {
    if (!elSuccessAlert) return;
    const textEl = document.getElementById('successAlertText');
    if (textEl) textEl.textContent = text;
    elSuccessAlert.classList.remove('hidden');
    if (elThreatAlert) elThreatAlert.classList.add('hidden');

    setTimeout(() => {
      if (elSuccessAlert) elSuccessAlert.classList.add('hidden');
    }, 3800);
  }

  function resetSimulation() {
    threats = [];
    explosions = [];
    uav.flares = [];
    uav.trail = [];
    uav.x = canvas.width / 2;
    uav.y = canvas.height / 2;
    uav.angle = -Math.PI / 2;
    uav.targetAngle = -Math.PI / 2;
    uav.evading = false;
    uav.currentG = 1.2;

    if (elThreatAlert) elThreatAlert.classList.add('hidden');
    if (elSuccessAlert) elSuccessAlert.classList.add('hidden');

    updateTelemetry(null);
  }

  function updateScores() {
    if (scoreTotal) scoreTotal.textContent = stats.total;
    if (scoreSuccess) scoreSuccess.textContent = stats.success;
    if (scoreHits) scoreHits.textContent = stats.hits;
  }

  // Evasion Decision Policy Execution
  function executeEvasionDecision(closestThreat, dist) {
    const dx = closestThreat.x - uav.x;
    const dy = closestThreat.y - uav.y;
    const threatAngle = Math.atan2(dy, dx);

    if (currentMode === 'rl') {
      // ERDENIS Deep Reinforcement Learning Agent:
      // Evaluates optimal tangential break-turn vector perpendicular to threat line-of-sight
      // Constrained within max G-force limit (8.4G)
      uav.evading = true;
      uav.currentG = 6.8 + Math.sin(Date.now() / 200) * 1.4;

      // Decide evasive breakout direction (left or right wing)
      const evadeAngle = threatAngle + Math.PI / 2 + (Math.sin(Date.now() / 300) * 0.4);
      uav.targetAngle = evadeAngle;

      // Auto-deploy countermeasures (chaff/flares) when within critical envelope
      if (dist < 180 && Math.random() < 0.22) {
        deployFlares();
        closestThreat.spoofed = true; // Missile guidance diverted by thermal decoys
      }

      if (dist < 220) {
        audio.playEvasionWhoosh();
      }

    } else {
      // Conventional Baseline (Artificial Potential Field):
      // Simple repulsive vector directly away from threat
      // Prone to oscillation, excessive G-load, or getting cornered
      uav.evading = true;
      const repelAngle = Math.atan2(-dy, -dx);
      uav.targetAngle = repelAngle;
      uav.currentG = 10.4; // Violates safety envelope!
    }
  }

  function deployFlares() {
    for (let i = 0; i < 4; i++) {
      uav.flares.push({
        x: uav.x + (Math.random() - 0.5) * 14,
        y: uav.y + (Math.random() - 0.5) * 14,
        vx: (Math.random() - 0.5) * 4 - Math.cos(uav.angle) * 2,
        vy: (Math.random() - 0.5) * 4 - Math.sin(uav.angle) * 2,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.02
      });
    }
  }

  // Update UAV & Threats Physics
  function updatePhysics(dt) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // UAV Heading Lerp
    let angleDiff = uav.targetAngle - uav.angle;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

    const turnRate = currentMode === 'rl' ? 0.08 : 0.04;
    uav.angle += angleDiff * turnRate;

    // UAV Velocity
    const speed = uav.evading ? SIM_CONFIG.uavBaseSpeed * 1.45 : SIM_CONFIG.uavBaseSpeed;
    uav.vx = Math.cos(uav.angle) * speed;
    uav.vy = Math.sin(uav.angle) * speed;

    uav.x += uav.vx;
    uav.y += uav.vy;

    // Boundaries Containment (soft bounce towards radar center)
    const margin = 80;
    if (uav.x < margin || uav.x > canvas.width - margin || uav.y < margin || uav.y > canvas.height - margin) {
      const returnAngle = Math.atan2(centerY - uav.y, centerX - uav.x);
      uav.targetAngle = returnAngle;
    }

    // UAV Trail
    uav.trail.push({ x: uav.x, y: uav.y, alpha: 1.0 });
    if (uav.trail.length > 35) uav.trail.shift();
    uav.trail.forEach(p => p.alpha -= 0.025);

    // Update Flares
    for (let i = uav.flares.length - 1; i >= 0; i--) {
      const f = uav.flares[i];
      f.x += f.vx;
      f.y += f.vy;
      f.life -= f.decay;
      if (f.life <= 0) uav.flares.splice(i, 1);
    }

    // Find closest threat
    let closestThreat = null;
    let minDist = Infinity;

    for (let i = threats.length - 1; i >= 0; i--) {
      const t = threats[i];
      if (!t.active) continue;

      let targetX = uav.x;
      let targetY = uav.y;

      // If spoofed by flares in RL mode, missile targets flare decoy cluster
      if (t.spoofed && uav.flares.length > 0) {
        targetX = uav.flares[0].x;
        targetY = uav.flares[0].y;
      }

      // Missile Guidance (Proportional Navigation)
      const tdx = targetX - t.x;
      const tdy = targetY - t.y;
      const tDist = Math.hypot(tdx, tdy);
      const tAngle = Math.atan2(tdy, tdx);

      t.x += Math.cos(tAngle) * t.speed;
      t.y += Math.sin(tAngle) * t.speed;

      t.trail.push({ x: t.x, y: t.y, alpha: 0.9 });
      if (t.trail.length > 25) t.trail.shift();
      t.trail.forEach(tp => tp.alpha -= 0.035);

      // Check distance to UAV
      const distToUav = Math.hypot(uav.x - t.x, uav.y - t.y);
      if (distToUav < minDist) {
        minDist = distToUav;
        closestThreat = t;
      }

      // Collision Detection
      if (distToUav < 18) {
        // Impact occurred
        t.active = false;
        createExplosion(uav.x, uav.y, '#ef4444', 35);
        audio.playHitExplosion();

        if (currentMode === 'rl') {
          // Extremely rare in RL mode
          stats.hits++;
        } else {
          // Frequent in conventional mode
          stats.hits++;
          showThreatAlert('COLLISION: CONVENTIONAL POTENTIAL FIELD FAILED TO BREAK LOCK');
        }
        updateScores();
        threats.splice(i, 1);
        continue;
      }

      // Check if threat bypassed / evaded
      // When a threat gets close and then moves past or is spoofed beyond range
      if (tDist < 80 && t.spoofed) {
        t.active = false;
        createExplosion(t.x, t.y, '#f59e0b', 16);
        audio.playSuccessChime();
        stats.success++;
        updateScores();
        showSuccessAlert('EVASION SUCCESSFUL: REINFORCEMENT LEARNING DECOY DEPLOYED');
        threats.splice(i, 1);
        continue;
      }

      // Threat out of radar boundaries
      if (t.x < -40 || t.x > canvas.width + 40 || t.y < -40 || t.y > canvas.height + 40) {
        t.active = false;
        stats.success++;
        updateScores();
        audio.playSuccessChime();
        showSuccessAlert('THREAT NEUTRALIZED: TRAJECTORY OVERSHOT ENVELOPE');
        threats.splice(i, 1);
        continue;
      }
    }

    // Execute Evasion if threat active
    if (closestThreat && minDist < 320) {
      executeEvasionDecision(closestThreat, minDist);
      updateTelemetry(closestThreat, minDist);
    } else {
      uav.evading = false;
      uav.currentG = 1.0 + Math.sin(Date.now() / 400) * 0.15;
      // Gentle mission patrol loop
      uav.targetAngle += 0.008;
      updateTelemetry(null, null);
    }

    // Update Explosions
    for (let i = explosions.length - 1; i >= 0; i--) {
      const exp = explosions[i];
      exp.life -= 0.025;
      exp.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
      });
      if (exp.life <= 0) explosions.splice(i, 1);
    }
  }

  function createExplosion(x, y, color, count) {
    const particles = [];
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = Math.random() * 5 + 1;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        color: color,
        size: Math.random() * 3 + 1.5
      });
    }
    explosions.push({ particles, life: 1.0 });
  }

  function updateTelemetry(threat, dist) {
    if (!telThreatDist) return;

    if (threat && dist != null) {
      const km = ((dist / canvas.width) * SIM_CONFIG.rangeKm).toFixed(1);
      telThreatDist.textContent = `${km} KM`;
      telThreatDist.className = dist < 120 ? 'tel-val font-mono text-red' : 'tel-val font-mono text-amber';

      const vc = (threat.speed * 180 + 320).toFixed(0);
      telClosingSpeed.textContent = `${vc} M/S`;

      telGLoad.textContent = `${uav.currentG.toFixed(1)} G`;
      if (currentMode === 'conventional' && uav.currentG > 9.0) {
        telGLoad.className = 'tel-val font-mono text-red';
        telEnvelope.textContent = 'WARNING: G-OVERLOAD (11.2G)';
        telEnvelope.className = 'tel-val font-mono text-red';
      } else {
        telGLoad.className = 'tel-val font-mono text-cyan';
        telEnvelope.textContent = 'OPTIMAL (100%)';
        telEnvelope.className = 'tel-val font-mono text-green';
      }

      telChaff.textContent = uav.flares.length > 0 ? 'DEPLOYING COUNTERMEASURES' : 'READY / ENGAGED';
    } else {
      telThreatDist.textContent = 'NO THREAT';
      telThreatDist.className = 'tel-val font-mono text-green';
      telClosingSpeed.textContent = '0 M/S';
      telGLoad.textContent = `${uav.currentG.toFixed(1)} G`;
      telGLoad.className = 'tel-val font-mono text-cyan';
      telEnvelope.textContent = 'NOMINAL (100%)';
      telEnvelope.className = 'tel-val font-mono text-green';
      telChaff.textContent = 'MONITORING AIRSPACE';
    }
  }

  // Drawing Pipeline
  function drawRadarBackground() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const maxRadius = Math.min(cx, cy) - 20;

    // Outer dark radar disc
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#050c1b';
    ctx.fill();

    // Concentric Range Rings
    const rings = [0.33, 0.66, 1.0];
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
    ctx.lineWidth = 1;

    rings.forEach(r => {
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius * r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx - maxRadius, cy);
    ctx.lineTo(cx + maxRadius, cy);
    ctx.moveTo(cx, cy - maxRadius);
    ctx.lineTo(cx, cy + maxRadius);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
    ctx.stroke();

    // Radar Sweep Beam
    sweepAngle += SIM_CONFIG.radarSweepSpeed;
    if (sweepAngle > Math.PI * 2) sweepAngle -= Math.PI * 2;

    const sweepGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius);
    sweepGrad.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
    sweepGrad.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, maxRadius, sweepAngle - 0.25, sweepAngle);
    ctx.closePath();
    ctx.fillStyle = sweepGrad;
    ctx.fill();

    // Sweep Front Line
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sweepAngle) * maxRadius, cy + Math.sin(sweepAngle) * maxRadius);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  function drawUAV() {
    ctx.save();
    ctx.translate(uav.x, uav.y);
    ctx.rotate(uav.angle);

    // UAV Flight Trail
    uav.trail.forEach((p, idx) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x - uav.x, p.y - uav.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 240, 255, ${p.alpha * 0.4})`;
      ctx.fill();
      ctx.restore();
    });

    // Tactical Delta Wing Sprite
    ctx.beginPath();
    ctx.moveTo(14, 0);       // Nose
    ctx.lineTo(-10, -10);   // Left Wingtip
    ctx.lineTo(-6, -3);     // Inset
    ctx.lineTo(-12, 0);     // Engine Exhaust
    ctx.lineTo(-6, 3);      // Inset
    ctx.lineTo(-10, 10);    // Right Wingtip
    ctx.closePath();

    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Afterburner Glow when evading
    if (uav.evading) {
      ctx.beginPath();
      ctx.arc(-14, 0, 5 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 15;
      ctx.fill();
    }

    ctx.restore();

    // Draw Flares
    uav.flares.forEach(f => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(f.x, f.y, 3 * f.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245, 158, 11, ${f.life})`;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
    });
  }

  function drawThreats() {
    threats.forEach(t => {
      // Trail
      t.trail.forEach(tp => {
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(239, 68, 68, ${tp.alpha * 0.4})`;
        ctx.fill();
      });

      // Threat Icon
      ctx.save();
      ctx.translate(t.x, t.y);

      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = t.color;
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 10;
      ctx.fill();

      // Threat Lock Ring
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(239, 68, 68, 0.6)`;
      ctx.setLineDash([3, 3]);
      ctx.stroke();

      // Label
      ctx.font = '10px JetBrains Mono';
      ctx.fillStyle = '#fca5a5';
      ctx.fillText(t.name, 14, 4);

      ctx.restore();
    });
  }

  function drawExplosions() {
    explosions.forEach(exp => {
      exp.particles.forEach(p => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * exp.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = exp.life;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      });
    });
  }

  // Main Render Loop
  function renderLoop(time) {
    const dt = (time - lastTime) / 1000;
    lastTime = time;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawRadarBackground();
    updatePhysics(dt);
    drawThreats();
    drawUAV();
    drawExplosions();

    requestAnimationFrame(renderLoop);
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSimulator);
  } else {
    initSimulator();
  }

})();
