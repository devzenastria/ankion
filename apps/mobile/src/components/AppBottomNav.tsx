import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ActiveRoute = "home" | "feed" | "plus" | "discover" | "chat" | "profile";
type NavRoute = "/" | "/feed" | "/plus" | "/discover" | "/profile";

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
  if (pathname === "/plus") return "plus";
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
  const active = activeOverride ?? getActiveRoute(pathname);

  function go(path: NavRoute) {
    if (pathname === path) {
      return;
    }

    router.replace(path);
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

      <NavButton
        active={active}
        itemKey="plus"
        label="Plus"
        icon="+"
        onPress={() => go("/plus")}
      />

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
