// src/services/doctorAuth.ts
import { api } from "./api";

export async function saveDoctorProfile(payload: {
  full_name: string;
  doctor_number: string;
  clinic_name: string;
  clinic_address: string;
  avatar_url?: string;
  location?: { lat: number; lng: number };
  work_schedule?: { days: string[]; start: string; end: string };
  specialties?: number[];
  custom_specialties?: string[];
  preferred_pharmacies?: number[];
  extra_pharmacies?: string[];
}) {
  const { data } = await api.post("/doctor/profile", payload);
  return data as { doctor_id: number };
}

export async function uploadAvatar(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const { data } = await api.post("/upload/avatar", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data as { url: string };
}
