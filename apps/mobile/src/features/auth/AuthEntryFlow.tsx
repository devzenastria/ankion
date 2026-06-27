import { useState } from "react";

import { AuthLandingScreen } from "./AuthLandingScreen";
import { AuthLoginScaffoldScreen } from "./AuthLoginScaffoldScreen";
import { AuthSignupCredentialsScaffoldScreen } from "./AuthSignupCredentialsScaffoldScreen";

type AuthEntryRoute = "landing" | "login" | "signup";

export function AuthEntryFlow() {
  const [route, setRoute] = useState<AuthEntryRoute>("landing");

  if (route === "login") {
    return <AuthLoginScaffoldScreen onBackPress={() => setRoute("landing")} />;
  }

  if (route === "signup") {
    return (
      <AuthSignupCredentialsScaffoldScreen
        onBackPress={() => setRoute("landing")}
      />
    );
  }

  return (
    <AuthLandingScreen
      onLoginPress={() => setRoute("login")}
      onSignupPress={() => setRoute("signup")}
    />
  );
}
