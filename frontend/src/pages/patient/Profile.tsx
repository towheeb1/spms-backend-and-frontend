import { useState, useEffect } from 'react';
import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"

export   function PatientProfile() {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    nationalId: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    emergencyContact: '',
    emergencyPhone: '',
    address: '',
    city: '',
    postalCode: ''
  });
  
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // محاكاة تحميل بيانات الملف الشخصي
    loadProfileData();
  }, []);

  async function loadProfileData() {
    try {
      setLoading(true);
      // هنا يتم جلب البيانات من API
      // const response = await api.get('/patient/profile');
      // setProfile(response.data);
      
      // بيانات تجريبية
      setProfile({
        firstName: 'توهيب  ',
        lastName: '  العلي',
        nationalId: '1234567890',
        phone: '778016636',
        email: 'mohammed.ali@email.com',
        dateOfBirth: '2003-11-21',
        gender: 'male',
        bloodType: 'A+',
        emergencyContact: '   توهيب الجعفري  ',
        emergencyPhone: '0509876543',
        address: '    مذبح جامعه العلوم  ',
        city: 'صنعاء',
        postalCode: ' '
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(field: string, value: string) {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  }

  async function handleSave() {
    try {
      setLoading(true);
      // هنا يتم حفظ البيانات في API
      // await api.put('/patient/profile', profile);
      
      setIsEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* العنوان والتحكم */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">الملف الشخصي</h1>
          <p className="text-gray-400 mt-1">إدارة وتحديث معلوماتك الشخصية</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <span>✏️</span>
              تعديل الملف
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? 'جاري الحفظ...' : '💾'}
                {loading ? 'جاري الحفظ' : 'حفظ التغييرات'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  loadProfileData(); // إعادة تحميل البيانات الأصلية
                }}
              >
                إلغاء
              </Button>
            </>
          )}
        </div>
      </div>

      {/* البطاقة الشخصية */}
      <div className="card rounded-2xl p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* صورة الملف الشخصي */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl text-white font-bold">
                {profile.firstName ? profile.firstName.charAt(0) : 'م'}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <span className="text-xs">📷</span>
                </label>
              )}
            </div>
            <div className="mt-3 text-center">
              <div className="font-semibold text-lg">{profile.firstName} {profile.lastName}</div>
              <div className="text-sm opacity-70">مريض</div>
            </div>
          </div>

          {/* المعلومات الأساسية */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm opacity-70 mb-1">رقم الهوية</div>
              <div className="font-medium">{profile.nationalId || '—'}</div>
            </div>
            <div>
              <div className="text-sm opacity-70 mb-1">تاريخ الميلاد</div>
              <div className="font-medium">
                {profile.dateOfBirth 
                  ? new Date(profile.dateOfBirth).toLocaleDateString('ar-SA') 
                  : '—'}
              </div>
            </div>
            <div>
              <div className="text-sm opacity-70 mb-1">الجنس</div>
              <div className="font-medium">
                {profile.gender === 'male' ? 'ذكر' : 
                 profile.gender === 'female' ? 'أنثى' : '—'}
              </div>
            </div>
            <div>
              <div className="text-sm opacity-70 mb-1">فصيلة الدم</div>
              <div className="font-medium">{profile.bloodType || '—'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* نموذج تعديل البيانات */}
      {isEditing && (
        <div className="card rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10">
          <h2 className="text-xl font-semibold mb-6">تعديل البيانات الشخصية</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* المعلومات الشخصية */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b border-white/20 pb-2">المعلومات الشخصية</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm opacity-80 mb-2">الاسم الأول *</label>
                  <Input
                    value={profile.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="الاسم الأول"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm opacity-80 mb-2">اسم العائلة *</label>
                  <Input
                    value={profile.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="اسم العائلة"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm opacity-80 mb-2">رقم الهوية *</label>
                <Input
                  value={profile.nationalId}
                  onChange={(e) => handleInputChange('nationalId', e.target.value)}
                  placeholder="رقم الهوية"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm opacity-80 mb-2">تاريخ الميلاد</label>
                  <Input
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm opacity-80 mb-2">الجنس</label>
                  <select
                    className="w-full px-3 py-2 rounded-2xl bg-white/10 border border-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                    value={profile.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  >
                    <option value="">اختر الجنس</option>
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm opacity-80 mb-2">فصيلة الدم</label>
                <select
                  className="w-full px-3 py-2 rounded-2xl bg-white/10 border border-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                  value={profile.bloodType}
                  onChange={(e) => handleInputChange('bloodType', e.target.value)}
                >
                  <option value="">اختر فصيلة الدم</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            {/* معلومات الاتصال */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b border-white/20 pb-2">معلومات الاتصال</h3>
              
              <div>
                <label className="block text-sm opacity-80 mb-2">البريد الإلكتروني</label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="البريد الإلكتروني"
                />
              </div>
              
              <div>
                <label className="block text-sm opacity-80 mb-2">رقم الهاتف *</label>
                <Input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="رقم الهاتف"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm opacity-80 mb-2">العنوان</label>
                <Input
                  value={profile.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="العنوان"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm opacity-80 mb-2">المدينة</label>
                  <Input
                    value={profile.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="المدينة"
                  />
                </div>
                <div>
                  <label className="block text-sm opacity-80 mb-2">الرمز البريدي</label>
                  <Input
                    value={profile.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="الرمز البريدي"
                  />
                </div>
              </div>
            </div>

            {/* جهة الاتصال الطارئ */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-medium border-b border-white/20 pb-2">جهة الاتصال في حالة الطوارئ</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm opacity-80 mb-2">اسم جهة الاتصال</label>
                  <Input
                    value={profile.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    placeholder="اسم جهة الاتصال"
                  />
                </div>
                <div>
                  <label className="block text-sm opacity-80 mb-2">رقم الهاتف</label>
                  <Input
                    type="tel"
                    value={profile.emergencyPhone}
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                    placeholder="رقم الهاتف"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* عرض البيانات (عند عدم التعديل) */}
      {!isEditing && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* معلومات الاتصال */}
          <div className="card rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10">
            <h2 className="text-xl font-semibold mb-6">معلومات الاتصال</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <span className="opacity-80">البريد الإلكتروني</span>
                <span className="font-medium">{profile.email || '—'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <span className="opacity-80">رقم الهاتف</span>
                <span className="font-medium">{profile.phone || '—'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <span className="opacity-80">العنوان</span>
                <span className="font-medium text-right">
                  {profile.address ? `${profile.address}, ${profile.city}` : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-80">الرمز البريدي</span>
                <span className="font-medium">{profile.postalCode || '—'}</span>
              </div>
            </div>
          </div>

          {/* معلومات الطوارئ */}
          <div className="card rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10">
            <h2 className="text-xl font-semibold mb-6">معلومات الطوارئ</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <span className="opacity-80">جهة الاتصال</span>
                <span className="font-medium">{profile.emergencyContact || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-80">رقم الهاتف</span>
                <span className="font-medium">{profile.emergencyPhone || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* الإحصائيات الشخصية */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card rounded-2xl p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">24</div>
              <div className="text-sm text-green-300">الزيارات</div>
            </div>
            <div className="text-3xl">🏥</div>
          </div>
        </div>
        
        <div className="card rounded-2xl p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-blue-300">الوصفات</div>
            </div>
            <div className="text-3xl">📋</div>
          </div>
        </div>
        
        <div className="card rounded-2xl p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">8</div>
              <div className="text-sm text-purple-300">الاختبارات</div>
            </div>
            <div className="text-3xl">🧪</div>
          </div>
        </div>
        
        <div className="card rounded-2xl p-4 bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm text-orange-300">المواعيد القادمة</div>
            </div>
            <div className="text-3xl">📅</div>
          </div>
        </div>
      </div>

      {/* رسالة النجاح */}
      {saved && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600/90 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fade-in">
          ✅ تم حفظ التغييرات بنجاح
        </div>
      )}
    </div>
  );
}