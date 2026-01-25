import React from "react";
import { useTranslation } from "react-i18next";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";
import { radius, spacing, typography } from "../lib/theme";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
}: ConfirmModalProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  const finalConfirmText = confirmText === "Confirm" ? t("common.save") : confirmText;
  const finalCancelText = cancelText === "Cancel" ? t("common.cancel") : cancelText;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton, { borderColor: colors.border }]} 
              onPress={onCancel}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>{finalCancelText}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.confirmButton, 
                { backgroundColor: isDestructive ? colors.error : colors.primary }
              ]} 
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>{finalConfirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  content: {
    width: "100%",
    maxWidth: 340,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  title: {
    ...typography.h3,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  footer: {
    flexDirection: "row",
    gap: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
  },
  cancelText: {
    ...typography.body,
    fontWeight: "600",
  },
  confirmButtonText: {
    ...typography.body,
    color: "#ffffff",
    fontWeight: "600",
  },
});
