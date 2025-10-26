import React, { useMemo, useState } from "react";
import { Card } from "../../ui/Card";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { Button } from "../../ui/Button";

export interface NewEmployeePayload {
  fullName: string;
  phone: string;
  email: string;
  role: string;
  branch: string;
  shift: string;
  notes: string;
  privileges: string[];
}

interface Props {
  onSubmit?: (payload: NewEmployeePayload) => void;
}

const ROLES = [
  { value: "pharmacist", label: "صيدلي" },
  { value: "supervisor", label: "مشرف" },
  { value: "inventory", label: "أمين مخزن" },
  { value: "cashier", label: "أمين صندوق" },
];

const BRANCHES = [
  { value: "main", label: "الفرع الرئيسي" },
  { value: "north", label: "فرع الشمال" },
  { value: "west", label: "فرع الغرب" },
];

const SHIFTS = [
  { value: "morning", label: "صباحي 8:00 - 4:00" },
  { value: "evening", label: "مسائي 4:00 - 12:00" },
  { value: "night", label: "ليلي 12:00 - 8:00" },
];

const PRIVILEGES = [
  "المبيعات",
  "إدارة المخزون",
  "المشتريات",
  "التقارير",
  "إدارة المستخدمين",
];

export function NewEmployeeForm({ onSubmit }: Props) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    role: ROLES[0].value,
    branch: BRANCHES[0].value,
    shift: SHIFTS[0].value,
    notes: "",
  });
  const [selectedPrivileges, setSelectedPrivileges] = useState<string[]>([
    "المبيعات",
    "إدارة المخزون",
  ]);

  const isValid = useMemo(() => {
    return Boolean(
      form.fullName.trim() &&
        form.phone.trim() &&
        form.email.trim() &&
        selectedPrivileges.length
    );
  }, [form, selectedPrivileges]);

  const togglePrivilege = (name: string) => {
    setSelectedPrivileges((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid) return;

    const payload: NewEmployeePayload = {
      ...form,
      privileges: selectedPrivileges,
    };
    onSubmit?.(payload);
  };

  return (
    <Card className="space-y-6 bg-white/5 border border-white/10 backdrop-blur">
      <div>
        <h3 className="text-lg font-semibold text-white/90">
          إضافة موظف جديد
        </h3>
        <p className="text-sm text-white/60">
          قم بتعبئة بيانات الموظف الجديد وتحديد صلاحياته قبل إرسال الدعوة.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-2 text-sm text-white/80">
            <span>الاسم الكامل</span>
            <Input
              placeholder="اكتب اسم الموظف"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </label>
          <label className="space-y-2 text-sm text-white/80">
            <span>رقم الجوال</span>
            <Input
              placeholder="05XXXXXXXX"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </label>
          <label className="space-y-2 text-sm text-white/80">
            <span>البريد الإلكتروني</span>
            <Input
              placeholder="employee@smartpharmacy.sa"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>
          <label className="space-y-2 text-sm text-white/80">
            <span>الدور الوظيفي</span>
            <Select
              value={form.role}
              onChange={(value) => setForm({ ...form, role: String(value) })}
              options={ROLES}
            />
          </label>
          <label className="space-y-2 text-sm text-white/80">
            <span>الفرع</span>
            <Select
              value={form.branch}
              onChange={(value) =>
                setForm({ ...form, branch: String(value) })
              }
              options={BRANCHES}
            />
          </label>
          <label className="space-y-2 text-sm text-white/80">
            <span>الشفت</span>
            <Select
              value={form.shift}
              onChange={(value) => setForm({ ...form, shift: String(value) })}
              options={SHIFTS}
            />
          </label>
        </div>

        <label className="space-y-2 text-sm text-white/80">
          <span>ملاحظات داخلية</span>
          <Input
            placeholder="أي معلومات إضافية أو تعليمات خاصة بالموظف"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </label>

        <div className="space-y-2">
          <span className="text-sm font-medium text-white/80">
            الصلاحيات
          </span>
          <div className="flex flex-wrap gap-2">
            {PRIVILEGES.map((privilege) => {
              const active = selectedPrivileges.includes(privilege);
              return (
                <button
                  key={privilege}
                  type="button"
                  onClick={() => togglePrivilege(privilege)}
                  className={`px-4 py-2 rounded-full text-sm transition ${
                    active
                      ? "bg-blue-600/80 text-white shadow-lg shadow-blue-500/30"
                      : "bg-white/10 text-white/70 border border-white/20 hover:bg-white/15"
                  }`}
                >
                  {privilege}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            variant="success"
            disabled={!isValid}
            className="flex-1"
          >
            إنشاء الملف الوظيفي
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setForm({
                fullName: "",
                phone: "",
                email: "",
                role: ROLES[0].value,
                branch: BRANCHES[0].value,
                shift: SHIFTS[0].value,
                notes: "",
              });
              setSelectedPrivileges(["المبيعات", "إدارة المخزون"]);
            }}
          >
            إعادة تعيين
          </Button>
        </div>
      </form>
    </Card>
  );
}
