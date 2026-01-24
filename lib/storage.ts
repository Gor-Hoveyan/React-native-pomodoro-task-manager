// Local storage utilities for persisting app data
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Achievement, Activity, DailyStats, Settings, Task, TaskSection, UserProgress } from "../types";

const TASKS_KEY = "@tasks";
const SECTIONS_KEY = "@sections";
const PROGRESS_KEY = "@progress";
const SETTINGS_KEY = "@settings";
const ACTIVITY_KEY = "@activities";
const STATS_KEY = "@daily_stats";
const ACHIEVEMENT_KEY = "@achievements";

// Helper for local date keys (YYYY-MM-DD)
const getLocalDateString = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const DEFAULT_SECTIONS: TaskSection[] = [
  { id: "1", name: "Todo", color: "#3b82f6", order: 0 },
  { id: "2", name: "In Progress", color: "#f59e0b", order: 1 },
  { id: "3", name: "Done", color: "#10b981", order: 2 },
];

const DEFAULT_PROGRESS: UserProgress = {
  totalTasksCompleted: 0,
  totalPomodoros: 0,
  level: 1,
  treeGrowth: 0,
  totalXP: 0,
};

const DEFAULT_SETTINGS: Settings = {
  pomodoroDuration: 25,
  theme: "light",
};

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: "1", title: "First Sprout🌱", description: "Complete your first Pomodoro session", icon: "sprout", condition: "pomodoro_count", targetValue: 1 },
  { id: "2", title: "Productive Start✅", description: "Complete your first task", icon: "check-decagram", condition: "task_count", targetValue: 1 },
  { id: "3", title: "Deep Focus 🧠", description: "Complete 10 Pomodoro sessions", icon: "brain", condition: "pomodoro_count", targetValue: 10 },
  { id: "4", title: "Task Legend 🏆", description: "Complete 10 tasks", icon: "trophy", condition: "task_count", targetValue: 10 },
  { id: "5", title: "Rising Star ✨", description: "Reach Level 5", icon: "star", condition: "level", targetValue: 5 },
  { id: "6", title: "Forest Guardian 🌳", description: "Reach Level 10", icon: "tree", condition: "level", targetValue: 10 },
  { id: "7", title: "Workaholic 🔥", description: "Complete 50 Pomodoros", icon: "fire", condition: "pomodoro_count", targetValue: 50 },
];

// Tasks
export async function getTasks(): Promise<Task[]> {
  try {
    const data = await AsyncStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading tasks:", error);
    return [];
  }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  try {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Error saving tasks:", error);
  }
}

// Sections
export async function getSections(): Promise<TaskSection[]> {
  try {
    const data = await AsyncStorage.getItem(SECTIONS_KEY);
    return data ? JSON.parse(data) : DEFAULT_SECTIONS;
  } catch (error) {
    console.error("Error reading sections:", error);
    return DEFAULT_SECTIONS;
  }
}

export async function saveSections(sections: TaskSection[]): Promise<void> {
  try {
    await AsyncStorage.setItem(SECTIONS_KEY, JSON.stringify(sections));
  } catch (error) {
    console.error("Error saving sections:", error);
  }
}

// Progress
export async function getProgress(): Promise<UserProgress> {
  try {
    const data = await AsyncStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : DEFAULT_PROGRESS;
  } catch (error) {
    console.error("Error reading progress:", error);
    return DEFAULT_PROGRESS;
  }
}

export async function saveProgress(progress: UserProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Error saving progress:", error);
  }
}

// Settings
export async function getSettings(): Promise<Settings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Error reading settings:", error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}

// Activity Feed
export async function getActivities(): Promise<Activity[]> {
  try {
    const data = await AsyncStorage.getItem(ACTIVITY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
}

export async function addActivity(
  type: Activity["type"],
  message: string,
  description?: string,
  value?: number
): Promise<void> {
  try {
    const activities = await getActivities();
    const newActivity: Activity = {
      id: Date.now().toString(),
      type,
      message,
      description,
      timestamp: Date.now(),
      value,
    };
    // Keep only last 20 activities
    const updated = [newActivity, ...activities].slice(0, 20);
    await AsyncStorage.setItem(ACTIVITY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error adding activity:", error);
  }
}

// Statistics
export async function getDailyStats(): Promise<DailyStats[]> {
  try {
    const data = await AsyncStorage.getItem(STATS_KEY);
    const parsed = data ? JSON.parse(data) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(s => s && typeof s.date === 'string' && typeof s.count === 'number');
  } catch (error) {
    return [];
  }
}

export async function recordPomodoro(count: number = 1): Promise<void> {
  try {
    const stats = await getDailyStats();
    const today = getLocalDateString();
    
    let found = false;
    const updatedStats = stats.map((s) => {
      if (s.date === today) {
        found = true;
        return { ...s, count: s.count + count };
      }
      return s;
    });
    
    if (!found) {
      updatedStats.push({ date: today, count: count });
    }
    
    const finalStats = updatedStats.slice(-14);
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(finalStats));
  } catch (error) {
    console.error("Error recording pomodoro stat:", error);
  }
}

// Achievements
export async function getAchievements(): Promise<Achievement[]> {
  try {
    const data = await AsyncStorage.getItem(ACHIEVEMENT_KEY);
    return data ? JSON.parse(data) : INITIAL_ACHIEVEMENTS;
  } catch (error) {
    return INITIAL_ACHIEVEMENTS;
  }
}

export async function saveAchievements(achievements: Achievement[]): Promise<void> {
  try {
    await AsyncStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(achievements));
  } catch (error) {
    console.error("Error saving achievements:", error);
  }
}

export async function checkAchievements(): Promise<Achievement[]> {
  try {
    const progress = await getProgress();
    const achievements = await getAchievements();
    const newlyUnlocked: Achievement[] = [];
    
    const updated = achievements.map((ach) => {
      if (ach.unlockedAt) return ach;
      
      let conditionMet = false;
      switch (ach.condition) {
        case "pomodoro_count":
          conditionMet = (progress.totalPomodoros || 0) >= ach.targetValue;
          break;
        case "task_count":
          conditionMet = (progress.totalTasksCompleted || 0) >= ach.targetValue;
          break;
        case "level":
          conditionMet = (progress.level || 1) >= ach.targetValue;
          break;
      }
      
      if (conditionMet) {
        const unlocked = { ...ach, unlockedAt: Date.now() };
        newlyUnlocked.push(unlocked);
        return unlocked;
      }
      return ach;
    });
    
    if (newlyUnlocked.length > 0) {
      await saveAchievements(updated);
      for (const ach of newlyUnlocked) {
        await addActivity("milestone", `Achievement Unlocked: ${ach.title}`, ach.description, 100);
      }
    }
    
    return newlyUnlocked;
  } catch (error) {
    return [];
  }
}

// Initialize storage with default data if empty
export async function initializeStorage(): Promise<void> {
  try {
    const sections = await getSections();
    if (sections.length === 0) {
      await saveSections(DEFAULT_SECTIONS);
    }
    const progress = await getProgress();
    if (!progress.level) {
      await saveProgress(DEFAULT_PROGRESS);
    }
    const settings = await getSettings();
    if (!settings.pomodoroDuration) {
      await saveSettings(DEFAULT_SETTINGS);
    }
    const achievements = await getAchievements();
    if (achievements.length === 0) {
      await saveAchievements(INITIAL_ACHIEVEMENTS);
    }
  } catch (error) {
    console.error("Error initializing storage:", error);
  }
}
