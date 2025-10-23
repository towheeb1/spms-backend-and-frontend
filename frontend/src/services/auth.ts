import { api } from "./api";

export type LoginResponse = {
  user: { id: number; role: string; name?: string };
  next?: string;
};

export async function pharmacistLoginPassword(params: {
  emailOrUsername: string;
  password: string;
  rememberMe?: boolean;
  captchaToken?: string;
}) {
  const { data } = await api.post<LoginResponse>("/auth/pharmacist/login-password", params, {
    withCredentials: true,
  });
  return data;
}
