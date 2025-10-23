// src/services/doctorApi.ts
import { api } from "./api";

// ========= Types =========
export type Patient = {
  id: number;
  full_name: string;
  phone?: string;
  age?: number;
  gender?: "m" | "f";
};

export type Condition = { id: number; name: string };

export type PatientConditionRow = {
  id: number;
  condition_id: number;
  name: string;
  diagnosed_date: string | null;
  notes?: string | null;
};

export type PatientConditionPayload = {
  condition_id: number;
  diagnosed_date?: string;
  notes?: string;
};

export type PrescriptionItem = {
  drug_id?: number;
  name?: string;
  dosage: string;
  frequency: string;
  duration_days: number;
  notes?: string;
};

export type PrescriptionPayload = {
  patient_id: number;
  doctor_id?: number;
  items: PrescriptionItem[];
  notes?: string;
};

export type Report = {
  id: number;
  title: string;
  description?: string;
  date: string;
  file_url?: string;
};

export type Note = {
  id: number;
  title?: string;
  content: string;
  date?: string;
  doctor?: string;
};

// ========= Refs / Lookups =========
export const listSpecialties = async () => {
  const { data } = await api.get("/ref/specialties");
  return (data?.list || []) as { id: number; name: string }[];
};

export const listNearbyPharmacies = async (lat: number, lng: number) => {
  const { data } = await api.get("/pharmacies/nearby", { params: { lat, lng, limit: 20 } });
  return (data?.list || []) as { id: number; name: string; distance_km: number }[];
};

export const listConditions = async () => {
  const { data } = await api.get("/conditions");
  return (data?.list || []) as Condition[];
};

// ========= Auth / Uploads / Profiles =========
export const uploadAvatar = async (file: File) => {
  const fd = new FormData();
  fd.append("file", file);
  const { data } = await api.post("/upload/avatar", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data as { url: string };
};

export const saveDoctorProfile = async (payload: any) => {
  const { data } = await api.post("/doctor/profile", payload);
  return data as { doctor_id: number };
};

// ========= Patients =========
export const searchPatients = async (q: string, limit = 20) => {
  const { data } = await api.get("/patients/search", { params: { q, limit } });
  return (data?.list || []) as Patient[];
};

// ========= Expected Patients (المتوقعون اليوم) =========
export const getExpectedPatients = async () => {
  const { data } = await api.get("/patients/expected");
  return (data?.list || []) as Patient[];
};

// ========= Patient Reports (تقارير المريض) =========
export const getPatientReports = async (patientId: number) => {
  const { data } = await api.get(`/patients/${patientId}/reports`);
  return (data?.list || []) as Report[];
};

// ========= Patient Notes (ملاحظات المريض) =========
export const getPatientNotes = async (patientId: number) => {
  const { data } = await api.get(`/patients/${patientId}/notes`);
  return (data?.list || []) as Note[];
};

// ========= Patient Conditions =========
export const getPatientConditions = async (patientId: number) => {
  const { data } = await api.get(`/patients/${patientId}/conditions`);

  const list = (data?.list || []) as any[];
  return list.map((r) => ({
    id: r.id,
    condition_id: r.condition_id,
    name: r.name ?? r.conditionName,
    diagnosed_date: r.diagnosed_date ?? r.diagnosed_at ?? null,
    notes: r.notes ?? null,
  })) as PatientConditionRow[];
};

export const addPatientCondition = async (patientId: number, payload: PatientConditionPayload) => {
  const { data } = await api.post(`/patients/${patientId}/conditions`, payload);
  return data as { id: number } | PatientConditionRow;
};

export const updatePatientCondition = async (
  patientId: number,
  conditionId: number,
  payload: Partial<PatientConditionPayload>
) => {
  const { data } = await api.put(`/patients/${patientId}/conditions/${conditionId}`, payload);
  return data as { ok: true } | PatientConditionRow;
};

export const deletePatientCondition = async (patientId: number, conditionId: number) => {
  const { data } = await api.delete(`/patients/${patientId}/conditions/${conditionId}`);
  return data as { ok: true };
};

// ========= Prescriptions =========
export const createPrescription = async (payload: PrescriptionPayload) => {
  const { data } = await api.post("/prescriptions", payload);
  return data as { prescription_id: number };
};