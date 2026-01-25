import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../../hooks/useAppTheme";
import SettingsScreen from "./settings";
import TasksScreen from "./tasks";
import TreeScreen from "./tree";

const Tab = createBottomTabNavigator();

export default function TabsLayout() {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }: any) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }: any) => {
          let iconName = "checkbox-multiple-marked";
          if (route.name === "Tree") iconName = "tree";
          if (route.name === "Settings") iconName = "cog";
          return (
            <MaterialCommunityIcons name={iconName as any} size={size} color={color} />
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
      <Tab.Screen 
        name="Tasks" 
        component={TasksScreen} 
        options={{ tabBarLabel: t("tabs.tasks") }} 
      />
      <Tab.Screen 
        name="Tree" 
        component={TreeScreen} 
        options={{ tabBarLabel: t("tabs.growth") }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ tabBarLabel: t("tabs.settings") }} 
      />
    </Tab.Navigator>
  );
}
