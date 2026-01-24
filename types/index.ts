// Types for the task manager app

export interface TaskSection {
  id: string;
  name: string;
  color: string;
  order: number;
}

export type TaskPriority = "urgent" | "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  description: string;
  sectionId: string;
  order: number;
  createdAt: number;
  completedAt?: number;
  pomodoroCount: number;
  priority: TaskPriority;
}

export interface UserProgress {
  totalTasksCompleted: number;
  totalPomodoros: number;
  level: number;
  treeGrowth: number; // 0-100, resets at each level
  totalXP: number;
}

export interface Activity {
  id: string;
  type: "task_done" | "pomodoro_complete" | "level_up" | "milestone";
  message: string;
  description?: string;
  timestamp: number;
  value?: number;
}

export interface DailyStats {
  date: string; // ISO date string (YYYY-MM-DD)
  count: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  condition: "pomodoro_count" | "task_count" | "level" | "streak";
  targetValue: number;
}

export interface Settings {
  pomodoroDuration: number; // in minutes
  theme: "light" | "dark";
}

export type RootStackParamList = {
  Tasks: undefined;
  Tree: undefined;
  Settings: undefined;
};
