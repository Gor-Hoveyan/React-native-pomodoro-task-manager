import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";
import { radius, spacing, typography } from "../lib/theme";
import { DailyStats } from "../types";

interface ProductivityChartProps {
  data: DailyStats[];
}

export default function ProductivityChart({ data }: ProductivityChartProps) {
  const { colors, isDark } = useAppTheme();

  // Get last 7 days names
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    
    // Construct local date string YYYY-MM-DD
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    
    const dayName = days[d.getDay()];
    const stat = data.find((s) => s.date === dateStr);
    return {
      day: dayName,
      count: stat ? stat.count : 0,
      isToday: i === 6,
    };
  });

  const maxCount = Math.max(...last7Days.map((d) => d.count), 5); // Minimum height of 5 for scale

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Weekly Workload</Text>
      
      <View style={styles.chartArea}>
        <View style={styles.yAxis}>
          <Text style={[styles.axisLabel, { color: colors.textTertiary }]}>{maxCount}</Text>
          <Text style={[styles.axisLabel, { color: colors.textTertiary }]}>{Math.floor(maxCount / 2)}</Text>
          <Text style={[styles.axisLabel, { color: colors.textTertiary }]}>0</Text>
        </View>

        <View style={styles.barsContainer}>
          {last7Days.map((day, index) => {
            const barHeight = (day.count / maxCount) * 100;
            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${barHeight}%`,
                        backgroundColor: day.isToday ? colors.primary : colors.primary + "40",
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.dayLabel,
                    { color: day.isToday ? colors.primary : colors.textSecondary },
                    day.isToday && { fontWeight: "700" },
                  ]}
                >
                  {day.day}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: "transparent",
  },
  title: {
    ...typography.h4,
    marginBottom: spacing.lg,
    fontWeight: "700",
  },
  chartArea: {
    flexDirection: "row",
    height: 160,
  },
  yAxis: {
    justifyContent: "space-between",
    paddingRight: spacing.sm,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: "rgba(0,0,0,0.05)",
  },
  axisLabel: {
    fontSize: 10,
    textAlign: "right",
    width: 20,
  },
  barsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    paddingLeft: spacing.sm,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    height: "100%",
  },
  barTrack: {
    flex: 1,
    width: 12,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: radius.full,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: radius.full,
  },
  dayLabel: {
    fontSize: 10,
    marginTop: spacing.xs,
  },
});
