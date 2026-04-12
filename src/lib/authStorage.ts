/**
 * Lưu thông tin user sau đăng nhập/đăng ký (đọc ở checkout, header, AuthGuard).
 * Key chính: `user` (các key cũ vẫn được đọc để tương thích).
 */
export const AUTH_USER_KEY = "user";

const LEGACY_KEYS = ["authUser", "auth_user", "next14-shop-user"];

export type AuthUser = {
  id: string;
  email?: string;
  name?: string | null;
};

export function saveAuthUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_USER_KEY);
  for (const k of LEGACY_KEYS) {
    localStorage.removeItem(k);
  }
}

export function readAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const tryParse = (raw: string | null): AuthUser | null => {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as Partial<AuthUser>;
      if (parsed && typeof parsed.id === "string" && parsed.id.trim()) {
        return {
          id: parsed.id.trim(),
          email: parsed.email,
          name: parsed.name ?? null,
        };
      }
    } catch {
      return null;
    }
    return null;
  };

  const primary = tryParse(localStorage.getItem(AUTH_USER_KEY));
  if (primary) return primary;

  for (const key of LEGACY_KEYS) {
    const u = tryParse(localStorage.getItem(key));
    if (u) return u;
  }
  return null;
}
