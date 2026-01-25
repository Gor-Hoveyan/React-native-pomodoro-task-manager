import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
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
    language, setLanguage,
    reset
  } = usePomodoroStore();
  
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  const resetAllData = () => {
    Alert.alert(
      t("settings.reset_data"),
      t("settings.reset_alert_msg"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
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
      backgroundColor: colors.surfaceVariant,
    },
    header: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.lg,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    resetButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: isDark ? "#7f1d1d30" : "#fee2e2",
      borderRadius: radius.lg,
      gap: spacing.md,
      borderWidth: isDark ? 1 : 0,
      borderColor: "#7f1d1d",
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={dynamicStyles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t("settings.title")}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t("settings.timer_settings")}
          </Text>
          <View style={dynamicStyles.card}>
            <View style={styles.settingRow}>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {t("settings.focus_duration")}
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textTertiary }]}>
                  {pomodoroDuration} {t("common.min")}
                </Text>
              </View>
              <View style={styles.pickerContainer}>
                {[15, 25, 45, 60].map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setPomodoroDuration(d)}
                    style={[
                      styles.pickerButton,
                      { backgroundColor: colors.surfaceVariant },
                      pomodoroDuration === d && { backgroundColor: colors.primary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pickerButtonText,
                        { color: colors.textSecondary },
                        pomodoroDuration === d && { color: "#ffffff" },
                      ]}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {t("settings.short_break")}
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textTertiary }]}>
                  {shortBreakDuration} {t("common.min")}
                </Text>
              </View>
              <View style={styles.pickerContainer}>
                {[3, 5, 10, 15].map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setShortBreakDuration(d)}
                    style={[
                      styles.pickerButton,
                      { backgroundColor: colors.surfaceVariant },
                      shortBreakDuration === d && { backgroundColor: colors.primary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pickerButtonText,
                        { color: colors.textSecondary },
                        shortBreakDuration === d && { color: "#ffffff" },
                      ]}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {t("settings.long_break")}
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textTertiary }]}>
                  {longBreakDuration} {t("common.min")}
                </Text>
              </View>
              <View style={styles.pickerContainer}>
                {[15, 20, 30, 45].map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setLongBreakDuration(d)}
                    style={[
                      styles.pickerButton,
                      { backgroundColor: colors.surfaceVariant },
                      longBreakDuration === d && { backgroundColor: colors.primary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pickerButtonText,
                        { color: colors.textSecondary },
                        longBreakDuration === d && { color: "#ffffff" },
                      ]}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t("settings.language")}
          </Text>
          <View style={dynamicStyles.card}>
            <View style={styles.languageContainer}>
              {[
                { id: 'en', label: 'English' },
                { id: 'hy', label: 'Հայերեն' },
                { id: 'ru', label: 'Русский' }
              ].map((lang) => (
                <TouchableOpacity
                  key={lang.id}
                  onPress={() => setLanguage(lang.id as any)}
                  style={[
                    styles.langButton,
                    { backgroundColor: colors.surfaceVariant },
                    language === lang.id && { backgroundColor: colors.primary }
                  ]}
                >
                  <Text
                    style={[
                      styles.langButtonText,
                      { color: colors.textSecondary },
                      language === lang.id && { color: "#ffffff", fontWeight: '700' }
                    ]}
                  >
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t("settings.alerts")}
          </Text>
          <View style={dynamicStyles.card}>
            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {t("settings.sound")}
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textTertiary }]}>
                  {t("settings.sound_desc")}
                </Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: colors.border, true: colors.primary + "80" }}
                thumbColor={soundEnabled ? colors.primary : "#f4f3f4"}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {t("settings.haptic")}
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textTertiary }]}>
                  {t("settings.haptic_desc")}
                </Text>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={setHapticsEnabled}
                trackColor={{ false: colors.border, true: colors.primary + "80" }}
                thumbColor={hapticsEnabled ? colors.primary : "#f4f3f4"}
              />
            </View>
            
            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {t("settings.dark_mode")}
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textTertiary }]}>
                  {t("settings.dark_mode_desc")}
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary + "80" }}
                thumbColor={isDark ? colors.primary : "#f4f3f4"}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t("settings.danger_zone")}
          </Text>
          <TouchableOpacity
            style={dynamicStyles.resetButton}
            onPress={resetAllData}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
            <Text style={[styles.resetButtonText, { color: colors.error }]}>
              {t("settings.reset_data")}
            </Text>
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
  section: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.caption,
    fontWeight: "700",
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: spacing.xs,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingLabel: {
    ...typography.body,
    fontWeight: "600",
  },
  settingDesc: {
    ...typography.caption,
    marginTop: 2,
  },
  pickerContainer: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  pickerButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginVertical: spacing.md,
  },
  languageContainer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  langButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  langButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  resetButtonText: {
    ...typography.body,
    fontWeight: "600",
  },
});
