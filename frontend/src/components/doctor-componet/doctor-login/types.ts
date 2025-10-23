// src/components/doctor-login/types.ts
export type WorkDay = "sat" | "sun" | "mon" | "tue" | "wed" | "thu" | "fri";
export type TimeHHmm = string; // "08:00"

export type DoctorProfilePayload = {
  full_name: string;
  doctor_number: string; // 9 أرقام ويبدأ بـ 73/77/78/71/70
  avatar_url?: string;
  clinic_name: string;
  clinic_address: string;
  location?: { lat: number; lng: number };
  work_schedule: { days: WorkDay[]; start: TimeHHmm; end: TimeHHmm };
  specialties?: number[];         // ممكن تكون undefined
  custom_specialties?: string[];
  preferred_pharmacies?: number[];
  extra_pharmacies?: string[];
};

export const DEFAULT_PROFILE: DoctorProfilePayload = {
  full_name: "",
  doctor_number: "",
  clinic_name: "",
  clinic_address: "",
  work_schedule: { days: ["sat","sun","mon","tue","wed","thu"], start: "08:00", end: "16:00" },
  specialties: [],
  custom_specialties: [],
  preferred_pharmacies: [],
  extra_pharmacies: [],
};

// ✅ أعدنا تصدير DAY_LABEL ليستوردها WorkSchedulePicker
export const DAY_LABEL: Record<WorkDay, string> = {
  sat: "السبت",
  sun: "الأحد",
  mon: "الإثنين",
  tue: "الثلاثاء",
  wed: "الأربعاء",
  thu: "الخميس",
  fri: "الجمعة",
};
