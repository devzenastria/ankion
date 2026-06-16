import { StyleSheet, Text, View } from "react-native";

type ContentType = "voice" | "photo" | "video" | "profile";

type ContentTypeIconProps = {
  type: ContentType;
  tone?: "soft" | "active" | "approved";
};

const iconByType: Record<ContentType, string> = {
  voice: "≋",
  photo: "□",
  video: "▷",
  profile: "◦",
};

export function ContentTypeIcon({ type, tone = "soft" }: ContentTypeIconProps) {
  return (
    <View
      style={[
        styles.wrap,
        tone === "active" && styles.wrapActive,
        tone === "approved" && styles.wrapApproved,
      ]}
    >
      <Text
        allowFontScaling={false}
        style={[
          styles.icon,
          tone === "active" && styles.iconActive,
          tone === "approved" && styles.iconApproved,
        ]}
      >
        {iconByType[type]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    backgroundColor: "#17131d",
    borderRadius: 999,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  wrapActive: {
    backgroundColor: "#21183a",
  },
  wrapApproved: {
    backgroundColor: "#102017",
  },
  icon: {
    color: "#a99cbc",
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 15,
  },
  iconActive: {
    color: "#f0abfc",
  },
  iconApproved: {
    color: "#86efac",
  },
});
