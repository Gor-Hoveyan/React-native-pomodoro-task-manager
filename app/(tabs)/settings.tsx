import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppTheme } from "../../hooks/useAppTheme";
import { initializeStorage } from "../../lib/storage";
import { radius, spacing, typography } from "../../lib/theme";
import { usePomodoroStore } from "../../store/usePomodoroStore";

export default function SettingsScreen() {
  const { 
    pomodoroDuration, setPomodoroDuration, 
    shortBreakDuration, setShortBreakDuration,
    longBreakDuration, setLongBreakDuration,
    theme, toggleTheme,
    soundEnabled, setSoundEnabled,
    hapticsEnabled, setHapticsEnabled,
    reset
  } = usePomodoroStore();
  
  const { colors, isDark } = useAppTheme();

  const resetAllData = () => {
    Alert.alert(
      "Reset All Data",
      "Are you sure? This will delete all tasks, sections, and progress. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                "@tasks",
                "@sections",
                "@progress",
                "@settings",
                "@activities",
                "@daily_stats",
                "@achievements",
                "app-storage-v2",
              ]);
              reset(); // Reset in-memory store
              await initializeStorage();
              Alert.alert("Success", "All data has been reset.");
            } catch (error) {
              Alert.alert("Error", "Failed to reset data.");
            }
          },
        },
      ]
    );
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    header: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    section: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    durationButton: {
      flex: 1,
      marginHorizontal: spacing.xs,
      paddingVertical: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.surfaceVariant,
      alignItems: "center",
      justifyContent: "center",
    },
    durationButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    durationButtonText: {
      ...typography.h3,
      color: colors.text,
    },
    durationButtonTextActive: {
      color: "#ffffff",
    },
    durationButtonLabel: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    durationButtonLabelActive: {
      color: "#ffffff",
    },
    switchRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    resetButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: isDark ? "#7f1d1d" : "#fee2e2",
      borderRadius: radius.lg,
      marginBottom: spacing.md,
      gap: spacing.md,
    },
    resetButtonText: {
      ...typography.body,
      color: isDark ? "#fecaca" : colors.error,
      fontWeight: "600",
    },
  });

  const DurationSelector = ({ label, value, onSelect, options }: any) => (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>{label}</Text>
      <View style={styles.durationGrid}>
        {options.map((opt: number) => (
          <TouchableOpacity
            key={opt}
            style={[
              dynamicStyles.durationButton,
              value === opt && dynamicStyles.durationButtonActive,
            ]}
            onPress={() => onSelect(opt)}
          >
            <Text style={[dynamicStyles.durationButtonText, value === opt && dynamicStyles.durationButtonTextActive]}>
              {opt}
            </Text>
            <Text style={[dynamicStyles.durationButtonLabel, value === opt && dynamicStyles.durationButtonLabelActive]}>
              min
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={dynamicStyles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        </View>

        {/* Durations Section */}
        <View style={dynamicStyles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            ⏱️ Timer Settings
          </Text>
          
          <DurationSelector 
            label="Focus Duration" 
            value={pomodoroDuration} 
            onSelect={setPomodoroDuration} 
            options={[15, 25, 45, 60]} 
          />
          
          <DurationSelector 
            label="Short Break" 
            value={shortBreakDuration} 
            onSelect={setShortBreakDuration} 
            options={[3, 5, 10, 15]} 
          />

          <DurationSelector 
            label="Long Break" 
            value={longBreakDuration} 
            onSelect={setLongBreakDuration} 
            options={[15, 20, 30, 45]} 
          />
        </View>

        {/* Preferences Section */}
        <View style={dynamicStyles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🔔 Notifications & Alerts
          </Text>
          
          <View style={dynamicStyles.switchRow}>
            <View>
              <Text style={[typography.body, { color: colors.text }]}>Sound Effects</Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Play sound on timer completion</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={dynamicStyles.switchRow}>
            <View>
              <Text style={[typography.body, { color: colors.text }]}>Haptic Feedback</Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Subtle vibrations for interactions</Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={setHapticsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Theme Section */}
        <View style={dynamicStyles.section}>
           <View style={dynamicStyles.switchRow}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>🎨 Dark Mode</Text>
              <Text style={[styles.sectionDescription, { color: colors.textSecondary, marginBottom: 0 }]}>Use a darker color palette</Text>
            </View>
            <Switch
              value={theme === "dark"}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Reset Section */}
        <View style={dynamicStyles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            ⚠️ Danger Zone
          </Text>
          <TouchableOpacity
            style={dynamicStyles.resetButton}
            onPress={resetAllData}
          >
            <Ionicons
              name="trash"
              size={20}
              color={isDark ? "#fecaca" : colors.error}
            />
            <Text style={dynamicStyles.resetButtonText}>Reset All Data</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.h2,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  sectionSubtitle: {
    ...typography.caption,
    fontWeight: "700",
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionDescription: {
    ...typography.bodySmall,
  },
  durationGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
