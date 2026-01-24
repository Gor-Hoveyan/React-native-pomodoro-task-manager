import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";
import { useNotifications } from "../hooks/useNotifications";
import { useAppStore } from "../store/usePomodoroStore";
import { radius, spacing, typography } from "./../lib/theme";

type TimerMode = "focus" | "shortBreak" | "longBreak";

interface PomodoroTimerProps {
  onComplete: () => void;
  onClose: () => void;
  duration?: number; // Initial duration if passed, otherwise uses store
}

export default function PomodoroTimer({
  onComplete,
  onClose,
  duration,
}: PomodoroTimerProps) {
  const { colors, isDark } = useAppTheme();
  const { triggerHaptic } = useNotifications();
  const { 
    pomodoroDuration, 
    shortBreakDuration, 
    longBreakDuration 
  } = useAppStore();

  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState((duration || pomodoroDuration) * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  
  const initialSeconds = useRef((duration || pomodoroDuration) * 60);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Sync initial seconds when mode changes
  useEffect(() => {
    let mins = pomodoroDuration;
    if (mode === "shortBreak") mins = shortBreakDuration;
    if (mode === "longBreak") mins = longBreakDuration;
    
    const seconds = mins * 60;
    initialSeconds.current = seconds;
    setTimeLeft(seconds);
    setIsRunning(false);
  }, [mode, pomodoroDuration, shortBreakDuration, longBreakDuration]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            handleTimerEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const handleTimerEnd = () => {
    triggerHaptic("success");
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const progress = 1 - timeLeft / initialSeconds.current;

  const handleAction = () => {
    if (timeLeft === 0) {
      if (mode === "focus") {
        setSessionCount(prev => prev + 1);
        onComplete(); // Award points
        // Suggest a break
        setMode("shortBreak");
      } else {
        setMode("focus");
      }
    } else {
      setIsRunning(!isRunning);
      triggerHaptic("light");
    }
  };

  const dynamicStyles = StyleSheet.create({
    content: {
      width: "90%",
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      padding: spacing.lg,
      alignItems: "center",
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    timerLabel: {
      ...typography.body,
      color: "#ffffff",
      fontWeight: "500",
    },
    modeButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      backgroundColor: isDark ? colors.surfaceVariant : "#f3f4f6",
    },
    modeButtonActive: {
      backgroundColor: mode === "focus" ? colors.primary : colors.success,
    },
  });

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={dynamicStyles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} hitSlop={20}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
            <View style={styles.modeToggle}>
              <TouchableOpacity 
                style={[dynamicStyles.modeButton, mode === "focus" && dynamicStyles.modeButtonActive]}
                onPress={() => { setMode("focus"); triggerHaptic("light"); }}
              >
                <Text style={{ color: mode === "focus" ? "#ffffff" : colors.textSecondary, fontWeight: "600" }}>Focus</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[dynamicStyles.modeButton, mode.includes("Break") && dynamicStyles.modeButtonActive]}
                onPress={() => { setMode("shortBreak"); triggerHaptic("light"); }}
              >
                <Text style={{ color: mode.includes("Break") ? "#ffffff" : colors.textSecondary, fontWeight: "600" }}>Break</Text>
              </TouchableOpacity>
            </View>
            <View style={{ width: 24 }} />
          </View>

          <Animated.View
            style={[styles.timerCircle, { transform: [{ scale: scaleAnim }] }]}
          >
            <View style={styles.circleBackground}>
              <View
                style={[
                  styles.circleProgress,
                  {
                    width: 200,
                    height: 200,
                    borderRadius: 100,
                    overflow: "hidden",
                    backgroundColor: mode === "focus" ? colors.primary : colors.success,
                  },
                ]}
              >
                <View style={styles.timerInner}>
                  <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
                  <Text style={dynamicStyles.timerLabel}>
                    {timeLeft === 0 ? "Done!" : isRunning ? (mode === "focus" ? "Stay Focused" : "Relaxing") : "Paused"}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          <View
            style={[
              styles.progressBar,
              { backgroundColor: colors.borderLight },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                { width: `${progress * 100}%`, backgroundColor: mode === "focus" ? colors.primary : colors.success },
              ]}
            />
          </View>
          
          <View style={styles.statsInline}>
             <MaterialCommunityIcons name="trophy" size={16} color={colors.warning} />
             <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Sessions completed: {sessionCount}</Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                { backgroundColor: timeLeft === 0 ? colors.success : isRunning ? colors.warning : colors.primary },
                { width: timeLeft === 0 ? 200 : 70, borderRadius: timeLeft === 0 ? radius.lg : 35 }
              ]}
              onPress={handleAction}
            >
              {timeLeft === 0 ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <MaterialCommunityIcons name="check-circle" size={24} color="#ffffff" />
                  <Text style={{ color: "#ffffff", fontWeight: "700" }}>{mode === "focus" ? "Collect Growth" : "Go to Focus"}</Text>
                </View>
              ) : (
                <MaterialCommunityIcons
                  name={isRunning ? "pause" : "play"}
                  size={32}
                  color="#ffffff"
                />
              )}
            </TouchableOpacity>

            {timeLeft > 0 && (
              <TouchableOpacity
                style={styles.resetButtonSmall}
                onPress={() => {
                  setTimeLeft(initialSeconds.current);
                  setIsRunning(false);
                  triggerHaptic("medium");
                }}
              >
                <MaterialCommunityIcons name="restart" size={24} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.tips, { backgroundColor: isDark ? "#374151" : colors.surfaceVariant }]}>
            <Text style={[styles.tipsTitle, { color: colors.text }]}>
              {mode === "focus" ? "💡 Focus Tip" : "🧘 Break Tip"}
            </Text>
            <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
              {mode === "focus" 
                ? "Break down your big goal into tiny manageable tasks." 
                : "Stand up and stretch your back for 30 seconds."}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: "transparent",
    gap: spacing.sm,
  },
  timerCircle: {
    marginVertical: spacing.lg,
  },
  circleBackground: {
    alignItems: "center",
    justifyContent: "center",
  },
  circleProgress: {
    justifyContent: "center",
    alignItems: "center",
  },
  timerInner: {
    alignItems: "center",
    gap: spacing.xs,
  },
  timeText: {
    fontSize: 56,
    fontWeight: "700",
    color: "#ffffff",
  },
  progressBar: {
    width: "100%",
    height: 8,
    borderRadius: radius.full,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.full,
  },
  statsInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.lg,
  },
  controls: {
    flexDirection: "row",
    gap: spacing.lg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
    width: "100%",
  },
  controlButton: {
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  resetButtonSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  tips: {
    width: "100%",
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  tipsTitle: {
    ...typography.bodySmall,
    fontWeight: "600",
    marginBottom: 4,
  },
  tipsText: {
    ...typography.bodySmall,
    lineHeight: 18,
  },
});
