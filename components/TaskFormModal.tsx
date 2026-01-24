import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";
import { TaskPriority } from "../types";
import { radius, spacing, typography } from "./../lib/theme";

interface TaskFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (
    title: string,
    description: string,
    priority: TaskPriority,
    pomodoroCount: number
  ) => void;
  initialData?: {
    title: string;
    description: string;
    priority: TaskPriority;
    pomodoroCount: number;
  };
}

export default function TaskFormModal({
  visible,
  onClose,
  onSubmit,
  initialData,
}: TaskFormModalProps) {
  const { colors, isDark } = useAppTheme();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<TaskPriority>("medium");
  const [pomodoroCount, setPomodoroCount] = React.useState(0);

  React.useEffect(() => {
    if (visible) {
      setTitle(initialData?.title || "");
      setDescription(initialData?.description || "");
      setPriority(initialData?.priority || "medium");
      setPomodoroCount(initialData?.pomodoroCount || 0);
    }
  }, [visible, initialData]);

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit(title, description, priority, pomodoroCount);
      setTitle("");
      setDescription("");
      setPriority("medium");
      setPomodoroCount(0);
    }
  };

  const getPriorityStyles = (p: TaskPriority) => {
    const isSelected = priority === p;
    if (!isSelected) {
      return {
        bg: colors.surfaceVariant,
        border: colors.border,
        text: colors.textSecondary,
      };
    }
    switch (p) {
      case "urgent":
        return {
          bg: isDark ? "#7f1d1d" : "#fee2e2",
          border: colors.error,
          text: isDark ? "#fecaca" : colors.error,
        };
      case "high":
        return {
          bg: isDark ? "#7c2d12" : "#ffedd5",
          border: colors.warning,
          text: isDark ? "#fed7aa" : "#c2410c",
        };
      case "medium":
        return {
          bg: isDark ? "#1e3a8a" : "#f0f9ff",
          border: colors.primary,
          text: isDark ? "#93c5fd" : colors.primary,
        };
      case "low":
        return {
          bg: isDark ? "#064e3b" : "#f0fdf4",
          border: colors.success,
          text: isDark ? "#6ee7b7" : colors.success,
        };
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    header: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      alignItems: "center",
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      fontSize: 16,
      color: colors.text,
      backgroundColor: isDark ? "#1f2937" : "#ffffff",
    },
    footer: {
      flexDirection: "row",
      gap: spacing.md,
      padding: spacing.md,
      borderTopColor: colors.border,
      borderTopWidth: 1,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      backgroundColor: isDark ? "#374151" : "transparent",
    },
    priorityButton: {
      flex: 1,
      minWidth: "45%",
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      alignItems: "center",
    },
    stepper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: isDark ? "#1f2937" : colors.surfaceVariant,
      borderRadius: radius.lg,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    stepperButton: {
      width: 48,
      height: 48,
      borderRadius: radius.md,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    stepperButtonText: {
      fontSize: 24,
      color: "#ffffff",
      fontWeight: "700",
    },
    stepperValueContainer: {
      alignItems: "center",
    },
    stepperValue: {
      fontSize: 24,
      fontWeight: "700",
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {initialData ? "Edit Task" : "New Task"}
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Task Title</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="Enter task title"
              placeholderTextColor={colors.textTertiary}
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[dynamicStyles.input, styles.textarea]}
              placeholder="Add notes or details..."
              placeholderTextColor={colors.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Priority</Text>
            <View style={styles.priorityGrid}>
              {(["urgent", "high", "medium", "low"] as TaskPriority[]).map(
                (p) => {
                  const pStyle = getPriorityStyles(p);
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[
                        dynamicStyles.priorityButton,
                        {
                          backgroundColor: pStyle.bg,
                          borderColor: pStyle.border,
                          borderWidth: priority === p ? 2 : 1,
                        },
                      ]}
                      onPress={() => setPriority(p)}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          { color: pStyle.text },
                          priority === p && { fontWeight: "700" },
                        ]}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Sessions Done
            </Text>
            <View style={dynamicStyles.stepper}>
              <TouchableOpacity
                style={dynamicStyles.stepperButton}
                onPress={() => setPomodoroCount(Math.max(0, pomodoroCount - 1))}
              >
                <Text style={dynamicStyles.stepperButtonText}>-</Text>
              </TouchableOpacity>

              <View style={dynamicStyles.stepperValueContainer}>
                <Text style={[dynamicStyles.stepperValue, { color: colors.text }]}>
                  {pomodoroCount}
                </Text>
                <Text
                  style={[
                    styles.stepperSubtext,
                    { color: colors.textSecondary },
                  ]}
                >
                  Pomodoros
                </Text>
              </View>

              <TouchableOpacity
                style={dynamicStyles.stepperButton}
                onPress={() => setPomodoroCount(pomodoroCount + 1)}
              >
                <Text style={dynamicStyles.stepperButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <View style={dynamicStyles.footer}>
          <TouchableOpacity
            style={dynamicStyles.cancelButton}
            onPress={onClose}
          >
            <Text
              style={[styles.cancelButtonText, { color: colors.textSecondary }]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: colors.primary },
              !title.trim() && styles.addButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!title.trim()}
          >
            <Text style={styles.addButtonText}>
              {initialData ? "Save Changes" : "Add Task"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.h3,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  textarea: {
    height: 100,
    paddingVertical: spacing.md,
  },
  cancelButtonText: {
    ...typography.body,
    fontWeight: "600",
  },
  addButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    ...typography.body,
    color: "#ffffff",
    fontWeight: "600",
  },
  priorityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  priorityText: {
    ...typography.bodySmall,
    fontWeight: "500",
  },
  stepperSubtext: {
    ...typography.caption,
    marginTop: -4,
  },
});
