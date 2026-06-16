import { useGlobalSearchParams, usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ActiveRoute = "home" | "feed" | "discover" | "chat" | "profile";
type NavRoute = "/" | "/feed" | "/discover" | "/profile";

type AppBottomNavProps = {
  active?: ActiveRoute;
};

type NavButtonProps = {
  active: ActiveRoute;
  itemKey: Exclude<ActiveRoute, "chat">;
  label: string;
  icon: string;
  onPress: () => void;
};

function VoiceMark({ active = false }: { active?: boolean }) {
  return (
    <View style={styles.voiceMark}>
      <View style={[styles.voiceBarSmall, active && styles.voiceBarActive]} />
      <View style={[styles.voiceBarTall, active && styles.voiceBarActive]} />
      <View style={[styles.voiceBarMid, active && styles.voiceBarActive]} />
    </View>
  );
}

function NavButton({ active, itemKey, label, icon, onPress }: NavButtonProps) {
  const isActive = active === itemKey;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.item, isActive && styles.itemActive]}
    >
      <Text
        allowFontScaling={false}
        numberOfLines={1}
        style={[styles.icon, isActive && styles.iconActive]}
      >
        {icon}
      </Text>
      <Text
        allowFontScaling={false}
        numberOfLines={1}
        style={[styles.label, isActive && styles.labelActive]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function getActiveRoute(pathname: string): ActiveRoute {
  if (pathname === "/feed") return "feed";
  if (pathname === "/discover") return "discover";
  if (pathname === "/chat") return "chat";

  if (
    pathname === "/profile" ||
    pathname === "/settings" ||
    pathname === "/reveal-requests" ||
    pathname === "/member-profile"
  ) {
    return "profile";
  }

  return "home";
}

export function AppBottomNav({
  active: activeOverride,
}: AppBottomNavProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useGlobalSearchParams<{ threadId?: string }>();
  const active = activeOverride ?? getActiveRoute(pathname);
  const isChatActive = active === "chat";
  const hasOpenThread = pathname === "/chat" && Boolean(params.threadId);

  function go(path: NavRoute) {
    if (pathname === path) {
      return;
    }

    router.replace(path);
  }

  function openConnections() {
    if (pathname === "/chat" && !hasOpenThread) {
      return;
    }

    router.replace("/chat");
  }

  return (
    <View style={styles.wrap}>
      <NavButton
        active={active}
        itemKey="home"
        label="Ana Sayfa"
        icon="⌂"
        onPress={() => go("/")}
      />

      <NavButton
        active={active}
        itemKey="feed"
        label="Akış"
        icon="≋"
        onPress={() => go("/feed")}
      />

      <Pressable
        accessibilityLabel="Bağlantılar"
        accessibilityRole="button"
        onPress={openConnections}
        style={[styles.centerItem, isChatActive && styles.centerItemActive]}
      >
        <View style={styles.centerIcon}>
          <VoiceMark active={isChatActive} />
        </View>

        <Text
          allowFontScaling={false}
          numberOfLines={1}
          style={[styles.centerLabel, isChatActive && styles.centerLabelActive]}
        >
          Bağlantılar
        </Text>
      </Pressable>

      <NavButton
        active={active}
        itemKey="discover"
        label="Keşfet"
        icon="⌕"
        onPress={() => go("/discover")}
      />

      <NavButton
        active={active}
        itemKey="profile"
        label="Profil"
        icon="○"
        onPress={() => go("/profile")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    backgroundColor: "rgba(8, 8, 12, 0.92)",
    borderColor: "#17131f",
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 5,
    paddingHorizontal: 5,
    paddingTop: 5,
  },
  item: {
    alignItems: "center",
    borderRadius: 16,
    flex: 1,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  itemActive: {
    backgroundColor: "rgba(124, 58, 237, 0.1)",
  },
  centerItem: {
    alignItems: "center",
    borderRadius: 16,
    flex: 1.08,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  centerItemActive: {
    backgroundColor: "rgba(240, 171, 252, 0.1)",
  },
  centerIcon: {
    alignItems: "center",
    height: 22,
    justifyContent: "center",
  },
  voiceMark: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
    height: 18,
  },
  voiceBarSmall: {
    backgroundColor: "#746a80",
    borderRadius: 999,
    height: 8,
    width: 4,
  },
  voiceBarMid: {
    backgroundColor: "#746a80",
    borderRadius: 999,
    height: 12,
    width: 4,
  },
  voiceBarTall: {
    backgroundColor: "#746a80",
    borderRadius: 999,
    height: 16,
    width: 4,
  },
  voiceBarActive: {
    backgroundColor: "#f0abfc",
  },
  centerLabel: {
    color: "#817889",
    fontSize: 9,
    fontWeight: "800",
    marginTop: 1,
  },
  centerLabelActive: {
    color: "#eadcf3",
  },
  icon: {
    color: "#817889",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 18,
  },
  iconActive: {
    color: "#eadcf3",
  },
  label: {
    color: "#817889",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 1,
  },
  labelActive: {
    color: "#eadcf3",
    fontWeight: "900",
  },
});
