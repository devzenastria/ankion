import { StyleSheet, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import { uiColors, uiSpacing, uiTypography } from "../constants/ui";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
};

export function SectionHeader({ title, subtitle, style }: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: uiSpacing.sm
  },
  title: {
    color: uiColors.text.primary,
    ...uiTypography.sectionTitle
  },
  subtitle: {
    color: uiColors.text.secondary,
    ...uiTypography.supporting
  }
});
