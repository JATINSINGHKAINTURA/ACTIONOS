import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getAI() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Intelligent offline assistant fallback for ActionBot
function generateOfflineAssistantReply(prompt: string, tasks: any[], _sourceText: string): string {
  const p = prompt.toLowerCase();
  const taskCount = tasks.length;
  const urgentCount = tasks.filter(t => t.priority === "URGENT").length;
  const highCount = tasks.filter(t => t.priority === "HIGH").length;

  if (p.includes("schedule") || p.includes("time") || p.includes("block") || p.includes("plan my day")) {
    let res = `### ⏱ ActionOS Suggested Time-Blocking Schedule\n\n`;
    res += `Based on your ${taskCount} active items (${urgentCount} Urgent, ${highCount} High priority):\n\n`;
    let startHour = 9;
    tasks.forEach((t, i) => {
      const duration = t.priority === "URGENT" ? 50 : t.priority === "HIGH" ? 40 : 25;
      const endHour = startHour + Math.floor(duration / 60);
      const endMin = duration % 60;
      const timeSlot = `${String(startHour).padStart(2, "0")}:00 - ${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
      res += `* **${timeSlot}** (${duration}m Focus): **[${t.priority}]** ${t.title}\n`;
      if (t.deadline) res += `  ↳ *Commitment Deadline:* ${t.deadline}\n`;
      startHour += 1;
    });
    res += `\n*Recommendation: Start with your highest-urgency items in the first 90 minutes while mental energy is peak.*`;
    return res;
  }

  if (p.includes("break down") || p.includes("subtask") || p.includes("decompose")) {
    const targetTask = tasks[0] || { title: "Primary deliverable" };
    return `### 🧩 Action Breakdown for: "${targetTask.title}"\n\nHere are 3 recommended micro-steps with time estimates:\n\n` +
      `1. **Gather requirements & source inputs** (15 mins)\n` +
      `2. **Execute core draft & verify against specs** (35 mins)\n` +
      `3. **Run quality smoke test & package for delivery** (15 mins)\n\n` +
      `You can add these subtasks directly into your active plan:\n` +
      `[ADD_TASK: Prepare requirements for ${targetTask.title.slice(0, 40)} | Today | HIGH | Decomposed subtask for rapid delivery]\n` +
      `[ADD_TASK: Review and smoke test ${targetTask.title.slice(0, 40)} | Today | MEDIUM | Verification phase]`;
  }

  if (p.includes("email") || p.includes("draft") || p.includes("notify") || p.includes("update")) {
    return `### ✉️ Draft Executive Update\n\n` +
      `**Subject:** Action Plan Update: ${taskCount} items registered\n\n` +
      `Hi Team,\n\n` +
      `Here is the verified execution roadmap based on latest project inputs:\n\n` +
      tasks.map((t, idx) => `• [${t.priority}] ${t.title} ${t.deadline ? `(Due: ${t.deadline})` : ''}`).join('\n') +
      `\n\nAll actions are tracked under human-in-the-loop verification. Please let me know if priority adjustments are needed.\n\nBest regards,\nActionOS Operator`;
  }

  if (p.includes("bottleneck") || p.includes("risk") || p.includes("prioritize")) {
    if (urgentCount > 2) {
      return `⚠️ **High Concurrency Risk Detected:** You have ${urgentCount} tasks marked URGENT simultaneously. Multitasking between multiple urgent tasks increases delivery failure by 40%.\n\n` +
        `**Recommendation:** Pick the single most time-sensitive item with today's deadline and run a focused 25-minute Pomodoro sprint.`;
    }
    return `✅ **Plan Health: Balanced:** Your plan features a healthy distribution of ${urgentCount} urgent and ${highCount} high-priority tasks. Use the Pomodoro timer in the stage header to lock in focus.`;
  }

  return `I have analyzed your **ActionOS plan** containing **${taskCount} verified tasks**.\n\n` +
    `Here is how I can assist right now:\n` +
    `• Ask **"Plan my day"** to generate a time-blocked schedule.\n` +
    `• Ask **"Break down task #1"** to decompose big tasks into micro-steps.\n` +
    `• Ask **"Draft team update email"** for an executive status report.\n` +
    `• Ask **"Check risks"** to identify scheduling bottlenecks.`;
}

// Algorithmic timetable and to-do generator (0-network fallback)
function generateOfflineTimetable(
  topic: string,
  startTimeStr: string = "09:00",
  totalHours: number = 6,
  protocol: string = "deep_work",
  energyMode: string = "morning_peak",
  existingTasks: any[] = []
) {
  const [startH, startM] = (startTimeStr || "09:00").split(":").map(Number);
  let curMinute = (isNaN(startH) ? 9 : startH) * 60 + (isNaN(startM) ? 0 : startM);

  const focusDuration = protocol === "pomodoro" ? 25 : protocol === "ultra_focus" ? 85 : 50;
  const breakDuration = protocol === "pomodoro" ? 5 : protocol === "ultra_focus" ? 15 : 10;
  const totalMinutes = Math.max(120, Math.min(720, totalHours * 60));
  const endLimit = curMinute + totalMinutes;

  const topicName = (topic || "Execution Sprint").trim();
  const stages = [
    { name: `Strategic Scoping & Requirements for ${topicName}`, category: "Deep Architecture", energy: 90, priority: "HIGH" },
    { name: `Core Implementation & Heavy Lift: ${topicName}`, category: "Core Execution", energy: 98, priority: "URGENT" },
    { name: `Mid-Sprint Alignment & Edge-Case Review`, category: "Verification & QA", energy: 75, priority: "MEDIUM" },
    { name: `Secondary Modules & Feature Polish`, category: "Core Execution", energy: 80, priority: "HIGH" },
    { name: `Integration Testing & Security Smoke Tests`, category: "Verification & QA", energy: 85, priority: "URGENT" },
    { name: `Executive Packaging & Final Sign-off: ${topicName}`, category: "Delivery & Sign-off", energy: 70, priority: "MEDIUM" }
  ];

  // If existing tasks provided, blend them into stages
  if (Array.isArray(existingTasks) && existingTasks.length > 0) {
    existingTasks.forEach((t, i) => {
      if (stages[i]) {
        stages[i].name = `Execute: ${t.title}`;
        stages[i].priority = t.priority || stages[i].priority;
      } else {
        stages.push({
          name: `Execute: ${t.title}`,
          category: "Task Item",
          energy: t.priority === "URGENT" ? 95 : 75,
          priority: t.priority || "MEDIUM"
        });
      }
    });
  }

  const schedule = [];
  const todoList = [];
  let stageIdx = 0;
  let slotId = 1;
  let totalFocusMinutes = 0;
  let totalBufferMinutes = 0;

  while (curMinute < endLimit && stageIdx < stages.length) {
    const stage = stages[stageIdx];
    const duration = Math.min(focusDuration, endLimit - curMinute);

    const sH = Math.floor(curMinute / 60) % 24;
    const sM = curMinute % 60;
    const eTime = curMinute + duration;
    const eH = Math.floor(eTime / 60) % 24;
    const eM = eTime % 60;

    const timeSlotStr = `${String(sH).padStart(2, "0")}:${String(sM).padStart(2, "0")} - ${String(eH).padStart(2, "0")}:${String(eM).padStart(2, "0")}`;

    // Compute energy adjustment based on energy mode
    let energyVal = stage.energy;
    if (energyMode === "morning_peak" && stageIdx > 2) energyVal = Math.max(50, energyVal - 15);
    if (energyMode === "evening" && stageIdx <= 1) energyVal = Math.max(50, energyVal - 15);

    schedule.push({
      id: slotId++,
      timeSlot: timeSlotStr,
      startTime: `${String(sH).padStart(2, "0")}:${String(sM).padStart(2, "0")}`,
      endTime: `${String(eH).padStart(2, "0")}:${String(eM).padStart(2, "0")}`,
      category: stage.category,
      taskTitle: stage.name,
      durationMinutes: duration,
      energyLevel: energyVal,
      priority: stage.priority,
      isBreak: false
    });

    todoList.push({
      id: slotId,
      title: stage.name,
      deadline: `${String(eH).padStart(2, "0")}:${String(eM).padStart(2, "0")}`,
      priority: stage.priority,
      reason: `Allocated for ${stage.category} during ${timeSlotStr} block (${duration} mins).`,
      estimatedMinutes: duration,
      completed: false
    });

    totalFocusMinutes += duration;
    curMinute = eTime;
    stageIdx++;

    // Insert rest/buffer if time remains
    if (curMinute < endLimit && stageIdx < stages.length) {
      const bDuration = Math.min(breakDuration, endLimit - curMinute);
      const bSH = Math.floor(curMinute / 60) % 24;
      const bSM = curMinute % 60;
      const bETime = curMinute + bDuration;
      const bEH = Math.floor(bETime / 60) % 24;
      const bEM = bETime % 60;

      schedule.push({
        id: slotId++,
        timeSlot: `${String(bSH).padStart(2, "0")}:${String(bSM).padStart(2, "0")} - ${String(bEH).padStart(2, "0")}:${String(bEM).padStart(2, "0")}`,
        startTime: `${String(bSH).padStart(2, "0")}:${String(bSM).padStart(2, "0")}`,
        endTime: `${String(bEH).padStart(2, "0")}:${String(bEM).padStart(2, "0")}`,
        category: "Cognitive Recovery",
        taskTitle: "Hydration, Mental Rest & Status Calibration",
        durationMinutes: bDuration,
        energyLevel: 30,
        priority: "LOW",
        isBreak: true
      });

      totalBufferMinutes += bDuration;
      curMinute = bETime;
    }
  }

  const cognitiveLoadScore = Math.min(95, Math.round((totalFocusMinutes / (totalFocusMinutes + totalBufferMinutes || 1)) * 100));

  return {
    topic: topicName,
    protocol,
    schedule,
    todoList,
    analytics: {
      totalFocusMinutes,
      totalBufferMinutes,
      cognitiveLoadScore,
      focusBlockCount: todoList.length,
      completionTarget: `${String(Math.floor(curMinute / 60) % 24).padStart(2, "0")}:${String(curMinute % 60).padStart(2, "0")}`,
      riskFactors: [
        cognitiveLoadScore > 85 ? "High sustained cognitive load (>85%). Ensure strict break enforcement." : "Balanced load distribution.",
        todoList.filter(t => t.priority === "URGENT").length > 2 ? "Multiple urgent tasks scheduled; consider deferring secondary items." : "Urgency pacing is manageable."
      ]
    }
  };
}

// Fallback offline extraction algorithm directly on server if client requests it
function extractTasksHeuristic(text: string) {
  if (!text || !text.trim()) return [];

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const actionVerbs = [
    "submit", "complete", "record", "send", "finish", "prepare",
    "review", "build", "create", "polish", "fix", "update",
    "write", "schedule", "confirm", "share", "upload", "test",
    "deploy", "finalize", "draft", "notify", "present"
  ];

  const urgentWords = ["asap", "urgent", "immediately", "right away"];
  const timePattern = /\b\d{1,2}(:\d{2})?\s?(am|pm)\b/i;
  const deadlineWords = ["deadline", "due", "end of day", "eod"];
  const stripPrefixes = /^(team,|also,|when you have time,|before submitting,)\s*/i;

  const tasks: any[] = [];
  let id = 1;

  sentences.forEach((sentence) => {
    const lower = sentence.toLowerCase();
    const matchedVerb = actionVerbs.find((v) => lower.includes(v));
    if (!matchedVerb) return;

    const timeMatch = sentence.match(timePattern);
    const hasToday = lower.includes("today");
    const hasTomorrow = lower.includes("tomorrow");
    const hasDeadlineWord = deadlineWords.some((w) => lower.includes(w));
    const hasUrgentWord = urgentWords.some((w) => lower.includes(w));

    let deadline = "";
    if (timeMatch) deadline = timeMatch[0].toUpperCase();
    else if (hasToday) deadline = "Today";
    else if (hasTomorrow) deadline = "Tomorrow";
    else if (hasDeadlineWord) deadline = "See note";

    let priority: string;
    let reasonBits: string[] = [];

    if (hasUrgentWord || (hasToday && (timeMatch || hasDeadlineWord))) {
      priority = "URGENT";
      reasonBits.push("the text marks it urgent or due today");
    } else if (lower.includes("high priority")) {
      priority = "HIGH";
      reasonBits.push('the text explicitly says "high priority"');
    } else if (lower.includes("medium priority")) {
      priority = "MEDIUM";
      reasonBits.push('the text explicitly says "medium priority"');
    } else if (lower.includes("low priority")) {
      priority = "LOW";
      reasonBits.push('the text explicitly says "low priority"');
    } else if (timeMatch || hasDeadlineWord || hasTomorrow) {
      priority = "HIGH";
      reasonBits.push("it has a specific deadline");
    } else {
      priority = "MEDIUM";
      reasonBits.push("it's a clear action item with no urgency signal");
    }

    const title = sentence.replace(stripPrefixes, "").trim();

    tasks.push({
      id: id++,
      title: title.length > 100 ? title.slice(0, 100) + "…" : title,
      deadline,
      priority,
      reason: `Classified ${priority} because ${reasonBits.join(" and ")} (detected action word: "${matchedVerb}").`,
      matchedVerb,
      sourceSentence: sentence,
      status: "pending"
    });
  });

  return tasks;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", service: "ActionOS" });
  });

  // --------------------------------------------------------------------------
  // Intelligent Quick Capture Parser
  // --------------------------------------------------------------------------
  function parseQuickCaptureHeuristic(input: string) {
    const text = (input || "").trim();
    const lower = text.toLowerCase();

    // Priority detection
    let priority = "MEDIUM";
    if (lower.includes("urgent") || lower.includes("asap") || lower.includes("immediately") || lower.includes("critical")) {
      priority = "URGENT";
    } else if (lower.includes("high priority") || lower.includes("important") || lower.includes("vital")) {
      priority = "HIGH";
    } else if (lower.includes("low priority") || lower.includes("someday") || lower.includes("when free")) {
      priority = "LOW";
    }

    // Category / Workspace detection
    let workspace = "Personal";
    let category = "General";
    if (lower.includes("exam") || lower.includes("assignment") || lower.includes("study") || lower.includes("class") || lower.includes("homework") || lower.includes("professor") || lower.includes("college") || lower.includes("dbms")) {
      workspace = "College";
      category = "Academics";
    } else if (lower.includes("client") || lower.includes("meeting") || lower.includes("deck") || lower.includes("report") || lower.includes("quarterly") || lower.includes("team") || lower.includes("boss") || lower.includes("work")) {
      workspace = "Work";
      category = "Business";
    } else if (lower.includes("bug") || lower.includes("pr") || lower.includes("deploy") || lower.includes("react") || lower.includes("api") || lower.includes("git") || lower.includes("docker") || lower.includes("repo")) {
      workspace = "Development";
      category = "Engineering";
    } else if (lower.includes("resume") || lower.includes("portfolio") || lower.includes("side project") || lower.includes("mvp")) {
      workspace = "Side Projects";
      category = "Career";
    }

    // Deadline detection
    let deadline = "Today";
    const timeMatch = text.match(/\b\d{1,2}(:\d{2})?\s?(am|pm)\b/i);
    const timeStr = timeMatch ? ` at ${timeMatch[0].toUpperCase()}` : "";

    if (lower.includes("before monday") || lower.includes("by monday") || lower.includes("on monday")) deadline = `Monday${timeStr || " 5:00 PM"}`;
    else if (lower.includes("before friday") || lower.includes("by friday") || lower.includes("on friday")) deadline = `Friday${timeStr || " 5:00 PM"}`;
    else if (lower.includes("this weekend") || lower.includes("by weekend")) deadline = "Sunday 6:00 PM";
    else if (lower.includes("tomorrow")) deadline = `Tomorrow${timeStr || " 10:00 AM"}`;
    else if (lower.includes("today") || lower.includes("tonight")) deadline = `Today${timeStr || " 6:00 PM"}`;
    else if (lower.includes("next week")) deadline = "Next Monday 10:00 AM";
    else if (timeStr) deadline = `Today${timeStr}`;

    // Cleaned title
    let title = text
      .replace(/^(remind me to|create a task to|remember to|i need to|please|todo:?)\s*/i, "")
      .replace(/\s*(urgent|asap|high priority|low priority|medium priority)\b/gi, "")
      .replace(/\s*(before monday|by monday|before friday|by friday|tomorrow|today|this weekend)\b/gi, "")
      .trim();

    if (title.length > 0) {
      title = title.charAt(0).toUpperCase() + title.slice(1);
    } else {
      title = text;
    }

    return {
      title,
      deadline,
      category,
      priority,
      workspace,
      raw: text
    };
  }

  // Quick Capture API
  app.post("/api/quick-parse", async (req: Request, res: Response) => {
    const { input } = req.body;
    if (!input || typeof input !== "string") {
      res.status(400).json({ error: "Input string is required" });
      return;
    }

    const ai = getAI();
    if (!ai) {
      const parsed = parseQuickCaptureHeuristic(input);
      res.json(parsed);
      return;
    }

    try {
      const prompt = `Parse this quick-add productivity input into a structured task:
"${input}"

Return a JSON object with:
- title: concise action title
- deadline: natural due date/time (e.g. "Tomorrow 10:00 AM", "Monday 5:00 PM", "Today")
- category: task category (e.g. "Academics", "Engineering", "Business", "Personal", "Health")
- priority: "URGENT", "HIGH", "MEDIUM", or "LOW"
- workspace: one of "Personal", "Work", "College", "Development", "Side Projects"

Return ONLY valid JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      res.json({
        title: parsed.title || input,
        deadline: parsed.deadline || "Today",
        category: parsed.category || "General",
        priority: parsed.priority || "MEDIUM",
        workspace: parsed.workspace || "Personal",
        raw: input
      });
    } catch {
      res.json(parseQuickCaptureHeuristic(input));
    }
  });

  // AI Task & Goal Breakdown API
  app.post("/api/breakdown-task", async (req: Request, res: Response) => {
    const { goal, workspace } = req.body;
    if (!goal || typeof goal !== "string") {
      res.status(400).json({ error: "Goal or task string is required" });
      return;
    }

    const ai = getAI();
    if (!ai) {
      // Deterministic breakdown fallback
      const cleanGoal = goal.trim();
      const subtasks = [
        { id: 1, title: `Define specifications and core scope for "${cleanGoal}"`, estimatedMinutes: 30, priority: "HIGH" },
        { id: 2, title: `Draft initial architecture, wireframes or outline`, estimatedMinutes: 45, priority: "HIGH" },
        { id: 3, title: `Build core deliverable and key milestones`, estimatedMinutes: 60, priority: "URGENT" },
        { id: 4, title: `Review, test edge cases, and refine quality`, estimatedMinutes: 40, priority: "MEDIUM" },
        { id: 5, title: `Finalize documentation and publish/deploy`, estimatedMinutes: 25, priority: "MEDIUM" }
      ];
      res.json({ goal: cleanGoal, subtasks, source: "heuristic" });
      return;
    }

    try {
      const prompt = `Break down this large goal or project into 5 to 7 concrete, actionable subtasks:
Goal: "${goal}"
Workspace: "${workspace || "General"}"

Return JSON matching:
{
  "goal": "${goal}",
  "subtasks": [
    {
      "id": 1,
      "title": "Actionable task description starting with a verb",
      "estimatedMinutes": 30,
      "priority": "URGENT" | "HIGH" | "MEDIUM" | "LOW"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      res.json(parsed);
    } catch {
      const cleanGoal = goal.trim();
      res.json({
        goal: cleanGoal,
        subtasks: [
          { id: 1, title: `Define requirements and outline for "${cleanGoal}"`, estimatedMinutes: 25, priority: "HIGH" },
          { id: 2, title: `Execute primary milestone implementation`, estimatedMinutes: 60, priority: "URGENT" },
          { id: 3, title: `Verify output, conduct review, and test`, estimatedMinutes: 35, priority: "MEDIUM" },
          { id: 4, title: `Package and ship completed deliverable`, estimatedMinutes: 20, priority: "HIGH" }
        ],
        source: "fallback"
      });
    }
  });

  // Student Study Planner API
  app.post("/api/study-planner", async (req: Request, res: Response) => {
    const { subject, daysLeft, hoursPerDay } = req.body;
    const subj = (subject || "General Exam").trim();
    const days = parseInt(daysLeft || "7", 10);
    const hours = parseInt(hoursPerDay || "3", 10);

    const ai = getAI();
    if (!ai) {
      const plan = {
        subject: subj,
        daysTotal: days,
        dailyHours: hours,
        stages: [
          { day: 1, focus: "Foundations & Syllabus Blueprint", topics: ["Core concepts review", "Glossary & key formulas", "Past papers scan"], durationHours: hours },
          { day: 2, focus: "Deep Dive: Module 1 & 2", topics: ["Theory analysis", "Solved illustrative problems", "Self-test flashcards"], durationHours: hours },
          { day: 3, focus: "Deep Dive: Module 3 & 4", topics: ["Complex derivations / algorithms", "Case problems", "Quick summary notes"], durationHours: hours },
          { day: Math.max(4, days - 2), focus: "Practice Question Bank & Timed Drills", topics: ["Simulated exam questions", "Timed section sprint", "Error log review"], durationHours: hours },
          { day: days, focus: "Final Revision & High-Yield Summary", topics: ["High-yield topics scan", "Formula cheat-sheet review", "Mental calibration"], durationHours: Math.min(2, hours) }
        ],
        generatedTasks: [
          { title: `[${subj}] Review Core Syllabus & Formulas`, deadline: "Day 1", priority: "HIGH", category: "College" },
          { title: `[${subj}] Complete Practice Question Bank`, deadline: `Day ${Math.max(2, days - 2)}`, priority: "URGENT", category: "College" },
          { title: `[${subj}] Run Full Mock Exam Simulation`, deadline: `Day ${Math.max(3, days - 1)}`, priority: "URGENT", category: "College" },
          { title: `[${subj}] Final Cheat-Sheet Review`, deadline: `Day ${days}`, priority: "HIGH", category: "College" }
        ]
      };
      res.json(plan);
      return;
    }

    try {
      const prompt = `Create an exam study plan for:
Subject: "${subj}"
Days until exam: ${days}
Available study hours per day: ${hours}

Generate a progressive study schedule covering:
- Topic mastery
- Study sessions
- Revision sessions
- Practice sessions
- Final revision

Return JSON:
{
  "subject": "${subj}",
  "daysTotal": ${days},
  "dailyHours": ${hours},
  "stages": [
    {
      "day": 1,
      "focus": "Topic or phase name",
      "topics": ["topic 1", "topic 2"],
      "durationHours": 3
    }
  ],
  "generatedTasks": [
    {
      "title": "Specific task title",
      "deadline": "Day X",
      "priority": "URGENT" | "HIGH" | "MEDIUM",
      "category": "College"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      res.json(parsed);
    } catch {
      res.json({
        subject: subj,
        daysTotal: days,
        dailyHours: hours,
        stages: [
          { day: 1, focus: "Syllabus Blueprint", topics: ["Core concepts", "Key terms"], durationHours: hours },
          { day: 2, focus: "Core Topics Intensive", topics: ["Problem sets", "Detailed review"], durationHours: hours },
          { day: days, focus: "Mock Simulation & Revision", topics: ["Timed exam drill", "Formula review"], durationHours: hours }
        ],
        generatedTasks: [
          { title: `[${subj}] Core Syllabus Outline`, deadline: "Day 1", priority: "HIGH", category: "College" },
          { title: `[${subj}] Practice Mock Problems`, deadline: `Day ${days - 1}`, priority: "URGENT", category: "College" }
        ]
      });
    }
  });

  // Meeting Notes Action Items Extractor API
  app.post("/api/meeting-actions", async (req: Request, res: Response) => {
    const { notes } = req.body;
    if (!notes || typeof notes !== "string") {
      res.status(400).json({ error: "Meeting notes text is required" });
      return;
    }

    const ai = getAI();
    if (!ai) {
      // Heuristic extraction for meeting notes
      const lines = notes.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const items: any[] = [];
      let id = 1;

      lines.forEach(line => {
        const lower = line.toLowerCase();
        let assignee = "Unassigned";
        const personMatch = line.match(/\b([A-Z][a-z]+)\s+(will|to|is\s+handling|is\s+responsible|assigned)\b/);
        if (personMatch) assignee = personMatch[1];

        let priority = "MEDIUM";
        if (lower.includes("urgent") || lower.includes("asap") || lower.includes("today")) priority = "URGENT";
        else if (lower.includes("important") || lower.includes("high") || lower.includes("critical")) priority = "HIGH";

        items.push({
          id: id++,
          task: line.replace(/^[•\-\*]\s*/, ""),
          assignee,
          deadline: lower.includes("friday") ? "Friday" : lower.includes("tomorrow") ? "Tomorrow" : "Next Week",
          priority,
          confirmed: true
        });
      });

      res.json({ actionItems: items, source: "heuristic" });
      return;
    }

    try {
      const prompt = `Extract discrete action items and assignees from these meeting notes:
"""
${notes}
"""

Return JSON:
{
  "summary": "1-sentence executive meeting summary",
  "actionItems": [
    {
      "id": 1,
      "task": "Specific actionable deliverable",
      "assignee": "Person name or 'Team'",
      "deadline": "Deadline mentioned or 'Next meeting'",
      "priority": "URGENT" | "HIGH" | "MEDIUM" | "LOW"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      res.json(parsed);
    } catch {
      res.json({
        summary: "Meeting Action Items",
        actionItems: [
          { id: 1, task: notes.slice(0, 80), assignee: "Team", deadline: "This Sprint", priority: "HIGH" }
        ]
      });
    }
  });

  // Natural-Language Command Interpreter API
  app.post("/api/natural-command", async (req: Request, res: Response) => {
    const { command, context } = req.body;
    if (!command || typeof command !== "string") {
      res.status(400).json({ error: "Command string is required" });
      return;
    }

    const cmd = command.toLowerCase().trim();
    const tasks = context?.tasks || [];

    // Instant local routing for high-frequency patterns
    if (cmd.includes("what's overdue") || cmd.includes("what is overdue") || cmd.includes("overdue")) {
      const overdue = tasks.filter((t: any) => {
        const d = (t.deadline || "").toLowerCase();
        return d.includes("yesterday") || d.includes("past") || (t.status === "pending" && d.includes("today"));
      });
      res.json({
        type: "OVERDUE_QUERY",
        message: overdue.length > 0
          ? `You have ${overdue.length} item(s) requiring immediate attention:`
          : "Great news! No overdue tasks detected in your active workspaces.",
        tasks: overdue
      });
      return;
    }

    if (cmd.startsWith("remind me") || cmd.startsWith("create a task") || cmd.includes("to finish my")) {
      const parsed = parseQuickCaptureHeuristic(command);
      res.json({
        type: "CREATE_TASK",
        message: `Parsed new task: "${parsed.title}" (Due: ${parsed.deadline}, Priority: ${parsed.priority})`,
        task: parsed
      });
      return;
    }

    if (cmd.includes("study session") || cmd.includes("exam in")) {
      const subjMatch = command.match(/for\s+([A-Za-z0-9\s]+)/i);
      const subject = subjMatch ? subjMatch[1].trim() : "General Study";
      res.json({
        type: "STUDY_PLAN",
        subject,
        message: `Generated focused study session for ${subject}.`,
        tasks: [
          { title: `[Study] ${subject} — Core Concept Review`, deadline: "Today 4:00 PM", priority: "HIGH", category: "College" },
          { title: `[Study] ${subject} — Practice Problems`, deadline: "Today 5:30 PM", priority: "MEDIUM", category: "College" }
        ]
      });
      return;
    }

    if (cmd.includes("plan my day") || cmd.includes("daily plan")) {
      res.json({
        type: "TRIGGER_DAILY_PLAN",
        message: "Initiating AI Daily Planner with your active tasks and priority distribution."
      });
      return;
    }

    // Default conversational AI fallback
    const ai = getAI();
    if (!ai) {
      res.json({
        type: "CHAT_REPLY",
        message: `I understood: "${command}". Use Quick Add or the Command Menu (⌘K) to execute tasks, calendar events, or study schedules!`
      });
      return;
    }

    try {
      const prompt = `You are ActionOS command executor. The user gave this natural-language command:
"${command}"

Interpret the user's intent and respond with structured action JSON:
{
  "type": "CREATE_TASK" | "NAVIGATE" | "STUDY_PLAN" | "FILTER_VIEW" | "CHAT_REPLY",
  "message": "Direct confirmation response to show user",
  "task": { "title": "...", "deadline": "...", "priority": "URGENT/HIGH/MEDIUM/LOW", "workspace": "Personal/Work/College/Development" } // optional if task action
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      res.json(parsed);
    } catch {
      res.json({
        type: "CHAT_REPLY",
        message: `Command received: "${command}". Check your task list or calendar for updates.`
      });
    }
  });

  // AI Extraction endpoint
  app.post("/api/extract", async (req: Request, res: Response) => {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "Text is required" });
      return;
    }

    const ai = getAI();
    if (!ai) {
      // If no API key configured, use the offline heuristic extraction fallback
      console.log("GEMINI_API_KEY missing, using offline heuristic fallback");
      const fallbackTasks = extractTasksHeuristic(text);
      res.json({ tasks: fallbackTasks, source: "heuristic_fallback" });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are ActionOS, an executive action extractor. Analyze the following unstructured text and extract actionable tasks.
For each task:
1. title: concise action sentence starting with a verb.
2. deadline: explicit deadline or time (e.g. "3:00 PM today", "Tomorrow", or empty string if none).
3. priority: "URGENT", "HIGH", "MEDIUM", or "LOW" based strictly on text signals.
4. reason: Explain WHY this task and priority was assigned, explicitly quoting the words or triggers from the text.
5. sourceSentence: The exact sentence from the source text where this task originated.

Return ONLY a JSON array of tasks matching this schema:
[
  {
    "id": 1,
    "title": "...",
    "deadline": "...",
    "priority": "URGENT" | "HIGH" | "MEDIUM" | "LOW",
    "reason": "...",
    "sourceSentence": "..."
  }
]

Input Text:
"""
${text}
"""`
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                title: { type: Type.STRING },
                deadline: { type: Type.STRING },
                priority: {
                  type: Type.STRING,
                  enum: ["URGENT", "HIGH", "MEDIUM", "LOW"]
                },
                reason: { type: Type.STRING },
                sourceSentence: { type: Type.STRING }
              },
              required: ["id", "title", "priority", "reason"]
            }
          }
        }
      });

      const responseText = response.text?.trim();
      if (!responseText) {
        throw new Error("Empty response from AI");
      }

      const tasks = JSON.parse(responseText).map((t: any, index: number) => ({
        ...t,
        id: t.id || index + 1,
        deadline: t.deadline || "",
        status: "pending"
      }));

      res.json({ tasks, source: "gemini_ai" });
    } catch (err: any) {
      console.error("AI extraction error, falling back to heuristics:", err?.message);
      const fallbackTasks = extractTasksHeuristic(text);
      res.json({ tasks: fallbackTasks, source: "heuristic_fallback" });
    }
  });

  // AI Chatbot endpoint for ActionOS Copilot with Cross-Workspace Intelligence
  app.post("/api/chat", async (req: Request, res: Response) => {
    const { messages, tasks, sourceText, activeWorkspace, allWorkspacesData, enabledWorkspaces } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "Messages array is required" });
      return;
    }

    const ai = getAI();
    const lastUserMessage = messages[messages.length - 1]?.content || "";

    if (!ai) {
      // Intelligent offline assistant fallback
      const offlineReply = generateOfflineAssistantReply(lastUserMessage, tasks || [], sourceText || "");
      res.json({ reply: offlineReply, source: "offline_fallback" });
      return;
    }

    try {
      const taskSummary = Array.isArray(tasks) && tasks.length > 0
        ? tasks.map((t: any, idx: number) => `${idx + 1}. [${t.priority}] [${t.workspace || "General"}] ${t.title} (Deadline: ${t.deadline || "None"}, Status: ${t.status || "pending"})`).join("\n")
        : "No tasks active.";

      let crossWorkspaceSummary = "";
      if (allWorkspacesData && typeof allWorkspacesData === "object") {
        crossWorkspaceSummary = Object.entries(allWorkspacesData)
          .filter(([ws]) => !enabledWorkspaces || enabledWorkspaces.includes(ws))
          .map(([ws, data]: [string, any]) => {
            const count = Array.isArray(data?.tasks) ? data.tasks.length : 0;
            const goals = Array.isArray(data?.goals) ? data.goals.map((g: any) => g.title).join(", ") : "None";
            return `• Space [${ws}]: ${count} tasks, Goals: ${goals}`;
          }).join("\n");
      }

      const systemPrompt = `You are ActionBot, the cross-workspace productivity copilot inside ActionOS.
ActionOS is a universal productivity manager for Personal, Work, College (Student), and Development workspaces.

Current Active Workspace: ${activeWorkspace || "Personal"}
Enabled Workspaces for Cross-Space Queries: ${(enabledWorkspaces || ["Personal", "Work", "College", "Development", "Side Projects"]).join(", ")}

Cross-Workspace Overview:
${crossWorkspaceSummary || "Single workspace context."}

Active Tasks:
${taskSummary}

Source Text Context (if provided):
"""
${(sourceText || "").slice(0, 1500)}
"""

Your Responsibilities:
1. Provide actionable, concise, and executive-level guidance on time management, task breakdown, scheduling, and execution risk across all enabled workspaces.
2. If asked "What should I finish today?" or "Plan my day", synthesize deadlines from all permitted workspaces (College assignments, Work deliverables, Personal tasks).
3. If the user asks to break down a task or add a new action item, clearly output suggested tasks in this format so the UI can auto-import them:
[ADD_TASK: <Title> | <Deadline> | <Priority: URGENT/HIGH/MEDIUM/LOW> | <Reason> | <Workspace>]
4. If asked to draft an email, meeting notes summary, or study plan, write crisp, professional copy.
5. Keep your tone direct, calm, analytical, and respectful of the human-in-the-loop principle. Avoid fluff.`;

      const contents = [
        {
          role: "user",
          parts: [{ text: systemPrompt }]
        },
        ...messages.map((m: any) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }]
        }))
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
      });

      const reply = response.text || "I was unable to process that request.";
      res.json({ reply, source: "gemini_ai" });
    } catch (err: any) {
      console.error("Chat API error, using offline response:", err?.message);
      const fallbackReply = generateOfflineAssistantReply(lastUserMessage, tasks || [], sourceText || "");
      res.json({ reply: fallbackReply, source: "offline_fallback" });
    }
  });

  // Executable Time Management Studio API
  app.post("/api/generate-timetable", async (req: Request, res: Response) => {
    const { topic, startTime, totalHours, protocol, energyMode, existingTasks } = req.body;
    const ai = getAI();

    if (!ai) {
      const offlineResult = generateOfflineTimetable(
        topic,
        startTime,
        totalHours || 6,
        protocol || "deep_work",
        energyMode || "morning_peak",
        existingTasks || []
      );
      res.json({ ...offlineResult, source: "algorithmic_engine" });
      return;
    }

    try {
      const prompt = `You are ActionOS Timetable & Execution Engine.
Generate an executable, high-fidelity day timetable, energy distribution curve, and structured To-Do list for the following objective:
Goal / Topic: "${topic || "High-Impact Execution Sprint"}"
Start Time: "${startTime || "09:00"}"
Total Working Hours: ${totalHours || 6}
Protocol: "${protocol || "deep_work"}" (Options: deep_work=50/10 min, pomodoro=25/5 min, ultra_focus=90/20 min)
Energy Profile: "${energyMode || "morning_peak"}"

Instructions:
1. Provide an array of sequential time slots from start to end with realistic breaks and category labels.
2. For each focus block, include an actionable taskTitle, duration in minutes, energyLevel (1-100), and priority (URGENT/HIGH/MEDIUM/LOW).
3. Provide a structured to-do list derived from these blocks that the user can immediately execute.
4. Calculate analytics: totalFocusMinutes, totalBufferMinutes, cognitiveLoadScore (1-100), and specific risk factors.

Return valid JSON with:
{
  "topic": "${topic || "Execution Sprint"}",
  "protocol": "${protocol || "deep_work"}",
  "schedule": [
    {
      "id": 1,
      "timeSlot": "09:00 - 09:50",
      "startTime": "09:00",
      "endTime": "09:50",
      "category": "Deep Architecture",
      "taskTitle": "...",
      "durationMinutes": 50,
      "energyLevel": 90,
      "priority": "HIGH",
      "isBreak": false
    }
  ],
  "todoList": [
    {
      "id": 1,
      "title": "...",
      "deadline": "09:50",
      "priority": "HIGH",
      "reason": "...",
      "estimatedMinutes": 50,
      "completed": false
    }
  ],
  "analytics": {
    "totalFocusMinutes": 250,
    "totalBufferMinutes": 50,
    "cognitiveLoadScore": 82,
    "focusBlockCount": 5,
    "completionTarget": "15:00",
    "riskFactors": ["..."]
  }
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      if (!parsed.schedule || !parsed.todoList) {
        throw new Error("Invalid schema from model");
      }
      res.json({ ...parsed, source: "gemini_ai" });
    } catch (err: any) {
      console.warn("AI Timetable error, falling back to algorithmic engine:", err?.message);
      const offlineResult = generateOfflineTimetable(
        topic,
        startTime,
        totalHours || 6,
        protocol || "deep_work",
        energyMode || "morning_peak",
        existingTasks || []
      );
      res.json({ ...offlineResult, source: "algorithmic_engine_fallback" });
    }
  });

  // Risk Audit Endpoint
  app.post("/api/audit-risks", (req: Request, res: Response) => {
    const { tasks, schedule } = req.body;
    const taskList = Array.isArray(tasks) ? tasks : [];
    const urgentCount = taskList.filter((t: any) => t.priority === "URGENT").length;
    const highCount = taskList.filter((t: any) => t.priority === "HIGH").length;

    const risks = [];
    if (urgentCount > 2) {
      risks.push({
        severity: "CRITICAL",
        title: "Urgent Task Saturation",
        description: `You have ${urgentCount} tasks marked URGENT. Cognitive switching penalties will degrade output quality by ~35%.`,
        recommendation: "Convert all except the #1 immediate deliverable into HIGH priority."
      });
    }
    if (taskList.length > 8) {
      risks.push({
        severity: "WARNING",
        title: "Excessive Daily Backlog",
        description: `Backlog of ${taskList.length} items exceeds human daily execution capacity.`,
        recommendation: "Limit daily active focus to maximum 5-6 core items and park remainder in deferred state."
      });
    }
    if (risks.length === 0) {
      risks.push({
        severity: "HEALTHY",
        title: "Balanced Execution Velocity",
        description: "Task load and priority distribution are within optimal execution parameters.",
        recommendation: "Maintain 50/10 focus sprint discipline."
      });
    }

    res.json({
      risks,
      urgentCount,
      highCount,
      totalCount: taskList.length,
      healthScore: Math.max(30, 100 - (urgentCount * 15) - (taskList.length > 8 ? 20 : 0))
    });
  });

  // Vite middleware in dev; static file server in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ActionOS running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
