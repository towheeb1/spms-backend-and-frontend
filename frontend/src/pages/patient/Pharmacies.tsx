import { useState, useEffect } from "react";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

type Pharmacy = {
  id: number;
  name: string;
  distance: number;
  address: string;
  phone: string;
  rating: number;
  isOpen: boolean;
  services: string[];
  latitude: number;
  longitude: number;
  delivery: boolean;
  deliveryTime: string;
};

export   function PatientPharmacies() {
  const [location, setLocation] = useState<{lat: number; lng: number} | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>("غير محدد");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<"distance" | "rating" | "name">("distance");
  const [filterBy, setFilterBy] = useState<"all" | "open" | "delivery">("all");
  const [mapView, setMapView] = useState<boolean>(false);

  // بيانات تجريبية للصيدليات
  const mockPharmacies: Pharmacy[] = [
    {
      id: 1,
      name: "صيدلية الهناء",
      distance: 1.2,
      address: "شارع الملك فهد، حي النخيل",
      phone: "0111234567",
      rating: 4.5,
      isOpen: true,
      services: ["توصيل", "24 ساعة", "تحليلات"],
      latitude: 24.7136,
      longitude: 46.6753,
      delivery: true,
      deliveryTime: "30-45 دقيقة"
    },
    {
      id: 2,
      name: "صيدلية الشفاء",
      distance: 2.0,
      address: "شارع العليا، حي العليا",
      phone: "0112345678",
      rating: 4.2,
      isOpen: true,
      services: ["توصيل", "استشارات"],
      latitude: 24.7236,
      longitude: 46.6853,
      delivery: true,
      deliveryTime: "45-60 دقيقة"
    },
    {
      id: 3,
      name: "صيدلية الرحمة",
      distance: 0.8,
      address: "شارع التخصصي، حي الملز",
      phone: "0113456789",
      rating: 4.8,
      isOpen: false,
      services: ["24 ساعة"],
      latitude: 24.7036,
      longitude: 46.6653,
      delivery: false,
      deliveryTime: ""
    },
    {
      id: 4,
      name: "صيدلية الدواء السريع",
      distance: 3.5,
      address: "شارع الجامعة، حي الجامعة",
      phone: "0114567890",
      rating: 4.0,
      isOpen: true,
      services: ["توصيل", "24 ساعة", "تحليلات", "استشارات"],
      latitude: 24.7336,
      longitude: 46.6953,
      delivery: true,
      deliveryTime: "20-30 دقيقة"
    },
    {
      id: 5,
      name: "صيدلية العافية",
      distance: 1.8,
      address: "شارع الستين، حي اليرموك",
      phone: "0115678901",
      rating: 4.6,
      isOpen: true,
      services: ["توصيل", "تحليلات"],
      latitude: 24.7186,
      longitude: 46.6803,
      delivery: true,
      deliveryTime: "35-50 دقيقة"
    }
  ];

  useEffect(() => {
    // محاكاة تحميل البيانات
    setTimeout(() => {
      setPharmacies(mockPharmacies);
      setFilteredPharmacies(mockPharmacies);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterAndSortPharmacies();
  }, [pharmacies, searchQuery, sortBy, filterBy]);

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("المتصفح لا يدعم تحديد الموقع");
      return;
    }

    setLocationStatus("جاري الحصول على الموقع...");
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setLocation(newLocation);
        setLocationStatus(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        
        // هنا يمكن تحديث المسافات بناءً على الموقع الفعلي
        updateDistances(newLocation);
      },
      (error) => {
        console.error("Error getting location:", error);
        setLocationStatus("تعذّر الحصول على الموقع");
      }
    );
  }

  function updateDistances(userLocation: {lat: number; lng: number}) {
    // محاكاة تحديث المسافات بناءً على الموقع الفعلي
    const updatedPharmacies = pharmacies.map(pharmacy => ({
      ...pharmacy,
      distance: calculateDistance(
        userLocation.lat, userLocation.lng,
        pharmacy.latitude, pharmacy.longitude
      )
    }));
    setPharmacies(updatedPharmacies);
  }

  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // محاكاة حساب المسافة (في الواقع يجب استخدام صيغة هافيرسين)
    return Math.random() * 5;
  }

  function filterAndSortPharmacies() {
    let filtered = [...pharmacies];

    // تصفية بالبحث
    if (searchQuery) {
      filtered = filtered.filter(pharmacy =>
        pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // تصفية حسب الحالة
    if (filterBy === "open") {
      filtered = filtered.filter(pharmacy => pharmacy.isOpen);
    } else if (filterBy === "delivery") {
      filtered = filtered.filter(pharmacy => pharmacy.delivery);
    }

    // فرز
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "distance":
          return a.distance - b.distance;
        case "rating":
          return b.rating - a.rating;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return a.distance - b.distance;
      }
    });

    setFilteredPharmacies(filtered);
  }

  function getRatingStars(rating: number) {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<span key={i} className="text-gray-400">☆</span>);
    }

    return stars;
  }

  function getServiceBadge(service: string) {
    const serviceColors: Record<string, string> = {
      "توصيل": "bg-blue-500/20 text-blue-300",
      "24 ساعة": "bg-green-500/20 text-green-300",
      "تحليلات": "bg-purple-500/20 text-purple-300",
      "استشارات": "bg-orange-500/20 text-orange-300"
    };

    return (
      <span 
        key={service}
        className={`px-2 py-1 rounded-full text-xs ${serviceColors[service] || "bg-gray-500/20 text-gray-300"}`}
      >
        {service}
      </span>
    );
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
          <h1 className="text-3xl font-bold">الصيدليات القريبة</h1>
          <p className="text-gray-400 mt-1">ابحث عن الصيدليات القريبة من موقعك</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setMapView(!mapView)}
            variant={mapView ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <span>{mapView ? "📋" : "🗺️"}</span>
            {mapView ? "عرض القائمة" : "عرض الخريطة"}
          </Button>
        </div>
      </div>

      {/* بطاقة البحث */}
      <div className="card rounded-2xl p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="text-sm opacity-80 block mb-2">ابحث عن صيدلية</label>
            <Input
              placeholder="اسم الصيدلية أو الحي..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="md:col-span-3">
            <label className="text-sm opacity-80 block mb-2">ترتيب حسب</label>
            <select
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="distance">أقرب صيدلية</option>
              <option value="rating">أعلى تقييم</option>
              <option value="name">الاسم</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="text-sm opacity-80 block mb-2">التصفية</label>
            <select
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
            >
              <option value="all">الكل</option>
              <option value="open">مفتوحة الآن</option>
              <option value="delivery">توصيل</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <Button 
              onClick={getCurrentLocation}
              className="w-full flex items-center justify-center gap-2"
            >
              <span>📍</span>
              موقعي الحالي
            </Button>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="text-sm opacity-80">
            <span className="font-medium">موقعك:</span> {locationStatus}
          </div>
        </div>
      </div>

      {/* نتائج البحث */}
      <div className="card rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            نتائج البحث ({filteredPharmacies.length} صيدلية)
          </h2>
          <div className="text-sm text-gray-400">
            محدثة الآن
          </div>
        </div>

        {filteredPharmacies.length > 0 ? (
          <div className="grid gap-4">
            {filteredPharmacies.map((pharmacy) => (
              <div 
                key={pharmacy.id} 
                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{pharmacy.name}</h3>
                          {pharmacy.isOpen ? (
                            <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs">
                              مفتوحة الآن
                            </span>
                          ) : (
                            <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs">
                              مغلقة
                            </span>
                          )}
                        </div>
                        <div className="text-sm opacity-80 mb-2">{pharmacy.address}</div>
                        <div className="flex flex-wrap gap-2">
                          {pharmacy.services.map(service => getServiceBadge(service))}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          {getRatingStars(pharmacy.rating)}
                          <span className="text-sm font-medium mr-2">{pharmacy.rating}</span>
                        </div>
                        <div className="text-sm font-medium">
                          {pharmacy.distance.toFixed(1)} كم
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span>📞</span>
                        <span>{pharmacy.phone}</span>
                      </div>
                      
                      {pharmacy.delivery && (
                        <div className="flex items-center gap-2">
                          <span>🚚</span>
                          <span>توصيل: {pharmacy.deliveryTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <span>📱</span>
                      اتصال
                    </Button>
                    <Button 
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <span>📍</span>
                      الاتجاهات
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-xl font-semibold mb-2">لا توجد صيدليات</h3>
            <p className="text-gray-400 mb-4">
              {searchQuery ? "لا توجد صيدليات تطابق بحثك" : "لا توجد صيدليات قريبة"}
            </p>
            <Button 
              onClick={() => {
                setSearchQuery("");
                setFilterBy("all");
              }}
            >
              إعادة تعيين البحث
            </Button>
          </div>
        )}
      </div>

      {/* الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card rounded-2xl p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{pharmacies.length}</div>
              <div className="text-sm text-blue-300">صيدلية إجمالي</div>
            </div>
            <div className="text-3xl">🏪</div>
          </div>
        </div>
        
        <div className="card rounded-2xl p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {pharmacies.filter(p => p.isOpen).length}
              </div>
              <div className="text-sm text-green-300">مفتوحة الآن</div>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>
        
        <div className="card rounded-2xl p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {pharmacies.filter(p => p.delivery).length}
              </div>
              <div className="text-sm text-purple-300">توصيل</div>
            </div>
            <div className="text-3xl">🚚</div>
          </div>
        </div>
        
        <div className="card rounded-2xl p-4 bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {(pharmacies.reduce((sum, p) => sum + p.rating, 0) / pharmacies.length || 0).toFixed(1)}
              </div>
              <div className="text-sm text-orange-300">متوسط التقييم</div>
            </div>
            <div className="text-3xl">⭐</div>
          </div>
        </div>
      </div>

      {/* تنبيهات مهمة */}
      <div className="card rounded-2xl p-5 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">⚠️</div>
          <h3 className="text-lg font-semibold">ملاحظات مهمة</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="font-medium text-sm mb-1">الصيدليات المفتوحة 24 ساعة</div>
            <div className="text-xs opacity-80">
              تحقق من توفر الخدمة قبل الزيارة
            </div>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="font-medium text-sm mb-1">الطلبات عبر الهاتف</div>
            <div className="text-xs opacity-80">
              اتصل مسبقًا لتأكيد توفر الأدوية
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}