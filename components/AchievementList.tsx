import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";
import { radius, spacing, typography } from "../lib/theme";
import { Achievement } from "../types";

interface AchievementListProps {
  achievements: Achievement[];
}

export default function AchievementList({ achievements }: AchievementListProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  const unlockedCount = achievements.filter((a) => a.unlockedAt).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t("achievements.title")}</Text>
        <Text style={[styles.count, { color: colors.primary }]}>{unlockedCount}/{achievements.length}</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {achievements.map((ach) => {
          const isUnlocked = !!ach.unlockedAt;
          return (
            <View 
              key={ach.id} 
              style={[
                styles.badge, 
                { backgroundColor: isUnlocked ? colors.surfaceCard : isDark ? colors.surfaceVariant : "#f3f4f6" },
                !isUnlocked && { opacity: 0.6 }
              ]}
            >
              <View style={[
                styles.iconCircle, 
                { backgroundColor: isUnlocked ? colors.primary + "20" : "transparent" }
              ]}>
                <MaterialCommunityIcons 
                  name={(ach.icon as any) || "medal"} 
                  size={32} 
                  color={isUnlocked ? colors.primary : colors.textTertiary} 
                />
              </View>
              <Text 
                numberOfLines={1} 
                style={[styles.badgeTitle, { color: isUnlocked ? colors.text : colors.textSecondary }]}
              >
                {t(`achievements.items.${ach.id}.title`, { defaultValue: ach.title })}
              </Text>
              <Text 
                numberOfLines={2} 
                style={[styles.badgeDesc, { color: colors.textTertiary }]}
              >
                {isUnlocked 
                  ? t(`achievements.items.${ach.id}.desc`, { defaultValue: ach.description }) 
                  : t("achievements.locked")}
              </Text>
              
              {isUnlocked && (
                <View style={[styles.check, { backgroundColor: colors.success }]}>
                  <MaterialCommunityIcons name="check" size={10} color="#ffffff" />
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h4,
    fontWeight: "700",
  },
  count: {
    ...typography.caption,
    fontWeight: "700",
  },
  scrollContent: {
    paddingLeft: spacing.md,
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  badge: {
    width: 120,
    height: 160,
    borderRadius: radius.lg,
    padding: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  badgeTitle: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  badgeDesc: {
    fontSize: 10,
    textAlign: "center",
    lineHeight: 12,
  },
  check: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
