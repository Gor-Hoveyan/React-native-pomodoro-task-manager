import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";
import { spacing, typography } from "../lib/theme";
import { Activity } from "../types";

interface ActivityFeedProps {
  activities: Activity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const { colors, isDark } = useAppTheme();

  const getIcon = (type: Activity["type"]) => {
    switch (type) {
      case "pomodoro_complete":
        return { name: "timer-check", color: colors.primary };
      case "task_done":
        return { name: "checkbox-marked-circle", color: colors.success };
      case "level_up":
        return { name: "trending-up", color: colors.warning };
      case "milestone":
        return { name: "trophy", color: colors.warning };
      default:
        return { name: "information", color: colors.primary };
    }
  };

  const formatTimestamp = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  if (activities.length === 0) {
    return (
      <View style={styles.empty}>
        <MaterialCommunityIcons name="history" size={40} color={colors.textTertiary} />
        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No recent activity</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Recent Activity</Text>
      {activities.map((item, index) => {
        const icon = getIcon(item.type);
        return (
          <View key={item.id} style={styles.item}>
            <View style={styles.timeline}>
              <View style={[styles.iconCircle, { backgroundColor: icon.color + "20" }]}>
                <MaterialCommunityIcons name={icon.name as any} size={20} color={icon.color} />
              </View>
              {index !== activities.length - 1 && (
                <View style={[styles.line, { backgroundColor: colors.borderLight }]} />
              )}
            </View>
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={[styles.message, { color: colors.text }]}>{item.message}</Text>
                <Text style={[styles.time, { color: colors.textTertiary }]}>{formatTimestamp(item.timestamp)}</Text>
              </View>
              {item.description && (
                <Text style={[styles.desc, { color: colors.textSecondary }]}>{item.description}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  title: {
    ...typography.h4,
    marginBottom: spacing.lg,
    fontWeight: "700",
  },
  item: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  timeline: {
    alignItems: "center",
    width: 40,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
    paddingTop: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 4,
  },
  message: {
    ...typography.body,
    fontWeight: "600",
    flex: 1,
  },
  time: {
    fontSize: 10,
  },
  desc: {
    ...typography.caption,
  },
  empty: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    ...typography.bodySmall,
    marginTop: spacing.sm,
  },
});
