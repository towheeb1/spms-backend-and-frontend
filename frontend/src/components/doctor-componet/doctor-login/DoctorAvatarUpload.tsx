// =============================================================
// File: src/components/doctor-login/DoctorAvatarUpload.tsx
// =============================================================
import { useEffect, useState } from "react";

export default function DoctorAvatarUpload({ file, onChange }: { file?: File; onChange: (f?: File) => void }) {
  const [preview, setPreview] = useState<string | undefined>();
  useEffect(() => {
    if (!file) return setPreview(undefined);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <section className="card rounded-2xl p-4 bg-white/5">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
          {preview ? <img src={preview} alt="avatar" className="h-full w-full object-cover" /> : <span className="opacity-70">صورة</span>}
        </div>
        <label className="px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/15 cursor-pointer">
          اختر صورة أو التقط صورة
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onChange(e.target.files?.[0])} />
        </label>
      </div>
    </section>
  );
}
