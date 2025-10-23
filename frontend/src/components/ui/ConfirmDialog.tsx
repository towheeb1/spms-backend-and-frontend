import React from "react";

type Props = {
  open: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
};

export function ConfirmDialog({ open, title = "تأكيد", message = "هل أنت متأكد؟", onConfirm, onCancel, confirmText = "تأكيد", cancelText = "إلغاء" }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="card rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="opacity-80 mb-4">{message}</p>
        <div className="flex gap-2 justify-end">
          <button className="px-4 py-2 rounded-xl bg-gray-600/80 hover:bg-gray-600 transition-colors" onClick={onCancel}>{cancelText}</button>
          <button className="px-4 py-2 rounded-xl bg-red-600/90 hover:bg-red-600 transition-colors" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
