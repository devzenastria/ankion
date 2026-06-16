import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, Text, View } from "react-native";

import { uiColors, uiRadius, uiSpacing, uiTypography } from "../constants/ui";

type PrivacyNoteProps = {
  title?: string;
  description: string;
  style?: StyleProp<ViewStyle>;
};

export function PrivacyNote({ title, description, style }: PrivacyNoteProps) {
  return (
    <View style={[styles.container, style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: uiRadius.lg,
    padding: uiSpacing.md,
    backgroundColor: uiColors.surface.soft,
    borderWidth: 1,
    borderColor: uiColors.border.subtle,
  },
  title: {
    ...uiTypography.metadata,
    color: uiColors.text.primary,
    marginBottom: uiSpacing.xs,
  },
  description: {
    ...uiTypography.supporting,
    color: uiColors.text.secondary,
  },
});
