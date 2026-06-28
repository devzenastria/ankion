import type { ReactNode } from "react";
import { usePathname } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { useAuthSessionBoundary } from "../../state/AuthSessionProvider";
import { AuthEntryFlow } from "./AuthEntryFlow";

type AuthStateGateProps = Readonly<{
  bottomInset: number;
  bottomNavigation: ReactNode;
  children: ReactNode;
}>;

type AuthGateState = "loading" | "signedOut" | "signedIn";

const authCallbackPathname = "/auth-callback";

function isAuthCallbackPath(pathname: string): boolean {
  return pathname === authCallbackPathname;
}

function resolveAuthGateState(
  sessionStatus: ReturnType<typeof useAuthSessionBoundary>["snapshot"]["session"]["status"],
  hasUser: boolean,
  isInitialSessionReadPending: boolean,
): AuthGateState {
  if (
    isInitialSessionReadPending ||
    sessionStatus === "loading" ||
    sessionStatus === "refresh_pending"
  ) {
    return "loading";
  }

  if (sessionStatus === "authenticated" && hasUser) {
    return "signedIn";
  }

  return "signedOut";
}

export function AuthStateGate({ bottomInset, bottomNavigation, children }: AuthStateGateProps) {
  const pathname = usePathname();
  const { isInitialSessionReadPending, snapshot } = useAuthSessionBoundary();
  const gateState = resolveAuthGateState(
    snapshot.session.status,
    snapshot.session.user !== null,
    isInitialSessionReadPending,
  );
  const isAuthCallbackRoute = isAuthCallbackPath(pathname);

  if (gateState !== "signedIn" && isAuthCallbackRoute) {
    return <View style={styles.root}>{children}</View>;
  }

  if (gateState === "loading") {
    return (
      <View style={[styles.root, styles.centered]}>
        <Text style={styles.loadingText}>Oturum kontrol ediliyor.</Text>
      </View>
    );
  }

  if (gateState === "signedOut") {
    return <AuthEntryFlow />;
  }

  return (
    <View style={styles.root}>
      {children}
      <View pointerEvents="box-none" style={[styles.navSlot, { paddingBottom: bottomInset }]}>
        {bottomNavigation}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#f4f0ff",
    fontSize: 15,
    fontWeight: "700",
  },
  navSlot: {
    backgroundColor: "transparent",
    bottom: 0,
    left: 0,
    paddingHorizontal: 10,
    position: "absolute",
    right: 0,
  },
  root: {
    backgroundColor: "#050509",
    flex: 1,
  },
});
