import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AchievementList from "../../components/AchievementList";
import ActivityFeed from "../../components/ActivityFeed";
import PomodoroTimer from "../../components/PomodoroTimer";
import ProductivityChart from "../../components/ProductivityChart";
import TreeVisualization from "../../components/TreeVisualization";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useNotifications } from "../../hooks/useNotifications";
import {
  addActivity,
  checkAchievements,
  getAchievements,
  getActivities,
  getDailyStats,
  getProgress,
  getTasks,
  recordPomodoro,
  saveProgress,
  saveTasks
} from "../../lib/storage";
import { radius, spacing, typography } from "../../lib/theme";
import { useAppStore } from "../../store/usePomodoroStore";
import { Task, UserProgress } from "../../types";

export default function TreeScreen() {
  const { colors, isDark } = useAppTheme();
  const { triggerHaptic } = useNotifications();
  const { pomodoroDuration } = useAppStore();
  const { t } = useTranslation();
  
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const [loadedProgress, loadedTasks, loadedActivities, loadedStats, loadedAchievements] = await Promise.all([
      getProgress(),
      getTasks(),
      getActivities(),
      getDailyStats(),
      getAchievements(),
    ]);
    setProgress(loadedProgress);
    setTasks(loadedTasks.filter((t: Task) => !t.completedAt));
    setActivities(loadedActivities);
    setDailyStats(loadedStats);
    setAchievements(loadedAchievements);
  };

  const handleStartPomodoro = () => {
    setShowPomodoro(true);
    triggerHaptic("medium");
    triggerBounce();
  };

  const triggerBounce = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePomodoroComplete = async () => {
    if (!progress) return;

    if (selectedTaskId) {
      // Logic: Reward is deferred until the task is marked as "Done"
      const allTasks = await getTasks();
      const updatedTasks = allTasks.map((t) =>
        t.id === selectedTaskId
          ? { ...t, pomodoroCount: (t.pomodoroCount || 0) + 1 }
          : t
      );
      await saveTasks(updatedTasks);
      setTasks(updatedTasks.filter((t) => !t.completedAt));
      
      // Log Activity
      const taskTitle = allTasks.find(t => t.id === selectedTaskId)?.title;
      await addActivity("pomodoro_complete", t("tree.focused_on_msg", { title: taskTitle }), t("tree.sessions_desc"), 1);
      await recordPomodoro();
      
      triggerHaptic("success");
      
      // We don't close the modal immediately here if you want them to see the "Done" state
      // but the current PomodoroTimer handles its own "Done" state.
      // After they hit "Collect Growth" or "Go to Focus", it will close.
    } else {
      // Generic Session - reward immediately as there's no completion event
      const newProgress = {
        ...progress,
        totalPomodoros: progress.totalPomodoros + 1,
        treeGrowth: progress.treeGrowth + 5,
        totalXP: progress.totalXP + 5,
      };
      
      if (newProgress.treeGrowth >= 100) {
        newProgress.level += 1;
        newProgress.treeGrowth -= 100;
        newProgress.totalXP += 50;
        await addActivity("level_up", t("tree.level_up_msg", { title: `${t("common.level")} ${newProgress.level}` }), t("tree.earning_mastery"), 50);
      }
      await addActivity("pomodoro_complete", t("common.generic_session"), t("tree.sessions_desc"), 1);
      await recordPomodoro();

      setProgress(newProgress);
      await saveProgress(newProgress);
      triggerHaptic("success");
    }
    
    // Check for achievements
    await checkAchievements();
    
    triggerBounce();
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surfaceVariant,
    },
    header: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.lg,
      backgroundColor: colors.surface,
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
    },
    statCard: {
      width: "48%",
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    progressContainer: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    progressBar: {
      width: "100%",
      height: 12,
      backgroundColor: isDark ? "#374151" : colors.surfaceVariant,
      borderRadius: radius.full,
      overflow: "hidden",
      marginBottom: spacing.md,
    },
    milestoneList: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      overflow: "hidden",
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    milestoneItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
    },
    milestoneDone: {
      backgroundColor: isDark ? "#1f293780" : colors.surfaceVariant,
    },
    taskChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      backgroundColor: isDark ? colors.surfaceCard : "#ffffff",
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    taskChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
  });

  if (!progress) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={dynamicStyles.container}>
        <View style={styles.loadingState}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {t("common.loading")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={dynamicStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={dynamicStyles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t("tree.title")}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t("tree.subtitle")}
          </Text>
        </View>

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <View style={styles.treeContainer}>
            <TreeVisualization
              level={progress.level}
              treeGrowth={progress.treeGrowth}
            />
          </View>
        </Animated.View>

        <View style={styles.statsGrid}>
          <View style={dynamicStyles.statCard}>
            <MaterialCommunityIcons
              name="star"
              size={32}
              color={colors.warning}
            />
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {progress.level}
            </Text>
            <Text 
              style={[styles.statLabel, { color: colors.textSecondary }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {t("tree.stats.level")}
            </Text>
          </View>
          <View style={dynamicStyles.statCard}>
            <MaterialCommunityIcons
              name="check-circle"
              size={32}
              color={colors.success}
            />
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {progress.totalTasksCompleted}
            </Text>
            <Text 
              style={[styles.statLabel, { color: colors.textSecondary }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {t("tree.stats.tasks")}
            </Text>
          </View>
          <View style={dynamicStyles.statCard}>
            <MaterialCommunityIcons
              name="timer"
              size={32}
              color={colors.primary}
            />
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {progress.totalPomodoros}
            </Text>
            <Text 
              style={[styles.statLabel, { color: colors.textSecondary }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {t("tree.stats.poms")}
            </Text>
          </View>
          <View style={dynamicStyles.statCard}>
            <MaterialCommunityIcons
              name="lightning-bolt"
              size={32}
              color={colors.error}
            />
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {progress.totalXP}
            </Text>
            <Text 
              style={[styles.statLabel, { color: colors.textSecondary }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {t("tree.stats.xp")}
            </Text>
          </View>
        </View>

        <View style={styles.growthSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("tree.growth_progress")}
          </Text>
          <View style={dynamicStyles.progressContainer}>
            <View style={dynamicStyles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress.treeGrowth}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              {t("tree.next_level", { current: progress.treeGrowth })}
            </Text>
          </View>
        </View>

        <View style={styles.dashboardSection}>
          <View style={[styles.dashboardCard, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]}>
            <AchievementList achievements={achievements} />
          </View>
        </View>

        <View style={styles.pomodoroSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("tree.focus_on_task")}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.taskSelector}
            contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.md }}
          >
            <TouchableOpacity
              style={[
                dynamicStyles.taskChip,
                !selectedTaskId && dynamicStyles.taskChipActive,
              ]}
              onPress={() => { setSelectedTaskId(null); triggerHaptic("light"); }}
            >
              <Text
                style={[
                  styles.taskChipText,
                  !selectedTaskId
                    ? { color: "#ffffff" }
                    : { color: colors.text },
                ]}
              >
                {t("common.generic_session")}
              </Text>
            </TouchableOpacity>
            {tasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[
                  dynamicStyles.taskChip,
                  selectedTaskId === task.id && dynamicStyles.taskChipActive,
                ]}
                onPress={() => { setSelectedTaskId(task.id); triggerHaptic("light"); }}
              >
                <Text
                  style={[
                    styles.taskChipText,
                    selectedTaskId === task.id
                      ? { color: "#ffffff" }
                      : { color: colors.text },
                  ]}
                  numberOfLines={1}
                >
                  {task.title}
                </Text>
                <View
                  style={[
                    styles.taskPomodoroTag,
                    {
                      backgroundColor:
                        selectedTaskId === task.id
                          ? "rgba(255, 255, 255, 0.3)"
                          : isDark
                          ? "#374151"
                          : colors.surfaceVariant,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.taskPomodoroCount,
                      {
                        color:
                          selectedTaskId === task.id ? "#ffffff" : colors.primary,
                      },
                    ]}
                  >
                    {task.pomodoroCount || 0}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text, marginTop: spacing.lg },
            ]}
          >
            {t("tree.session_title")}
          </Text>
          <Text
            style={[
              styles.pomodoroDescription,
              { color: colors.textSecondary },
            ]}
          >
            {selectedTaskId
              ? t("tree.timer_desc_task", { 
                  title: tasks.find((t) => t.id === selectedTaskId)?.title || "",
                  duration: pomodoroDuration 
                })
              : t("tree.timer_desc", { duration: pomodoroDuration })}
          </Text>
          <TouchableOpacity
            style={[styles.pomodoroButton, { backgroundColor: colors.primary }]}
            onPress={handleStartPomodoro}
          >
            <MaterialCommunityIcons name="play" size={24} color="#ffffff" />
            <Text style={styles.pomodoroButtonText}>{t("tree.start_session")}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.milestoneSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("tree.milestones")}
          </Text>
          <View style={dynamicStyles.milestoneList}>
            {[
              { level: 1, title: t("tree.tree_names.sprout"), description: t("tree.reach_level", { level: 1 }) },
              { level: 5, title: t("tree.milestones_list.blooming"), description: t("tree.reach_level", { level: 5 }) },
              { level: 10, title: t("tree.milestones_list.mature_oak"), description: t("tree.reach_level", { level: 10 }) },
              { level: 20, title: t("tree.milestones_list.forest_guardian"), description: t("tree.reach_level", { level: 20 }) },
              {
                level: 50,
                title: t("tree.tree_names.ancient"),
                description: t("tree.reach_level", { level: 50 }),
              },
            ].map((milestone, index) => (
              <View
                key={index}
                style={[
                  dynamicStyles.milestoneItem,
                  progress.level >= milestone.level &&
                    dynamicStyles.milestoneDone,
                ]}
              >
                <MaterialCommunityIcons
                  name={
                    progress.level >= milestone.level
                      ? "check-circle"
                      : "circle-outline"
                  }
                  size={24}
                  color={
                    progress.level >= milestone.level
                      ? colors.success
                      : colors.textTertiary
                  }
                />
                <View style={styles.milestoneText}>
                  <Text style={[styles.milestoneName, { color: colors.text }]}>
                    {milestone.title}
                  </Text>
                  <Text
                    style={[
                      styles.milestoneDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {milestone.description}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.milestoneLevel,
                    progress.level >= milestone.level
                      ? { color: colors.success }
                      : { color: colors.textTertiary },
                  ]}
                >
                  {t("common.lvl_short")} {milestone.level}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.dashboardSection}>
          <View style={[styles.dashboardCard, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]}>
            <ProductivityChart data={dailyStats} />
          </View>
          
          <View style={[styles.dashboardCard, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: isDark ? 1 : 0, marginTop: spacing.lg }]}>
            <ActivityFeed activities={activities} />
          </View>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {showPomodoro && (
        <PomodoroTimer
          onComplete={handlePomodoroComplete}
          onClose={() => { setShowPomodoro(false); setSelectedTaskId(null); }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
  },
  treeContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...typography.body,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  statValue: {
    ...typography.h2,
    marginTop: spacing.sm,
  },
  statLabel: {
    ...typography.bodySmall,
    marginTop: spacing.xs,
  },
  growthSection: {
    paddingHorizontal: spacing.md,
    marginVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.full,
  },
  progressText: {
    ...typography.caption,
    textAlign: "center",
  },
  pomodoroSection: {
    paddingHorizontal: spacing.md,
    marginVertical: spacing.md,
  },
  pomodoroDescription: {
    ...typography.bodySmall,
    marginBottom: spacing.md,
  },
  pomodoroButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  pomodoroButtonText: {
    ...typography.body,
    color: "#ffffff",
    fontWeight: "600",
  },
  taskSelector: {
    marginBottom: spacing.xs,
  },
  taskChipText: {
    ...typography.bodySmall,
    fontWeight: "600",
    maxWidth: 150,
  },
  taskPomodoroTag: {
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: "center",
  },
  taskPomodoroCount: {
    fontSize: 12,
    fontWeight: "700",
  },
  milestoneSection: {
    paddingHorizontal: spacing.md,
    marginVertical: spacing.md,
    marginBottom: spacing.xl,
  },
  milestoneText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  milestoneName: {
    ...typography.body,
    fontWeight: "600",
  },
  milestoneDescription: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  milestoneLevel: {
    ...typography.caption,
    fontWeight: "600",
  },
  dashboardSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  dashboardCard: {
    borderRadius: radius.xl,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
