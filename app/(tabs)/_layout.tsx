import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../../hooks/useAppTheme";

export default function TabsLayout() {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarIcon: ({ color, size }) => {
          let iconName = "checkbox-multiple-marked";

          if (route.name === "tree") {
            iconName = "tree";
          }

          if (route.name === "settings") {
            iconName = "cog";
          }

          return (
            <MaterialCommunityIcons
              name={iconName as any}
              size={size}
              color={color}
            />
          );
        },

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDark ? "#6b7280" : "#9ca3af",

        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 8,
          height: 60,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.tasks"),
          tabBarLabel: t("tabs.tasks"),
        }}
      />

      <Tabs.Screen
        name="tree"
        options={{
          title: t("tabs.growth"),
          tabBarLabel: t("tabs.growth"),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: t("tabs.settings"),
          tabBarLabel: t("tabs.settings"),
        }}
      />
    </Tabs>
  );
}
