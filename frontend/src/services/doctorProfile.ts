// src/services/doctorProfile.ts
import { api } from "./api";

export type DoctorProfile = {
  id: number;
  full_name: string;
  doctor_number: string;
  avatar_url?: string;
  clinic_name: string;
  clinic_address: string;
};

export async function getDoctorProfile(doctor_number?: string) {
  const dn = doctor_number || localStorage.getItem("doctor_number") || "";
  const { data } = await api.get<{ profile: DoctorProfile }>("/doctor/profile", {
    params: { doctor_number: dn },
  });
  return data.profile;
}
