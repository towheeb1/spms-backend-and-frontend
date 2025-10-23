// src/services/doctorDashboard.ts
import { api } from "./api";

export type KPI = { label: string; value: number; hint?: string };
export type PatientRow = { id: number; full_name: string; avatar_url?: string; gender?: string; date_of_birth?: string };
export type VisitRow = { visit_id: number; full_name: string; visit_reason?: string; visit_date: string };
export type RxRow = { prescription_id: number; full_name: string; created_at: string };
export type PieItem = { name: string; value: number };
export type TrendItem = { label: string; value: number };

// ✅ جعل الحقول المختلف عليها "اختيارية" حتى لا يشتكي الـ TS إن الباك إند ما أرسلها
export type DashboardPayload = {
  kpis: KPI[];
  recentPatients: PatientRow[];
  recentRx: RxRow[];
  last6: TrendItem[];
  diseasePie?: PieItem[];
  upcoming?: VisitRow[];
};

export async function fetchDoctorDashboard() {
  const { data } = await api.get<DashboardPayload>("/doctor/dashboard");
  return data;
}
