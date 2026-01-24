import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";
import { radius, spacing, typography } from "./../lib/theme";

interface TreeVisualizationProps {
  level: number;
  treeGrowth: number;
}

export default function TreeVisualization({
  level,
  treeGrowth,
}: TreeVisualizationProps) {
  const { colors, isDark } = useAppTheme();

  // Determine tree stage based on level
  const getTreeStage = () => {
    if (level < 5) return "seed";
    if (level < 10) return "sprout";
    if (level < 20) return "seedling";
    if (level < 35) return "sapling";
    if (level < 50) return "young";
    return "ancient";
  };

  // ASCII tree representations at different stages
  const trees = {
    seed: { icon: "🌱", label: "Seed" },
    sprout: { icon: "🌿", label: "Sprout" },
    seedling: { icon: "🌱🌿", label: "Seedling" },
    sapling: { icon: "🌲", label: "Sapling" },
    young: { icon: "🌳", label: "Young Tree" },
    ancient: { icon: "🌳✨", label: "Ancient Oak" },
  };

  const stage = getTreeStage();
  const currentTree = trees[stage as keyof typeof trees];
  const isMultiEmoji = Array.from(currentTree.icon).length > 1;

  const dynamicStyles = StyleSheet.create({
    treeDisplay: {
      width: 200,
      height: 200,
      borderRadius: 100,
      borderWidth: 4,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDark ? "#1f2937" : colors.surface,
      overflow: "hidden",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 15,
      elevation: 10,
      borderColor: colors.primary,
    },
    treeLabel: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: "700",
      backgroundColor: isDark ? "#374151" : colors.surfaceVariant,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.sm,
      overflow: "hidden",
    },
  });

  return (
    <View style={styles.container}>
      <View
        style={[
          dynamicStyles.treeDisplay,
          {
            opacity: 0.7 + (treeGrowth / 100) * 0.3,
          },
        ]}
      >
        <View style={styles.treeContent}>
          <Text
            style={[
              styles.treeText,
              { fontSize: isMultiEmoji ? 56 : 72 },
            ]}
          >
            {currentTree.icon}
          </Text>
          <Text style={dynamicStyles.treeLabel}>{currentTree.label}</Text>
        </View>
      </View>
      <View style={styles.treeInfo}>
        <Text style={[styles.levelText, { color: colors.primary }]}>
          Level {level}
        </Text>
        <Text style={[styles.stageText, { color: colors.textSecondary }]}>
          {stage.charAt(0).toUpperCase() + stage.slice(1)} Stage
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: spacing.lg,
  },
  treeContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    width: "100%",
    height: "100%",
  },
  treeText: {
    textAlign: "center",
    includeFontPadding: false,
  },
  treeInfo: {
    alignItems: "center",
    gap: spacing.xs,
  },
  levelText: {
    ...typography.h3,
    fontWeight: "700",
  },
  stageText: {
    ...typography.bodySmall,
  },
});
