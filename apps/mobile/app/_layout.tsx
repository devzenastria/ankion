import * as Linking from "expo-linking";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBottomNav } from "../src/components/AppBottomNav";
import { AuthStateGate } from "../src/features/auth/AuthStateGate";
import { rememberAuthCallbackUrl } from "../src/lib/authCallbackUrlStore";
import { AuthSessionProvider } from "../src/state/AuthSessionProvider";

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);

  useEffect(() => {
    let isMounted = true;

    void Linking.getInitialURL().then((initialUrl) => {
      if (isMounted) {
        rememberAuthCallbackUrl(initialUrl);
      }
    });

    const subscription = Linking.addEventListener("url", (event) => {
      rememberAuthCallbackUrl(event.url);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return (
    <AuthSessionProvider>
      <AuthStateGate bottomInset={bottomInset} bottomNavigation={<AppBottomNav />}>
        <Stack
          screenOptions={{
            animation: "none",
            contentStyle: { backgroundColor: "#050509" },
            headerShown: false,
          }}
        />
      </AuthStateGate>
    </AuthSessionProvider>
  );
}
