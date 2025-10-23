import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Loader, ButtonLoader } from "../../components/ui/Loader";
import { useToast } from "../../components/ui/Toast";

interface Profile {
  id: number;
  full_name: string;
  email?: string | null;
  username?: string | null;
  phone?: string | null;
  title?: string | null;
  license_no?: string | null;
  license_expiry?: string | null;
  accreditation_body?: string | null;
  timezone?: string | null;
  locale?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pharmacy_id: number;
  pharmacy_name?: string | null;
  display_name?: string | null;
  branches_count?: number | null;
}

export default function PharmacistProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [branches, setBranches] = useState<Array<{ name?: string; address?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  async function load() {
    try {
      setLoading(true);
      const { data } = await api.get("/pharmacist/profile");
  setProfile(data.profile);
  setBranches(data.profile?.branches || []);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) {
        toast.error("الجلسة منتهية، يرجى تسجيل الدخول مجدداً");
        navigate("/login/pharmacist", { replace: true });
        return;
      }
      toast.error(e?.response?.data?.error || "تعذر تحميل الملف");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (!profile) return;
    try {
      setSaving(true);
      await api.put("/pharmacist/profile", {
        full_name: profile.full_name,
        phone: profile.phone,
        title: profile.title,
        license_no: profile.license_no,
        license_expiry: profile.license_expiry,
        accreditation_body: profile.accreditation_body,
        address_line1: profile.address_line1,
        address_line2: profile.address_line2,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        timezone: profile.timezone,
        locale: profile.locale,
        pharmacy_display_name: profile.display_name,
        branches_count: profile.branches_count,
        branches: branches.length ? branches : undefined,
      });
      toast.success("تم حفظ التغييرات بنجاح");
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "تعذر حفظ التغييرات");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader fullScreen text="جاري تحميل الملف الشخصي..." />;
  if (!profile) return null;

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3">
        <img src="/logo.png" className="w-10 h-10" />
        <div>
          <h1 className="text-2xl font-bold">الملف الشخصي</h1>
          <p className="text-gray-400">تحديث بياناتك وبيانات المنشأة</p>
        </div>
      </div>

      <div className="card rounded-2xl p-6 grid gap-4">
        <h2 className="font-semibold">المعلومات الأساسية</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs opacity-80 block mb-1">الاسم الكامل</label>
            <Input value={profile.full_name || ""} onChange={(e)=>setProfile({...profile, full_name: e.target.value})} />
          </div>
          <div>
            <label className="text-xs opacity-80 block mb-1">الهاتف</label>
            <Input value={profile.phone || ""} onChange={(e)=>setProfile({...profile, phone: e.target.value})} />
          </div>
          <div>
            <label className="text-xs opacity-80 block mb-1">المسمى الوظيفي</label>
            <Input value={profile.title || ""} onChange={(e)=>setProfile({...profile, title: e.target.value})} />
          </div>
          <div>
            <label className="text-xs opacity-80 block mb-1">اللغة</label>
            <Input value={profile.locale || ""} onChange={(e)=>setProfile({...profile, locale: e.target.value})} />
          </div>
        </div>
      </div>

          {Number(profile.branches_count || 0) > 1 && (
            <div className="card rounded-2xl p-6 grid gap-4">
              <h2 className="font-semibold">تفاصيل الفروع</h2>
              <div className="grid gap-3">
                <div className="text-sm opacity-70">أدخل اسم وعنوان الفروع المسجلة. هذه البيانات ستستخدم لاحقاً كخيارات للاستلام في أوامر الشراء.</div>
                {Array.from({ length: Number(profile.branches_count || 0) }).map((_, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Input placeholder={`اسم الفرع ${i + 1}`} value={branches[i]?.name || ""} onChange={(e)=>setBranches(prev => { const copy = [...prev]; copy[i] = { ...(copy[i]||{}), name: e.target.value }; return copy; })} />
                    <Input placeholder={`عنوان الفرع ${i + 1}`} value={branches[i]?.address || ""} onChange={(e)=>setBranches(prev => { const copy = [...prev]; copy[i] = { ...(copy[i]||{}), address: e.target.value }; return copy; })} />
                  </div>
                ))}
              </div>
            </div>
          )}

      <div className="card rounded-2xl p-6 grid gap-4">
        <h2 className="font-semibold">الترخيص المهني</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs opacity-80 block mb-1">رقم الترخيص</label>
            <Input value={profile.license_no || ""} onChange={(e)=>setProfile({...profile, license_no: e.target.value})} />
          </div>
          <div>
            <label className="text-xs opacity-80 block mb-1">تاريخ الانتهاء</label>
            <Input type="date" value={profile.license_expiry || ""} onChange={(e)=>setProfile({...profile, license_expiry: e.target.value})} />
          </div>
          <div>
            <label className="text-xs opacity-80 block mb-1">جهة الاعتماد</label>
            <Input value={profile.accreditation_body || ""} onChange={(e)=>setProfile({...profile, accreditation_body: e.target.value})} />
          </div>
        </div>
      </div>

      <div className="card rounded-2xl p-6 grid gap-4">
        <h2 className="font-semibold">المنشأة</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs opacity-80 block mb-1">اسم المنشأة</label>
            <Input value={profile.display_name || ""} onChange={(e)=>setProfile({...profile, display_name: e.target.value})} />
          </div>
          <div>
            <label className="text-xs opacity-80 block mb-1">عدد الفروع</label>
            <Input type="number" min={1} value={profile.branches_count ?? 1} onChange={(e)=>setProfile({...profile, branches_count: Number(e.target.value)})} />
          </div>
        </div>
      </div>

      <div className="card rounded-2xl p-6 grid gap-4">
        <h2 className="font-semibold">العنوان والتفضيلات</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs opacity-80 block mb-1">العنوان 1</label>
            <Input value={profile.address_line1 || ""} onChange={(e)=>setProfile({...profile, address_line1: e.target.value})} />
          </div>
          <div>
            <label className="text-xs opacity-80 block mb-1">العنوان 2</label>
            <Input value={profile.address_line2 || ""} onChange={(e)=>setProfile({...profile, address_line2: e.target.value})} />
          </div>
          <div>
            <label className="text-xs opacity-80 block mb-1">المدينة</label>
            <Input value={profile.city || ""} onChange={(e)=>setProfile({...profile, city: e.target.value})} />
          </div>
          <div>
            <label className="text-xs opacity-80 block mb-1">المنطقة</label>
            <Input value={profile.state || ""} onChange={(e)=>setProfile({...profile, state: e.target.value})} />
          </div>
          <div>
            <label className="text-xs opacity-80 block mb-1">الدولة</label>
            <Input value={profile.country || ""} onChange={(e)=>setProfile({...profile, country: e.target.value})} />
          </div>
          <div>
            <label className="text-xs opacity-80 block mb-1">المنطقة الزمنية</label>
            <Input value={profile.timezone || ""} onChange={(e)=>setProfile({...profile, timezone: e.target.value})} />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="flex items-center gap-2">
          {saving ? <><ButtonLoader /> جاري الحفظ...</> : "حفظ التغييرات"}
        </Button>
      </div>
    </div>
  );
}
