import { StyleSheet, View } from "react-native";

type VoiceWaveProps = {
  variant?: "purple" | "pink" | "orange";
  size?: "sm" | "md" | "lg";
};

const heights = {
  sm: [10, 18, 12, 24, 14, 20, 11],
  md: [18, 30, 22, 42, 26, 34, 20, 28, 16],
  lg: [24, 44, 32, 58, 38, 50, 30, 42, 22],
};

const colors = {
  purple: ["#c4b5fd", "#a855f7", "#7c3aed"],
  pink: ["#f9a8d4", "#ec4899", "#a855f7"],
  orange: ["#fdba74", "#fb7185", "#a855f7"],
};

export function VoiceWave({ variant = "purple", size = "md" }: VoiceWaveProps) {
  const selectedHeights = heights[size];
  const selectedColors = colors[variant];

  return (
    <View style={styles.wrap}>
      {selectedHeights.map((height, index) => (
        <View
          key={`${height}-${index}`}
          style={[
            styles.bar,
            {
              backgroundColor: selectedColors[index % selectedColors.length],
              height,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  bar: {
    borderRadius: 999,
    width: 5,
  },
});
