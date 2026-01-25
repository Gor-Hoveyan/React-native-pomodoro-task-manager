import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";
import { radius, spacing, typography } from "./../lib/theme";
import { Task, TaskSection } from "./../types";

interface TaskCardProps {
  task: Task;
  onDelete: () => void;
  onComplete: () => void;
  sections: TaskSection[];
  onMove: (sectionId: string) => void;
  onEdit: () => void;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export default function TaskCard({
  task,
  onDelete,
  onComplete,
  sections,
  onMove,
  onEdit,
  isDragging = false,
  onDragStart,
  onDragEnd,
}: TaskCardProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const [showActions, setShowActions] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const getPriorityColors = () => {
    switch (task.priority) {
      case "urgent":
        return {
          bg: isDark ? "#7f1d1d" : "#fee2e2",
          text: isDark ? "#fecaca" : colors.error,
        };
      case "high":
        return {
          bg: isDark ? "#7c2d12" : "#ffedd5",
          text: isDark ? "#fed7aa" : "#c2410c",
        };
      case "medium":
        return {
          bg: isDark ? "#1e3a8a" : "#f0f9ff",
          text: isDark ? "#93c5fd" : colors.primary,
        };
      case "low":
        return {
          bg: isDark ? "#064e3b" : "#f0fdf4",
          text: isDark ? "#6ee7b7" : colors.success,
        };
      default:
        return { bg: colors.surfaceVariant, text: colors.textSecondary };
    }
  };

  const pColors = getPriorityColors();

  const dynamicStyles = StyleSheet.create({
    card: {
      backgroundColor: colors.surfaceCard,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    cardDragging: {
      opacity: 0.8,
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      transform: [{ scale: 1.02 }],
    },
    actionMenu: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      width: "80%",
      maxWidth: 300,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    moveMenu: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      width: "80%",
      maxWidth: 300,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    pomodoroTag: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      marginTop: spacing.sm,
      marginLeft: 32,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      backgroundColor: isDark ? "#374151" : colors.surfaceVariant,
      borderRadius: radius.md,
      alignSelf: "flex-start",
    },
  });

  return (
    <>
      <View
        style={[
          dynamicStyles.card,
          isDragging && dynamicStyles.cardDragging,
          { borderLeftColor: colors.primary },
        ]}
      >
        <View style={styles.cardHeader}>
          <TouchableOpacity onPress={onComplete} style={styles.checkbox}>
            <MaterialCommunityIcons
              name="checkbox-blank-outline"
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>

          <Text style={[styles.title, { color: colors.text }]}>
            {task.title}
          </Text>

          <View style={styles.headerRightActions}>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: pColors.bg },
              ]}
            >
              <Text
                style={[
                  styles.priorityBadgeText,
                  { color: pColors.text },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {t(`priorities.${task.priority}`).toUpperCase()}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="drag-vertical"
              size={18}
              color={isDragging ? colors.textSecondary : colors.textTertiary}
            />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Task actions"
              onPress={() => setShowActions(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.actionsButton}
            >
              <MaterialCommunityIcons
                name="dots-vertical"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {task.description && (
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {task.description}
          </Text>
        )}

        <View style={dynamicStyles.pomodoroTag}>
          <MaterialCommunityIcons
            name={task.pomodoroCount > 0 ? "timer" : "timer-outline"}
            size={12}
            color={task.pomodoroCount > 0 ? colors.primary : colors.textTertiary}
          />
          <Text
            style={[
              styles.pomodoroText,
              {
                color:
                  task.pomodoroCount > 0
                    ? colors.primary
                    : colors.textSecondary,
              },
            ]}
          >
            {task.pomodoroCount || 0} {t("tree.stats.poms")}
          </Text>
        </View>
      </View>

      <Modal
        visible={showActions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActions(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowActions(false)}
        >
          <View style={dynamicStyles.actionMenu}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                onComplete();
                setShowActions(false);
              }}
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={colors.success}
              />
              <Text style={[styles.actionText, { color: colors.text }]}>
                {t("tasks.actions.complete")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                setShowMoveMenu(true);
                setShowActions(false);
              }}
            >
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.actionText, { color: colors.text }]}>
                {t("tasks.actions.move_to")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                onEdit();
                setShowActions(false);
              }}
            >
              <MaterialCommunityIcons
                name="pencil-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.actionText, { color: colors.text }]}>
                {t("tasks.actions.edit")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionItem, styles.dangerAction]}
              onPress={() => {
                onDelete();
                setShowActions(false);
              }}
            >
              <MaterialCommunityIcons
                name="delete-outline"
                size={20}
                color={colors.error}
              />
              <Text style={[styles.actionText, styles.dangerText]}>
                {t("tasks.actions.delete")}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showMoveMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMoveMenu(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowMoveMenu(false)}
        >
          <View style={dynamicStyles.moveMenu}>
            <Text style={[styles.moveMenuTitle, { color: colors.text }]}>
              {t("tasks.actions.move_title")}
            </Text>
            {sections.map((section) => (
              <TouchableOpacity
                key={section.id}
                style={styles.moveMenuItem}
                onPress={() => {
                  onMove(section.id);
                  setShowMoveMenu(false);
                }}
              >
                <View
                  style={[
                    styles.colorDot,
                    { backgroundColor: section.color },
                  ]}
                />
                <Text
                  style={[styles.moveMenuItemText, { color: colors.text }]}
                >
                  {section.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  actionsButton: {
    paddingVertical: 2,
    paddingLeft: spacing.xs,
  },
  checkbox: {
    padding: spacing.xs,
  },
  title: {
    ...typography.body,
    flex: 1,
    fontWeight: "500",
  },
  description: {
    ...typography.bodySmall,
    marginTop: spacing.sm,
    marginLeft: 32,
  },
  pomodoroText: {
    ...typography.caption,
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  actionText: {
    ...typography.body,
    marginLeft: spacing.md,
    fontWeight: "500",
  },
  dangerAction: {
    marginBottom: 0,
  },
  dangerText: {
    color: "#ef4444",
  },
  moveMenuTitle: {
    ...typography.h4,
    marginBottom: spacing.md,
  },
  moveMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
    marginRight: spacing.md,
  },
  moveMenuItemText: {
    ...typography.body,
    fontWeight: "500",
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginRight: spacing.xs,
    maxWidth: 80,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
});
