import { AUTH } from "./endpoints";
import type {
  ApiResponse,
  SigninData,
  SigninPayload,
  SignupData,
  SignupPayload,
  MeData,
} from "./types";

// credentials: "include" is required on all calls so the browser sends/receives
// the httpOnly refresh-token cookie the backend sets on signin.

export async function apiSignin(
  payload: SigninPayload
): Promise<ApiResponse<SigninData>> {
  const res = await fetch(AUTH.SIGNIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function apiSignup(
  payload: SignupPayload
): Promise<ApiResponse<SignupData>> {
  const res = await fetch(AUTH.SIGNUP, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function apiSignout(): Promise<ApiResponse<null>> {
  const res = await fetch(AUTH.SIGNOUT, {
    method: "POST",
    credentials: "include",
  });
  return res.json();
}

export async function apiForgotPassword(
  email: string
): Promise<ApiResponse<null>> {
  const res = await fetch(AUTH.FORGOT_PASSWORD, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function apiResetPassword(
  token: string,
  password: string,
  confirmPassword: string
): Promise<ApiResponse<null>> {
  const res = await fetch(`${AUTH.RESET_PASSWORD}?token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, confirmPassword }),
  });
  return res.json();
}

export async function apiRefreshToken(): Promise<ApiResponse<SigninData>> {
  const res = await fetch(AUTH.REFRESH_TOKEN, {
    method: "POST",
    credentials: "include",
  });
  return res.json();
}

export async function apiGetMe(
  accessToken: string
): Promise<ApiResponse<MeData>> {
  const res = await fetch(AUTH.ME, {
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: "include",
  });
  return res.json();
}
