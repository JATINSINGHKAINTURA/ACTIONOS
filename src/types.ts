export type WorkspaceType = "Personal" | "Work" | "College" | "Development" | "Side Projects" | string;

export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TaskStatus = "pending" | "in_progress" | "completed" | "archived";

export type RecurringSchedule = "none" | "daily" | "weekly" | "monthly" | "custom";

export interface Subtask {
  id: number;
  title: string;
  completed: boolean;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  deadline?: string;
  dueDate?: string;
  dueTime?: string;
  priority: PriorityLevel;
  workspace: WorkspaceType;
  category: string;
  tags: string[];
  subtasks: Subtask[];
  attachments: string[];
  recurring?: RecurringSchedule;
  recurringCustom?: string;
  status: TaskStatus;
  completed?: boolean;
  createdAt: string;
  completedAt?: string;
  order?: number;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  workspace: WorkspaceType;
  progress: number;
  status: "active" | "completed" | "on_hold";
  deadline?: string;
  tags: string[];
  tasksCount?: number;
  completedTasksCount?: number;
  color?: string;
}

export interface Milestone {
  id: number;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface Goal {
  id: number;
  title: string;
  description?: string;
  timeFrame: "daily" | "weekly" | "monthly" | "long_term";
  progress: number;
  workspace: WorkspaceType;
  milestones: Milestone[];
  relatedTaskIds?: number[];
  deadline?: string;
  color?: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  startDate: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endDate?: string; // YYYY-MM-DD
  endTime?: string; // HH:MM
  type: "deadline" | "meeting" | "study" | "task" | "event";
  workspace: WorkspaceType;
  recurring?: boolean;
  taskId?: number;
  notes?: string;
  color?: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  workspace: WorkspaceType;
  tags: string[];
  isPinned: boolean;
  linkedTaskId?: number;
  linkedProjectId?: number;
  updatedAt: string;
  createdAt: string;
}

export interface SubjectAttendance {
  id: number;
  name: string;
  code: string;
  attended: number;
  total: number;
  targetPercentage: number;
}

export interface ExamItem {
  id: number;
  subject: string;
  date: string;
  time: string;
  topics: string[];
  daysLeft: number;
}

export interface DevRepository {
  id: number;
  name: string;
  description: string;
  branch: string;
  openIssues: number;
  openPRs: number;
  deploymentStatus: "deployed" | "building" | "failed";
  commits: { hash: string; msg: string; author: string; time: string }[];
  issues: { id: number; title: string; status: "open" | "closed"; priority: PriorityLevel; tag: string }[];
}

export interface FocusSession {
  id: number;
  taskId?: number;
  taskTitle?: string;
  durationMinutes: number;
  completedAt: string;
  type: "pomodoro" | "custom" | "short_break" | "long_break";
  workspace?: WorkspaceType;
}

export interface ProductivityTemplate {
  id: string;
  name: string;
  category: "student" | "employee" | "developer" | "personal";
  description: string;
  tasks: Partial<Task>[];
  goals?: Partial<Goal>[];
}

export interface TimetableSlot {
  id: number;
  timeSlot: string;
  startTime: string;
  endTime: string;
  category: string;
  taskTitle: string;
  durationMinutes: number;
  energyLevel: number;
  priority: PriorityLevel;
  isBreak: boolean;
}
