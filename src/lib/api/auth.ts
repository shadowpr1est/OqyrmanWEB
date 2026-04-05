import { apiFetch, tokenStorage } from "./client";
import type { TokenResponse } from "./types";

export const authApi = {
  register: (data: {
    email: string;
    phone: string;
    password: string;
    name: string;
    surname: string;
  }) =>
    apiFetch<{ message: string; user_id: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyEmail: (email: string, code: string) =>
    apiFetch<TokenResponse>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    }),

  resendCode: (email: string) =>
    apiFetch<{ message: string }>("/auth/resend-code", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  login: (email: string, password: string) =>
    apiFetch<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiFetch<void>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token: tokenStorage.getRefresh() }),
    }),

  forgotPassword: (email: string) =>
    apiFetch<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resendResetCode: (email: string) =>
    apiFetch<{ message: string }>("/auth/resend-reset-code", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email: string, code: string, new_password: string) =>
    apiFetch<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, code, new_password }),
    }),

  loginWithGoogle: (id_token: string) =>
    apiFetch<TokenResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ id_token }),
    }),
};
