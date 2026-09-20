import { Task, Project, Goal, CalendarEvent, Note, SubjectAttendance, DevRepository, FocusSession, ProductivityTemplate, WorkspaceType } from "../types";

export const initialTasks: Task[] = [
  {
    id: 1,
    title: "Finish portfolio redesign and upload updated resume",
    description: "Incorporate Apple-grade typography, responsive showcase, and clean contact details.",
    deadline: "Monday 5:00 PM",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    dueTime: "17:00",
    priority: "URGENT",
    workspace: "Side Projects",
    category: "Career",
    tags: ["portfolio", "design", "resume"],
    subtasks: [
      { id: 101, title: "Draft high-contrast hero typography", completed: true },
      { id: 102, title: "Export optimized project case studies", completed: true },
      { id: 103, title: "Embed interactive command bar demo", completed: false },
      { id: 104, title: "Deploy to Cloud Run production tier", completed: false },
    ],
    attachments: ["resume_jatin_2026.pdf"],
    recurring: "none",
    status: "in_progress",
    createdAt: new Date().toISOString(),
    order: 1
  },
  {
    id: 2,
    title: "DBMS Exam Revision: Indexing, B+ Trees & ACID properties",
    description: "Read chapters 12-14 and solve past 3 years university question bank.",
    deadline: "Friday 10:00 AM",
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 10),
    dueTime: "10:00",
    priority: "URGENT",
    workspace: "College",
    category: "Academics",
    tags: ["exam", "dbms", "cs"],
    subtasks: [
      { id: 201, title: "B+ Tree insertion & deletion algorithm drill", completed: true },
      { id: 202, title: "2-Phase Locking & Serializability proofs", completed: false },
      { id: 203, title: "Query optimization heuristics scan", completed: false }
    ],
    attachments: ["dbms_unit4_handbook.pdf"],
    recurring: "none",
    status: "pending",
    createdAt: new Date().toISOString(),
    order: 2
  },
  {
    id: 3,
    title: "Prepare Sprint Review Deck & Analytics summary",
    description: "Consolidate Q3 delivery velocity, sprint burndown, and client KPI benchmarks.",
    deadline: "Tomorrow 2:00 PM",
    dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    dueTime: "14:00",
    priority: "HIGH",
    workspace: "Work",
    category: "Business",
    tags: ["sprint", "meeting", "client"],
    subtasks: [
      { id: 301, title: "Extract weekly task completion rate from database", completed: true },
      { id: 302, title: "Create 3 executive summary visual slides", completed: true },
      { id: 303, title: "Share draft agenda with engineering manager", completed: false }
    ],
    attachments: ["sprint_velocity_report.csv"],
    recurring: "weekly",
    status: "pending",
    createdAt: new Date().toISOString(),
    order: 3
  },
  {
    id: 4,
    title: "Refactor SQLite OPFS WebAssembly worker thread pools",
    description: "Benchmark write latency reduction using shared array buffers and origin file lock.",
    deadline: "Saturday 18:00",
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
    dueTime: "18:00",
    priority: "HIGH",
    workspace: "Development",
    category: "Engineering",
    tags: ["wasm", "sqlite", "perf"],
    subtasks: [
      { id: 401, title: "Profile main thread memory spikes", completed: true },
      { id: 402, title: "Isolate background search worker", completed: false }
    ],
    attachments: [],
    recurring: "none",
    status: "in_progress",
    createdAt: new Date().toISOString(),
    order: 4
  },
  {
    id: 5,
    title: "Morning 30-min mindful cardio & hydration routine",
    description: "Outdoor run and zero-distraction breath calibration before starting work sprint.",
    deadline: "Daily 7:30 AM",
    dueDate: new Date().toISOString().slice(0, 10),
    dueTime: "07:30",
    priority: "MEDIUM",
    workspace: "Personal",
    category: "Wellness",
    tags: ["health", "morning", "habit"],
    subtasks: [
      { id: 501, title: "5km zone-2 cardio", completed: true },
      { id: 502, title: "10m stretching", completed: true }
    ],
    attachments: [],
    recurring: "daily",
    status: "completed",
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    order: 5
  },
  {
    id: 6,
    title: "Review Design Systems book (Chapter 4: Spatial Grids & Typographic Ratios)",
    description: "Reflect on how whitespace creates natural cognitive hierarchy.",
    deadline: "Sunday",
    dueDate: new Date(Date.now() + 86400000 * 6).toISOString().slice(0, 10),
    dueTime: "20:00",
    priority: "LOW",
    workspace: "Personal",
    category: "Reading",
    tags: ["design", "books"],
    subtasks: [],
    attachments: [],
    recurring: "none",
    status: "pending",
    createdAt: new Date().toISOString(),
    order: 6
  }
];

export const initialProjects: Project[] = [
  {
    id: 1,
    title: "Aethel Productivity Kernel",
    description: "A sovereign, local-first productivity workspace combining natural language capture and soundscapes.",
    workspace: "Development",
    progress: 85,
    status: "active",
    deadline: "Oct 15",
    tags: ["React", "TypeScript", "AI", "WASM"],
    tasksCount: 14,
    completedTasksCount: 12,
    color: "#0071e3"
  },
  {
    id: 2,
    title: "Semester 4 CS Engineering Honors",
    description: "Maintaining 9.2+ CGPA across Operating Systems, DBMS, Algorithms, and Discrete Math.",
    workspace: "College",
    progress: 72,
    status: "active",
    deadline: "Dec 20",
    tags: ["Academics", "Exams", "Labs"],
    tasksCount: 22,
    completedTasksCount: 16,
    color: "#10b981"
  },
  {
    id: 3,
    title: "Enterprise Client Platform Migration",
    description: "Cloud microservices transition and performance audit for quarterly deliverable.",
    workspace: "Work",
    progress: 60,
    status: "active",
    deadline: "Nov 30",
    tags: ["Architecture", "GCP", "Express"],
    tasksCount: 18,
    completedTasksCount: 11,
    color: "#8b5cf6"
  },
  {
    id: 4,
    title: "Mind & Health Optimization",
    description: "Consistent sleep schedule, daily focus sessions, and active exercise routines.",
    workspace: "Personal",
    progress: 90,
    status: "active",
    deadline: "Ongoing",
    tags: ["Habits", "Fitness", "Meditation"],
    tasksCount: 8,
    completedTasksCount: 7,
    color: "#f59e0b"
  }
];

export const initialGoals: Goal[] = [
  {
    id: 1,
    title: "Build & Ship Personal Portfolio Platform",
    description: "Complete modern, responsive developer portfolio showcasing engineering principles and projects.",
    timeFrame: "monthly",
    progress: 65,
    workspace: "Side Projects",
    deadline: "End of Month",
    color: "#0071e3",
    milestones: [
      { id: 11, title: "Design clean typography system & color palette", completed: true },
      { id: 12, title: "Implement universal dashboard & workspace filters", completed: true },
      { id: 13, title: "Improve mobile responsive design & touch targets", completed: true },
      { id: 14, title: "Deploy website to custom domain with SSL", completed: false }
    ],
    relatedTaskIds: [1]
  },
  {
    id: 2,
    title: "Score 95%+ in DBMS & OS Final Exams",
    description: "Master all core theoretical concepts, practice university papers, and complete lab records.",
    timeFrame: "monthly",
    progress: 75,
    workspace: "College",
    deadline: "Oct 25",
    color: "#10b981",
    milestones: [
      { id: 21, title: "Finish Unit 1-3 theoretical notes", completed: true },
      { id: 22, title: "Solve all SQL query optimization problem sheets", completed: true },
      { id: 23, title: "Simulate 2 timed mock exams with grading", completed: false },
      { id: 24, title: "Final high-yield revision flashcard pass", completed: false }
    ],
    relatedTaskIds: [2]
  },
  {
    id: 3,
    title: "Achieve 20 Hours of Weekly Deep Work",
    description: "Track focused Pomodoro sprints with ambient audio masking and minimal context switching.",
    timeFrame: "weekly",
    progress: 80,
    workspace: "Personal",
    deadline: "Every Sunday",
    color: "#8b5cf6",
    milestones: [
      { id: 31, title: "Monday to Wednesday: 10 focus hours logged", completed: true },
      { id: 32, title: "Thursday to Friday: 8 focus hours logged", completed: true },
      { id: 33, title: "Weekend synthesis: 2 hours sprint", completed: false }
    ]
  },
  {
    id: 4,
    title: "Master Distributed Systems & Consensus Algorithms",
    description: "Deep study of Raft, Paxos, and distributed storage primitives with code implementations.",
    timeFrame: "long_term",
    progress: 40,
    workspace: "Development",
    deadline: "Q1 2027",
    color: "#ec4899",
    milestones: [
      { id: 41, title: "Read Raft paper and implement leader election in Go", completed: true },
      { id: 42, title: "Implement distributed key-value log replication", completed: false },
      { id: 43, title: "Benchmark network partition recovery edge cases", completed: false }
    ],
    relatedTaskIds: [4]
  }
];

export const initialCalendarEvents: CalendarEvent[] = [
  {
    id: 1,
    title: "Sprint Standup & Project Sync",
    startDate: new Date().toISOString().slice(0, 10),
    startTime: "09:30",
    endDate: new Date().toISOString().slice(0, 10),
    endTime: "10:00",
    type: "meeting",
    workspace: "Work",
    notes: "Review blockers and API integration status"
  },
  {
    id: 2,
    title: "Database Management Systems Lecture",
    startDate: new Date().toISOString().slice(0, 10),
    startTime: "11:00",
    endDate: new Date().toISOString().slice(0, 10),
    endTime: "12:30",
    type: "study",
    workspace: "College",
    notes: "Room 402 • Topic: Concurrency Control Protocols"
  },
  {
    id: 3,
    title: "Deep Work Sprint: WASM SQLite Profiling",
    startDate: new Date().toISOString().slice(0, 10),
    startTime: "15:00",
    endDate: new Date().toISOString().slice(0, 10),
    endTime: "17:00",
    type: "task",
    workspace: "Development",
    notes: "Zero-notification focus block with 432Hz binaural wave"
  },
  {
    id: 4,
    title: "Resume & Portfolio Deadline",
    startDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    startTime: "17:00",
    endDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    endTime: "17:00",
    type: "deadline",
    workspace: "Side Projects",
    taskId: 1
  },
  {
    id: 5,
    title: "DBMS Mid-Semester Examination",
    startDate: new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 10),
    startTime: "10:00",
    endDate: new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 10),
    endTime: "13:00",
    type: "deadline",
    workspace: "College",
    taskId: 2
  }
];

export const initialNotes: Note[] = [
  {
    id: 1,
    title: "Cognitive Bandwidth & Interface Design Notes",
    content: `# Cognitive Bandwidth in Product Design\n\nAttention cannot be multiplied—it can only be divided.\n\n### Key Principles\n1. **Zero Unsolicited Interruption**: Avoid badges, popups, and artificial alerts.\n2. **High Information Density**: Present meaningful data without visual clutter.\n3. **Tactile Feedback**: Every interaction should feel instantaneous (<50ms response).\n\n*Next step: apply these to the smart task queue.*`,
    workspace: "Personal",
    tags: ["design", "psychology", "ux"],
    isPinned: true,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "DBMS High-Yield Revision Cheatsheet",
    content: `# DBMS Exam Revision Summary\n\n### 1. ACID Properties\n- **Atomicity**: All or nothing transaction execution.\n- **Consistency**: Preserves database invariants.\n- **Isolation**: Concurrent transactions execute as if serial.\n- **Durability**: Committed data survives system crashes.\n\n### 2. Indexing Trade-offs\n- B+ Trees: Optimal for range queries ($O(\\log n)$).\n- Hash Index: $O(1)$ point lookups, inefficient for ranges.`,
    workspace: "College",
    tags: ["dbms", "exam", "cs"],
    isPinned: true,
    linkedTaskId: 2,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    title: "Sprint Alignment Meeting Notes",
    content: `# Sprint Retro & Action Items\n\n- Landing page needs redesign with high-contrast typography.\n- Rahul will handle database performance analytics.\n- Jatin to verify WebAssembly OPFS storage layer before Friday.`,
    workspace: "Work",
    tags: ["meeting", "sprint"],
    isPinned: false,
    linkedTaskId: 3,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }
];

export const initialAttendance: SubjectAttendance[] = [
  { id: 1, name: "Database Management Systems", code: "CS401", attended: 28, total: 32, targetPercentage: 75 },
  { id: 2, name: "Operating Systems", code: "CS402", attended: 26, total: 30, targetPercentage: 75 },
  { id: 3, name: "Design & Analysis of Algorithms", code: "CS403", attended: 31, total: 34, targetPercentage: 75 },
  { id: 4, name: "Computer Networks", code: "CS404", attended: 24, total: 30, targetPercentage: 75 },
  { id: 5, name: "Software Engineering & Agile", code: "CS405", attended: 29, total: 32, targetPercentage: 75 }
];

export const initialDevRepos: DevRepository[] = [
  {
    id: 1,
    name: "aethel-kernel",
    description: "Sovereign local-first productivity workspace engine built on React, TypeScript & WASM.",
    branch: "main",
    openIssues: 3,
    openPRs: 1,
    deploymentStatus: "deployed",
    commits: [
      { hash: "8f2a91c", msg: "Implement universal cross-workspace command bar (⌘K)", author: "Jatin Singh Kaintura", time: "1 hour ago" },
      { hash: "4c1b72e", msg: "Optimize Web Audio 432Hz binaural generator gain nodes", author: "Jatin Singh Kaintura", time: "3 hours ago" },
      { hash: "d9e830a", msg: "Add student study planner and attendance calculator", author: "Jatin Singh Kaintura", time: "Yesterday" }
    ],
    issues: [
      { id: 101, title: "Support drag-and-drop task prioritization in list view", status: "open", priority: "HIGH", tag: "enhancement" },
      { id: 102, title: "Export notes to Markdown zip archive", status: "open", priority: "MEDIUM", tag: "feature" },
      { id: 103, title: "Cache calendar events in local IndexedDB", status: "closed", priority: "LOW", tag: "optimization" }
    ]
  },
  {
    id: 2,
    name: "mindful-audio-synthesizer",
    description: "Client-side acoustic masking generator with pink noise and harmonic binaural carriers.",
    branch: "v1.2",
    openIssues: 1,
    openPRs: 0,
    deploymentStatus: "deployed",
    commits: [
      { hash: "1a3b5c7", msg: "Add bandpass filter for serene rain soundscape", author: "Jatin Singh Kaintura", time: "2 days ago" }
    ],
    issues: [
      { id: 201, title: "Smooth exponential volume ramp on play/pause", status: "open", priority: "MEDIUM", tag: "audio" }
    ]
  }
];

export const initialFocusSessions: FocusSession[] = [
  { id: 1, taskId: 1, taskTitle: "Portfolio redesign typography", durationMinutes: 25, completedAt: new Date(Date.now() - 3600000 * 3).toISOString(), type: "pomodoro", workspace: "Side Projects" },
  { id: 2, taskId: 2, taskTitle: "DBMS B+ Tree derivations", durationMinutes: 50, completedAt: new Date(Date.now() - 3600000 * 6).toISOString(), type: "custom", workspace: "College" },
  { id: 3, taskId: 4, taskTitle: "WASM SQLite Profiling", durationMinutes: 25, completedAt: new Date(Date.now() - 3600000 * 24).toISOString(), type: "pomodoro", workspace: "Development" }
];

export const readyTemplates: ProductivityTemplate[] = [
  {
    id: "student-exam",
    name: "Exam Preparation Sprint",
    category: "student",
    description: "7-day structured revision schedule covering syllabus blueprint, practice question bank, and timed mocks.",
    tasks: [
      { title: "Review exam syllabus and create high-yield formula cheat-sheet", priority: "HIGH", workspace: "College", category: "Academics" },
      { title: "Solve past 3 years university question papers", priority: "URGENT", workspace: "College", category: "Academics" },
      { title: "Conduct 2-hour timed mock exam simulation", priority: "URGENT", workspace: "College", category: "Academics" },
      { title: "Final quick revision of weak topics and glossary", priority: "HIGH", workspace: "College", category: "Academics" }
    ],
    goals: [
      {
        id: 901,
        title: "Master Subject Syllabus for 90%+ Score",
        timeFrame: "weekly",
        progress: 0,
        workspace: "College",
        milestones: [
          { id: 91, title: "Complete all lecture slides review", completed: false },
          { id: 92, title: "Solve 50 practice problems", completed: false },
          { id: 93, title: "Score >85% in mock test", completed: false }
        ]
      }
    ]
  },
  {
    id: "employee-weekly",
    name: "Weekly Work Sprint & Planning",
    category: "employee",
    description: "Structured corporate workflow with weekly goal setting, team syncs, deliverables, and retro.",
    tasks: [
      { title: "Define top 3 high-impact deliverables for the week", priority: "HIGH", workspace: "Work", category: "Planning" },
      { title: "Lead sprint sync and assign clear action items", priority: "HIGH", workspace: "Work", category: "Meetings" },
      { title: "Execute core project milestone before Thursday code freeze", priority: "URGENT", workspace: "Work", category: "Execution" },
      { title: "Draft Friday executive summary update email", priority: "MEDIUM", workspace: "Work", category: "Reporting" }
    ]
  },
  {
    id: "dev-feature",
    name: "Feature Development & Release Checklist",
    category: "developer",
    description: "Engineering lifecycle from technical specification to implementation, unit tests, and production deploy.",
    tasks: [
      { title: "Write technical RFC / architecture specification", priority: "HIGH", workspace: "Development", category: "Architecture" },
      { title: "Implement core business logic with strict TypeScript types", priority: "URGENT", workspace: "Development", category: "Engineering" },
      { title: "Write automated unit and integration tests (>90% coverage)", priority: "HIGH", workspace: "Development", category: "QA" },
      { title: "Create Pull Request, request peer review & address comments", priority: "MEDIUM", workspace: "Development", category: "Code Review" },
      { title: "Deploy to staging environment and verify smoke tests", priority: "URGENT", workspace: "Development", category: "DevOps" }
    ]
  },
  {
    id: "personal-habits",
    name: "Daily Mindful Habit & Focus Routine",
    category: "personal",
    description: "Sustainable daily rhythm combining physical wellness, 2 focused deep work blocks, and reflective journaling.",
    tasks: [
      { title: "Morning hydration & 20-min outdoor cardio", priority: "MEDIUM", workspace: "Personal", category: "Wellness", recurring: "daily" },
      { title: "Block 1: 90-minute uninterrupted deep work sprint", priority: "HIGH", workspace: "Personal", category: "Focus", recurring: "daily" },
      { title: "Block 2: 60-minute creative development / reading session", priority: "MEDIUM", workspace: "Personal", category: "Learning", recurring: "daily" },
      { title: "Evening reflection and next-day priority planning", priority: "LOW", workspace: "Personal", category: "Reflection", recurring: "daily" }
    ]
  }
];

export const initialEvents = initialCalendarEvents;
export const initialRepositories = initialDevRepos;
export const workspacesList: WorkspaceType[] = ["Personal", "Work", "College", "Development", "Side Projects"];

