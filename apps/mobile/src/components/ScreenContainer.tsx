import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScreenContainerProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  scrollEnabled?: boolean;
  floatingAction?: ReactNode;
  floatingActionStyle?: StyleProp<ViewStyle>;
};

export function ScreenContainer({
  children,
  style,
  contentStyle,
  scrollEnabled = true,
  floatingAction,
  floatingActionStyle,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 0);
  const bottomInset = Math.max(insets.bottom, 8);
  const contentTopPadding = Math.min(Math.max(topInset + 4, 10), 30);
  const contentBottomPadding = (floatingAction ? 164 : 98) + bottomInset;
  const floatingBottom = 104 + bottomInset;

  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <StatusBar barStyle="light-content" backgroundColor="#050509" />

      <View style={styles.shell}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: contentBottomPadding,
              paddingTop: contentTopPadding,
            },
            contentStyle,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={scrollEnabled}
        >
          <View pointerEvents="none" style={styles.glowTop} />
          {children}
        </ScrollView>

        {floatingAction ? (
          <View
            pointerEvents="box-none"
            style={[
              styles.floatingAction,
              { bottom: floatingBottom },
              floatingActionStyle,
            ]}
          >
            {floatingAction}
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#050509",
    flex: 1,
  },
  shell: {
    backgroundColor: "#050509",
    flex: 1,
  },
  scroll: {
    backgroundColor: "#050509",
    flex: 1,
  },
  content: {
    gap: 9,
    paddingHorizontal: 14,
  },
  glowTop: {
    backgroundColor: "#6d28d9",
    borderRadius: 999,
    height: 110,
    opacity: 0.025,
    position: "absolute",
    right: -82,
    top: -86,
    width: 110,
  },
  floatingAction: {
    alignItems: "center",
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: 40,
  },
});
