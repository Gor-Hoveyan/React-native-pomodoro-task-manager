import React, { useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";
import { radius, spacing, typography } from "./../lib/theme";

interface EditSectionModalProps {
  visible: boolean;
  onClose: () => void;
  onAddSection: (name: string, color: string) => void;
}

const PREDEFINED_COLORS = [
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#10b981", // green
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#6366f1", // indigo
];

export default function EditSectionModal({
  visible,
  onClose,
  onAddSection,
}: EditSectionModalProps) {
  const { colors, isDark } = useAppTheme();
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PREDEFINED_COLORS[0]);

  const handleSubmit = () => {
    if (name.trim()) {
      onAddSection(name, selectedColor);
      setName("");
      setSelectedColor(PREDEFINED_COLORS[0]);
      onClose();
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    header: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      alignItems: "center",
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      fontSize: 16,
      color: colors.text,
      backgroundColor: isDark ? "#1f2937" : "#ffffff",
    },
    cancelButton: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      backgroundColor: isDark ? "#374151" : "transparent",
    },
    footer: {
      flexDirection: "row",
      gap: spacing.md,
      padding: spacing.md,
      borderTopColor: colors.border,
      borderTopWidth: 1,
    },
    colorOption: {
      width: "23%",
      aspectRatio: 1,
      borderRadius: radius.lg,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: "transparent",
    },
    colorOptionSelected: {
      borderColor: colors.text,
      borderWidth: 3,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            New Section
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Section Name
            </Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="e.g., Urgent, Waiting for, Personal..."
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
              autoFocus
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Section Color
            </Text>
            <View style={styles.colorGrid}>
              {PREDEFINED_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    dynamicStyles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && dynamicStyles.colorOptionSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Text style={[styles.checkmark, { color: "#ffffff" }]}>
                      ✓
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={dynamicStyles.footer}>
          <TouchableOpacity
            style={dynamicStyles.cancelButton}
            onPress={onClose}
          >
            <Text
              style={[styles.cancelButtonText, { color: colors.textSecondary }]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.createButton,
              { backgroundColor: colors.primary },
              !name.trim() && styles.createButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!name.trim()}
          >
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.h3,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  checkmark: {
    fontSize: 20,
    fontWeight: "700",
  },
  cancelButtonText: {
    ...typography.body,
    fontWeight: "600",
  },
  createButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    ...typography.body,
    color: "#ffffff",
    fontWeight: "600",
  },
});
