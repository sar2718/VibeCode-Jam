import { STORAGE_KEYS } from "@/config/app.config";
import { buildMockDatabase } from "@/mock/seed";
import type { AuthSession } from "@/types/auth";

type CollectionKey = Exclude<keyof typeof STORAGE_KEYS, "authSession">;

const MOCK_SCHEMA_VERSION = "2026-04-14-algo-range-start-ui";
const MOCK_SCHEMA_VERSION_KEY = "ai-interview.mock-schema-version";

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function writeDatabase(force = false) {
  if (!canUseStorage()) {
    return;
  }

  const database = buildMockDatabase();

  (Object.entries(STORAGE_KEYS) as Array<[keyof typeof STORAGE_KEYS, string]>).forEach(
    ([key, storageKey]) => {
      if (key === "authSession") {
        if (force) {
          window.localStorage.removeItem(storageKey);
        }
        return;
      }

      const collectionKey = key as CollectionKey;
      window.localStorage.setItem(storageKey, JSON.stringify(database[collectionKey]));
    }
  );

  window.localStorage.setItem(MOCK_SCHEMA_VERSION_KEY, MOCK_SCHEMA_VERSION);
}

export function seedMockStorage(force = false) {
  if (!canUseStorage()) {
    return;
  }

  const needsUpgrade = window.localStorage.getItem(MOCK_SCHEMA_VERSION_KEY) !== MOCK_SCHEMA_VERSION;

  if (force || needsUpgrade) {
    writeDatabase(true);
    return;
  }

  const database = buildMockDatabase();

  (Object.entries(STORAGE_KEYS) as Array<[keyof typeof STORAGE_KEYS, string]>).forEach(
    ([key, storageKey]) => {
      if (key === "authSession") {
        return;
      }

      if (!window.localStorage.getItem(storageKey)) {
        const collectionKey = key as CollectionKey;
        window.localStorage.setItem(storageKey, JSON.stringify(database[collectionKey]));
      }
    }
  );
}

export function readCollection<T>(key: CollectionKey): T {
  if (!canUseStorage()) {
    throw new Error("Local storage is not available.");
  }

  seedMockStorage();

  const raw = window.localStorage.getItem(STORAGE_KEYS[key]);

  if (!raw) {
    seedMockStorage(true);
    return readCollection<T>(key);
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    seedMockStorage(true);
    return readCollection<T>(key);
  }
}

export function writeCollection<T>(key: CollectionKey, payload: T) {
  if (!canUseStorage()) {
    throw new Error("Local storage is not available.");
  }

  window.localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(payload));
}

export function readAuthSession() {
  if (!canUseStorage()) {
    return null;
  }

  seedMockStorage();

  const raw = window.localStorage.getItem(STORAGE_KEYS.authSession);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    window.localStorage.removeItem(STORAGE_KEYS.authSession);
    return null;
  }
}

export function writeAuthSession(session: AuthSession | null) {
  if (!canUseStorage()) {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(STORAGE_KEYS.authSession);
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.authSession, JSON.stringify(session));
}
