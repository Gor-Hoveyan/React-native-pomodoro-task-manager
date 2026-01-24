import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  PanResponder,
  PanResponderGestureState,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConfirmModal from "../../components/ConfirmModal";
import EditSectionModal from "../../components/EditSectionModal";
import TaskCard from "../../components/TaskCard";
import TaskFormModal from "../../components/TaskFormModal";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useNotifications } from "../../hooks/useNotifications";
import {
  addActivity,
  checkAchievements,
  getProgress,
  getSections,
  getTasks,
  initializeStorage,
  recordPomodoro,
  saveProgress,
  saveSections,
  saveTasks,
} from "../../lib/storage";
import { radius, spacing, typography } from "../../lib/theme";
import { Task, TaskPriority, TaskSection, UserProgress } from "../../types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function TasksScreen() {
  const { colors, isDark } = useAppTheme();
  const { triggerHaptic } = useNotifications();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sections, setSections] = useState<TaskSection[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showSectionEditor, setShowSectionEditor] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  );
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    visible: boolean;
    type: "task" | "section";
    id: string;
    title: string;
    message: string;
  }>({
    visible: false,
    type: "task",
    id: "",
    title: "",
    message: "",
  });
  
  const sectionLayouts = React.useRef<{ [key: string]: number }>({});
  const scrollOffset = React.useRef(0);
  const dragStartScrollOffset = React.useRef(0);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const autoscrollInterval = React.useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const startAutoscroll = (direction: number) => {
    if (autoscrollInterval.current) return;
    autoscrollInterval.current = setInterval(() => {
      if (scrollViewRef.current) {
        const nextX = scrollOffset.current + direction * 8;
        scrollViewRef.current.scrollTo({ x: nextX, animated: false });
      }
    }, 16);
  };

  const stopAutoscroll = () => {
    if (autoscrollInterval.current) {
      clearInterval(autoscrollInterval.current);
      autoscrollInterval.current = null;
    }
  };

  const handleDragMove = (gestureState: PanResponderGestureState) => {
    const { moveX } = gestureState;
    const edgeWidth = 60;
    if (moveX > SCREEN_WIDTH - edgeWidth) {
      startAutoscroll(1);
    } else if (moveX < edgeWidth) {
      startAutoscroll(-1);
    } else {
      stopAutoscroll();
    }
  };

  const loadData = async () => {
    await initializeStorage();
    const [loadedTasks, loadedSections, loadedProgress] = await Promise.all([
      getTasks(),
      getSections(),
      getProgress(),
    ]);

    // Sanitize tasks
    const sanitizedTasks: Task[] = loadedTasks.map((t) => ({
      ...t,
      priority: t.priority || "medium",
      pomodoroCount: t.pomodoroCount || 0,
    }));

    setTasks(sanitizedTasks);
    setSections(loadedSections.sort((a, b) => a.order - b.order));
    setProgress(loadedProgress);
    if (loadedSections.length > 0) {
      setSelectedSectionId(loadedSections[0].id);
    }
  };

  const handleAddTask = async (
    title: string,
    description: string,
    priority: TaskPriority,
    pomodoroCount: number = 0
  ) => {
    if (!selectedSectionId) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      description,
      sectionId: selectedSectionId,
      order: tasks.filter((t) => t.sectionId === selectedSectionId).length,
      createdAt: Date.now(),
      pomodoroCount,
      priority,
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
    setShowTaskForm(false);
    triggerHaptic("success");
  };

  const handleUpdateTask = async (
    title: string,
    description: string,
    priority: TaskPriority,
    pomodoroCount: number
  ) => {
    if (!editingTask) return;
    const updatedTasks = tasks.map((t) =>
      t.id === editingTask.id
        ? { ...t, title, description, priority, pomodoroCount }
        : t
    );
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
    setEditingTask(null);
    setShowTaskForm(false);
  };

  const handleMoveTask = async (taskId: string, toSectionId: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            sectionId: toSectionId,
          }
        : task
    );
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
    setDraggingTaskId(null);
    triggerHaptic("light");
  };

  const handleSwipeMove = async (
    taskId: string,
    direction: "left" | "right"
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const currentSectionIndex = sections.findIndex((s) => s.id === task.sectionId);
    if (currentSectionIndex === -1) return;

    let newSectionIndex = currentSectionIndex;
    if (direction === "right" && currentSectionIndex < sections.length - 1) {
      newSectionIndex = currentSectionIndex + 1;
    } else if (direction === "left" && currentSectionIndex > 0) {
      newSectionIndex = currentSectionIndex - 1;
    }

    if (newSectionIndex !== currentSectionIndex) {
      const newSectionId = sections[newSectionIndex].id;
      await handleMoveTask(taskId, newSectionId);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    setDeleteDialog({
      visible: true,
      type: "task",
      id: taskId,
      title: "Delete Task",
      message: `Are you sure you want to delete "${task?.title || "this task"}"?`,
    });
    triggerHaptic("warning");
  };

  const handleDeleteSection = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    setDeleteDialog({
      visible: true,
      type: "section",
      id: sectionId,
      title: "Delete Section",
      message: `Are you sure you want to delete "${section?.name || "this section"}"? All tasks inside will also be deleted.`,
    });
  };

  const confirmDelete = async () => {
    const { type, id } = deleteDialog;
    if (type === "task") {
      const updatedTasks = tasks.filter((t) => t.id !== id);
      setTasks(updatedTasks);
      await saveTasks(updatedTasks);
    } else {
      const updatedSections = sections.filter((s) => s.id !== id);
      const updatedTasks = tasks.filter((t) => t.sectionId !== id);
      setSections(updatedSections);
      setTasks(updatedTasks);
      await saveSections(updatedSections);
      await saveTasks(updatedTasks);
    }
    setDeleteDialog((prev) => ({ ...prev, visible: false }));
  };

  const handleCompleteTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const doneSection = sections.find((s) => s.name.toLowerCase() === "done");
    if (doneSection && task.sectionId !== doneSection.id) {
      const updatedTasks = tasks.map((t) =>
        t.id === taskId ? { ...t, sectionId: doneSection.id, completedAt: Date.now() } : t
      );
      setTasks(updatedTasks);
      await saveTasks(updatedTasks);
    }

    // Award rewards ONLY when the task is done
    if (progress) {
      const pomsSpent = task.pomodoroCount || 0;
      
      // Calculate growth: 10 base for finishing + 5 per session spent
      const totalGrowthToAward = 10 + (pomsSpent * 5);
      const xpToAward = 20 + (pomsSpent * 10);

      let newProgress = {
        ...progress,
        totalTasksCompleted: progress.totalTasksCompleted + 1,
        totalPomodoros: progress.totalPomodoros + pomsSpent,
        treeGrowth: progress.treeGrowth + totalGrowthToAward,
        totalXP: progress.totalXP + xpToAward,
      };

      // Handle multi-level up if the task was very large
      while (newProgress.treeGrowth >= 100) {
        newProgress.level += 1;
        newProgress.treeGrowth -= 100;
        newProgress.totalXP += 50; // Level up bonus
        await addActivity("level_up", `Reached Level ${newProgress.level}!`, "Earning mastery", 50);
      }

      await addActivity("task_done", `Completed "${task.title}"`, `Earned ${xpToAward} XP`, xpToAward);

      // Record total effort to stats (minimum 1 point for finishing a task)
      const effortToRecord = Math.max(1, pomsSpent);
      await recordPomodoro(effortToRecord);

      setProgress(newProgress);
      await saveProgress(newProgress);
      triggerHaptic("success");
      
      // Check for achievements
      await checkAchievements();
    }
  };

  const handleAddSection = async (name: string, color: string) => {
    const newSection: TaskSection = {
      id: Date.now().toString(),
      name,
      color,
      order: sections.length,
    };
    const updatedSections = [...sections, newSection];
    setSections(updatedSections);
    await saveSections(updatedSections);
    setShowSectionEditor(false);
  };

  const getTasksForSection = (sectionId: string) => {
    return tasks
      .filter((t) => t.sectionId === sectionId)
      .sort((a, b) => a.order - b.order);
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surfaceVariant,
    },
    header: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: colors.surface,
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
    },
    stat: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: isDark ? colors.surfaceCard : colors.surfaceVariant,
      borderRadius: radius.md,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    sectionColumn: {
      width: 300,
      marginRight: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      maxHeight: "100%",
      overflow: "visible",
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    sectionCount: {
      ...typography.caption,
      color: colors.textTertiary,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      backgroundColor: colors.surfaceVariant,
      borderRadius: radius.md,
    },
    addTaskButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.md,
      marginTop: spacing.md,
      borderRadius: radius.md,
      borderColor: colors.primary,
      borderWidth: 1,
      borderStyle: "dashed",
      gap: spacing.sm,
    },
    addSectionButton: {
      width: 300,
      height: 200,
      marginRight: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      justifyContent: "center",
      alignItems: "center",
      borderColor: colors.border,
      borderWidth: 2,
      borderStyle: "dashed",
    },
  });

  return (
    <SafeAreaView edges={["top", "bottom"]} style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Tasks</Text>
        {progress && (
          <View style={styles.statsRow}>
            <View style={dynamicStyles.stat}>
              <MaterialCommunityIcons name="star" size={16} color={colors.warning} />
              <Text style={[styles.statText, { color: colors.text }]}>
                Level {progress.level}
              </Text>
            </View>
            <View style={dynamicStyles.stat}>
              <MaterialCommunityIcons name="check-circle" size={16} color={colors.success} />
              <Text style={[styles.statText, { color: colors.text }]}>
                {progress.totalTasksCompleted}
              </Text>
            </View>
          </View>
        )}
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sectionsContainer}
        scrollEnabled={draggingTaskId == null}
        onScroll={(e) => {
          scrollOffset.current = e.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
      >
        {sections.map((section) => {
          const isCurrentDraggingSection = draggingTaskId && tasks.find((t) => t.id === draggingTaskId)?.sectionId === section.id;
          return (
            <View
              key={section.id}
              style={[
                dynamicStyles.sectionColumn,
                isCurrentDraggingSection && { zIndex: 100, elevation: 10 },
              ]}
              onLayout={(e) => { sectionLayouts.current[section.id] = e.nativeEvent.layout.x; }}
            >
              <TouchableOpacity
                style={[styles.sectionHeader, { borderTopColor: section.color }]}
                onLongPress={() => handleDeleteSection(section.id)}
              >
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.name}</Text>
                <Text style={dynamicStyles.sectionCount}>{getTasksForSection(section.id).length}</Text>
              </TouchableOpacity>

              <FlatList
                scrollEnabled={false}
                style={{ overflow: "visible" }}
                contentContainerStyle={{ overflow: "visible" }}
                data={getTasksForSection(section.id)}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <DraggableTaskCard
                    task={item}
                    onDelete={() => handleDeleteTask(item.id)}
                    onComplete={() => handleCompleteTask(item.id)}
                    sections={sections}
                    onMove={(sectionId) => handleMoveTask(item.id, sectionId)}
                    onEdit={() => { setEditingTask(item); setShowTaskForm(true); }}
                    isDragging={draggingTaskId === item.id}
                    onDragStart={() => { setDraggingTaskId(item.id); dragStartScrollOffset.current = scrollOffset.current; }}
                    onDragEnd={() => { setDraggingTaskId(null); stopAutoscroll(); }}
                    onDragMove={handleDragMove}
                    onSwipeMove={(direction) => handleSwipeMove(item.id, direction)}
                    scrollOffset={scrollOffset}
                    startScrollOffset={dragStartScrollOffset}
                  />
                )}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No tasks</Text>
                  </View>
                }
              />

              <TouchableOpacity
                style={dynamicStyles.addTaskButton}
                onPress={() => { setSelectedSectionId(section.id); setShowTaskForm(true); }}
              >
                <MaterialCommunityIcons name="plus" size={20} color={colors.primary} />
                <Text style={[styles.addTaskText, { color: colors.primary }]}>Add task</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <TouchableOpacity style={dynamicStyles.addSectionButton} onPress={() => setShowSectionEditor(true)}>
          <MaterialCommunityIcons name="plus" size={24} color={colors.primary} />
          <Text style={[styles.addSectionText, { color: colors.primary }]}>Add Section</Text>
        </TouchableOpacity>
      </ScrollView>

      <TaskFormModal
        visible={showTaskForm}
        onClose={() => { setShowTaskForm(false); setEditingTask(null); }}
        onSubmit={editingTask ? handleUpdateTask : handleAddTask}
        initialData={
          editingTask
            ? {
                title: editingTask.title,
                description: editingTask.description,
                priority: editingTask.priority,
                pomodoroCount: editingTask.pomodoroCount || 0,
              }
            : undefined
        }
      />

      <EditSectionModal
        visible={showSectionEditor}
        onClose={() => setShowSectionEditor(false)}
        onAddSection={handleAddSection}
      />

      <ConfirmModal
        visible={deleteDialog.visible}
        title={deleteDialog.title}
        message={deleteDialog.message}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog((prev) => ({ ...prev, visible: false }))}
        isDestructive
        confirmText="Delete"
      />
    </SafeAreaView>
  );
}

interface DraggableTaskCardProps {
  task: Task;
  onDelete: () => void;
  onComplete: () => void;
  sections: TaskSection[];
  onMove: (sectionId: string) => void;
  onEdit: () => void;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragMove?: (gestureState: any) => void;
  onSwipeMove?: (direction: "left" | "right") => void;
  scrollOffset: React.MutableRefObject<number>;
  startScrollOffset: React.MutableRefObject<number>;
}

function DraggableTaskCard({
  task,
  onDelete,
  onComplete,
  sections,
  onMove,
  onEdit,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onDragMove,
  onSwipeMove,
  scrollOffset,
  startScrollOffset,
}: DraggableTaskCardProps) {
  const pan = React.useRef(new Animated.ValueXY()).current;
  const scale = React.useRef(new Animated.Value(1)).current;
  const opacity = React.useRef(new Animated.Value(1)).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const isHorizontalIntent = Math.abs(gestureState.dx) > 15;
        const isVerticalIntent = Math.abs(gestureState.dy) > 10;
        return isHorizontalIntent || isVerticalIntent;
      },
      onPanResponderGrant: () => {
        onDragStart?.();
        Animated.parallel([
          Animated.spring(scale, { toValue: 1.05, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.8, duration: 150, useNativeDriver: true }),
        ]).start();
      },
      onPanResponderMove: (evt, gestureState) => {
        const currentScrollX = scrollOffset.current;
        const scrollDelta = currentScrollX - startScrollOffset.current;
        pan.setValue({ x: gestureState.dx + scrollDelta, y: gestureState.dy });
        onDragMove?.(gestureState);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (Math.abs(gestureState.dx) > 80) {
          if (gestureState.dx > 0) onSwipeMove?.("right");
          else onSwipeMove?.("left");
        }
        onDragEnd?.();
        Animated.parallel([
          Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }),
        ]).start();
      },
      onPanResponderTerminate: () => {
        onDragEnd?.();
        Animated.parallel([
          Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }),
        ]).start();
      },
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[{ transform: [...pan.getTranslateTransform(), { scale }], opacity, zIndex: isDragging ? 1000 : 1 }]}
    >
      <TaskCard
        task={task}
        onDelete={onDelete}
        onComplete={onComplete}
        sections={sections}
        onMove={onMove}
        onEdit={onEdit}
        isDragging={isDragging}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { ...typography.h2, marginBottom: spacing.sm },
  statsRow: { flexDirection: "row", gap: spacing.md },
  statText: { ...typography.bodySmall, fontWeight: "600" },
  sectionsContainer: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, overflow: "visible" },
  sectionHeader: { paddingBottom: spacing.sm, marginBottom: spacing.md, borderTopWidth: 3, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { ...typography.h4 },
  emptyState: { padding: spacing.md, alignItems: "center" },
  emptyText: { ...typography.bodySmall },
  addTaskText: { ...typography.bodySmall, fontWeight: "600" },
  addSectionText: { ...typography.bodySmall, fontWeight: "600", marginTop: spacing.sm },
});
