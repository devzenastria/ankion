import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import type { OwnerProfileCreationBoundaryResult } from "../lib/ownerProfileCreationBoundary";
import { useAuthSessionBoundary } from "../state/AuthSessionProvider";

type CreationUiStatus =
  | "idle"
  | "loading"
  | OwnerProfileCreationBoundaryResult["status"];

const ageBands = ["18-24", "25-34", "35-44", "45+"] as const;

function getVisibleMessage(status: CreationUiStatus): string | null {
  switch (status) {
    case "idle":
    case "loading":
      return null;
    case "created":
      return "Profil temeli güvenli şekilde hazırlandı.";
    case "idempotent_existing":
      return "Profil temeli zaten hazır.";
    case "invalid_input":
      return "Bilgileri kontrol et.";
    case "not_authenticated":
    case "client_unavailable":
    case "creation_requested":
    case "denied":
    case "network_failed":
    case "unknown_failed":
      return "Profil kurulumu tamamlanamadı. Daha sonra tekrar dene.";
  }
}

function isSuccessStatus(status: CreationUiStatus): boolean {
  return status === "created" || status === "idempotent_existing";
}

export function OwnerProfileCreationCard() {
  const { requestOwnerProfileCreation } = useAuthSessionBoundary();
  const [displayName, setDisplayName] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [ageBand, setAgeBand] = useState<(typeof ageBands)[number]>("18-24");
  const [status, setStatus] = useState<CreationUiStatus>("idle");

  async function handleCreatePress() {
    if (status === "loading") {
      return;
    }

    setStatus("loading");

    try {
      const result = await requestOwnerProfileCreation({
        displayName,
        shortBio,
        ageBand,
      });

      setStatus(result.status);
    } catch {
      setStatus("unknown_failed");
    }
  }

  const isLoading = status === "loading";
  const visibleMessage = getVisibleMessage(status);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil kurulumu</Text>
        <Text style={styles.description}>
          Oturumun gözlemlendikten sonra ANKION kimliğini güvenli şekilde
          hazırlarsın. Bu işlem ürün kilidi açmaz.
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Görünen ad</Text>
        <TextInput
          accessibilityLabel="Görünen ad"
          autoCapitalize="words"
          maxLength={32}
          onChangeText={setDisplayName}
          placeholder="ANKION adı"
          placeholderTextColor="#5f5668"
          style={styles.input}
          value={displayName}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Kısa bio</Text>
        <TextInput
          accessibilityLabel="Kısa bio"
          maxLength={160}
          multiline
          onChangeText={setShortBio}
          placeholder="Kısa bir tanıtım"
          placeholderTextColor="#5f5668"
          style={[styles.input, styles.bioInput]}
          textAlignVertical="top"
          value={shortBio}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Yaş aralığı</Text>
        <View style={styles.ageBandRow}>
          {ageBands.map((item) => {
            const isActive = ageBand === item;

            return (
              <Pressable
                accessibilityRole="button"
                key={item}
                onPress={() => setAgeBand(item)}
                style={[
                  styles.ageBandButton,
                  isActive ? styles.ageBandButtonActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.ageBandText,
                    isActive ? styles.ageBandTextActive : null,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={isLoading}
        onPress={handleCreatePress}
        style={({ pressed }) => [
          styles.button,
          pressed && !isLoading ? styles.buttonPressed : null,
          isLoading ? styles.buttonDisabled : null,
        ]}
      >
        {isLoading ? <ActivityIndicator color="#050509" size="small" /> : null}
        <Text style={styles.buttonText}>
          {isLoading ? "Hazırlanıyor..." : "Profil temelini oluştur"}
        </Text>
      </Pressable>

      {visibleMessage !== null ? (
        <Text
          style={[
            styles.message,
            isSuccessStatus(status) ? styles.messageSuccess : null,
          ]}
        >
          {visibleMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111017",
    borderColor: "#211d29",
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  header: {
    gap: 5,
  },
  title: {
    color: "#fff7ed",
    fontSize: 14,
    fontWeight: "900",
  },
  description: {
    color: "#a99cbc",
    fontSize: 12,
    lineHeight: 17,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    color: "#817889",
    fontSize: 11,
    fontWeight: "900",
  },
  input: {
    backgroundColor: "#0d0c12",
    borderColor: "#201c27",
    borderRadius: 12,
    borderWidth: 1,
    color: "#fff7ed",
    fontSize: 13,
    fontWeight: "800",
    minHeight: 44,
    paddingHorizontal: 12,
  },
  bioInput: {
    minHeight: 72,
    paddingTop: 10,
  },
  ageBandRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  ageBandButton: {
    backgroundColor: "#0d0c12",
    borderColor: "#201c27",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  ageBandButtonActive: {
    backgroundColor: "#21183a",
    borderColor: "#4b3b68",
  },
  ageBandText: {
    color: "#817889",
    fontSize: 11,
    fontWeight: "900",
  },
  ageBandTextActive: {
    color: "#f0abfc",
  },
  button: {
    alignItems: "center",
    backgroundColor: "#d8b46a",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 14,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonDisabled: {
    opacity: 0.72,
  },
  buttonText: {
    color: "#050509",
    fontSize: 13,
    fontWeight: "900",
  },
  message: {
    color: "#e28787",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
  },
  messageSuccess: {
    color: "#86efac",
  },
});
