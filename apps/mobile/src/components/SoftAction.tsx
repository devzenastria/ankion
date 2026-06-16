import { StyleSheet, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import { uiColors, uiRadius, uiSpacing, uiTypography } from "../constants/ui";

type SoftActionProps = {
  label: string;
  hint?: string;
  style?: StyleProp<ViewStyle>;
};

export function SoftAction({ label, hint, style }: SoftActionProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: uiColors.surface.soft,
    borderColor: uiColors.border.subtle,
    borderRadius: uiRadius.lg,
    borderWidth: 1,
    gap: uiSpacing.xs,
    paddingHorizontal: uiSpacing.lg,
    paddingVertical: uiSpacing.md
  },
  label: {
    color: uiColors.accent.voice,
    ...uiTypography.action
  },
  hint: {
    color: uiColors.text.muted,
    ...uiTypography.metadata
  }
});
