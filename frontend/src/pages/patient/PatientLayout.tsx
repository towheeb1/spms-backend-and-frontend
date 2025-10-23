import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { SearchBar } from "../../components/search/SearchBar";
import { SearchResults } from "../../components/search/SearchResults";
import { Link } from "react-router-dom";

const links = [
  { to: "/patient", label: "الرئيسية", icon: "🏠" },
  { to: "/patient/prescriptions", label: "التقارير", icon: "📋" },
  { to: "/patient/orders", label: "الطلبات", icon: "🛒" },
  { to: "/patient/invoices", label: "التحاليل", icon: "📄" },
  { to: "/patient/payments", label: "المدفوعات", icon: "💳" },
  { to: "/patient/profile", label: "ملفي", icon: "👤" },
  { to: "/patient/addresses", label: "عناويني", icon: "📍" },
  { to: "/patient/insurance", label: "التأمين", icon: "🛡️" },
  { to: "/patient/pharmacies", label: "الصيدليات", icon: "🏪" },
  { to: "/patient/settings", label: "الإعدادات", icon: "⚙️" },
];

export   function PatientLayout() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [user, setUser] = useState({
    name: "محمد أحمد",
    avatar: null as string | null
  });
  const location = useLocation();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive 
        ? "bg-blue-600/20 text-blue-300 border border-blue-500/30" 
        : "opacity-80 hover:opacity-100 hover:bg-white/10"
    }`;

  // إغلاق القائمة المحمولة عند تغيير الصفحة
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* شريط التنقل العلوي */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/30 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* الشعار والقائمة المحمولة */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <span className="text-xl">☰</span>
              </button>
              
              <Link to="/patient" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-lg font-bold">م</span>
                </div>
                <span className="text-xl font-bold hidden sm:block">الرعاية الصحية</span>
              </Link>
            </div>

            {/* شريط البحث */}
            <div className="flex-1 max-w-2xl mx-6 hidden md:block">
              <SearchBar 
                onSearchFocus={() => setShowSearchResults(true)}
                onSearchBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              />
            </div>

            {/* عناصر التحكم اليمنى */}
            <div className="flex items-center gap-3">
              {/* إشعارات */}
              <div className="relative">
                <button className="p-2 rounded-lg hover:bg-white/10 transition-colors relative">
                <Link to={"/"}>
                 <span className="text-xl">🔔</span>
                </Link>
                 
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </button>
              </div>

              {/* ملف المستخدم */}
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} alt="الملف الشخصي" className="w-8 h-8 rounded-full" />
                    ) : (
                      <span className="font-medium">{user.name.charAt(0)}</span>
                    )}
                  </div>
                  <span className="hidden md:block text-sm">{user.name}</span>
                  <span className="hidden md:block text-xs">▼</span>
                </button>
                
                {/* قائمة الملف الشخصي */}
                <div className="absolute left-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-4 border-b border-white/10">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm opacity-70">مريض</div>
                  </div>
                  <div className="p-2">
                    <Link 
                      to="/patient/profile" 
                      className="block px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      الملف الشخصي
                    </Link>
                    <Link 
                      to="/patient/settings" 
                      className="block px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      الإعدادات
                    </Link>
                    <div className="border-t border-white/10 my-2"></div>
                    <Link 
                      to="/login" 
                      className="block px-3 py-2 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-colors"
                    >
                      تسجيل الخروج
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* شريط البحث المحمول */}
      <div className="md:hidden px-4 pb-3">
        <SearchBar 
          onSearchFocus={() => setShowSearchResults(true)}
          onSearchBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
        />
      </div>

      {/* نتائج البحث المنبثقة */}
      {showSearchResults && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4">
          <div className="w-full max-w-2xl">
            <SearchResults />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* القائمة الجانبية - سطح المكتب */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="card rounded-2xl p-4 bg-white/5 backdrop-blur-sm border border-white/10 sticky top-24">
              <nav className="space-y-1">
                {links.map((link) => (
                  <NavLink 
                    key={link.to} 
                    to={link.to} 
                    className={navLinkClass}
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span>{link.label}</span>
                  </NavLink>
                ))}
                
                <div className="pt-4 mt-4 border-t border-white/10">
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors"
                  >
                    <span className="text-lg">🚪</span>
                    <span>تسجيل الخروج</span>
                  </Link>
                </div>
              </nav>
            </div>
          </aside>

          {/* القائمة المحمولة المنبثقة */}
          {showMobileMenu && (
            <div className="fixed inset-0 z-40 md:hidden">
              <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowMobileMenu(false)}
              ></div>
              <div className="absolute right-0 top-0 h-full w-80 bg-gray-900/95 backdrop-blur-xl border-l border-white/10 p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">القائمة</h2>
                  <button 
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 rounded-lg hover:bg-white/10"
                  >
                    ✕
                  </button>
                </div>
                
                <nav className="space-y-1">
                  {links.map((link) => (
                    <NavLink 
                      key={link.to} 
                      to={link.to} 
                      className={navLinkClass}
                    >
                      <span className="text-lg">{link.icon}</span>
                      <span>{link.label}</span>
                    </NavLink>
                  ))}
                  
                  <div className="pt-4 mt-4 border-t border-white/10">
                    <Link
                      to="/login"
                      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors w-full"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <span className="text-lg">🚪</span>
                      <span>تسجيل الخروج</span>
                    </Link>
                  </div>
                </nav>
              </div>
            </div>
          )}

          {/* المحتوى الرئيسي */}
          <main className="flex-1 min-w-0">
            <div className="grid gap-6">
              {/* محتوى الصفحة المحددة */}
              <div className="transition-all duration-300">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}