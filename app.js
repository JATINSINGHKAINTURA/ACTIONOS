// app.js — ActionOS Core Engine: Navigation, State, Copilot Chatbot, Time Management & Motion
// State passes cleanly between pages via sessionStorage under key "actionos_tasks".

const STORAGE_KEY = "actionos_tasks";
const ENGINE_KEY = "actionos_engine";
const SOURCE_KEY = "actionos_source_text";
const CHAT_HISTORY_KEY = "actionos_chat_history";
const TIMER_STATE_KEY = "actionos_timer_state";

// ---------- Persistence Utilities ----------
function saveTasks(tasks) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function getActiveEngine() {
  return sessionStorage.getItem(ENGINE_KEY) || "offline";
}

function setActiveEngine(engine) {
  sessionStorage.setItem(ENGINE_KEY, engine);
}

function priorityBadge(priority) {
  const span = document.createElement("span");
  const pri = (priority || "MEDIUM").toLowerCase();
  span.className = `badge badge-${pri}`;
  span.textContent = priority || "MEDIUM";
  return span;
}

function priorityRank(p) {
  return { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }[p] ?? 4;
}

// Sample presets for quick testing
const PRESETS = {
  hackathon: "Submit the hackathon registration by 3:00 PM today — this is urgent. Complete the README with setup instructions by 5:00 PM. Record a short demo video showing the app working; this is medium priority. Review the action plan checklist before the final submission. When you have time, polish the presentation slides — low priority, only if time remains.",
  launch: "Deploy the v1.2 release candidate to staging by 11:00 AM tomorrow. Conduct regression smoke tests immediately; this is urgent. Notify beta customers with release highlights by end of day. Prepare documentation updates and schedule the marketing announcement for Friday — medium priority.",
  exec: "Review the quarterly executive board deck before 4:00 PM today — this is high priority. Submit revised departmental budget forecasts right away. Send confirmation email to stakeholders once finalized. Organize team Q&A session next week."
};

// ============================================================================
// 1. SCROLL MOTION & INTERSECTION OBSERVER
// ============================================================================
function initScrollMotion() {
  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  reveals.forEach((el) => observer.observe(el));
}

// ============================================================================
// 2. SOUNDSCAPE SYNTHESIZER & AUDIO FEEDBACK (100% Web Audio API)
// ============================================================================
const SoundEngine = {
  ctx: null,
  activeSource: null,
  gainNode: null,
  volume: 0.25,

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.value = this.volume;
        this.gainNode.connect(this.ctx.destination);
      }
    }
  },

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }
  },

  playChime(type = "start") {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      gain.connect(this.ctx.destination);
      gain.gain.value = this.volume * 0.35;

      const now = this.ctx.currentTime;
      if (type === "start") {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      } else if (type === "complete") {
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.12);
        osc.frequency.setValueAtTime(783.99, now + 0.24);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      }
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch {
      // Audio autoplay handled gracefully
    }
  },

  playAmbient(type) {
    this.stopAmbient();
    if (type === "off") return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    if (type === "drone") {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 800;

      osc.type = "sine";
      osc.frequency.value = 432;
      osc.connect(filter);
      filter.connect(this.gainNode);
      osc.start();
      this.activeSource = osc;
      return;
    }

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === "brown") {
        lastOut = (lastOut + 0.02 * white) / 1.02;
        output[i] = lastOut * 3.5;
      } else if (type === "pink") {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      } else {
        output[i] = white * 0.1;
      }
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = type === "brown" ? 450 : 1200;

    whiteNoise.connect(filter);
    filter.connect(this.gainNode);
    whiteNoise.start();
    this.activeSource = whiteNoise;
  },

  stopAmbient() {
    if (this.activeSource) {
      try {
        this.activeSource.stop();
        this.activeSource.disconnect();
      } catch {}
      this.activeSource = null;
    }
  }
};

// ============================================================================
// 3. TIME MANAGEMENT SUITE (Focus Sprint Timer & Timeline)
// ============================================================================
let timerInterval = null;
let timerSecondsLeft = 25 * 60;
let timerIsRunning = false;
let timerMode = "focus"; // "focus" (25m) or "break" (5m)

function startFocusSprint(durationMinutes, taskTitle) {
  const timerDisplay = document.getElementById("timer-display");
  const timerToggleBtn = document.getElementById("timer-toggle-btn");
  const timerStatusLabel = document.getElementById("timer-status-label");
  const timerModeBadge = document.getElementById("timer-mode-badge");

  clearInterval(timerInterval);
  timerSecondsLeft = durationMinutes * 60;
  timerMode = "focus";
  timerIsRunning = true;

  if (timerStatusLabel) timerStatusLabel.textContent = taskTitle ? `Active Sprint: ${taskTitle}` : "Focus Sprint";
  if (timerModeBadge) {
    timerModeBadge.textContent = `${durationMinutes}m Focus`;
    timerModeBadge.className = "badge badge-urgent";
  }

  const mins = Math.floor(timerSecondsLeft / 60);
  const secs = timerSecondsLeft % 60;
  if (timerDisplay) timerDisplay.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  if (timerToggleBtn) timerToggleBtn.textContent = "Pause";

  SoundEngine.playChime("start");

  const section = document.getElementById("time-management-section") || document.querySelector(".time-suite-card");
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
    section.style.outline = "2px solid var(--accent)";
    setTimeout(() => { section.style.outline = "none"; }, 1500);
  }

  timerInterval = setInterval(() => {
    if (timerSecondsLeft > 0) {
      timerSecondsLeft--;
      const m = Math.floor(timerSecondsLeft / 60);
      const s = timerSecondsLeft % 60;
      if (timerDisplay) timerDisplay.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    } else {
      clearInterval(timerInterval);
      timerIsRunning = false;
      if (timerToggleBtn) timerToggleBtn.textContent = "Start Focus";
      SoundEngine.playChime("complete");
      alert("🎯 Focus sprint completed! Excellent work.");
    }
  }, 1000);
}

function initTimeManagement() {
  const timerDisplay = document.getElementById("timer-display");
  const timerToggleBtn = document.getElementById("timer-toggle-btn");
  const timerResetBtn = document.getElementById("timer-reset-btn");
  const timerSwitchModeBtn = document.getElementById("timer-switch-mode-btn");
  const timerModeBadge = document.getElementById("timer-mode-badge");
  const timerStatusLabel = document.getElementById("timer-status-label");
  const openPomodoroRailBtn = document.getElementById("open-pomodoro-btn");
  const openStudioRailBtn = document.getElementById("open-studio-btn");

  function scrollToStudio() {
    const section = document.getElementById("time-management-section") || document.querySelector(".time-suite-card");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      section.style.outline = "2px solid var(--accent)";
      setTimeout(() => { section.style.outline = "none"; }, 1500);
    }
  }

  if (openPomodoroRailBtn) openPomodoroRailBtn.addEventListener("click", scrollToStudio);
  if (openStudioRailBtn) openStudioRailBtn.addEventListener("click", scrollToStudio);

  if (!timerDisplay || !timerToggleBtn) return;

  function updateTimerUI() {
    const mins = Math.floor(timerSecondsLeft / 60);
    const secs = timerSecondsLeft % 60;
    timerDisplay.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    if (timerToggleBtn) {
      timerToggleBtn.textContent = timerIsRunning ? "Pause" : (timerSecondsLeft === (timerMode === "focus" ? 1500 : 300) ? (timerMode === "focus" ? "Start Focus" : "Start Break") : "Resume");
    }
  }

  timerToggleBtn.addEventListener("click", () => {
    if (timerIsRunning) {
      clearInterval(timerInterval);
      timerIsRunning = false;
      updateTimerUI();
    } else {
      timerIsRunning = true;
      SoundEngine.playChime("start");
      updateTimerUI();
      timerInterval = setInterval(() => {
        if (timerSecondsLeft > 0) {
          timerSecondsLeft--;
          updateTimerUI();
        } else {
          clearInterval(timerInterval);
          timerIsRunning = false;
          updateTimerUI();
          SoundEngine.playChime("complete");
          alert(timerMode === "focus" ? "🎯 Focus sprint complete! Take a well-earned 5-minute break." : "⚡ Break finished! Ready for the next action sprint?");
        }
      }, 1000);
    }
  });

  if (timerResetBtn) {
    timerResetBtn.addEventListener("click", () => {
      clearInterval(timerInterval);
      timerIsRunning = false;
      timerSecondsLeft = timerMode === "focus" ? 25 * 60 : 5 * 60;
      updateTimerUI();
    });
  }

  if (timerSwitchModeBtn) {
    timerSwitchModeBtn.addEventListener("click", () => {
      clearInterval(timerInterval);
      timerIsRunning = false;
      if (timerMode === "focus") {
        timerMode = "break";
        timerSecondsLeft = 5 * 60;
        timerSwitchModeBtn.textContent = "Switch to 25m Focus";
        if (timerModeBadge) {
          timerModeBadge.textContent = "5m Break";
          timerModeBadge.className = "badge badge-low";
        }
        if (timerStatusLabel) timerStatusLabel.textContent = "Rest & Reset";
      } else {
        timerMode = "focus";
        timerSecondsLeft = 25 * 60;
        timerSwitchModeBtn.textContent = "Switch to 5m Break";
        if (timerModeBadge) {
          timerModeBadge.textContent = "25m Focus";
          timerModeBadge.className = "badge badge-medium";
        }
        if (timerStatusLabel) timerStatusLabel.textContent = "Sprint Interval Countdown";
      }
      updateTimerUI();
    });
  }

  updateTimerUI();
}

// Ambient Audio Synthesizer Controls
function initAmbientAudio() {
  const toggleContainer = document.getElementById("ambient-audio-toggles");
  const volSlider = document.getElementById("ambient-vol-slider");

  if (toggleContainer) {
    const buttons = toggleContainer.querySelectorAll(".ambient-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const sound = btn.dataset.sound || "off";
        SoundEngine.playAmbient(sound);
      });
    });
  }

  if (volSlider) {
    volSlider.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value) / 100;
      SoundEngine.setVolume(val);
    });
  }
}

// ============================================================================
// 4. EXECUTABLE TIME MANAGEMENT STUDIO & GENERATOR
// ============================================================================
const TIMETABLE_STORAGE_KEY = "actionos_timetable_plan";

function loadTimetablePlan() {
  try {
    return JSON.parse(sessionStorage.getItem(TIMETABLE_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function saveTimetablePlan(plan) {
  sessionStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(plan));
}

function renderEnergyChart(analytics, schedule) {
  const container = document.getElementById("svg-chart-container");
  const statsSummary = document.getElementById("chart-stats-summary");
  if (!container) return;

  if (statsSummary) {
    statsSummary.innerHTML = `
      <div class="chart-stat-item">
        <span class="chart-stat-num">${analytics?.totalHours || 6}h</span>
        <span class="chart-stat-label">Total Duration</span>
      </div>
      <div class="chart-stat-item">
        <span class="chart-stat-num" style="color: var(--accent-light);">${analytics?.deepWorkBlocks || 4}</span>
        <span class="chart-stat-label">Deep Work Blocks</span>
      </div>
      <div class="chart-stat-item">
        <span class="chart-stat-num" style="color: var(--urgent);">${analytics?.peakHour || "10:00 AM"}</span>
        <span class="chart-stat-label">Peak Performance</span>
      </div>
      <div class="chart-stat-item">
        <span class="chart-stat-num" style="color: var(--success);">${analytics?.bufferMinutes || 40}m</span>
        <span class="chart-stat-label">Cognitive Buffer</span>
      </div>
    `;
  }

  const items = schedule || [];
  if (items.length === 0) {
    container.innerHTML = '<p class="empty-state">Generate a schedule to view energy and workload distribution.</p>';
    return;
  }

  const width = 640;
  const height = 180;
  const padding = { top: 22, right: 24, bottom: 36, left: 36 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const barWidth = Math.min(48, Math.max(20, (chartWidth / items.length) * 0.65));

  let barsSvg = "";
  let points = [];

  items.forEach((item, idx) => {
    const x = padding.left + (idx + 0.5) * (chartWidth / items.length);
    const energyVal = item.energyLevel || (item.isBreak ? 20 : 75);
    const barHeight = (energyVal / 100) * chartHeight;
    const y = padding.top + (chartHeight - barHeight);

    points.push({ x, y });
    const color = item.isBreak ? "#64748b" : (energyVal >= 80 ? "#6366f1" : energyVal >= 60 ? "#10b981" : "#f59e0b");

    barsSvg += `
      <g class="chart-bar-group">
        <rect x="${x - barWidth / 2}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="${color}" fill-opacity="0.85" />
        <text x="${x}" y="${height - 10}" fill="#94a3b8" font-size="10" text-anchor="middle" font-family="monospace">${item.startTime}</text>
        <text x="${x}" y="${y - 4}" fill="#f1f5f9" font-size="10" font-weight="600" text-anchor="middle">${energyVal}%</text>
      </g>
    `;
  });

  let pathD = "";
  if (points.length > 1) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const cur = points[i];
      const cpX = (prev.x + cur.x) / 2;
      pathD += ` C ${cpX} ${prev.y}, ${cpX} ${cur.y}, ${cur.x} ${cur.y}`;
    }
  }

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; display: block; overflow: visible;">
      <line x1="${padding.left}" y1="${padding.top}" x2="${width - padding.right}" y2="${padding.top}" stroke="#334155" stroke-dasharray="3 3" />
      <line x1="${padding.left}" y1="${padding.top + chartHeight / 2}" x2="${width - padding.right}" y2="${padding.top + chartHeight / 2}" stroke="#334155" stroke-dasharray="3 3" />
      <line x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${width - padding.right}" y2="${padding.top + chartHeight}" stroke="#475569" />
      ${barsSvg}
      ${pathD ? `<path d="${pathD}" fill="none" stroke="#a5b4fc" stroke-width="2" stroke-linecap="round" />` : ""}
    </svg>
  `;
}

function renderTodoList(todos) {
  const container = document.getElementById("todo-items-list");
  const progressText = document.getElementById("todo-progress-text");
  const progressFill = document.getElementById("todo-progress-fill");
  if (!container) return;

  const items = todos || [];
  if (items.length === 0) {
    container.innerHTML = '<p class="empty-state">No to-do tasks generated yet.</p>';
    return;
  }

  function updateTodoProgress() {
    const total = items.length;
    const done = items.filter((i) => i.status === "done").length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    if (progressText) progressText.textContent = `${done} of ${total} Completed (${pct}%)`;
    if (progressFill) progressFill.style.width = `${pct}%`;
  }

  container.innerHTML = "";
  items.forEach((todo) => {
    const card = document.createElement("div");
    card.className = `todo-item-card ${todo.status === "done" ? "completed" : ""}`;

    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.className = "todo-check-input";
    chk.checked = todo.status === "done";
    chk.addEventListener("change", () => {
      todo.status = chk.checked ? "done" : "pending";
      card.classList.toggle("completed", chk.checked);
      updateTodoProgress();
      const plan = loadTimetablePlan();
      if (plan && plan.todoList) {
        plan.todoList = items;
        saveTimetablePlan(plan);
      }
      if (chk.checked) SoundEngine.playChime("complete");
    });

    const body = document.createElement("div");
    body.className = "todo-item-body";
    body.innerHTML = `
      <div class="todo-item-title">${todo.title}</div>
      <div class="todo-item-meta">
        <span>⏱ Est: ${todo.estimatedMinutes || 45}m</span>
        ${todo.deadline ? `<span>📅 ${todo.deadline}</span>` : ""}
        <span>Category: ${todo.category || "General"}</span>
      </div>
    `;

    card.appendChild(chk);
    card.appendChild(body);
    card.appendChild(priorityBadge(todo.priority || "MEDIUM"));
    container.appendChild(card);
  });

  updateTodoProgress();
}

function renderTimetableList(schedule) {
  const container = document.getElementById("timetable-list");
  if (!container) return;

  const items = schedule || [];
  if (items.length === 0) {
    container.innerHTML = '<p class="empty-state">Enter a topic and click "Generate Timetable" to create time blocks.</p>';
    return;
  }

  container.innerHTML = "";
  items.forEach((block) => {
    const row = document.createElement("div");
    row.className = `timetable-row ${block.isBreak ? "is-break" : ""}`;

    const timeBadge = document.createElement("span");
    timeBadge.className = "timetable-time-badge";
    timeBadge.textContent = `${block.startTime} - ${block.endTime}`;

    const catBadge = document.createElement("span");
    catBadge.className = "timetable-category-badge";
    catBadge.textContent = block.category || (block.isBreak ? "Rest & Buffer" : "Execution");

    const taskName = document.createElement("span");
    taskName.className = "timetable-task-name";
    taskName.textContent = block.title;

    const energyCol = document.createElement("div");
    energyCol.className = "timetable-energy-col";
    energyCol.innerHTML = `
      <div class="energy-pill-track">
        <div class="energy-pill-fill" style="width: ${block.energyLevel || (block.isBreak ? 20 : 80)}%;"></div>
      </div>
      <span style="font-size: 0.72rem; color: var(--text-dim); font-family: monospace;">${block.energyLevel || 75}%</span>
    `;

    const actionCol = document.createElement("div");
    if (!block.isBreak) {
      const launchBtn = document.createElement("button");
      launchBtn.type = "button";
      launchBtn.className = "slot-launch-btn";
      launchBtn.textContent = "▶ Run Sprint";
      launchBtn.title = "Load this block directly into Focus Sprint Timer";
      launchBtn.addEventListener("click", () => {
        const dur = block.durationMinutes || 50;
        startFocusSprint(dur, block.title);
      });
      actionCol.appendChild(launchBtn);
    } else {
      actionCol.innerHTML = '<span style="font-size: 0.72rem; color: var(--text-dim);">Rest Buffer</span>';
    }

    row.appendChild(timeBadge);
    row.appendChild(catBadge);
    row.appendChild(taskName);
    row.appendChild(energyCol);
    row.appendChild(actionCol);
    container.appendChild(row);
  });
}

function renderEisenhowerMatrix(tasks) {
  const currentTasks = tasks || loadTasks();

  const q1 = [];
  const q2 = [];
  const q3 = [];
  const q4 = [];

  currentTasks.forEach((task) => {
    const p = (task.priority || "MEDIUM").toUpperCase();
    if (p === "URGENT") q1.push(task);
    else if (p === "HIGH") q2.push(task);
    else if (p === "MEDIUM") q3.push(task);
    else q4.push(task);
  });

  function populateQuadrant(prefix, qTasks) {
    const listEl = document.getElementById(`${prefix}-tasks`) || document.getElementById(`tasks-${prefix}`);
    const countEl = document.getElementById(`${prefix}-count`) || document.getElementById(`count-${prefix}`);
    if (countEl) countEl.textContent = qTasks.length;
    if (listEl) {
      if (qTasks.length === 0) {
        listEl.innerHTML = '<span style="font-size: 0.74rem; color: var(--text-dim);">No items</span>';
      } else {
        listEl.innerHTML = qTasks
          .map(
            (t) => `
          <div class="quadrant-task-chip">
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${t.title}</span>
            ${t.deadline ? `<span style="font-size: 0.7rem; color: var(--text-dim); flex-shrink: 0;">${t.deadline}</span>` : ""}
          </div>
        `
          )
          .join("");
      }
    }
  }

  ["q1", "q2", "q3", "q4"].forEach((qKey, idx) => {
    const group = [q1, q2, q3, q4][idx];
    populateQuadrant(qKey, group);
    populateQuadrant(`analysis-${qKey}`, group);
  });
}

async function executeGenerateTimetable() {
  const topicInput = document.getElementById("studio-topic-input");
  const startTimeInput = document.getElementById("studio-start-time");
  const hoursSelect = document.getElementById("studio-hours-select");
  const protocolSelect = document.getElementById("studio-protocol-select");
  const genBtn = document.getElementById("generate-timetable-btn");

  const topic = (topicInput?.value || "").trim() || "Hackathon MVP Final Sprint & Polish";
  const startTime = startTimeInput?.value || "09:00";
  const totalHours = parseInt(hoursSelect?.value || "6", 10);
  const protocol = protocolSelect?.value || "deep_work";

  if (genBtn) {
    genBtn.disabled = true;
    genBtn.innerHTML = "<span>Generating Schedule…</span>";
  }

  const existingTasks = loadTasks();

  try {
    const res = await fetch("/api/generate-timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic,
        startTime,
        totalHours,
        protocol,
        existingTasks
      })
    });

    if (res.ok) {
      const plan = await res.json();
      saveTimetablePlan(plan);
      renderTimetableList(plan.schedule);
      renderEnergyChart(plan.analytics, plan.schedule);
      renderTodoList(plan.todoList);
      renderEisenhowerMatrix(plan.todoList);
      SoundEngine.playChime("complete");
    } else {
      throw new Error("Server response not ok");
    }
  } catch (err) {
    console.warn("Timetable API error, using deterministic client fallback:", err);
    // Instant fallback generator
    const fallbackSchedule = [
      { id: 1, title: `${topic}: Architecture & Scoping`, startTime: "09:00", endTime: "09:50", durationMinutes: 50, category: "Architecture", energyLevel: 90, isBreak: false },
      { id: 2, title: "Transition Buffer & Hydration", startTime: "09:50", endTime: "10:00", durationMinutes: 10, category: "Buffer", energyLevel: 25, isBreak: true },
      { id: 3, title: `${topic}: Core Feature Implementation`, startTime: "10:00", endTime: "10:50", durationMinutes: 50, category: "Execution", energyLevel: 95, isBreak: false },
      { id: 4, title: "Buffer & Quick Sync", startTime: "10:50", endTime: "11:00", durationMinutes: 10, category: "Buffer", energyLevel: 30, isBreak: true },
      { id: 5, title: `${topic}: UI Polish & Error Handling`, startTime: "11:00", endTime: "11:50", durationMinutes: 50, category: "Execution", energyLevel: 80, isBreak: false },
      { id: 6, title: "Mid-Sprint Cognitive Reset & Lunch", startTime: "11:50", endTime: "12:30", durationMinutes: 40, category: "Buffer", energyLevel: 20, isBreak: true },
      { id: 7, title: `${topic}: Integration Verification & Smoke Tests`, startTime: "12:30", endTime: "13:20", durationMinutes: 50, category: "Verification", energyLevel: 85, isBreak: false }
    ];
    const fallbackTodos = [
      { id: 101, title: `Finalize technical architecture and scope for ${topic}`, priority: "URGENT", estimatedMinutes: 45, category: "Planning", deadline: "10:00 AM", status: "pending" },
      { id: 102, title: `Implement core functionality and data flow for ${topic}`, priority: "HIGH", estimatedMinutes: 50, category: "Execution", deadline: "11:30 AM", status: "pending" },
      { id: 103, title: `Run end-to-end verification and regression tests`, priority: "HIGH", estimatedMinutes: 45, category: "Testing", deadline: "01:30 PM", status: "pending" },
      { id: 104, title: `Document release notes and prepare stakeholder summary`, priority: "MEDIUM", estimatedMinutes: 30, category: "Documentation", deadline: "03:00 PM", status: "pending" }
    ];
    const fallbackAnalytics = { totalHours, deepWorkBlocks: 4, peakHour: "10:00 AM", bufferMinutes: 60 };

    const plan = { schedule: fallbackSchedule, todoList: fallbackTodos, analytics: fallbackAnalytics };
    saveTimetablePlan(plan);
    renderTimetableList(plan.schedule);
    renderEnergyChart(plan.analytics, plan.schedule);
    renderTodoList(plan.todoList);
    renderEisenhowerMatrix(plan.todoList);
    SoundEngine.playChime("complete");
  } finally {
    if (genBtn) {
      genBtn.disabled = false;
      genBtn.innerHTML = "<span>⚡ Generate Timetable &amp; To-Do</span>";
    }
  }
}

function initTimeStudio() {
  const genBtn = document.getElementById("generate-timetable-btn");
  const topicChips = document.querySelectorAll(".studio-chip-btn");
  const topicInput = document.getElementById("studio-topic-input");
  const tabBtns = document.querySelectorAll(".studio-tab-btn");
  const syncBtn = document.getElementById("sync-todo-pipeline-btn");
  const copyMdBtn = document.getElementById("copy-todo-markdown-btn");
  const exportIcsBtn = document.getElementById("export-schedule-ics-btn");

  if (genBtn) {
    genBtn.addEventListener("click", executeGenerateTimetable);
  }

  topicChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      if (topicInput && chip.dataset.topic) {
        topicInput.value = chip.dataset.topic;
        topicInput.focus();
      }
    });
  });

  // Tab switching
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const tabKey = btn.dataset.tab;
      document.querySelectorAll(".studio-tab-pane").forEach((pane) => {
        pane.style.display = "none";
      });
      const targetPane = document.getElementById(`studio-pane-${tabKey}`);
      if (targetPane) targetPane.style.display = "block";
    });
  });

  // 1-Click Sync to ActionOS Pipeline
  if (syncBtn) {
    syncBtn.addEventListener("click", () => {
      const plan = loadTimetablePlan();
      if (!plan || !plan.todoList || plan.todoList.length === 0) {
        alert("Please generate a timetable and to-do plan first.");
        return;
      }

      const existing = loadTasks();
      const newItems = plan.todoList.map((item) => ({
        id: Date.now() + Math.floor(Math.random() * 1000),
        title: item.title,
        deadline: item.deadline || "Today",
        priority: item.priority || "HIGH",
        reason: `Generated from ${item.category || "Sprint"} timetable engine.`,
        status: item.status || "pending"
      }));

      const merged = [...existing, ...newItems];
      saveTasks(merged);

      syncBtn.textContent = `✓ Synced ${newItems.length} Tasks!`;
      syncBtn.style.background = "var(--success)";
      SoundEngine.playChime("complete");

      setTimeout(() => {
        syncBtn.textContent = "⚡ Sync to ActionOS Pipeline";
        syncBtn.style.background = "";
        if (confirm("Tasks synchronized into your active session! Would you like to jump to Step 2 (Task Analysis) now?")) {
          window.location.href = "analysis.html";
        }
      }, 1000);
    });
  }

  // Copy Markdown Todo List
  if (copyMdBtn) {
    copyMdBtn.addEventListener("click", () => {
      const plan = loadTimetablePlan();
      if (!plan || !plan.todoList) return;
      let md = "# ActionOS Sprint To-Do List\n\n";
      plan.todoList.forEach((t, i) => {
        const mark = t.status === "done" ? "[x]" : "[ ]";
        md += `- ${mark} **[${t.priority}]** ${t.title} (Est: ${t.estimatedMinutes || 45}m)\n`;
      });
      navigator.clipboard.writeText(md).then(() => {
        const prev = copyMdBtn.textContent;
        copyMdBtn.textContent = "Copied!";
        setTimeout(() => (copyMdBtn.textContent = prev), 1500);
      });
    });
  }

  // Export .ICS Calendar from Studio
  if (exportIcsBtn) {
    exportIcsBtn.addEventListener("click", () => {
      const plan = loadTimetablePlan();
      const schedule = plan?.schedule || [];
      if (schedule.length === 0) {
        alert("Generate a timetable first before exporting.");
        return;
      }
      let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//ActionOS//Timetable Studio//EN\n";
      schedule.forEach((block) => {
        ics += "BEGIN:VEVENT\n";
        ics += `SUMMARY:[${block.category || "Sprint"}] ${block.title.replace(/\n/g, " ")}\n`;
        ics += `DESCRIPTION:Energy Demand: ${block.energyLevel || 75}% · Duration: ${block.durationMinutes}m\n`;
        ics += "STATUS:CONFIRMED\n";
        ics += "END:VEVENT\n";
      });
      ics += "END:VCALENDAR";
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `actionos-schedule-${Date.now()}.ics`;
      link.click();
    });
  }

  // Load cached plan if present, else auto-generate initial rich state
  const cachedPlan = loadTimetablePlan();
  if (cachedPlan) {
    renderTimetableList(cachedPlan.schedule);
    renderEnergyChart(cachedPlan.analytics, cachedPlan.schedule);
    renderTodoList(cachedPlan.todoList);
    renderEisenhowerMatrix(cachedPlan.todoList);
  } else {
    executeGenerateTimetable();
  }
}

// Generate an intelligent visual timeline of tasks across the day
function renderScheduleTimeline() {
  const container = document.getElementById("schedule-timeline");
  if (!container) return;

  const tasks = loadTasks();
  if (tasks.length === 0) {
    container.innerHTML = '<p class="empty-state">No tasks available to schedule. Ingest some text first.</p>';
    return;
  }

  const sorted = tasks.slice().sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
  let currentHour = 9;
  let currentMinute = 0;

  let html = "";
  sorted.forEach((task) => {
    const duration = task.priority === "URGENT" ? 50 : task.priority === "HIGH" ? 40 : 25;
    const startStr = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;

    let endMinute = currentMinute + duration;
    let endHour = currentHour + Math.floor(endMinute / 60);
    endMinute = endMinute % 60;
    const endStr = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;

    html += `
      <div class="timeline-slot">
        <span class="timeline-time">${startStr} – ${endStr}</span>
        <span class="badge badge-${(task.priority || "medium").toLowerCase()}" style="font-size: 0.65rem;">${task.priority}</span>
        <span class="timeline-content">${task.title}</span>
        ${task.deadline ? `<span style="font-size: 0.75rem; color: var(--text-dim); margin-left: auto;">⏱ Due: ${task.deadline}</span>` : ""}
      </div>
    `;

    currentMinute = endMinute + 10;
    currentHour = endHour + Math.floor(currentMinute / 60);
    currentMinute = currentMinute % 60;
  });

  container.innerHTML = html;
  renderEisenhowerMatrix(tasks);
}

// ============================================================================
// 3. STRONG COPILOT CHATBOT (ActionBot)
// ============================================================================
function initActionBot() {
  const toggleBtn = document.getElementById("chatbot-toggle-btn");
  const railChatBtn = document.getElementById("open-chat-rail-btn");
  const modal = document.getElementById("chat-modal");
  const closeBtn = document.getElementById("chat-close-btn");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const messagesBox = document.getElementById("chat-messages");
  const promptChips = document.querySelectorAll(".chat-chip");

  if (!modal || !toggleBtn) return;

  function openChat() {
    modal.hidden = false;
    if (input) input.focus();
    renderChatHistory();
  }

  function closeChat() {
    modal.hidden = true;
  }

  toggleBtn.addEventListener("click", () => {
    if (modal.hidden) openChat();
    else closeChat();
  });

  if (railChatBtn) {
    railChatBtn.addEventListener("click", openChat);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeChat);
  }

  // Load chat history from session
  function getChatHistory() {
    try {
      return JSON.parse(sessionStorage.getItem(CHAT_HISTORY_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveChatHistory(history) {
    sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
  }

  function formatMessageText(text) {
    // Detect [ADD_TASK: Title | Deadline | Priority | Reason]
    const addTaskPattern = /\[ADD_TASK:\s*([^|]+)\|\s*([^|]*)\|\s*([^|]*)\|\s*([^\]]*)\]/g;
    
    let parsed = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br/>");

    parsed = parsed.replace(addTaskPattern, (_match, title, deadline, priority, reason) => {
      const t = title.trim();
      const d = deadline.trim();
      const p = priority.trim() || "MEDIUM";
      const r = reason.trim();
      return `
        <div style="margin-top: 8px; padding: 10px; background: rgba(99, 102, 241, 0.08); border: 1px dashed var(--accent); border-radius: 6px;">
          <div style="font-weight: 600; font-size: 0.85rem; color: #fff;">Suggested Subtask: ${t}</div>
          <div style="font-size: 0.76rem; color: var(--text-dim); margin-top: 2px;">Deadline: ${d || 'Today'} · Priority: ${p}</div>
          <button type="button" class="chat-add-task-btn" data-title="${encodeURIComponent(t)}" data-deadline="${encodeURIComponent(d)}" data-priority="${encodeURIComponent(p)}" data-reason="${encodeURIComponent(r)}">
            + Add to Action Plan
          </button>
        </div>
      `;
    });

    return parsed;
  }

  function renderChatHistory() {
    if (!messagesBox) return;
    const history = getChatHistory();
    if (history.length === 0) return;

    // Keep initial greeting if present
    messagesBox.innerHTML = `
      <div class="chat-bubble model">
        Hello! I'm <strong>ActionBot</strong>, your executive copilot. I can help you break down complex tasks, optimize your daily time blocks, audit scheduling risks, or draft email updates based on your extracted plan.
      </div>
    `;

    history.forEach((msg) => {
      const bubble = document.createElement("div");
      bubble.className = `chat-bubble ${msg.role === "user" ? "user" : "model"}`;
      bubble.innerHTML = formatMessageText(msg.content);
      messagesBox.appendChild(bubble);
    });

    wireAddTaskButtons();
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  function wireAddTaskButtons() {
    const addBtns = messagesBox.querySelectorAll(".chat-add-task-btn");
    addBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const title = decodeURIComponent(btn.dataset.title || "");
        const deadline = decodeURIComponent(btn.dataset.deadline || "");
        const priority = decodeURIComponent(btn.dataset.priority || "MEDIUM");
        const reason = decodeURIComponent(btn.dataset.reason || "Suggested by ActionBot Copilot");

        const tasks = loadTasks();
        const newTask = {
          id: Date.now(),
          title,
          deadline: deadline || "Today",
          priority,
          reason,
          status: "pending"
        };
        tasks.push(newTask);
        saveTasks(tasks);

        btn.disabled = true;
        btn.textContent = "✓ Added to Plan";
        btn.style.background = "var(--success)";
        btn.style.borderColor = "var(--success)";
        btn.style.color = "#fff";

        // If on analysis page, re-render
        if (typeof renderAnalysisUI === "function") {
          renderAnalysisUI();
        }
      });
    });
  }

  async function handleSend(userPrompt) {
    if (!userPrompt || !userPrompt.trim()) return;
    const history = getChatHistory();

    // Append user message
    history.push({ role: "user", content: userPrompt });
    saveChatHistory(history);

    const userBubble = document.createElement("div");
    userBubble.className = "chat-bubble user";
    userBubble.textContent = userPrompt;
    messagesBox.appendChild(userBubble);
    messagesBox.scrollTop = messagesBox.scrollHeight;

    // Placeholder model bubble
    const modelBubble = document.createElement("div");
    modelBubble.className = "chat-bubble model";
    modelBubble.textContent = "Thinking…";
    messagesBox.appendChild(modelBubble);
    messagesBox.scrollTop = messagesBox.scrollHeight;

    const currentTasks = loadTasks();
    const sourceText = sessionStorage.getItem(SOURCE_KEY) || "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          tasks: currentTasks,
          sourceText
        })
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.reply || "I couldn't process that.";
        modelBubble.innerHTML = formatMessageText(reply);
        history.push({ role: "model", content: reply });
        saveChatHistory(history);
      } else {
        throw new Error("Chat server error");
      }
    } catch {
      // Fallback in case of network interruption
      const fallbackReply = `I've analyzed your **${currentTasks.length} active tasks** locally. Try using the Pomodoro timer in the stage header to lock in focus on your top urgent items.`;
      modelBubble.innerHTML = formatMessageText(fallbackReply);
      history.push({ role: "model", content: fallbackReply });
      saveChatHistory(history);
    }

    wireAddTaskButtons();
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = (input?.value || "").trim();
      if (!val) return;
      if (input) input.value = "";
      handleSend(val);
    });
  }

  promptChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const promptText = chip.dataset.prompt;
      if (promptText) handleSend(promptText);
    });
  });

  renderChatHistory();
}

// ============================================================================
// 4. INDEX.HTML PAGE CONTROLLER
// ============================================================================
function initInputPage() {
  const analyzeBtn = document.getElementById("analyze-btn");
  const inputText = document.getElementById("input-text");
  if (!analyzeBtn || !inputText) return;

  // Preset buttons
  const presetButtons = document.querySelectorAll(".preset-btn");
  presetButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const presetKey = btn.dataset.preset;
      if (presetKey === "clear") {
        inputText.value = "";
        inputText.focus();
      } else if (PRESETS[presetKey]) {
        inputText.value = PRESETS[presetKey];
        inputText.focus();
      }
      updateInputMeta();
    });
  });

  // Extraction Engine Mode Pills
  const modePills = document.querySelectorAll(".mode-pill");
  const currentEngine = getActiveEngine();
  modePills.forEach((pill) => {
    if (pill.dataset.mode === currentEngine) {
      pill.classList.add("active");
    } else {
      pill.classList.remove("active");
    }

    pill.addEventListener("click", () => {
      modePills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      setActiveEngine(pill.dataset.mode);
    });
  });

  function updateInputMeta() {
    const metaSpan = document.getElementById("text-meta");
    if (!metaSpan) return;
    const val = inputText.value.trim();
    if (!val) {
      metaSpan.textContent = "0 words · 0 characters";
      return;
    }
    const words = val.split(/\s+/).filter(Boolean).length;
    metaSpan.textContent = `${words} words · ${val.length} chars`;
  }

  inputText.addEventListener("input", updateInputMeta);
  updateInputMeta();

  async function triggerAnalysis() {
    const text = inputText.value.trim();
    if (!text) {
      alert("Please paste text or click one of the sample presets to analyze.");
      return;
    }

    sessionStorage.setItem(SOURCE_KEY, text);
    const engine = getActiveEngine();

    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = `<span>Analyzing with ${engine === "ai" ? "Gemini AI" : "Heuristics"}…</span>`;

    let tasks = [];

    if (engine === "ai") {
      try {
        const res = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.tasks) && data.tasks.length > 0) {
            tasks = data.tasks;
          } else {
            console.warn("AI returned empty tasks, using offline heuristic fallback.");
            tasks = extractTasks(text);
          }
        } else {
          tasks = extractTasks(text);
        }
      } catch {
        tasks = extractTasks(text);
      }
    } else {
      // 100% offline heuristic fallback
      tasks = extractTasks(text);
    }

    saveTasks(tasks);
    window.location.href = "analysis.html";
  }

  analyzeBtn.addEventListener("click", triggerAnalysis);

  // Keyboard shortcut: Ctrl + Enter / Cmd + Enter
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      if (document.activeElement === inputText || !analyzeBtn.disabled) {
        e.preventDefault();
        triggerAnalysis();
      }
    }
  });
}

// ============================================================================
// 5. ANALYSIS.HTML PAGE CONTROLLER
// ============================================================================
let renderAnalysisUI = null;

function initAnalysisPage() {
  const list = document.getElementById("task-list");
  if (!list) return;

  let tasks = loadTasks();
  let currentFilter = "ALL";

  const engineBadge = document.getElementById("analysis-engine-badge");
  if (engineBadge) {
    const engine = getActiveEngine();
    if (engine === "ai") {
      engineBadge.innerHTML = "🧠 Gemini AI Deep Context";
      engineBadge.style.color = "var(--accent-light)";
    } else {
      engineBadge.innerHTML = "⚡ Offline Heuristic Fallback (0-Network)";
    }
  }

  function renderStats() {
    const deadlineCount = tasks.filter((t) => t.deadline).length;
    const priorityCount = new Set(tasks.map((t) => t.priority)).size;

    const statTasks = document.getElementById("stat-tasks");
    const statDeadlines = document.getElementById("stat-deadlines");
    const statPriorities = document.getElementById("stat-priorities");

    if (statTasks) statTasks.textContent = `${tasks.length} Tasks Found`;
    if (statDeadlines) statDeadlines.textContent = `${deadlineCount} Deadlines`;
    if (statPriorities) statPriorities.textContent = `${priorityCount} Priority Levels`;
  }

  function renderList() {
    list.innerHTML = "";

    const filtered = currentFilter === "ALL"
      ? tasks
      : tasks.filter((t) => (t.priority || "MEDIUM").toUpperCase() === currentFilter);

    if (filtered.length === 0) {
      if (tasks.length === 0) {
        list.innerHTML =
          '<p class="empty-state">No clear tasks detected. Go back and paste text with action words like "submit," "complete," or "review," plus a deadline.</p>';
      } else {
        list.innerHTML = `<p class="empty-state">No tasks matching the "${currentFilter}" priority filter.</p>`;
      }
      return;
    }

    filtered
      .slice()
      .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority))
      .forEach((task) => {
        const row = document.createElement("div");
        row.className = "task-row";

        const main = document.createElement("div");
        main.className = "task-main";
        main.innerHTML = `
          <span class="task-title">${task.title}</span>
          ${task.deadline ? `<span class="task-deadline">⏱ Deadline: ${task.deadline}</span>` : ""}
        `;

        const actions = document.createElement("div");
        actions.className = "task-actions";
        actions.appendChild(priorityBadge(task.priority));

        // Delete button
        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "task-del-btn";
        delBtn.title = "Remove item";
        delBtn.innerHTML = "✕";
        delBtn.addEventListener("click", () => {
          tasks = tasks.filter((t) => t.id !== task.id);
          saveTasks(tasks);
          renderStats();
          renderList();
          renderScheduleTimeline();
        });
        actions.appendChild(delBtn);

        row.appendChild(main);
        row.appendChild(actions);
        list.appendChild(row);
      });
  }

  renderAnalysisUI = () => {
    tasks = loadTasks();
    renderStats();
    renderList();
    renderScheduleTimeline();
  };

  // Filter chips
  const filterBtns = document.querySelectorAll(".filter-chip");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderList();
    });
  });

  // Toggle Add Task Box
  const toggleAddBtn = document.getElementById("toggle-add-task-btn");
  const addTaskBox = document.getElementById("add-task-box");
  const confirmAddBtn = document.getElementById("confirm-add-task-btn");
  const newTitleInput = document.getElementById("new-task-title");
  const newDeadInput = document.getElementById("new-task-deadline");
  const newPrioSelect = document.getElementById("new-task-priority");

  if (toggleAddBtn && addTaskBox) {
    toggleAddBtn.addEventListener("click", () => {
      const isHidden = addTaskBox.style.display === "none";
      addTaskBox.style.display = isHidden ? "block" : "none";
      toggleAddBtn.textContent = isHidden ? "Cancel" : "+ Add Task Item";
      if (isHidden && newTitleInput) newTitleInput.focus();
    });

    if (confirmAddBtn) {
      confirmAddBtn.addEventListener("click", () => {
        const title = (newTitleInput?.value || "").trim();
        if (!title) return;
        const deadline = (newDeadInput?.value || "").trim();
        const priority = newPrioSelect?.value || "MEDIUM";

        const newTask = {
          id: Date.now(),
          title: title.length > 100 ? title.slice(0, 100) + "…" : title,
          deadline: deadline || (priority === "URGENT" ? "Today" : ""),
          priority,
          reason: `Manually added by user with ${priority} priority.`,
          status: "pending"
        };

        tasks.push(newTask);
        saveTasks(tasks);
        if (newTitleInput) newTitleInput.value = "";
        if (newDeadInput) newDeadInput.value = "";
        addTaskBox.style.display = "none";
        toggleAddBtn.textContent = "+ Add Task Item";
        renderStats();
        renderList();
        renderScheduleTimeline();
      });
    }
  }

  // Refresh schedule button
  document.getElementById("recalc-schedule-btn")?.addEventListener("click", renderScheduleTimeline);

  renderStats();
  renderList();
  renderScheduleTimeline();
  initRiskAuditor();

  const continueBtn = document.getElementById("continue-btn");
  if (continueBtn) {
    continueBtn.addEventListener("click", () => {
      window.location.href = "action.html";
    });
  }
}

// ============================================================================
// 6. ACTION.HTML PAGE CONTROLLER (Cryptographic Gate & Verification)
// ============================================================================
async function computePlanSha256(tasks) {
  try {
    const enc = new TextEncoder();
    const data = enc.encode(JSON.stringify(tasks));
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return Math.random().toString(36).substring(2, 14);
  }
}

function initActionPage() {
  const checklist = document.getElementById("checklist");
  if (!checklist) return;

  const tasks = loadTasks();
  const approveBtn = document.getElementById("approve-btn");
  const verification = document.getElementById("verification");
  const taskDetail = document.getElementById("task-detail");
  const resetBtn = document.getElementById("reset-plan-btn");
  const toggleAllWhyBtn = document.getElementById("toggle-all-why");

  let allExpanded = false;

  if (taskDetail) {
    if (tasks.length === 0) {
      taskDetail.innerHTML = '<p class="empty-state">No tasks were carried over from the analysis step.</p>';
    } else {
      taskDetail.innerHTML = "";
      tasks.forEach((task) => {
        const row = document.createElement("div");
        row.className = "detail-row";

        const head = document.createElement("div");
        head.className = "detail-head";
        head.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 3px;">
            <span class="task-title" style="font-weight: 500;">${task.title}</span>
            ${task.deadline ? `<span style="font-size: 0.8rem; color: var(--text-dim);">⏱ Commitment Deadline: ${task.deadline}</span>` : ""}
          </div>
        `;
        head.appendChild(priorityBadge(task.priority));

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "why-toggle";
        toggle.textContent = "Why?";

        const why = document.createElement("div");
        why.className = "why-text";
        why.hidden = true;

        let reasonContent = task.reason || "Action item extracted from text.";
        if (task.sourceSentence) {
          reasonContent += `<div style="margin-top: 6px; font-size: 0.8rem; color: var(--text-dim);">Grounded source quote: <span class="why-quote">"${task.sourceSentence}"</span></div>`;
        }
        why.innerHTML = reasonContent;

        toggle.addEventListener("click", () => {
          why.hidden = !why.hidden;
          toggle.textContent = why.hidden ? "Why?" : "Hide";
        });

        row.appendChild(head);
        row.appendChild(toggle);
        row.appendChild(why);
        taskDetail.appendChild(row);
      });
    }
  }

  // Toggle all reasons
  if (toggleAllWhyBtn) {
    toggleAllWhyBtn.addEventListener("click", () => {
      allExpanded = !allExpanded;
      toggleAllWhyBtn.textContent = allExpanded ? "Collapse all reasons" : "Expand all reasons";
      document.querySelectorAll(".why-text").forEach((w) => (w.hidden = !allExpanded));
      document.querySelectorAll(".why-toggle").forEach((t) => {
        if (t !== toggleAllWhyBtn) t.textContent = allExpanded ? "Hide" : "Why?";
      });
    });
  }

  // Check if previously approved
  const isAlreadyApproved = tasks.length > 0 && tasks.every((t) => t.status === "done");
  if (isAlreadyApproved) {
    ["chk-tasks", "chk-deadlines", "chk-priorities", "chk-notify"].forEach((id) => {
      document.getElementById(id)?.classList.add("done");
    });
    showVerificationBox();
    if (approveBtn) {
      approveBtn.disabled = true;
      approveBtn.textContent = "Approved ✓";
    }
    if (resetBtn) resetBtn.style.display = "inline-flex";
  }

  // Stepped execution pipeline simulation
  if (approveBtn) {
    approveBtn.addEventListener("click", async () => {
      approveBtn.disabled = true;
      approveBtn.textContent = "Executing Plan…";
      SoundEngine.playChime("start");

      const checkSteps = [
        { id: "chk-tasks", msg: "Creating verified tasks…" },
        { id: "chk-deadlines", msg: "Assigning deadlines and commitments…" },
        { id: "chk-priorities", msg: "Calibrating priority queues…" },
        { id: "chk-notify", msg: "Dispatched execution notifications." }
      ];

      for (let i = 0; i < checkSteps.length; i++) {
        const step = checkSteps[i];
        const el = document.getElementById(step.id);
        if (el) {
          el.classList.add("running");
          await new Promise((r) => setTimeout(r, 260));
          el.classList.remove("running");
          el.classList.add("done");
        }
      }

      tasks.forEach((t) => (t.status = "done"));
      saveTasks(tasks);

      approveBtn.textContent = "Approved ✓";
      if (resetBtn) resetBtn.style.display = "inline-flex";

      SoundEngine.playChime("complete");
      await showVerificationBox();
    });
  }

  async function showVerificationBox() {
    if (!verification) return;
    verification.hidden = false;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const deadlineCount = tasks.filter((t) => t.deadline).length;
    const shaHash = await computePlanSha256(tasks);

    verification.innerHTML = `
      <p style="color: var(--success); font-weight: 600;">✓ Plan execution verified &amp; cryptographically logged</p>
      <p>✓ ${tasks.length} tasks scheduled in isolated session storage</p>
      <p>✓ ${deadlineCount} time-bounded commitments confirmed</p>
      <p>✓ Notifications prepared with verifiable audit trail</p>

      <div class="log-box">
        <div class="log-entry success"><span class="time">[${now}]</span> Human sign-off approved via interactive gate</div>
        <div class="log-entry"><span class="time">[${now}]</span> State committed to session key: actionos_tasks</div>
        <div class="log-entry"><span class="time">[${now}]</span> Cryptographic Proof Hash: <code style="color: var(--accent-light); font-size: 0.78rem;">sha256-${shaHash.slice(0, 32)}…</code></div>
      </div>

      <div class="verification-actions">
        <button type="button" class="btn-secondary" id="copy-markdown-btn">
          📋 Copy as Markdown
        </button>
        <button type="button" class="btn-secondary" id="download-json-btn">
          💾 Export JSON
        </button>
        <button type="button" class="btn-secondary" id="download-ics-btn">
          📅 Export .ICS Calendar
        </button>
      </div>
    `;

    // Copy Markdown
    document.getElementById("copy-markdown-btn")?.addEventListener("click", () => {
      let md = `# ActionOS Approved Action Plan\n\n`;
      tasks.forEach((t, i) => {
        md += `### ${i + 1}. [${t.priority}] ${t.title}\n`;
        if (t.deadline) md += `- **Deadline:** ${t.deadline}\n`;
        md += `- **Why:** ${t.reason}\n\n`;
      });
      navigator.clipboard.writeText(md).then(() => {
        const btn = document.getElementById("copy-markdown-btn");
        if (btn) {
          const prev = btn.textContent;
          btn.textContent = "Copied to Clipboard!";
          setTimeout(() => (btn.textContent = prev), 2000);
        }
      });
    });

    // Download JSON
    document.getElementById("download-json-btn")?.addEventListener("click", () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
      const dlAnchor = document.createElement("a");
      dlAnchor.setAttribute("href", dataStr);
      dlAnchor.setAttribute("download", `actionos-plan-${Date.now()}.json`);
      dlAnchor.click();
    });

    // Download .ICS calendar
    document.getElementById("download-ics-btn")?.addEventListener("click", () => {
      let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//ActionOS//Action Plan//EN\n";
      tasks.forEach((t) => {
        ics += "BEGIN:VEVENT\n";
        ics += `SUMMARY:[${t.priority}] ${t.title.replace(/\n/g, " ")}\n`;
        ics += `DESCRIPTION:${(t.reason || "").replace(/\n/g, " ")}\n`;
        ics += "STATUS:CONFIRMED\n";
        ics += "END:VEVENT\n";
      });
      ics += "END:VCALENDAR";
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "actionos-tasks.ics";
      link.click();
    });
  }

  // Reset approval button
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      tasks.forEach((t) => (t.status = "pending"));
      saveTasks(tasks);
      ["chk-tasks", "chk-deadlines", "chk-priorities", "chk-notify"].forEach((id) => {
        document.getElementById(id)?.classList.remove("done", "running");
      });
      if (verification) verification.hidden = true;
      if (approveBtn) {
        approveBtn.disabled = false;
        approveBtn.textContent = "Approve Actions";
      }
      resetBtn.style.display = "none";
    });
  }
}

// ============================================================================
// 7. PLAN RISK AUDITOR CONTROLLER
// ============================================================================
async function runPlanRiskAudit() {
  const scoreBadge = document.getElementById("health-score-badge");
  const riskContainer = document.getElementById("risk-list-container");
  const auditBtn = document.getElementById("run-audit-btn");

  if (!riskContainer) return;

  if (auditBtn) {
    auditBtn.disabled = true;
    auditBtn.textContent = "Auditing Execution Plan…";
  }

  const tasks = loadTasks();
  const timetablePlan = loadTimetablePlan();

  try {
    const res = await fetch("/api/audit-risks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tasks,
        schedule: timetablePlan?.schedule || []
      })
    });

    if (res.ok) {
      const data = await res.json();
      renderRiskAuditResults(data.healthScore, data.risks);
    } else {
      throw new Error("Audit API failed");
    }
  } catch (err) {
    console.warn("Using offline heuristic audit fallback:", err);
    const urgentCount = tasks.filter((t) => (t.priority || "").toUpperCase() === "URGENT").length;
    const withDeadlines = tasks.filter((t) => t.deadline).length;

    let score = 94;
    const risks = [];

    if (urgentCount >= 3) {
      score -= 18;
      risks.push({
        severity: "HIGH",
        title: "High Cognitive Burden: Multiple Urgent Items",
        description: `You have ${urgentCount} urgent commitments running concurrently in this sprint.`,
        recommendation: "Stagger execution or delegate lower-impact tasks into Quadrant 3."
      });
    }

    if (withDeadlines === 0 && tasks.length > 2) {
      score -= 10;
      risks.push({
        severity: "MEDIUM",
        title: "Commitment Uncertainty: Missing Deadlines",
        description: "Multiple tasks lack explicit time horizons, raising Parkinson's Law risk.",
        recommendation: "Assign time-of-day commitments to ensure accountability."
      });
    }

    if (tasks.length > 7) {
      score -= 12;
      risks.push({
        severity: "LOW",
        title: "Sprint Overload: High Volume",
        description: `${tasks.length} total tasks identified. Context switching may deplete energy.`,
        recommendation: "Batch similar items into single focus blocks using the Focus Sprint Timer."
      });
    }

    if (risks.length === 0) {
      risks.push({
        severity: "LOW",
        title: "Plan Coherence Verified",
        description: "Optimal workload distribution and well-separated deadlines detected.",
        recommendation: "Maintain steady focus blocks and take scheduled 5-minute cognitive resets."
      });
    }

    renderRiskAuditResults(Math.max(40, score), risks);
  } finally {
    if (auditBtn) {
      auditBtn.disabled = false;
      auditBtn.textContent = "🛡️ Run Full Audit";
    }
  }
}

function renderRiskAuditResults(score, risks) {
  const scoreBadge = document.getElementById("health-score-badge");
  const riskContainer = document.getElementById("risk-list-container");

  if (scoreBadge) {
    scoreBadge.textContent = `${score}/100`;
    scoreBadge.className = "badge";
    if (score >= 85) scoreBadge.classList.add("badge-low");
    else if (score >= 65) scoreBadge.classList.add("badge-medium");
    else scoreBadge.classList.add("badge-urgent");
  }

  if (riskContainer) {
    if (!risks || risks.length === 0) {
      riskContainer.innerHTML = '<p class="empty-state">No critical risks detected. Your plan is optimized.</p>';
      return;
    }

    riskContainer.innerHTML = risks
      .map(
        (r) => `
      <div class="risk-card severity-${(r.severity || "low").toLowerCase()}">
        <div class="risk-card-head">
          <span class="badge badge-${(r.severity || "low").toLowerCase()}">${r.severity} RISK</span>
          <span class="risk-title">${r.title}</span>
        </div>
        <p class="risk-desc">${r.description}</p>
        <div class="risk-rec">💡 <strong>Remedy:</strong> ${r.recommendation}</div>
      </div>
    `
      )
      .join("");
  }
}

function initRiskAuditor() {
  const auditBtn = document.getElementById("run-audit-btn");
  if (auditBtn) {
    auditBtn.addEventListener("click", runPlanRiskAudit);
  }
  if (document.getElementById("risk-list-container")) {
    runPlanRiskAudit();
  }
}

// ============================================================================
// 8. UNIVERSAL COMMAND PALETTE (Ctrl+K / Cmd+K)
// ============================================================================
function initCommandPalette() {
  const modal = document.getElementById("command-palette-modal");
  const input = document.getElementById("cmd-search-input");
  const list = document.getElementById("cmd-results-list");
  const openCmdBtn = document.getElementById("open-cmd-rail-btn");

  if (!modal) return;

  const commands = [
    {
      id: "sprint-25",
      title: "Focus Sprint: Start 25m Timer",
      subtitle: "Launches immediate Pomodoro sprint with audio chime",
      category: "Focus",
      icon: "⚡",
      action: () => startFocusSprint(25, "Deep Work Interval")
    },
    {
      id: "sprint-50",
      title: "Deep Work Sprint: Start 50m Timer",
      subtitle: "Sets 50-minute intense execution block",
      category: "Focus",
      icon: "🎯",
      action: () => startFocusSprint(50, "Architecture & Deep Work")
    },
    {
      id: "goto-studio",
      title: "Open Timetable & Schedule Studio",
      subtitle: "Jump to AI schedule generator, workload chart & to-do checklist",
      category: "Navigation",
      icon: "📊",
      action: () => {
        if (window.location.pathname.includes("index.html") || window.location.pathname === "/" || window.location.pathname.endsWith("/")) {
          const sec = document.getElementById("timetable-studio-section");
          if (sec) sec.scrollIntoView({ behavior: "smooth" });
        } else {
          window.location.href = "index.html#timetable-studio-section";
        }
      }
    },
    {
      id: "ambient-brown",
      title: "Ambient Sound: Brown Noise",
      subtitle: "Calming low-frequency masking sound for deep concentration",
      category: "Audio",
      icon: "🌊",
      action: () => SoundEngine.playAmbient("brown")
    },
    {
      id: "ambient-drone",
      title: "Ambient Sound: 432Hz Drone",
      subtitle: "Harmonic focus frequency wave generator",
      category: "Audio",
      icon: "🧘",
      action: () => SoundEngine.playAmbient("drone")
    },
    {
      id: "ambient-off",
      title: "Ambient Sound: Silence / Stop",
      subtitle: "Disables background audio generation",
      category: "Audio",
      icon: "🔇",
      action: () => SoundEngine.playAmbient("off")
    },
    {
      id: "open-chat",
      title: "Open ActionBot Copilot",
      subtitle: "Engage executive assistant for plan refinement or subtask extraction",
      category: "Copilot",
      icon: "🤖",
      action: () => {
        const chatModal = document.getElementById("chat-modal");
        if (chatModal) chatModal.hidden = false;
      }
    },
    {
      id: "nav-step1",
      title: "Go to Step 1: Input Ingestion",
      subtitle: "Ingest transcripts, briefs, or meeting notes",
      category: "Navigation",
      icon: "📥",
      action: () => {
        window.location.href = "index.html";
      }
    },
    {
      id: "nav-step2",
      title: "Go to Step 2: Task Analysis & Matrix",
      subtitle: "Inspect priority levels, Eisenhower matrix & risk auditor",
      category: "Navigation",
      icon: "🔍",
      action: () => {
        window.location.href = "analysis.html";
      }
    },
    {
      id: "nav-step3",
      title: "Go to Step 3: Approval & Execution",
      subtitle: "Cryptographic human sign-off and exports",
      category: "Navigation",
      icon: "✅",
      action: () => {
        window.location.href = "action.html";
      }
    }
  ];

  let selectedIndex = 0;
  let filteredCommands = [...commands];

  function openModal() {
    modal.hidden = false;
    if (input) {
      input.value = "";
      input.focus();
    }
    filteredCommands = [...commands];
    selectedIndex = 0;
    renderResults();
  }

  function closeModal() {
    modal.hidden = true;
  }

  function renderResults() {
    if (!list) return;
    if (filteredCommands.length === 0) {
      list.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-dim); font-size: 0.85rem;">No matching commands found.</div>';
      return;
    }

    list.innerHTML = "";
    filteredCommands.forEach((cmd, idx) => {
      const item = document.createElement("div");
      item.className = `cmd-item ${idx === selectedIndex ? "selected" : ""}`;
      item.innerHTML = `
        <span class="cmd-item-icon">${cmd.icon}</span>
        <div class="cmd-item-info">
          <div class="cmd-item-title">${cmd.title}</div>
          <div class="cmd-item-desc">${cmd.subtitle}</div>
        </div>
        <span class="cmd-item-badge">${cmd.category}</span>
      `;
      item.addEventListener("click", () => {
        closeModal();
        cmd.action();
      });
      list.appendChild(item);
    });
  }

  if (openCmdBtn) {
    openCmdBtn.addEventListener("click", openModal);
  }

  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (modal.hidden) openModal();
      else closeModal();
    } else if (e.key === "Escape" && !modal.hidden) {
      closeModal();
    } else if (!modal.hidden) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % filteredCommands.length;
        renderResults();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + filteredCommands.length) % filteredCommands.length;
        renderResults();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          const cmd = filteredCommands[selectedIndex];
          closeModal();
          cmd.action();
        }
      }
    }
  });

  if (input) {
    input.addEventListener("input", (e) => {
      const q = (e.target.value || "").toLowerCase().trim();
      if (!q) {
        filteredCommands = [...commands];
      } else {
        filteredCommands = commands.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.subtitle.toLowerCase().includes(q) ||
            c.category.toLowerCase().includes(q)
        );
      }
      selectedIndex = 0;
      renderResults();
    });
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
}

// ============================================================================
// 7. UNIVERSAL PRODUCTIVITY OPERATING SYSTEM ENGINE (ProductivityHub)
// ============================================================================
const ProductivityHub = {
  currentWorkspace: "Personal",
  activeView: "view-dashboard",
  tasks: [],
  projects: [],
  events: [],
  goals: [],
  notes: [],
  subjects: [],
  bugs: [],
  snippets: [],
  repos: [],

  STORAGE_KEY_HUB: "actionos_hub_state_v2",

  init() {
    this.loadState();
    this.bindWorkspaceSwitchers();
    this.bindViewTabs();
    this.bindQuickCapture();
    this.bindTaskModalsAndActions();
    this.bindCalendar();
    this.bindGoals();
    this.bindNotes();
    this.bindStudentWorkspace();
    this.bindWorkWorkspace();
    this.bindDeveloperWorkspace();
    this.bindUniversalSearch();
    this.bindTemplates();
    this.bindThemeAndSettings();

    // Initial render
    this.renderAll();
  },

  getDefaultState() {
    return {
      currentWorkspace: "Personal",
      tasks: [
        // Personal
        { id: "t-p1", title: "Renew passport and travel visa", deadline: "Tomorrow 5:00 PM", priority: "URGENT", status: "pending", workspace: "Personal", tags: ["travel", "admin"], subtasks: [{ id: "st-1", title: "Fill online DS-82 form", completed: true }, { id: "st-2", title: "Take 2x2 passport photos", completed: false }, { id: "st-3", title: "Mail courier packet", completed: false }], createdAt: Date.now() - 3600000 },
        { id: "t-p2", title: "Book annual dental hygienist checkup", deadline: "Friday", priority: "MEDIUM", status: "pending", workspace: "Personal", tags: ["health"], subtasks: [], createdAt: Date.now() - 7200000 },
        { id: "t-p3", title: "Service car engine oil and brake fluid", deadline: "Sunday 2:00 PM", priority: "LOW", status: "pending", workspace: "Personal", tags: ["auto"], subtasks: [], createdAt: Date.now() - 10000000 },
        // Work
        { id: "t-w1", title: "Prepare Q3 financial review presentation slides", deadline: "Today 4:00 PM", priority: "URGENT", status: "pending", workspace: "Work", tags: ["exec", "finance"], subtasks: [{ id: "st-4", title: "Export Stripe revenue metrics", completed: true }, { id: "st-5", title: "Draft slide 4 burn rate chart", completed: true }, { id: "st-6", title: "Review deck with CFO", completed: false }], createdAt: Date.now() - 5000000 },
        { id: "t-w2", title: "Conduct architecture sync with security auditor", deadline: "Tomorrow 10:00 AM", priority: "HIGH", status: "pending", workspace: "Work", tags: ["security", "soc2"], subtasks: [], createdAt: Date.now() - 8000000 },
        { id: "t-w3", title: "Review pull request #142 for caching layer", deadline: "Thursday", priority: "MEDIUM", status: "pending", workspace: "Work", tags: ["code-review"], subtasks: [], createdAt: Date.now() - 9000000 },
        // College
        { id: "t-c1", title: "Submit DBMS Assignment 3: B+ Tree Indexing", deadline: "Tomorrow 11:59 PM", priority: "URGENT", status: "pending", workspace: "College", tags: ["dbms", "hw"], subtasks: [{ id: "st-7", title: "Implement leaf split node algorithm", completed: true }, { id: "st-8", title: "Run test harness suite", completed: false }, { id: "st-9", title: "Generate PDF report", completed: false }], createdAt: Date.now() - 4000000 },
        { id: "t-c2", title: "Review chapters 4-6 for Algorithms midterm quiz", deadline: "Friday 9:00 AM", priority: "HIGH", status: "pending", workspace: "College", tags: ["algo", "exam"], subtasks: [], createdAt: Date.now() - 7000000 },
        { id: "t-c3", title: "Submit lab attendance verification form to TA", deadline: "Monday", priority: "LOW", status: "pending", workspace: "College", tags: ["admin"], subtasks: [], createdAt: Date.now() - 12000000 },
        // Development
        { id: "t-d1", title: "Fix memory leak in websocket event loop", deadline: "Today 6:00 PM", priority: "URGENT", status: "pending", workspace: "Development", tags: ["bug", "backend"], subtasks: [{ id: "st-10", title: "Profile heap snapshot in Chrome DevTools", completed: true }, { id: "st-11", title: "Clear unmounted listener handles", completed: false }], createdAt: Date.now() - 3000000 },
        { id: "t-d2", title: "Implement OAuth token refresh exponential backoff", deadline: "Wednesday", priority: "HIGH", status: "pending", workspace: "Development", tags: ["auth", "security"], subtasks: [], createdAt: Date.now() - 6000000 },
        { id: "t-d3", title: "Write unit tests for task extraction heuristics", deadline: "Friday", priority: "MEDIUM", status: "pending", workspace: "Development", tags: ["tests"], subtasks: [], createdAt: Date.now() - 11000000 }
      ],
      projects: [
        { id: "p1", title: "Home Office Renovation & Ergonomics", workspace: "Personal", progress: 65, status: "Active" },
        { id: "p2", title: "Half-Marathon 21k Training Regimen", workspace: "Personal", progress: 40, status: "Active" },
        { id: "p3", title: "SOC-2 Type II Compliance Certification", workspace: "Work", progress: 82, status: "Active" },
        { id: "p4", title: "Enterprise Multi-Region Infrastructure Migration", workspace: "Work", progress: 45, status: "Active" },
        { id: "p5", title: "Senior Capstone Distributed Database Engine", workspace: "College", progress: 70, status: "Active" },
        { id: "p6", title: "ActionOS v2.5 Architecture & Copilot Engine", workspace: "Development", progress: 92, status: "Active" }
      ],
      events: [
        { id: "e1", title: "Sprint Planning Standup", day: 20, time: "09:30", type: "meeting", workspace: "Work" },
        { id: "e2", title: "Deep Work: Financial Slide Deck", day: 20, time: "14:00", type: "deepwork", workspace: "Work" },
        { id: "e3", title: "Database Systems Lecture (Hall B)", day: 21, time: "10:00", type: "meeting", workspace: "College" },
        { id: "e4", title: "DBMS Assignment 3 Due", day: 21, time: "23:59", type: "deadline", workspace: "College" },
        { id: "e5", title: "Algorithms Midterm Exam", day: 25, time: "09:00", type: "exam", workspace: "College" },
        { id: "e6", title: "Evening 5k Jogging Session", day: 22, time: "18:00", type: "deepwork", workspace: "Personal" }
      ],
      goals: [
        { id: "g1", title: "Run 100 Kilometers in 30 Days", timeframe: "monthly", targetDate: "End of Month", workspace: "Personal", milestones: [{ id: "gm-1", title: "Complete 25km week 1", completed: true }, { id: "gm-2", title: "Complete 50km week 2", completed: true }, { id: "gm-3", title: "Complete 75km week 3", completed: false }, { id: "gm-4", title: "Final 100km sprint", completed: false }] },
        { id: "g2", title: "Achieve 99.99% Production API Uptime", timeframe: "monthly", targetDate: "End of Quarter", workspace: "Work", milestones: [{ id: "gm-5", title: "Add multi-zone health probes", completed: true }, { id: "gm-6", title: "Set up automated failover routing", completed: true }, { id: "gm-7", title: "Conduct chaos engineering simulation", completed: false }] },
        { id: "g3", title: "Earn Straight A Grade in DBMS and Algorithms", timeframe: "monthly", targetDate: "Semester End", workspace: "College", milestones: [{ id: "gm-8", title: "Score 95%+ on all lab assignments", completed: true }, { id: "gm-9", title: "Ace mid-semester theoretical exam", completed: false }, { id: "gm-10", title: "Submit capstone project early", completed: false }] },
        { id: "g4", title: "Ship ActionOS v2.5 with 0 Open Blocker Bugs", timeframe: "weekly", targetDate: "This Friday", workspace: "Development", milestones: [{ id: "gm-11", title: "Fix websocket connection pool", completed: true }, { id: "gm-12", title: "Ensure offline extraction 100% functional", completed: true }, { id: "gm-13", title: "Pass end-to-end audit checklist", completed: true }] }
      ],
      notes: [
        { id: "n1", title: "Weekly Planning & Habit Audit", content: "- Morning hydration and 20 min reading\n- Prioritize deep work blocks before checking email\n- Review calendar every Sunday afternoon\n- Keep inbox at zero unread", tags: ["habits", "routine"], pinned: true, workspace: "Personal", updatedAt: Date.now() - 14000000 },
        { id: "n2", title: "Client Demo Feedback & Actionables", content: "- Client loved the natural language task extraction speed\n- Requested export to .ICS for Google Calendar and Outlook\n- Requested dark mode toggle and audio chimes\n- Schedule follow-up sync for next Tuesday", tags: ["client", "feedback"], pinned: true, workspace: "Work", updatedAt: Date.now() - 25000000 },
        { id: "n3", title: "DBMS Exam Revision Checklist", content: "- B+ Tree search, insertion, and split algorithms\n- ACID guarantees and two-phase locking (2PL)\n- Query optimization via cost-based selection\n- Practice past 3 years university exam papers", tags: ["dbms", "exam"], pinned: false, workspace: "College", updatedAt: Date.now() - 30000000 }
      ],
      subjects: [
        { id: "sub-1", name: "Database Management Systems", code: "CS401", attended: 18, total: 20, instructor: "Prof. Reynolds" },
        { id: "sub-2", name: "Design & Analysis of Algorithms", code: "CS403", attended: 14, total: 20, instructor: "Dr. Henderson" }, // 70% (Below 75%!)
        { id: "sub-3", name: "Computer Networks & Security", code: "CS407", attended: 19, total: 22, instructor: "Prof. Tanaka" },
        { id: "sub-4", name: "Linear Algebra & Probability", code: "MATH302", attended: 17, total: 20, instructor: "Dr. Varma" }
      ],
      bugs: [
        { id: "b1", title: "High memory consumption during bulk JSON ingestion", severity: "Blocker", status: "In Progress" },
        { id: "b2", title: "CSS overflow on mobile viewport for Eisenhower matrix", severity: "Normal", status: "Resolved" },
        { id: "b3", title: "Web Audio synthesizer needs resume() on iOS Safari", severity: "Critical", status: "Open" }
      ],
      snippets: [
        { id: "sn-1", title: "TypeScript In-Memory Debounce Hook", lang: "TypeScript", code: "function debounce<T extends (...args: any[]) => void>(fn: T, ms = 300) {\n  let timer: any;\n  return (...args: Parameters<T>) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), ms);\n  };\n}" },
        { id: "sn-2", title: "Express Safe CORS & Health Handler", lang: "TypeScript", code: "app.get('/api/health', (req, res) => {\n  res.json({ status: 'healthy', timestamp: new Date().toISOString() });\n});" },
        { id: "sn-3", title: "Git Clean Squash Rebase Command", lang: "Bash", code: "git checkout -b feature/clean-sprint\ngit reset --soft main\ngit commit -m 'feat: complete executive task suite'\ngit push origin feature/clean-sprint --force" }
      ],
      repos: [
        { id: "r1", name: "octocat/actionos-core", branch: "main", issues: 3, prs: 1, status: "Passing", lastSync: "10 mins ago" },
        { id: "r2", name: "enterprise/productivity-engine", branch: "staging", issues: 5, prs: 2, status: "Building", lastSync: "1 hour ago" }
      ]
    };
  },

  loadState() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY_HUB);
      if (raw) {
        const parsed = JSON.parse(raw);
        Object.assign(this, parsed);
      } else {
        const def = this.getDefaultState();
        Object.assign(this, def);
        this.saveState();
      }
    } catch {
      const def = this.getDefaultState();
      Object.assign(this, def);
    }

    // Sync legacy tasks in sessionStorage with current active workspace tasks
    this.syncSessionStorage();
  },

  saveState() {
    const data = {
      currentWorkspace: this.currentWorkspace,
      tasks: this.tasks,
      projects: this.projects,
      events: this.events,
      goals: this.goals,
      notes: this.notes,
      subjects: this.subjects,
      bugs: this.bugs,
      snippets: this.snippets,
      repos: this.repos
    };
    try {
      localStorage.setItem(this.STORAGE_KEY_HUB, JSON.stringify(data));
    } catch (e) {
      console.warn("Storage quota exceeded or storage unavailable", e);
    }
    this.syncSessionStorage();
  },

  syncSessionStorage() {
    // Keep sessionStorage 'actionos_tasks' filled with active tasks so analysis.html and action.html continue to work seamlessly!
    const activeTasks = this.tasks.filter((t) => t.status !== "trash" && (!this.currentWorkspace || t.workspace === this.currentWorkspace || this.currentWorkspace === "All"));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(activeTasks));
  },

  // Switch Workspace
  setWorkspace(ws) {
    if (!ws) return;
    this.currentWorkspace = ws;
    
    // Update rail dropdown and top pill
    const railSelect = document.getElementById("rail-workspace-select");
    if (railSelect) railSelect.value = ws;

    const titleEl = document.getElementById("hub-workspace-title");
    const iconEl = document.getElementById("hub-workspace-icon");
    const icons = { Personal: "🏠", Work: "💼", College: "🎓", Development: "💻", "Side Projects": "🚀" };

    if (titleEl) titleEl.textContent = `${ws} Workspace`;
    if (iconEl) iconEl.textContent = icons[ws] || "📁";

    // Show/hide workspace specific tabs cleanly based on active workspace
    const studentPill = document.getElementById("tab-student-pill");
    const workPill = document.getElementById("tab-work-pill");
    const devPill = document.getElementById("tab-dev-pill");

    if (studentPill) studentPill.style.display = (ws === "College" || ws === "All") ? "inline-flex" : "none";
    if (workPill) workPill.style.display = (ws === "Work" || ws === "All") ? "inline-flex" : "none";
    if (devPill) devPill.style.display = (ws === "Development" || ws === "All") ? "inline-flex" : "none";

    // If user switched to College, optionally jump to student view if currently on work/dev view
    if (ws === "College" && (this.activeView === "view-work" || this.activeView === "view-developer")) {
      this.switchView("view-student");
    } else if (ws === "Work" && (this.activeView === "view-student" || this.activeView === "view-developer")) {
      this.switchView("view-work");
    } else if (ws === "Development" && (this.activeView === "view-student" || this.activeView === "view-work")) {
      this.switchView("view-developer");
    }

    this.saveState();
    this.renderAll();
  },

  bindWorkspaceSwitchers() {
    const railSelect = document.getElementById("rail-workspace-select");
    if (railSelect) {
      railSelect.addEventListener("change", (e) => {
        this.setWorkspace(e.target.value);
      });
    }

    const hubPill = document.getElementById("hub-workspace-pill");
    if (hubPill) {
      const workspaces = ["Personal", "Work", "College", "Development", "Side Projects"];
      hubPill.addEventListener("click", () => {
        const nextIdx = (workspaces.indexOf(this.currentWorkspace) + 1) % workspaces.length;
        this.setWorkspace(workspaces[nextIdx]);
      });
    }
  },

  switchView(viewId) {
    if (!viewId) return;
    this.activeView = viewId;

    // Toggle views
    document.querySelectorAll(".productivity-view").forEach((v) => {
      v.style.display = v.id === viewId ? "block" : "none";
    });

    // Update tab pills
    document.querySelectorAll("#view-tabs-bar .tab-pill").forEach((btn) => {
      if (btn.dataset.target === viewId) btn.classList.add("active");
      else btn.classList.remove("active");
    });

    // Update rail steps
    document.querySelectorAll(".rail-steps li").forEach((li) => {
      if (li.dataset.view === viewId.replace("view-", "")) li.classList.add("active");
      else li.classList.remove("active");
    });

    // Scroll to top of stage
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  bindViewTabs() {
    document.querySelectorAll("#view-tabs-bar .tab-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.target;
        this.switchView(target);
      });
    });

    document.querySelectorAll(".rail-steps li[data-view]").forEach((li) => {
      li.addEventListener("click", (e) => {
        e.preventDefault();
        const viewName = li.dataset.view;
        this.switchView(`view-` + viewName);
      });
    });

    // Dash Quick View buttons
    document.getElementById("dash-view-calendar-btn")?.addEventListener("click", () => this.switchView("view-calendar"));
    document.getElementById("dash-view-goals-btn")?.addEventListener("click", () => this.switchView("view-goals"));
  },

  // ==========================================================================
  // QUICK CAPTURE
  // ==========================================================================
  bindQuickCapture() {
    const input = document.getElementById("universal-quick-input");
    const btn = document.getElementById("universal-quick-btn");
    const railBtn = document.getElementById("open-quick-capture-btn");

    const handleQuickAdd = async (rawText) => {
      const text = (rawText || input?.value || "").trim();
      if (!text) {
        input?.focus();
        return;
      }

      // Try server quick-parse API with fallback
      let parsed = {
        title: text,
        deadline: "",
        priority: "MEDIUM",
        category: "General",
        workspace: this.currentWorkspace
      };

      try {
        const res = await fetch("/api/quick-parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: text, defaultWorkspace: this.currentWorkspace })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.title) parsed = data;
        }
      } catch {
        // Simple heuristic fallback
        if (/urgent|asap|critical|today/i.test(text)) parsed.priority = "URGENT";
        else if (/tomorrow|high/i.test(text)) parsed.priority = "HIGH";
      }

      // Populate pre-save review modal
      const titleInput = document.getElementById("qc-task-title");
      const deadlineInput = document.getElementById("qc-task-deadline");
      const prioritySelect = document.getElementById("qc-task-priority");
      const wsSelect = document.getElementById("qc-task-workspace");
      const tagInput = document.getElementById("qc-task-tag");

      if (titleInput) titleInput.value = parsed.title;
      if (deadlineInput) deadlineInput.value = parsed.deadline || "";
      if (prioritySelect) prioritySelect.value = parsed.priority || "MEDIUM";
      if (wsSelect) wsSelect.value = parsed.workspace || this.currentWorkspace;
      if (tagInput) tagInput.value = parsed.category || "";

      this.openModal("quick-capture-modal");
      if (input) input.value = "";
    };

    btn?.addEventListener("click", () => handleQuickAdd());
    input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleQuickAdd();
      }
    });
    railBtn?.addEventListener("click", () => {
      if (input) input.focus();
      else handleQuickAdd("New task item");
    });

    // Confirm save in quick-capture modal
    document.getElementById("qc-confirm-btn")?.addEventListener("click", () => {
      const title = document.getElementById("qc-task-title")?.value.trim();
      if (!title) return;

      const deadline = document.getElementById("qc-task-deadline")?.value.trim() || "";
      const priority = document.getElementById("qc-task-priority")?.value || "MEDIUM";
      const workspace = document.getElementById("qc-task-workspace")?.value || this.currentWorkspace;
      const tag = document.getElementById("qc-task-tag")?.value.trim() || "";

      const newTask = {
        id: "t-" + Math.random().toString(36).substring(2, 9),
        title,
        deadline,
        priority,
        status: "pending",
        workspace,
        tags: tag ? [tag] : [],
        subtasks: [],
        createdAt: Date.now()
      };

      this.tasks.unshift(newTask);
      this.saveState();
      this.closeModal("quick-capture-modal");
      this.renderAll();
      SoundEngine.playChime("start");
    });
  },

  // ==========================================================================
  // SMART TASK MANAGEMENT
  // ==========================================================================
  bindTaskModalsAndActions() {
    // Open full create modal
    const openCreateTaskModal = () => {
      const wsSelect = document.getElementById("new-task-workspace");
      if (wsSelect) wsSelect.value = this.currentWorkspace;
      this.openModal("create-task-modal");
    };

    document.getElementById("task-create-modal-btn")?.addEventListener("click", openCreateTaskModal);
    document.getElementById("dash-new-task-btn")?.addEventListener("click", openCreateTaskModal);

    // Save from modal
    document.getElementById("save-new-task-btn")?.addEventListener("click", () => {
      const title = document.getElementById("new-task-title")?.value.trim();
      if (!title) return;

      const desc = document.getElementById("new-task-desc")?.value.trim() || "";
      const deadline = document.getElementById("new-task-deadline")?.value.trim() || "";
      const priority = document.getElementById("new-task-priority")?.value || "MEDIUM";
      const workspace = document.getElementById("new-task-workspace")?.value || this.currentWorkspace;
      const rawTags = document.getElementById("new-task-tags")?.value || "";
      const tags = rawTags.split(",").map((t) => t.trim()).filter(Boolean);

      const newTask = {
        id: "t-" + Math.random().toString(36).substring(2, 9),
        title,
        description: desc,
        deadline,
        priority,
        status: "pending",
        workspace,
        tags,
        subtasks: [],
        createdAt: Date.now()
      };

      this.tasks.unshift(newTask);
      this.saveState();
      this.closeModal("create-task-modal");
      this.renderAll();
      SoundEngine.playChime("start");

      // Reset modal inputs
      document.getElementById("new-task-title").value = "";
      document.getElementById("new-task-desc").value = "";
      document.getElementById("new-task-deadline").value = "";
      document.getElementById("new-task-tags").value = "";
    });

    // AI Task Breakdown
    const openBreakdown = () => this.openModal("breakdown-modal");
    document.getElementById("task-ai-breakdown-btn")?.addEventListener("click", openBreakdown);
    document.getElementById("open-breakdown-btn")?.addEventListener("click", openBreakdown);
    document.getElementById("qa-breakdown-btn")?.addEventListener("click", openBreakdown);

    let generatedSubtasks = [];

    document.getElementById("breakdown-generate-btn")?.addEventListener("click", async () => {
      const input = document.getElementById("breakdown-input")?.value.trim();
      if (!input) return;

      const resultsContainer = document.getElementById("breakdown-results-container");
      const addBtn = document.getElementById("breakdown-add-tasks-btn");
      if (resultsContainer) {
        resultsContainer.innerHTML = '<div style="padding: 14px; text-align: center; color: var(--text-dim);">Decomposing into actionable milestones…</div>';
      }

      try {
        const res = await fetch("/api/breakdown-task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskTitle: input, workspace: this.currentWorkspace })
        });
        const data = await res.json();
        generatedSubtasks = data.subtasks || [];
      } catch {
        // Fallback decomposition
        generatedSubtasks = [
          { title: "Define specifications and target outcomes for " + input, estimatedMinutes: 30 },
          { title: "Assemble prerequisites, assets, and environmental setup", estimatedMinutes: 45 },
          { title: "Execute core implementation and critical path items", estimatedMinutes: 90 },
          { title: "Run verification checks, test coverage, and edge cases", estimatedMinutes: 45 },
          { title: "Publish final deliverable and notify team stakeholders", estimatedMinutes: 20 }
        ];
      }

      if (resultsContainer) {
        resultsContainer.innerHTML = "";
        generatedSubtasks.forEach((st, idx) => {
          const row = document.createElement("label");
          row.style.display = "flex";
          row.style.alignItems = "center";
          row.style.gap = "10px";
          row.style.padding = "8px 10px";
          row.style.background = "var(--bg-surface-elevated)";
          row.style.borderRadius = "var(--radius-sm)";
          row.style.fontSize = "0.82rem";
          row.style.cursor = "pointer";
          row.innerHTML = `
            <input type="checkbox" checked data-idx="${idx}" class="breakdown-check" />
            <span style="flex: 1; color: var(--text-main);">${st.title}</span>
            <span style="color: var(--text-dim); font-size: 0.75rem;">${st.estimatedMinutes ? st.estimatedMinutes + "m" : ""}</span>
          `;
          resultsContainer.appendChild(row);
        });
      }
      if (addBtn) addBtn.style.display = "inline-flex";
    });

    document.getElementById("breakdown-add-tasks-btn")?.addEventListener("click", () => {
      const checks = document.querySelectorAll(".breakdown-check:checked");
      checks.forEach((chk) => {
        const idx = parseInt(chk.dataset.idx, 10);
        const item = generatedSubtasks[idx];
        if (item) {
          this.tasks.push({
            id: "t-" + Math.random().toString(36).substring(2, 9),
            title: item.title,
            deadline: item.estimatedMinutes ? `Within ${item.estimatedMinutes}m` : "",
            priority: "HIGH",
            status: "pending",
            workspace: this.currentWorkspace,
            tags: ["subtask"],
            subtasks: [],
            createdAt: Date.now()
          });
        }
      });
      this.saveState();
      this.closeModal("breakdown-modal");
      this.renderAll();
      SoundEngine.playChime("complete");
    });

    // Filters and sorting
    document.getElementById("task-search-filter")?.addEventListener("input", () => this.renderFullTasks());
    document.getElementById("task-status-filter")?.addEventListener("change", () => this.renderFullTasks());
    document.getElementById("task-priority-filter")?.addEventListener("change", () => this.renderFullTasks());
    document.getElementById("task-sort-by")?.addEventListener("change", () => this.renderFullTasks());
  },

  toggleTaskStatus(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return;
    if (task.status === "completed") task.status = "pending";
    else {
      task.status = "completed";
      SoundEngine.playChime("complete");
    }
    this.saveState();
    this.renderAll();
  },

  deleteTask(taskId) {
    const idx = this.tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) return;
    if (this.tasks[idx].status === "trash") {
      this.tasks.splice(idx, 1);
    } else {
      this.tasks[idx].status = "trash";
    }
    this.saveState();
    this.renderAll();
  },

  restoreTask(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = "pending";
      this.saveState();
      this.renderAll();
    }
  },

  toggleSubtask(taskId, subtaskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task || !task.subtasks) return;
    const sub = task.subtasks.find((s) => s.id === subtaskId);
    if (sub) {
      sub.completed = !sub.completed;
      this.saveState();
      this.renderAll();
    }
  },

  // ==========================================================================
  // CALENDAR
  // ==========================================================================
  bindCalendar() {
    document.getElementById("cal-add-event-btn")?.addEventListener("click", () => {
      this.openModal("create-event-modal");
    });

    document.getElementById("save-new-event-btn")?.addEventListener("click", () => {
      const title = document.getElementById("new-event-title")?.value.trim();
      if (!title) return;

      const day = parseInt(document.getElementById("new-event-day")?.value, 10) || 20;
      const time = document.getElementById("new-event-time")?.value || "10:00";
      const type = document.getElementById("new-event-type")?.value || "meeting";

      this.events.push({
        id: "e-" + Math.random().toString(36).substring(2, 9),
        title,
        day,
        time,
        type,
        workspace: this.currentWorkspace
      });

      this.saveState();
      this.closeModal("create-event-modal");
      this.renderCalendar();
      this.renderDashboardDeadlines();
      SoundEngine.playChime("start");
    });
  },

  renderCalendar() {
    const container = document.getElementById("calendar-days-cells");
    if (!container) return;

    container.innerHTML = "";
    // Days in September 2026 (Starts on Tuesday = offset 2)
    const offset = 2; // Sun, Mon blank
    const daysInMonth = 30;

    for (let i = 0; i < offset; i++) {
      const blank = document.createElement("div");
      blank.className = "calendar-cell other-month";
      blank.innerHTML = `<span style="color: var(--text-dim); font-size: 0.72rem;">${31 - offset + i + 1}</span>`;
      container.appendChild(blank);
    }

    const currentDay = 20; // Simulated today
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement("div");
      cell.className = `calendar-cell ${d === currentDay ? "today" : ""}`;
      cell.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="font-size: 0.78rem; color: ${d === currentDay ? "var(--accent-light)" : "var(--text-main)"};">${d}</strong>
          ${d === currentDay ? `<span style="font-size: 0.65rem; color: var(--accent-light);">Today</span>` : ""}
        </div>
        <div class="cal-events-list" style="display: flex; flex-direction: column; gap: 2px; overflow: hidden;"></div>
      `;

      const listEl = cell.querySelector(".cal-events-list");

      // Match workspace events
      this.events
        .filter((e) => e.day === d && (!this.currentWorkspace || e.workspace === this.currentWorkspace || this.currentWorkspace === "All"))
        .forEach((ev) => {
          const pill = document.createElement("div");
          pill.className = `calendar-event-pill ${ev.type || "meeting"}`;
          pill.title = `${ev.time ? ev.time + " " : ""}${ev.title}`;
          pill.textContent = `${ev.time ? ev.time + " " : ""}${ev.title}`;
          listEl.appendChild(pill);
        });

      // Match task deadlines for that day
      this.tasks
        .filter((t) => t.status !== "trash" && (!this.currentWorkspace || t.workspace === this.currentWorkspace || this.currentWorkspace === "All"))
        .forEach((task) => {
          if (task.deadline && (task.deadline.includes(`${d}`) || (d === currentDay && /today/i.test(task.deadline)))) {
            const pill = document.createElement("div");
            pill.className = `calendar-event-pill ${task.priority.toLowerCase()}`;
            pill.title = `Task: ${task.title}`;
            pill.textContent = `📋 ${task.title}`;
            listEl.appendChild(pill);
          }
        });

      container.appendChild(cell);
    }
  },

  // ==========================================================================
  // GOALS & MILESTONES
  // ==========================================================================
  bindGoals() {
    document.getElementById("create-goal-modal-btn")?.addEventListener("click", () => {
      this.openModal("create-goal-modal");
    });

    document.getElementById("save-new-goal-btn")?.addEventListener("click", () => {
      const title = document.getElementById("new-goal-title")?.value.trim();
      if (!title) return;

      const timeframe = document.getElementById("new-goal-timeframe")?.value || "monthly";
      const targetDate = document.getElementById("new-goal-target-date")?.value.trim() || "Ongoing";
      const rawMilestones = document.getElementById("new-goal-milestones")?.value || "";
      const lines = rawMilestones.split("\n").map((l) => l.trim()).filter(Boolean);

      const milestones = lines.map((m) => ({
        id: "gm-" + Math.random().toString(36).substring(2, 9),
        title: m.replace(/^[-*•0-9.]+\s*/, ""),
        completed: false
      }));

      this.goals.unshift({
        id: "g-" + Math.random().toString(36).substring(2, 9),
        title,
        timeframe,
        targetDate,
        workspace: this.currentWorkspace,
        milestones
      });

      this.saveState();
      this.closeModal("create-goal-modal");
      this.renderGoals();
      this.renderDashboardGoals();
      SoundEngine.playChime("start");
    });

    // Goal filter buttons
    document.querySelectorAll("[data-goal-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-goal-filter]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.renderGoals(btn.dataset.goalFilter);
      });
    });
  },

  toggleGoalMilestone(goalId, milestoneId) {
    const goal = this.goals.find((g) => g.id === goalId);
    if (!goal || !goal.milestones) return;
    const ms = goal.milestones.find((m) => m.id === milestoneId);
    if (ms) {
      ms.completed = !ms.completed;
      this.saveState();
      this.renderGoals();
      this.renderDashboardGoals();
      SoundEngine.playChime(ms.completed ? "complete" : "start");
    }
  },

  renderGoals(filter = "all") {
    const container = document.getElementById("goals-container");
    if (!container) return;

    container.innerHTML = "";
    const filtered = this.goals.filter((g) => {
      const matchWs = !this.currentWorkspace || g.workspace === this.currentWorkspace || this.currentWorkspace === "All";
      const matchTf = filter === "all" || g.timeframe === filter;
      return matchWs && matchTf;
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div style="grid-column: 1 / -1; padding: 24px; text-align: center; color: var(--text-dim);">No goals set for this view. Click '+ Create Goal' above!</div>`;
      return;
    }

    filtered.forEach((goal) => {
      const total = goal.milestones ? goal.milestones.length : 0;
      const completed = goal.milestones ? goal.milestones.filter((m) => m.completed).length : 0;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

      const card = document.createElement("div");
      card.className = "goal-card";
      card.innerHTML = `
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;">
          <div>
            <span class="badge badge-low" style="font-size: 0.68rem; text-transform: uppercase;">${goal.timeframe || "Goal"}</span>
            <strong style="display: block; font-size: 0.95rem; color: var(--text-main); margin-top: 4px;">${goal.title}</strong>
            <span style="font-size: 0.75rem; color: var(--text-dim);">Target: ${goal.targetDate || "Ongoing"} · ${goal.workspace}</span>
          </div>
          <span style="font-size: 1.1rem; font-weight: 700; color: ${pct === 100 ? "var(--success)" : "var(--accent-light)"}; font-family: 'Space Grotesk', sans-serif;">${pct}%</span>
        </div>

        <div class="goal-progress-bar-bg">
          <div class="goal-progress-bar-fill" style="width: ${pct}%; background: ${pct === 100 ? "var(--success)" : "var(--accent)"};"></div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">
          ${(goal.milestones || [])
            .map(
              (m) => `
            <label class="milestone-item" style="cursor: pointer;">
              <input type="checkbox" ${m.completed ? "checked" : ""} class="goal-ms-check" data-goal="${goal.id}" data-ms="${m.id}" />
              <span style="${m.completed ? "text-decoration: line-through; color: var(--text-dim);" : ""}">${m.title}</span>
            </label>
          `
            )
            .join("")}
        </div>
      `;

      card.querySelectorAll(".goal-ms-check").forEach((chk) => {
        chk.addEventListener("change", () => {
          this.toggleGoalMilestone(chk.dataset.goal, chk.dataset.ms);
        });
      });

      container.appendChild(card);
    });
  },

  // ==========================================================================
  // NOTES & CONVERT TO TASKS
  // ==========================================================================
  bindNotes() {
    document.getElementById("create-note-modal-btn")?.addEventListener("click", () => {
      this.openModal("create-note-modal");
    });
    document.getElementById("qa-note-btn")?.addEventListener("click", () => {
      this.openModal("create-note-modal");
    });

    document.getElementById("save-new-note-btn")?.addEventListener("click", () => {
      const title = document.getElementById("new-note-title")?.value.trim();
      if (!title) return;

      const content = document.getElementById("new-note-content")?.value.trim() || "";
      const rawTags = document.getElementById("new-note-tags")?.value || "";
      const tags = rawTags.split(",").map((t) => t.trim()).filter(Boolean);

      this.notes.unshift({
        id: "n-" + Math.random().toString(36).substring(2, 9),
        title,
        content,
        tags,
        pinned: false,
        workspace: this.currentWorkspace,
        updatedAt: Date.now()
      });

      this.saveState();
      this.closeModal("create-note-modal");
      this.renderNotes();
      SoundEngine.playChime("start");
    });
  },

  convertNoteToTasks(noteId) {
    const note = this.notes.find((n) => n.id === noteId);
    if (!note || !note.content) return;

    // Parse bullet points or sentences
    const lines = note.content.split("\n").map((l) => l.trim()).filter(Boolean);
    let addedCount = 0;

    lines.forEach((line) => {
      const clean = line.replace(/^[-*•0-9.]+\s*/, "").trim();
      if (clean.length > 5) {
        this.tasks.push({
          id: "t-" + Math.random().toString(36).substring(2, 9),
          title: clean,
          deadline: "Upcoming",
          priority: "MEDIUM",
          status: "pending",
          workspace: note.workspace || this.currentWorkspace,
          tags: ["from-note", ...(note.tags || [])],
          subtasks: [],
          createdAt: Date.now()
        });
        addedCount++;
      }
    });

    this.saveState();
    this.renderAll();
    SoundEngine.playChime("complete");
    alert(`Converted ${addedCount} actionable task items from "${note.title}" into your Task Manager!`);
  },

  toggleNotePin(noteId) {
    const note = this.notes.find((n) => n.id === noteId);
    if (note) {
      note.pinned = !note.pinned;
      this.saveState();
      this.renderNotes();
    }
  },

  deleteNote(noteId) {
    const idx = this.notes.findIndex((n) => n.id === noteId);
    if (idx !== -1) {
      this.notes.splice(idx, 1);
      this.saveState();
      this.renderNotes();
    }
  },

  renderNotes() {
    const container = document.getElementById("notes-container");
    if (!container) return;

    container.innerHTML = "";
    const filtered = this.notes.filter((n) => !this.currentWorkspace || n.workspace === this.currentWorkspace || this.currentWorkspace === "All");

    if (filtered.length === 0) {
      container.innerHTML = `<div style="grid-column: 1 / -1; padding: 24px; text-align: center; color: var(--text-dim);">No notes yet in this workspace. Click '+ New Note' to start writing.</div>`;
      return;
    }

    filtered.forEach((note) => {
      const card = document.createElement("div");
      card.className = `note-card ${note.pinned ? "pinned" : ""}`;
      card.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <strong style="font-size: 0.95rem; color: var(--text-main);">${note.title}</strong>
          <button type="button" class="why-toggle pin-note-btn" data-id="${note.id}" style="padding: 2px 6px;">
            ${note.pinned ? "📌 Pinned" : "Pin"}
          </button>
        </div>

        <div class="note-body-preview">${note.content}</div>

        <div style="display: flex; gap: 4px; flex-wrap: wrap;">
          ${(note.tags || []).map((t) => `<span class="task-tag">#${t}</span>`).join("")}
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 10px; margin-top: auto;">
          <button type="button" class="btn-secondary convert-note-btn" data-id="${note.id}" style="padding: 4px 10px; font-size: 0.75rem; color: var(--accent-light);">
            ⚡ Convert to Tasks
          </button>
          <button type="button" class="why-toggle delete-note-btn" data-id="${note.id}" style="color: var(--urgent); padding: 4px 8px;">
            Delete
          </button>
        </div>
      `;

      card.querySelector(".pin-note-btn")?.addEventListener("click", () => this.toggleNotePin(note.id));
      card.querySelector(".convert-note-btn")?.addEventListener("click", () => this.convertNoteToTasks(note.id));
      card.querySelector(".delete-note-btn")?.addEventListener("click", () => this.deleteNote(note.id));

      container.appendChild(card);
    });
  },

  // ==========================================================================
  // STUDENT WORKSPACE (COLLEGE)
  // ==========================================================================
  bindStudentWorkspace() {
    // Open Study Planner
    const openStudyPlanner = () => this.openModal("study-planner-modal");
    document.getElementById("student-plan-study-btn")?.addEventListener("click", openStudyPlanner);
    document.getElementById("qa-planner-btn")?.addEventListener("click", openStudyPlanner);

    let generatedStudyItems = [];

    document.getElementById("study-generate-btn")?.addEventListener("click", async () => {
      const subject = document.getElementById("study-subject-input")?.value.trim() || "Database Management Systems";
      const daysLeft = parseInt(document.getElementById("study-days-input")?.value, 10) || 7;
      const out = document.getElementById("study-plan-output");
      const importBtn = document.getElementById("study-import-btn");

      if (out) out.innerHTML = '<div style="padding: 14px; text-align: center; color: var(--text-dim);">Designing curriculum, review checkpoints, and practice questions…</div>';

      try {
        const res = await fetch("/api/study-planner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject, daysLeft })
        });
        const data = await res.json();
        generatedStudyItems = data.studyPlan || [];
      } catch {
        // Fallback generator
        generatedStudyItems = [
          { day: 1, topic: "Core Architecture & Relational Schema Normalization", sessionMinutes: 90, type: "Concept Mastery" },
          { day: 2, topic: "B+ Tree and Hash Indexing with Performance Benchmarks", sessionMinutes: 90, type: "Deep Dive" },
          { day: 3, topic: "Transaction Isolation, ACID Properties, and Deadlocks", sessionMinutes: 90, type: "Concept Mastery" },
          { day: 4, topic: "Query Plan Optimization & Cost Evaluation", sessionMinutes: 90, type: "Problem Solving" },
          { day: 5, topic: "Distributed Consensus & Two-Phase Commit Protocols", sessionMinutes: 90, type: "Case Study" },
          { day: 6, topic: "Mock Exam Simulation: 3 Hours Under Timed Conditions", sessionMinutes: 180, type: "Practice Exam" },
          { day: 7, topic: "Formula Cheat Sheet, High-Yield Concepts & Mind Mapping", sessionMinutes: 60, type: "Final Revision" }
        ];
      }

      if (out) {
        out.innerHTML = "";
        generatedStudyItems.forEach((st) => {
          const div = document.createElement("div");
          div.style.padding = "8px 12px";
          div.style.background = "var(--bg-surface-elevated)";
          div.style.borderRadius = "var(--radius-sm)";
          div.style.fontSize = "0.82rem";
          div.style.display = "flex";
          div.style.alignItems = "center";
          div.style.justifyContent = "space-between";
          div.innerHTML = `
            <div>
              <strong>Day ${st.day}: ${st.topic}</strong>
              <div style="font-size: 0.72rem; color: var(--text-dim);">${st.type || "Study"} · ${st.sessionMinutes || 90} mins</div>
            </div>
            <span class="badge badge-medium">Day ${st.day}</span>
          `;
          out.appendChild(div);
        });
      }
      if (importBtn) importBtn.style.display = "inline-flex";
    });

    document.getElementById("study-import-btn")?.addEventListener("click", () => {
      generatedStudyItems.forEach((st) => {
        this.tasks.push({
          id: "t-" + Math.random().toString(36).substring(2, 9),
          title: `[Day ${st.day}] ${st.topic}`,
          deadline: `Day ${st.day} of Study Plan`,
          priority: "HIGH",
          status: "pending",
          workspace: "College",
          tags: ["study-plan", "exam-prep"],
          subtasks: [],
          createdAt: Date.now()
        });

        this.events.push({
          id: "e-" + Math.random().toString(36).substring(2, 9),
          title: `Study: ${st.topic}`,
          day: Math.min(30, 20 + st.day),
          time: "19:00",
          type: "deepwork",
          workspace: "College"
        });
      });

      this.saveState();
      this.closeModal("study-planner-modal");
      this.renderAll();
      SoundEngine.playChime("complete");
      alert(`Imported ${generatedStudyItems.length} study sessions into your College Tasks and Calendar!`);
    });

    // Add subject
    document.getElementById("student-add-subject-btn")?.addEventListener("click", () => {
      const name = prompt("Enter Subject Name (e.g. Operating Systems):");
      if (!name) return;
      const code = prompt("Enter Course Code (e.g. CS405):") || "CS400";
      this.subjects.push({
        id: "sub-" + Math.random().toString(36).substring(2, 7),
        name,
        code,
        attended: 10,
        total: 10,
        instructor: "Professor"
      });
      this.saveState();
      this.renderStudentWorkspace();
    });

    // Add exam
    document.getElementById("student-add-exam-btn")?.addEventListener("click", () => {
      const title = prompt("Enter Exam or Assignment Name:");
      if (!title) return;
      const deadline = prompt("Enter Due Date (e.g. Friday 5 PM):") || "Friday";
      this.tasks.unshift({
        id: "t-" + Math.random().toString(36).substring(2, 9),
        title,
        deadline,
        priority: "URGENT",
        status: "pending",
        workspace: "College",
        tags: ["exam", "college"],
        subtasks: [],
        createdAt: Date.now()
      });
      this.saveState();
      this.renderAll();
    });
  },

  logAttendance(subjectId, deltaAttended, deltaTotal) {
    const sub = this.subjects.find((s) => s.id === subjectId);
    if (!sub) return;
    sub.attended = Math.max(0, sub.attended + deltaAttended);
    sub.total = Math.max(1, sub.total + deltaTotal);
    this.saveState();
    this.renderStudentWorkspace();
  },

  renderStudentWorkspace() {
    const container = document.getElementById("student-subjects-container");
    if (!container) return;

    container.innerHTML = "";
    this.subjects.forEach((sub) => {
      const pct = Math.round((sub.attended / sub.total) * 100);
      const isCritical = pct < 75;

      const row = document.createElement("div");
      row.className = "task-item-card";
      row.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <div>
            <strong style="font-size: 0.92rem; color: var(--text-main);">${sub.name}</strong>
            <div style="font-size: 0.75rem; color: var(--text-dim);">${sub.code} · ${sub.instructor || "Faculty"}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="text-align: right;">
              <span style="font-size: 1.1rem; font-weight: 700; color: ${isCritical ? "var(--urgent)" : "var(--success)"}; font-family: 'Space Grotesk', sans-serif;">${pct}%</span>
              <div style="font-size: 0.72rem; color: var(--text-dim);">${sub.attended}/${sub.total} classes</div>
            </div>
            ${isCritical ? `<span class="badge badge-urgent" style="font-size: 0.68rem;">⚠️ &lt;75% Attendance!</span>` : `<span class="badge badge-low" style="font-size: 0.68rem; color: var(--success);">Eligible</span>`}
          </div>
        </div>

        <div class="goal-progress-bar-bg" style="margin: 4px 0;">
          <div class="goal-progress-bar-fill" style="width: ${pct}%; background: ${isCritical ? "var(--urgent)" : "var(--success)"};"></div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.78rem;">
          <span style="color: var(--text-dim);">Quick Attendance Log:</span>
          <div style="display: flex; gap: 4px;">
            <button type="button" class="btn-secondary attend-yes-btn" data-id="${sub.id}" style="padding: 2px 8px; font-size: 0.72rem;">+ Attended (+1)</button>
            <button type="button" class="btn-secondary attend-no-btn" data-id="${sub.id}" style="padding: 2px 8px; font-size: 0.72rem; color: var(--urgent);">- Missed (+0/1)</button>
          </div>
        </div>
      `;

      row.querySelector(".attend-yes-btn")?.addEventListener("click", () => this.logAttendance(sub.id, 1, 1));
      row.querySelector(".attend-no-btn")?.addEventListener("click", () => this.logAttendance(sub.id, 0, 1));

      container.appendChild(row);
    });

    // Exams container in student view
    const examsContainer = document.getElementById("student-exams-container");
    if (examsContainer) {
      examsContainer.innerHTML = "";
      const collegeTasks = this.tasks.filter((t) => t.workspace === "College" && t.status !== "trash");
      if (collegeTasks.length === 0) {
        examsContainer.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-dim);">No assignments due. Click + Exam to add one!</div>';
      } else {
        collegeTasks.forEach((t) => {
          const div = document.createElement("div");
          div.className = "task-item-card";
          div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong style="font-size: 0.88rem; color: var(--text-main);">${t.title}</strong>
              <span class="badge badge-${t.priority.toLowerCase()}">${t.priority}</span>
            </div>
            <span style="font-size: 0.75rem; color: var(--text-dim);">⏱ ${t.deadline || "Upcoming"}</span>
          `;
          examsContainer.appendChild(div);
        });
      }
    }
  },

  // ==========================================================================
  // WORK WORKSPACE
  // ==========================================================================
  bindWorkWorkspace() {
    const openMeetingExtractor = () => this.openModal("meeting-modal");
    document.getElementById("work-extract-meeting-btn")?.addEventListener("click", openMeetingExtractor);
    document.getElementById("qa-meeting-btn")?.addEventListener("click", openMeetingExtractor);

    let extractedActions = [];

    document.getElementById("meeting-extract-btn")?.addEventListener("click", async () => {
      const notes = document.getElementById("meeting-notes-input")?.value.trim();
      if (!notes) return;

      const out = document.getElementById("meeting-actions-output");
      const importBtn = document.getElementById("meeting-import-btn");

      if (out) out.innerHTML = '<div style="padding: 14px; text-align: center; color: var(--text-dim);">Isolating decisions, assignees, and deadlines…</div>';

      try {
        const res = await fetch("/api/meeting-actions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ meetingNotes: notes })
        });
        const data = await res.json();
        extractedActions = data.actionItems || [];
      } catch {
        // Fallback action item extraction
        extractedActions = [
          { title: "Finalize client proposal slide deck", assignee: "Alice", deadline: "Wednesday 4:00 PM", priority: "HIGH" },
          { title: "Run database migrations and schema checks", assignee: "Bob", deadline: "Tonight", priority: "URGENT" },
          { title: "Email quarterly revenue updates to investors", assignee: "Sarah", deadline: "Friday morning", priority: "MEDIUM" }
        ];
      }

      if (out) {
        out.innerHTML = "";
        extractedActions.forEach((act) => {
          const div = document.createElement("div");
          div.style.padding = "8px 10px";
          div.style.background = "var(--bg-surface-elevated)";
          div.style.borderRadius = "var(--radius-sm)";
          div.style.fontSize = "0.82rem";
          div.style.display = "flex";
          div.style.alignItems = "center";
          div.style.justifyContent = "space-between";
          div.innerHTML = `
            <div>
              <strong>${act.title}</strong>
              <div style="font-size: 0.72rem; color: var(--text-dim);">👤 Owner: ${act.assignee || "Unassigned"} · ⏱ ${act.deadline || "TBD"}</div>
            </div>
            <span class="badge badge-${(act.priority || "medium").toLowerCase()}">${act.priority || "MEDIUM"}</span>
          `;
          out.appendChild(div);
        });
      }
      if (importBtn) importBtn.style.display = "inline-flex";
    });

    document.getElementById("meeting-import-btn")?.addEventListener("click", () => {
      extractedActions.forEach((act) => {
        this.tasks.push({
          id: "t-" + Math.random().toString(36).substring(2, 9),
          title: `${act.title} (${act.assignee || "Team"})`,
          deadline: act.deadline || "This week",
          priority: act.priority || "HIGH",
          status: "pending",
          workspace: "Work",
          tags: ["meeting-action", act.assignee ? act.assignee.toLowerCase() : "team"],
          subtasks: [],
          createdAt: Date.now()
        });
      });

      this.saveState();
      this.closeModal("meeting-modal");
      this.renderAll();
      SoundEngine.playChime("complete");
      alert(`Imported ${extractedActions.length} action items into your Work Task Manager!`);
    });

    // Add project in Work view
    document.getElementById("work-add-project-btn")?.addEventListener("click", () => {
      const title = prompt("Enter Project Title:");
      if (!title) return;
      this.projects.push({
        id: "p-" + Math.random().toString(36).substring(2, 7),
        title,
        workspace: "Work",
        progress: 10,
        status: "Active"
      });
      this.saveState();
      this.renderWorkWorkspace();
      this.renderDashboardProjects();
    });

    // Add meeting in Work view
    document.getElementById("work-add-meeting-btn")?.addEventListener("click", () => {
      const title = prompt("Enter Meeting Title (e.g. Weekly Executive Review):");
      if (!title) return;
      this.events.push({
        id: "e-" + Math.random().toString(36).substring(2, 7),
        title,
        day: 22,
        time: "15:00",
        type: "meeting",
        workspace: "Work"
      });
      this.saveState();
      this.renderCalendar();
      this.renderWorkWorkspace();
      this.renderDashboardDeadlines();
    });
  },

  renderWorkWorkspace() {
    const projContainer = document.getElementById("work-projects-container");
    if (projContainer) {
      projContainer.innerHTML = "";
      const workProjs = this.projects.filter((p) => p.workspace === "Work");
      workProjs.forEach((p) => {
        const div = document.createElement("div");
        div.className = "task-item-card";
        div.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-size: 0.92rem; color: var(--text-main);">${p.title}</strong>
            <span style="font-size: 0.82rem; font-weight: 600; color: var(--accent-light);">${p.progress}%</span>
          </div>
          <div class="goal-progress-bar-bg" style="margin: 4px 0;">
            <div class="goal-progress-bar-fill" style="width: ${p.progress}%;"></div>
          </div>
        `;
        projContainer.appendChild(div);
      });
    }

    const meetContainer = document.getElementById("work-meetings-container");
    if (meetContainer) {
      meetContainer.innerHTML = "";
      const workEvents = this.events.filter((e) => e.workspace === "Work");
      workEvents.forEach((ev) => {
        const div = document.createElement("div");
        div.className = "task-item-card";
        div.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-size: 0.88rem; color: var(--text-main);">${ev.title}</strong>
            <span class="badge badge-low">Day ${ev.day} · ${ev.time || "Sync"}</span>
          </div>
        `;
        meetContainer.appendChild(div);
      });
    }
  },

  // ==========================================================================
  // DEVELOPER WORKSPACE
  // ==========================================================================
  bindDeveloperWorkspace() {
    document.getElementById("dev-new-snippet-btn")?.addEventListener("click", () => {
      const title = prompt("Snippet Title:");
      if (!title) return;
      const lang = prompt("Language (TypeScript, Python, Bash):") || "TypeScript";
      const code = prompt("Paste Code Snippet:") || "// your code here";
      this.snippets.unshift({
        id: "sn-" + Math.random().toString(36).substring(2, 7),
        title,
        lang,
        code
      });
      this.saveState();
      this.renderDeveloperWorkspace();
    });

    document.getElementById("dev-add-bug-btn")?.addEventListener("click", () => {
      const title = prompt("Bug Description / Issue:");
      if (!title) return;
      const severity = prompt("Severity (Blocker, Critical, Normal, Minor):") || "Normal";
      this.bugs.unshift({
        id: "b-" + Math.random().toString(36).substring(2, 7),
        title,
        severity,
        status: "Open"
      });
      this.saveState();
      this.renderDeveloperWorkspace();
    });

    document.getElementById("dev-sync-repo-btn")?.addEventListener("click", () => {
      alert("Simulated GitHub/GitLab repository sync complete. All webhook events verified.");
    });
  },

  renderDeveloperWorkspace() {
    // Repositories
    const repoContainer = document.getElementById("dev-repos-container");
    if (repoContainer) {
      repoContainer.innerHTML = "";
      this.repos.forEach((repo) => {
        const card = document.createElement("div");
        card.className = "github-repo-card";
        card.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.1rem;">📦</span>
              <strong style="font-size: 0.92rem; color: var(--accent-light);">${repo.name}</strong>
              <span class="task-tag">${repo.branch}</span>
            </div>
            <span class="badge badge-low" style="color: var(--success);">${repo.status}</span>
          </div>
          <div style="display: flex; gap: 14px; font-size: 0.78rem; color: var(--text-dim); margin-top: 4px;">
            <span>⚠️ ${repo.issues} open issues</span>
            <span>🔀 ${repo.prs} pending PRs</span>
            <span>⏱ Synced ${repo.lastSync}</span>
          </div>
          <button type="button" class="btn-secondary convert-issue-btn" style="margin-top: 6px; padding: 4px 8px; font-size: 0.75rem; align-self: flex-start;">
            + Import Issues to Dev Tasks
          </button>
        `;

        card.querySelector(".convert-issue-btn")?.addEventListener("click", () => {
          this.tasks.unshift({
            id: "t-" + Math.random().toString(36).substring(2, 9),
            title: `Fix ${repo.name} issue: Memory leak in event dispatcher`,
            deadline: "Today",
            priority: "URGENT",
            status: "pending",
            workspace: "Development",
            tags: ["git", "bug"],
            subtasks: [],
            createdAt: Date.now()
          });
          this.saveState();
          this.renderAll();
          alert(`Created new high-priority development task from ${repo.name}!`);
        });

        repoContainer.appendChild(card);
      });
    }

    // Bugs
    const bugsContainer = document.getElementById("dev-bugs-container");
    if (bugsContainer) {
      bugsContainer.innerHTML = "";
      this.bugs.forEach((b) => {
        const div = document.createElement("div");
        div.className = "task-item-card";
        div.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-size: 0.88rem; color: var(--text-main);">${b.title}</strong>
            <span class="badge badge-${b.severity === "Blocker" || b.severity === "Critical" ? "urgent" : "medium"}">${b.severity}</span>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-dim);">Status: ${b.status}</div>
        `;
        bugsContainer.appendChild(div);
      });
    }

    // Snippets
    const snipContainer = document.getElementById("dev-snippets-container");
    if (snipContainer) {
      snipContainer.innerHTML = "";
      this.snippets.forEach((s) => {
        const card = document.createElement("div");
        card.className = "dash-card";
        card.style.background = "var(--bg-deep)";
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-size: 0.85rem; color: var(--text-main);">${s.title}</strong>
            <span class="task-tag">${s.lang}</span>
          </div>
          <pre class="code-snippet-box"><code>${s.code}</code></pre>
          <button type="button" class="btn-secondary copy-snippet-btn" style="padding: 4px 10px; font-size: 0.72rem; align-self: flex-end;">
            Copy Code
          </button>
        `;
        card.querySelector(".copy-snippet-btn")?.addEventListener("click", () => {
          navigator.clipboard?.writeText(s.code);
          alert(`Copied "${s.title}" snippet to clipboard!`);
        });
        snipContainer.appendChild(card);
      });
    }
  },

  // ==========================================================================
  // UNIVERSAL SEARCH
  // ==========================================================================
  bindUniversalSearch() {
    const openSearch = () => {
      this.openModal("universal-search-modal");
      const input = document.getElementById("universal-search-input");
      if (input) {
        input.value = "";
        input.focus();
      }
      this.executeUniversalSearch("");
    };

    document.getElementById("hub-search-btn")?.addEventListener("click", openSearch);

    let activeFilter = "all";
    document.querySelectorAll("#search-filter-chips button").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#search-filter-chips button").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeFilter = btn.dataset.searchFilter;
        const q = document.getElementById("universal-search-input")?.value || "";
        this.executeUniversalSearch(q, activeFilter);
      });
    });

    document.getElementById("universal-search-input")?.addEventListener("input", (e) => {
      this.executeUniversalSearch(e.target.value, activeFilter);
    });
  },

  executeUniversalSearch(query, filter = "all") {
    const q = (query || "").toLowerCase().trim();
    const resultsContainer = document.getElementById("search-results-container");
    if (!resultsContainer) return;

    if (!q) {
      resultsContainer.innerHTML = '<div style="text-align: center; color: var(--text-dim); padding: 24px;">Type a keyword to search across Tasks, Projects, Notes, Goals, and Calendar…</div>';
      return;
    }

    const matches = [];

    // Search tasks
    if (filter === "all" || filter === "task") {
      this.tasks.forEach((t) => {
        if (t.title.toLowerCase().includes(q) || (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q)))) {
          matches.push({ type: "Task", title: t.title, meta: `${t.workspace} · Priority: ${t.priority}`, icon: "📋", action: () => this.switchView("view-tasks") });
        }
      });
    }

    // Search projects
    if (filter === "all" || filter === "project") {
      this.projects.forEach((p) => {
        if (p.title.toLowerCase().includes(q)) {
          matches.push({ type: "Project", title: p.title, meta: `${p.workspace} · Progress: ${p.progress}%`, icon: "🚀", action: () => this.switchView("view-dashboard") });
        }
      });
    }

    // Search notes
    if (filter === "all" || filter === "note") {
      this.notes.forEach((n) => {
        if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) {
          matches.push({ type: "Note", title: n.title, meta: `${n.workspace} · Note`, icon: "📝", action: () => this.switchView("view-notes") });
        }
      });
    }

    // Search goals
    if (filter === "all" || filter === "goal") {
      this.goals.forEach((g) => {
        if (g.title.toLowerCase().includes(q)) {
          matches.push({ type: "Goal", title: g.title, meta: `${g.workspace} · Target: ${g.targetDate}`, icon: "🎯", action: () => this.switchView("view-goals") });
        }
      });
    }

    // Search events
    if (filter === "all" || filter === "event") {
      this.events.forEach((e) => {
        if (e.title.toLowerCase().includes(q)) {
          matches.push({ type: "Event", title: e.title, meta: `Day ${e.day} ${e.time || ""} · ${e.workspace}`, icon: "📅", action: () => this.switchView("view-calendar") });
        }
      });
    }

    if (matches.length === 0) {
      resultsContainer.innerHTML = `<div style="text-align: center; color: var(--text-dim); padding: 24px;">No items match "${query}".</div>`;
      return;
    }

    resultsContainer.innerHTML = "";
    matches.forEach((m) => {
      const item = document.createElement("div");
      item.className = "search-result-item";
      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <span>${m.icon}</span>
          <div>
            <strong style="font-size: 0.88rem; color: var(--text-main);">${m.title}</strong>
            <div style="font-size: 0.72rem; color: var(--text-dim);">${m.meta}</div>
          </div>
        </div>
        <span class="command-item-badge">${m.type}</span>
      `;
      item.addEventListener("click", () => {
        this.closeModal("universal-search-modal");
        m.action();
      });
      resultsContainer.appendChild(item);
    });
  },

  // ==========================================================================
  // TEMPLATES
  // ==========================================================================
  bindTemplates() {
    document.querySelectorAll(".apply-template-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.template;
        this.applyTemplate(type);
      });
    });
  },

  applyTemplate(type) {
    if (type === "student") {
      this.tasks.unshift(
        { id: "t-" + Math.random().toString(36).substring(2, 9), title: "Review DBMS Lecture 4 Slides & Readings", deadline: "Wednesday", priority: "HIGH", status: "pending", workspace: "College", tags: ["study", "dbms"], subtasks: [], createdAt: Date.now() },
        { id: "t-" + Math.random().toString(36).substring(2, 9), title: "Complete Algorithm Homework Set 2", deadline: "Friday 5 PM", priority: "URGENT", status: "pending", workspace: "College", tags: ["hw"], subtasks: [], createdAt: Date.now() },
        { id: "t-" + Math.random().toString(36).substring(2, 9), title: "Organize weekend group study session", deadline: "Saturday", priority: "LOW", status: "pending", workspace: "College", tags: ["study-group"], subtasks: [], createdAt: Date.now() }
      );
      this.setWorkspace("College");
      this.switchView("view-student");
      alert("Student Semester Starter Pack loaded into your College workspace!");
    } else if (type === "work") {
      this.tasks.unshift(
        { id: "t-" + Math.random().toString(36).substring(2, 9), title: "Prepare daily engineering standup updates", deadline: "Daily 09:30 AM", priority: "HIGH", status: "pending", workspace: "Work", tags: ["standup"], subtasks: [], createdAt: Date.now() },
        { id: "t-" + Math.random().toString(36).substring(2, 9), title: "Audit quarterly compliance documentation", deadline: "Friday", priority: "URGENT", status: "pending", workspace: "Work", tags: ["audit"], subtasks: [], createdAt: Date.now() }
      );
      this.setWorkspace("Work");
      this.switchView("view-work");
      alert("Employee Sprint Pack loaded into your Work workspace!");
    } else if (type === "dev") {
      this.tasks.unshift(
        { id: "t-" + Math.random().toString(36).substring(2, 9), title: "Run end-to-end integration test suite on staging", deadline: "Tomorrow", priority: "URGENT", status: "pending", workspace: "Development", tags: ["testing", "ci"], subtasks: [], createdAt: Date.now() },
        { id: "t-" + Math.random().toString(36).substring(2, 9), title: "Benchmark API endpoint latency under 5k rps", deadline: "Thursday", priority: "HIGH", status: "pending", workspace: "Development", tags: ["perf"], subtasks: [], createdAt: Date.now() }
      );
      this.setWorkspace("Development");
      this.switchView("view-developer");
      alert("Developer Release Pack loaded into your Development workspace!");
    } else if (type === "personal") {
      this.tasks.unshift(
        { id: "t-" + Math.random().toString(36).substring(2, 9), title: "Morning 30-minute diaphragmatic breathing & workout", deadline: "Daily 07:00 AM", priority: "MEDIUM", status: "pending", workspace: "Personal", tags: ["habits"], subtasks: [], createdAt: Date.now() },
        { id: "t-" + Math.random().toString(36).substring(2, 9), title: "Review monthly personal financial budget & savings", deadline: "Sunday", priority: "HIGH", status: "pending", workspace: "Personal", tags: ["finance"], subtasks: [], createdAt: Date.now() }
      );
      this.setWorkspace("Personal");
      this.switchView("view-dashboard");
      alert("Personal Habits Pack loaded into your Personal workspace!");
    }

    this.saveState();
    this.renderAll();
    SoundEngine.playChime("complete");
  },

  // ==========================================================================
  // THEME, NOTIFICATIONS & SETTINGS
  // ==========================================================================
  bindThemeAndSettings() {
    // Theme toggle
    const themeBtn = document.getElementById("theme-toggle-btn");
    const themeIcon = document.getElementById("theme-toggle-icon");

    const savedTheme = localStorage.getItem("actionos_theme") || "dark";
    if (savedTheme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
      if (themeIcon) themeIcon.textContent = "☀️";
    }

    themeBtn?.addEventListener("click", () => {
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      if (isLight) {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("actionos_theme", "dark");
        if (themeIcon) themeIcon.textContent = "🌙";
      } else {
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.setItem("actionos_theme", "light");
        if (themeIcon) themeIcon.textContent = "☀️";
      }
    });

    // Request Web Notification permission
    const notifBtn = document.getElementById("notifications-btn");
    const reqNotifBtn = document.getElementById("request-notif-btn");

    const handleReqNotifs = () => {
      if ("Notification" in window) {
        Notification.requestPermission().then((perm) => {
          if (perm === "granted") {
            alert("Web notifications enabled! You will receive focus countdown alerts and deadline notices.");
            new Notification("ActionOS Active", { body: "Universal productivity notifications are now active!" });
          } else {
            alert("Notification permission was not granted.");
          }
        });
      } else {
        alert("Web Notifications are not supported by this browser.");
      }
    };

    notifBtn?.addEventListener("click", handleReqNotifs);
    reqNotifBtn?.addEventListener("click", handleReqNotifs);

    // Export JSON Backup
    document.getElementById("export-json-btn")?.addEventListener("click", () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this, null, 2));
      const a = document.createElement("a");
      a.setAttribute("href", dataStr);
      a.setAttribute("download", `actionos-backup-${new Date().toISOString().slice(0, 10)}.json`);
      a.click();
    });

    // Clear All Data
    document.getElementById("clear-data-btn")?.addEventListener("click", () => {
      if (confirm("Are you sure you want to reset all ActionOS workspace data back to clean defaults?")) {
        localStorage.removeItem(this.STORAGE_KEY_HUB);
        sessionStorage.removeItem(STORAGE_KEY);
        location.reload();
      }
    });

    // Modal close buttons
    document.querySelectorAll(".modal-close-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const modalId = btn.dataset.modal;
        if (modalId) this.closeModal(modalId);
      });
    });

    document.querySelectorAll(".productivity-modal-backdrop").forEach((backdrop) => {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) backdrop.style.display = "none";
      });
    });

    // Open Copilot buttons
    const openCopilot = () => {
      const modal = document.getElementById("chat-modal");
      if (modal) modal.hidden = false;
    };
    document.getElementById("hub-ai-btn")?.addEventListener("click", openCopilot);
    document.getElementById("qa-copilot-btn")?.addEventListener("click", openCopilot);
    document.getElementById("open-chat-rail-btn")?.addEventListener("click", openCopilot);
  },

  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.style.display = "flex";
  },

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.style.display = "none";
  },

  // ==========================================================================
  // MASTER RENDER
  // ==========================================================================
  renderAll() {
    this.renderDashboardStats();
    this.renderDashboardTodayTasks();
    this.renderDashboardDeadlines();
    this.renderDashboardProjects();
    this.renderDashboardGoals();
    this.renderFullTasks();
    this.renderCalendar();
    this.renderGoals();
    this.renderNotes();
    this.renderStudentWorkspace();
    this.renderWorkWorkspace();
    this.renderDeveloperWorkspace();
  },

  renderDashboardStats() {
    const activeTasks = this.tasks.filter((t) => t.status !== "trash" && (!this.currentWorkspace || t.workspace === this.currentWorkspace || this.currentWorkspace === "All"));
    const dueToday = activeTasks.filter((t) => /today|asap|urgent/i.test(t.deadline || "") || t.priority === "URGENT");

    const statTasks = document.getElementById("dash-stat-tasks");
    const statToday = document.getElementById("dash-stat-today");
    const tabCount = document.getElementById("tab-tasks-count");

    if (statTasks) statTasks.textContent = `${activeTasks.length}`;
    if (statToday) statToday.textContent = `${dueToday.length}`;
    if (tabCount) tabCount.textContent = `${activeTasks.length}`;
  },

  renderDashboardTodayTasks() {
    const container = document.getElementById("dash-today-tasks-container");
    if (!container) return;

    container.innerHTML = "";
    const activeTasks = this.tasks
      .filter((t) => t.status !== "trash" && (!this.currentWorkspace || t.workspace === this.currentWorkspace || this.currentWorkspace === "All"))
      .slice(0, 6);

    if (activeTasks.length === 0) {
      container.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-dim); font-size: 0.85rem;">No active tasks in this workspace. Click '+ Add Task' above!</div>`;
      return;
    }

    activeTasks.forEach((t) => {
      const row = document.createElement("div");
      row.className = `task-item-card ${t.status === "completed" ? "completed" : ""}`;
      row.innerHTML = `
        <div class="task-main-row">
          <input type="checkbox" class="task-check-input dash-task-check" data-id="${t.id}" ${t.status === "completed" ? "checked" : ""} />
          <div style="flex: 1;">
            <span class="task-text" style="font-size: 0.88rem; font-weight: 500; color: var(--text-main);">${t.title}</span>
            <div class="task-meta-row" style="margin-left: 0; margin-top: 4px;">
              <span class="badge badge-${t.priority.toLowerCase()}">${t.priority}</span>
              ${t.deadline ? `<span>⏱ ${t.deadline}</span>` : ""}
              ${(t.tags || []).map((tg) => `<span class="task-tag">#${tg}</span>`).join("")}
            </div>
          </div>
        </div>
      `;

      row.querySelector(".dash-task-check")?.addEventListener("change", () => {
        this.toggleTaskStatus(t.id);
      });

      container.appendChild(row);
    });
  },

  renderDashboardDeadlines() {
    const container = document.getElementById("dash-deadlines-container");
    if (!container) return;

    container.innerHTML = "";
    const urgentItems = this.tasks
      .filter((t) => t.status !== "completed" && t.status !== "trash" && t.deadline && (!this.currentWorkspace || t.workspace === this.currentWorkspace || this.currentWorkspace === "All"))
      .slice(0, 4);

    if (urgentItems.length === 0) {
      container.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-dim); font-size: 0.82rem;">No upcoming critical deadlines.</div>';
    } else {
      urgentItems.forEach((t) => {
        const div = document.createElement("div");
        div.className = "task-item-card";
        div.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-size: 0.85rem; color: var(--text-main);">${t.title}</strong>
            <span class="badge badge-urgent" style="font-size: 0.68rem;">${t.deadline}</span>
          </div>
        `;
        container.appendChild(div);
      });
    }

    // Append today's scheduled meetings/events
    this.events
      .filter((e) => e.day === 20 && (!this.currentWorkspace || e.workspace === this.currentWorkspace || this.currentWorkspace === "All"))
      .forEach((ev) => {
        const div = document.createElement("div");
        div.className = "task-item-card";
        div.style.borderLeft = "3px solid #38bdf8";
        div.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.85rem; color: var(--text-main);">📅 ${ev.title}</span>
            <span style="font-size: 0.72rem; color: #38bdf8;">${ev.time || "Scheduled"}</span>
          </div>
        `;
        container.appendChild(div);
      });
  },

  renderDashboardProjects() {
    const container = document.getElementById("dash-projects-container");
    if (!container) return;

    container.innerHTML = "";
    const filtered = this.projects.filter((p) => !this.currentWorkspace || p.workspace === this.currentWorkspace || this.currentWorkspace === "All");

    if (filtered.length === 0) {
      container.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-dim); font-size: 0.82rem;">No active projects in this workspace.</div>';
      return;
    }

    filtered.forEach((p) => {
      const div = document.createElement("div");
      div.className = "task-item-card";
      div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="font-size: 0.88rem; color: var(--text-main);">${p.title}</strong>
          <span style="font-size: 0.78rem; font-weight: 600; color: var(--accent-light);">${p.progress}%</span>
        </div>
        <div class="goal-progress-bar-bg" style="margin-top: 4px;">
          <div class="goal-progress-bar-fill" style="width: ${p.progress}%;"></div>
        </div>
      `;
      container.appendChild(div);
    });
  },

  renderDashboardGoals() {
    const container = document.getElementById("dash-goals-summary");
    if (!container) return;

    container.innerHTML = "";
    const filtered = this.goals.filter((g) => !this.currentWorkspace || g.workspace === this.currentWorkspace || this.currentWorkspace === "All").slice(0, 3);

    if (filtered.length === 0) {
      container.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-dim); font-size: 0.82rem;">No goals established yet.</div>';
      return;
    }

    filtered.forEach((g) => {
      const total = g.milestones ? g.milestones.length : 0;
      const completed = g.milestones ? g.milestones.filter((m) => m.completed).length : 0;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

      const div = document.createElement("div");
      div.className = "task-item-card";
      div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.85rem; font-weight: 500; color: var(--text-main);">${g.title}</span>
          <span style="font-size: 0.8rem; font-weight: 700; color: ${pct === 100 ? "var(--success)" : "var(--accent-light)"};">${pct}%</span>
        </div>
        <div class="goal-progress-bar-bg" style="margin-top: 4px;">
          <div class="goal-progress-bar-fill" style="width: ${pct}%; background: ${pct === 100 ? "var(--success)" : "var(--accent)"};"></div>
        </div>
      `;
      container.appendChild(div);
    });
  },

  renderFullTasks() {
    const container = document.getElementById("full-tasks-list-container");
    if (!container) return;

    const q = (document.getElementById("task-search-filter")?.value || "").toLowerCase().trim();
    const statusFilter = document.getElementById("task-status-filter")?.value || "pending";
    const priFilter = document.getElementById("task-priority-filter")?.value || "all";
    const sortBy = document.getElementById("task-sort-by")?.value || "deadline";

    let list = this.tasks.filter((t) => {
      // Workspace filter
      if (this.currentWorkspace && this.currentWorkspace !== "All" && t.workspace !== this.currentWorkspace) return false;

      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "trash") {
          if (t.status !== "trash") return false;
        } else {
          if (t.status === "trash") return false;
          if (t.status !== statusFilter) return false;
        }
      } else {
        if (t.status === "trash") return false;
      }

      // Priority filter
      if (priFilter !== "all" && t.priority !== priFilter) return false;

      // Search query
      if (q) {
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchTag = t.tags && t.tags.some((tg) => tg.toLowerCase().includes(q));
        if (!matchTitle && !matchTag) return false;
      }

      return true;
    });

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "priority") return priorityRank(a.priority) - priorityRank(b.priority);
      if (sortBy === "created") return (b.createdAt || 0) - (a.createdAt || 0);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      // default: deadline
      return (a.deadline || "").localeCompare(b.deadline || "");
    });

    container.innerHTML = "";
    if (list.length === 0) {
      container.innerHTML = `<div style="padding: 32px; text-align: center; color: var(--text-dim);">No tasks match your active filters. Try resetting the status or adding a new task!</div>`;
      return;
    }

    list.forEach((t) => {
      const card = document.createElement("div");
      card.className = `task-item-card ${t.status === "completed" ? "completed" : ""}`;
      
      const hasSubtasks = t.subtasks && t.subtasks.length > 0;
      const subtaskCompleted = hasSubtasks ? t.subtasks.filter((s) => s.completed).length : 0;

      card.innerHTML = `
        <div class="task-main-row">
          <input type="checkbox" class="task-check-input full-task-check" data-id="${t.id}" ${t.status === "completed" ? "checked" : ""} />
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <span class="task-text" style="font-size: 0.95rem; font-weight: 500; color: var(--text-main);">${t.title}</span>
              <div style="display: flex; align-items: center; gap: 6px;">
                ${t.status === "trash" ? `
                  <button type="button" class="why-toggle restore-task-btn" data-id="${t.id}" style="color: var(--success); padding: 2px 6px;">Restore</button>
                  <button type="button" class="why-toggle delete-task-btn" data-id="${t.id}" style="color: var(--urgent); padding: 2px 6px;">Perm Delete</button>
                ` : `
                  <button type="button" class="why-toggle delete-task-btn" data-id="${t.id}" style="color: var(--urgent); padding: 2px 6px;">Delete</button>
                `}
              </div>
            </div>

            ${t.description ? `<p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">${t.description}</p>` : ""}

            <div class="task-meta-row" style="margin-left: 0; margin-top: 6px;">
              <span class="badge badge-${t.priority.toLowerCase()}">${t.priority}</span>
              ${t.deadline ? `<span>⏱ ${t.deadline}</span>` : ""}
              <span class="task-tag">${t.workspace}</span>
              ${(t.tags || []).map((tg) => `<span class="task-tag">#${tg}</span>`).join("")}
              ${hasSubtasks ? `<span style="font-size: 0.75rem; color: var(--text-dim); margin-left: auto;">Subtasks: ${subtaskCompleted}/${t.subtasks.length}</span>` : ""}
            </div>

            ${hasSubtasks ? `
              <div class="subtask-list">
                ${t.subtasks.map((st) => `
                  <label class="subtask-item" style="cursor: pointer;">
                    <input type="checkbox" ${st.completed ? "checked" : ""} class="subtask-check" data-task="${t.id}" data-st="${st.id}" />
                    <span style="${st.completed ? "text-decoration: line-through; color: var(--text-dim);" : ""}">${st.title}</span>
                  </label>
                `).join("")}
              </div>
            ` : ""}
          </div>
        </div>
      `;

      card.querySelector(".full-task-check")?.addEventListener("change", () => this.toggleTaskStatus(t.id));
      card.querySelector(".delete-task-btn")?.addEventListener("click", () => this.deleteTask(t.id));
      card.querySelector(".restore-task-btn")?.addEventListener("click", () => this.restoreTask(t.id));

      card.querySelectorAll(".subtask-check").forEach((chk) => {
        chk.addEventListener("change", () => {
          this.toggleSubtask(chk.dataset.task, chk.dataset.st);
        });
      });

      container.appendChild(card);
    });
  }
};

window.ProductivityHub = ProductivityHub;

// ============================================================================
// 8. LANDING PAGE & WORKSPACE NAVIGATION CONTROLLER
// ============================================================================
function initLandingFlow() {
  const landingView = document.getElementById("landing-page-view");
  const workspaceView = document.getElementById("workspace-view");

  if (!landingView || !workspaceView) return;

  function setPageMode(mode, updateHash = true) {
    if (mode === "workspace") {
      landingView.style.display = "none";
      workspaceView.style.display = "flex";
      if (updateHash && window.location.hash !== "#workspace") {
        window.location.hash = "workspace";
      }
      // Re-trigger layout renders when workspace becomes visible
      if (window.ProductivityHub && typeof window.ProductivityHub.renderAll === "function") {
        window.ProductivityHub.renderAll();
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      landingView.style.display = "flex";
      workspaceView.style.display = "none";
      if (updateHash && window.location.hash === "#workspace") {
        window.location.hash = "landing";
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleRoute() {
    const hash = window.location.hash.toLowerCase();
    const urlParams = new URLSearchParams(window.location.search);
    const wantsWorkspace =
      hash === "#workspace" ||
      hash.startsWith("#workspace") ||
      urlParams.get("view") === "workspace" ||
      urlParams.get("workspace") === "1";

    if (wantsWorkspace) {
      setPageMode("workspace", false);
    } else {
      setPageMode("landing", false);
    }
  }

  // Bind all CTA buttons that open the workspace
  document.querySelectorAll(".cta-open-workspace").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      setPageMode("workspace", true);
      SoundEngine.playChime("quick");
    });
  });

  // Bind all buttons that return to the landing page
  document.querySelectorAll(".nav-to-landing-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      setPageMode("landing", true);
      SoundEngine.playChime("quick");
    });
  });

  // Listen for hash changes (e.g. browser back/forward buttons)
  window.addEventListener("hashchange", handleRoute);

  // Initialize landing theme toggle
  const landingThemeBtn = document.getElementById("landing-theme-toggle-btn");
  const landingThemeIcon = document.getElementById("landing-theme-icon");
  const currentTheme = localStorage.getItem("actionos_theme") || "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  if (landingThemeIcon) landingThemeIcon.textContent = currentTheme === "light" ? "☀️" : "🌙";

  if (landingThemeBtn) {
    landingThemeBtn.addEventListener("click", () => {
      const nowTheme = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", nowTheme);
      localStorage.setItem("actionos_theme", nowTheme);
      if (landingThemeIcon) landingThemeIcon.textContent = nowTheme === "light" ? "☀️" : "🌙";
      const hubThemeIcon = document.getElementById("theme-toggle-icon");
      if (hubThemeIcon) hubThemeIcon.textContent = nowTheme === "light" ? "☀️" : "🌙";
    });
  }

  // Initial evaluation
  handleRoute();
}

// ---------- DOM Lifecycle Setup ----------
document.addEventListener("DOMContentLoaded", () => {
  initScrollMotion();
  initTimeManagement();
  initAmbientAudio();
  initTimeStudio();
  initActionBot();
  initCommandPalette();

  initInputPage();
  initAnalysisPage();
  initActionPage();

  // Boot Universal Productivity Engine
  ProductivityHub.init();

  // Boot Landing Page Navigation Flow
  initLandingFlow();
});

