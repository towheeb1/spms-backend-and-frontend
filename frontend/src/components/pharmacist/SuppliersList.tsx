import React from "react";
import { DataTable, Column } from "../../components/ui/DataTable";
import { Supplier } from "../../services/suppliers";

type Props = {
  suppliers: Supplier[];
  onEdit: (s: Supplier) => void;
  onDelete: (s: Supplier) => void;
};

export function SuppliersList({ suppliers, onEdit, onDelete }: Props) {
  const cols: Column<Supplier>[] = [
    { key: "name", title: "الاسم" },
    { key: "phone", title: "الهاتف" },
    { key: "email", title: "البريد" },
    { key: "address", title: "العنوان" },
    {
      key: "actions",
      title: "الإجراءات",
      render: (s) => (
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-sm" onClick={() => onEdit(s)}>تعديل</button>
          <button className="px-3 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-sm" onClick={() => onDelete(s)}>حذف</button>
        </div>
      ),
    },
  ];

  return <DataTable columns={cols} rows={suppliers} />;
}
