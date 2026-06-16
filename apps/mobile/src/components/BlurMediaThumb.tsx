import { StyleSheet, Text, View } from "react-native";

type BlurMediaThumbProps = {
  kind: "voice" | "photo" | "video" | "profile";
  label?: string;
  variant?: "purple" | "pink" | "green" | "neutral";
};

export function BlurMediaThumb({
  kind,
  label,
  variant = "neutral",
}: BlurMediaThumbProps) {
  const isVoice = kind === "voice";
  const isVideo = kind === "video";
  const voiceColor =
    variant === "green"
      ? "#86efac"
      : variant === "purple"
        ? "#d7cdf0"
        : "#f0abfc";

  return (
    <View style={[styles.wrap, styles[variant]]}>
      <View style={styles.blurLayerOne} />
      <View style={styles.blurLayerTwo} />

      {isVoice ? (
        <View style={styles.wave}>
          <View style={[styles.waveShort, { backgroundColor: voiceColor }]} />
          <View style={[styles.waveTall, { backgroundColor: voiceColor }]} />
          <View style={[styles.waveMid, { backgroundColor: voiceColor }]} />
        </View>
      ) : (
        <Text style={styles.mediaIcon}>
          {isVideo ? "▷" : kind === "profile" ? "◦" : "□"}
        </Text>
      )}

      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    borderRadius: 14,
    height: 48,
    justifyContent: "center",
    overflow: "hidden",
    width: 48,
  },
  neutral: {
    backgroundColor: "#121117",
  },
  purple: {
    backgroundColor: "#171322",
  },
  pink: {
    backgroundColor: "#1c121e",
  },
  green: {
    backgroundColor: "#101711",
  },
  blurLayerOne: {
    backgroundColor: "rgba(255,255,255,0.045)",
    borderRadius: 999,
    height: 36,
    left: -14,
    position: "absolute",
    top: -12,
    width: 36,
  },
  blurLayerTwo: {
    backgroundColor: "rgba(240,171,252,0.07)",
    borderRadius: 999,
    bottom: -17,
    height: 44,
    position: "absolute",
    right: -17,
    width: 44,
  },
  mediaIcon: {
    color: "#bfb5d2",
    fontSize: 16,
    fontWeight: "900",
  },
  label: {
    color: "#b9aec8",
    fontSize: 9,
    fontWeight: "800",
    marginTop: 1,
  },
  wave: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
    height: 20,
  },
  waveShort: {
    borderRadius: 999,
    height: 8,
    width: 4,
  },
  waveMid: {
    borderRadius: 999,
    height: 12,
    width: 4,
  },
  waveTall: {
    borderRadius: 999,
    height: 16,
    width: 4,
  },
});
