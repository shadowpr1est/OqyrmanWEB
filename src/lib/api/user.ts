import { apiFetch, apiUpload } from "./client";
import type { AuthUser, UserStats } from "./types";

export const userApi = {
  getMe: () => apiFetch<AuthUser>("/users/me"),

  updateMe: (data: Partial<Pick<AuthUser, "name" | "surname" | "phone">>) =>
    apiFetch<AuthUser>("/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteMe: () => apiFetch<void>("/users/me", { method: "DELETE" }),

  uploadAvatar: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiUpload<AuthUser>("/users/me/avatar", fd);
  },

  getQr: () => apiFetch<{ qr_url: string }>("/users/me/qr"),

  changePassword: (old_password: string, new_password: string) =>
    apiFetch<{ message: string }>("/users/me/change-password", {
      method: "POST",
      body: JSON.stringify({ old_password, new_password }),
    }),

  getSessions: () =>
    apiFetch<Array<{ id: string; ip: string; user_agent: string; created_at: string }>>(
      "/users/me/sessions",
    ),

  deleteSession: (id: string) =>
    apiFetch<void>(`/users/me/sessions/${id}`, { method: "DELETE" }),

  deleteAllSessions: () =>
    apiFetch<void>("/users/me/sessions", { method: "DELETE" }),

  getStats: () => apiFetch<UserStats>("/users/me/stats"),
};
