import { getRuntimeSupabaseBoundary } from "./supabaseBoundary";

export type AuthEmailEntryRequest = Readonly<{
  email: string;
}>;

export type AuthEntryBoundaryStatus =
  | "client_unavailable"
  | "invalid_email"
  | "request_sent"
  | "request_failed";

export type AuthEntryBoundaryResult = Readonly<{
  kind: "auth_entry_boundary_result";
  phaseGate: "email_auth_entry_boundary";
  status: AuthEntryBoundaryStatus;
  isBackendAuthority: false;
  isServerConfirmed: false;
  isListenerEnabled: false;
  isOwnerCreationEnabled: false;
  isProfileCreationEnabled: false;
  isProductUnlockEnabled: false;
  isSessionEstablished: false;
  safeMessage: string;
}>;

function createResult(
  status: AuthEntryBoundaryStatus,
  safeMessage: string,
): AuthEntryBoundaryResult {
  return {
    kind: "auth_entry_boundary_result",
    phaseGate: "email_auth_entry_boundary",
    status,
    isBackendAuthority: false,
    isServerConfirmed: false,
    isListenerEnabled: false,
    isOwnerCreationEnabled: false,
    isProfileCreationEnabled: false,
    isProductUnlockEnabled: false,
    isSessionEstablished: false,
    safeMessage,
  };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function requestEmailAuthEntry(
  input: AuthEmailEntryRequest,
): Promise<AuthEntryBoundaryResult> {
  const normalizedEmail = normalizeEmail(input.email);

  if (!isValidEmail(normalizedEmail)) {
    return createResult("invalid_email", "Geçerli bir e-posta gir.");
  }

  const boundary = getRuntimeSupabaseBoundary();

  if (!boundary.clientAvailable || boundary.client === null) {
    return createResult(
      "client_unavailable",
      "İstek tamamlanamadı. Daha sonra tekrar dene.",
    );
  }

  try {
    const { error } = await boundary.client.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: "ankion://auth-callback",
        shouldCreateUser: true,
      },
    });

    if (error !== null) {
      return createResult(
        "request_failed",
        "İstek tamamlanamadı. Daha sonra tekrar dene.",
      );
    }

    return createResult(
      "request_sent",
      "Bağlantı isteği gönderildi. E-postanı kontrol et.",
    );
  } catch {
    return createResult(
      "request_failed",
      "İstek tamamlanamadı. Daha sonra tekrar dene.",
    );
  }
}
