// Centralized theme and styling constants

export const lightColors = {
  primary: "#6366f1",
  primaryLight: "#818cf8",
  primaryDark: "#4f46e5",
  secondary: "#ec4899",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",

  // Surfaces
  surface: "#ffffff",
  surfaceVariant: "#f9fafb",
  surfaceCard: "#ffffff",

  // Text
  text: "#1f2937",
  textSecondary: "#6b7280",
  textTertiary: "#9ca3af",

  // Borders
  border: "#e5e7eb",
  borderLight: "#f3f4f6",

  // Task section colors
  sections: {
    todo: "#3b82f6",
    inProgress: "#f59e0b",
    done: "#10b981",
  },
};

export const darkColors = {
  primary: "#818cf8", // Brighter in dark mode
  primaryLight: "#a5b4fc",
  primaryDark: "#6366f1",
  secondary: "#f472b6",
  success: "#34d399",
  warning: "#fbbf24",
  error: "#f87171",

  // Surfaces
  surface: "#111827",
  surfaceVariant: "#1f2937",
  surfaceCard: "#1f2937",

  // Text
  text: "#f9fafb",
  textSecondary: "#9ca3af",
  textTertiary: "#6b7280",

  // Borders
  border: "#374151",
  borderLight: "#1f2937",

  // Task section colors
  sections: {
    todo: "#60a5fa",
    inProgress: "#fbbf24",
    done: "#34d399",
  },
};

// Default expert for backward compatibility with existing code
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 24,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
};

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};
