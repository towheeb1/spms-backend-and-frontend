import React, { useState } from "react";
import { Card } from "../../ui/Card";
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";

interface Invitee {
  id: number;
  fullName: string;
  phone: string;
  role: string;
  status: "draft" | "sent";
}

const ROLE_TAGS = [
  { value: "cashier", label: "أمين صندوق" },
  { value: "inventory", label: "أمين مخزن" },
  { value: "assistant", label: "مساعد صيدلي" },
];

export function QuickInvitePanel() {
  const [invitees, setInvitees] = useState<Invitee[]>([
    {
      id: 1,
      fullName: "—",
      phone: "",
      role: ROLE_TAGS[0].value,
      status: "draft",
    },
    {
      id: 2,
      fullName: "—",
      phone: "",
      role: ROLE_TAGS[1].value,
      status: "draft",
    },
  ]);

  const updateInvitee = (
    id: number,
    field: keyof Invitee,
    value: string | Invitee["status"]
  ) => {
    setInvitees((prev) =>
      prev.map((invite) =>
        invite.id === id ? { ...invite, [field]: value } : invite
      )
    );
  };

  const sendInvite = (id: number) => {
    setInvitees((prev) =>
      prev.map((invite) =>
        invite.id === id ? { ...invite, status: "sent" } : invite
      )
    );
  };

  const addRow = () => {
    setInvitees((prev) => [
      ...prev,
      {
        id: Date.now(),
        fullName: "",
        phone: "",
        role: ROLE_TAGS[0].value,
        status: "draft",
      },
    ]);
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white/90">
            دعوات سريعة
          </h3>
          <p className="text-sm text-white/60">
            نموذج مختصر لإرسال رابط انضمام لموظفين موسميين أو متدربين.
          </p>
        </div>
        <Button variant="ghost" onClick={addRow}>
          إضافة صف
        </Button>
      </div>

      <div className="space-y-3">
        {invitees.map((invite) => (
          <div
            key={invite.id}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                label="الاسم"
                placeholder="اسم الموظف"
                value={invite.fullName}
                onChange={(e) =>
                  updateInvitee(invite.id, "fullName", e.target.value)
                }
              />
              <Input
                label="الجوال"
                placeholder="05XXXXXXXX"
                value={invite.phone}
                onChange={(e) =>
                  updateInvitee(invite.id, "phone", e.target.value)
                }
              />
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-white/70">
                  المهمة
                </span>
                <div className="flex flex-wrap gap-2">
                  {ROLE_TAGS.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() =>
                        updateInvitee(invite.id, "role", role.value)
                      }
                      className={`px-3 py-1.5 rounded-full text-sm transition ${
                        invite.role === role.value
                          ? "bg-emerald-500/80 text-white shadow-lg shadow-emerald-500/30"
                          : "bg-white/10 text-white/70 border border-white/20 hover:bg-white/15"
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              <div className="text-sm text-white/60">
                حالة الدعوة:
                <span
                  className={`ml-2 font-semibold ${
                    invite.status === "sent"
                      ? "text-emerald-400"
                      : "text-amber-300"
                  }`}
                >
                  {invite.status === "sent" ? "تم الإرسال" : "مسودة"}
                </span>
              </div>
              <Button
                variant={invite.status === "sent" ? "outline" : "primary"}
                onClick={() => sendInvite(invite.id)}
              >
                {invite.status === "sent" ? "إعادة الإرسال" : "إرسال الدعوة"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
