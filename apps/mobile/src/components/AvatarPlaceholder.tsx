import { StyleSheet, Text, View } from "react-native";

type AvatarPlaceholderProps = {
  initial?: string;
  approved?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizeStyles = {
  sm: { height: 44, width: 44, borderRadius: 16 },
  md: { height: 62, width: 62, borderRadius: 22 },
  lg: { height: 82, width: 82, borderRadius: 28 },
};

export function AvatarPlaceholder({
  initial = "A",
  approved = false,
  size = "md",
}: AvatarPlaceholderProps) {
  return (
    <View
      style={[
        styles.wrap,
        sizeStyles[size],
        approved ? styles.approved : styles.private,
      ]}
    >
      <View style={styles.softGlow} />
      <Text style={[styles.initial, size === "lg" && styles.initialLarge]}>
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    borderWidth: 1,
    justifyContent: "center",
    overflow: "hidden",
  },
  private: {
    backgroundColor: "#191329",
    borderColor: "#33284a",
  },
  approved: {
    backgroundColor: "#102017",
    borderColor: "#166534",
  },
  softGlow: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    height: 44,
    position: "absolute",
    right: -16,
    top: -18,
    width: 44,
  },
  initial: {
    color: "#f0abfc",
    fontSize: 22,
    fontWeight: "900",
  },
  initialLarge: {
    fontSize: 30,
  },
});
