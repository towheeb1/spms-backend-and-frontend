import React from "react";
import { NewEmployeeForm } from "../../../components/pharmacist/users/NewEmployeeForm";
import { QuickInvitePanel } from "../../../components/pharmacist/users/QuickInvitePanel";

export function Users() {
  return (
    <div className="space-y-6">
      <header className="card rounded-2xl p-6 bg-gradient-to-r from-slate-900 to-slate-800 border border-white/10">
        <h1 className="text-2xl font-bold text-white mb-2">
          إدارة المستخدمين والطاقم
        </h1>
        <p className="text-white/70">
          أضف موظفين جدد، خصص صلاحياتهم، وارسل دعوات الانضمام حسب نموذج العمل.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NewEmployeeForm
            onSubmit={(payload) => {
              console.log("Employee draft payload:", payload);
            }}
          />
        </div>
        <div className="lg:col-span-1">
          <QuickInvitePanel />
        </div>
      </div>
    </div>
  );
}
