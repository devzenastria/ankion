import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

type AppRoute =
  | "/"
  | "/feed"
  | "/discover"
  | "/chat"
  | "/profile"
  | "/settings"
  | "/reveal-requests"
  | "/member-profile";

type AppHeaderIcon = "bell" | "plus" | "search" | "settings" | "back" | "none";

type AppHeaderProps = {
  eyebrow?: string;
  title: string;
  actionLabel?: string;
  actionHref?: AppRoute;
  icon?: AppHeaderIcon;
};

const iconMap: Record<AppHeaderIcon, string> = {
  bell: "•",
  plus: "+",
  search: "⌕",
  settings: "⚙",
  back: "‹",
  none: "",
};

export function AppHeader({
  eyebrow,
  title,
  actionLabel,
  actionHref,
  icon = "none",
}: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  function openAction() {
    if (!actionHref || pathname === actionHref) {
      return;
    }

    router.replace(actionHref);
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.context}>
        {eyebrow ? (
          <Text numberOfLines={1} style={styles.eyebrow}>
            {eyebrow}
          </Text>
        ) : null}

        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
      </View>

      {actionHref && actionLabel ? (
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={openAction}
          style={styles.action}
        >
          <Text numberOfLines={1} style={styles.actionText}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : icon !== "none" ? (
        <View style={styles.iconButton}>
          <Text style={styles.iconText}>{iconMap[icon]}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 28,
    paddingBottom: 0,
    paddingTop: 0,
  },
  context: {
    flex: 1,
    paddingRight: 10,
  },
  eyebrow: {
    color: "#5f5668",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.35,
    marginBottom: 0,
  },
  title: {
    color: "#cfc3dd",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.05,
    lineHeight: 17,
  },
  action: {
    alignItems: "center",
    backgroundColor: "rgba(18, 16, 24, 0.62)",
    borderColor: "rgba(215, 205, 240, 0.08)",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    minHeight: 27,
    paddingHorizontal: 9,
  },
  actionText: {
    color: "#bfb1d1",
    fontSize: 10,
    fontWeight: "800",
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "rgba(18, 16, 24, 0.62)",
    borderColor: "rgba(215, 205, 240, 0.08)",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  iconText: {
    color: "#bfb1d1",
    fontSize: 13,
    fontWeight: "800",
  },
});
