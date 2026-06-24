import * as Linking from "expo-linking";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBottomNav } from "../src/components/AppBottomNav";
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
      <View style={styles.root}>
        <Stack
          screenOptions={{
            animation: "none",
            contentStyle: { backgroundColor: "#050509" },
            headerShown: false,
          }}
        />
        <View
          pointerEvents="box-none"
          style={[
            styles.navSlot,
            {
              paddingBottom: bottomInset,
            },
          ]}
        >
          <AppBottomNav />
        </View>
      </View>
    </AuthSessionProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#050509",
    flex: 1,
  },
  navSlot: {
    backgroundColor: "transparent",
    bottom: 0,
    left: 0,
    paddingHorizontal: 10,
    position: "absolute",
    right: 0,
  },
});
