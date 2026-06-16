import { StyleSheet, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import { uiColors, uiSpacing, uiTypography } from "../constants/ui";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  style
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel ? <Text style={styles.actionLabel}>{actionLabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: uiSpacing.md
  },
  title: {
    color: uiColors.text.primary,
    ...uiTypography.sectionTitle
  },
  description: {
    color: uiColors.text.secondary,
    ...uiTypography.supporting
  },
  actionLabel: {
    color: uiColors.accent.voice,
    marginTop: uiSpacing.sm,
    ...uiTypography.action
  }
});
