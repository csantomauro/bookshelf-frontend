import { useSyncExternalStore } from "react";

const JWT_KEY = "jwt";
const ROLE_KEY = "role";
const USERNAME_KEY = "username";

// storeAuthToken/clearAuth are the only two functions that mutate auth
// state; components that need to react to login/logout (e.g. the AppBar,
// which lives outside any route) subscribe here via useIsAuthenticated/
// useIsAdmin instead of reading sessionStorage once at render time.
const listeners = new Set<() => void>();

function notifyAuthChanged(): void {
  listeners.forEach((listener) => listener());
}

function subscribeToAuthChanges(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

type JwtPayload = {
  role?: string;
  sub?: string;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const normalized = token.startsWith("Bearer ") ? token.slice(7) : token;
    const payload = normalized.split(".")[1];
    if (!payload) {
      return null;
    }
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function storeAuthToken(token: string): void {
  sessionStorage.setItem(JWT_KEY, token);
  const payload = decodeJwtPayload(token);

  if (payload?.role) {
    sessionStorage.setItem(ROLE_KEY, payload.role);
  } else {
    sessionStorage.removeItem(ROLE_KEY);
  }

  if (payload?.sub) {
    sessionStorage.setItem(USERNAME_KEY, payload.sub);
  } else {
    sessionStorage.removeItem(USERNAME_KEY);
  }

  notifyAuthChanged();
}

export function clearAuth(): void {
  sessionStorage.removeItem(JWT_KEY);
  sessionStorage.removeItem(ROLE_KEY);
  sessionStorage.removeItem(USERNAME_KEY);
  notifyAuthChanged();
}

export function isAuthenticated(): boolean {
  return !!sessionStorage.getItem(JWT_KEY);
}

export function isAdmin(): boolean {
  return sessionStorage.getItem(ROLE_KEY) === "ADMIN";
}

export function useIsAuthenticated(): boolean {
  return useSyncExternalStore(subscribeToAuthChanges, isAuthenticated);
}

export function useIsAdmin(): boolean {
  return useSyncExternalStore(subscribeToAuthChanges, isAdmin);
}

export function getUsername(): string | null {
  return sessionStorage.getItem(USERNAME_KEY);
}

export function isForbiddenError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { status?: number } }).response?.status === "number" &&
    (error as { response: { status: number } }).response.status === 403
  );
}

export const PERMISSION_DENIED_MESSAGE =
  "You don't have permission for this action. Admin access is required.";

// Matches the shape returned by the backend's ValidationExceptionHandler:
// { error: "Validation failed", fields: { fieldName: "message", ... } }
export function getValidationErrorMessage(error: unknown): string | null {
  if (
    typeof error !== "object" ||
    error === null ||
    !("response" in error)
  ) {
    return null;
  }

  const response = (error as { response?: { status?: number; data?: { fields?: Record<string, string> } } }).response;
  if (response?.status !== 400 || !response.data?.fields) {
    return null;
  }

  const fields = response.data.fields;
  const messages = Object.entries(fields).map(([field, message]) => `${field}: ${message}`);
  return messages.length > 0 ? messages.join(", ") : null;
}
