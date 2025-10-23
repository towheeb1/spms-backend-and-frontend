import { Link, NavLink, Outlet } from "react-router-dom";

export default function DoctorLayout() {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg transition ${
      isActive ? "bg-blue-600 text-white" : "opacity-80 hover:bg-white/10"
    }`;

  return (
    <div className="min-h-screen grid grid-rows-[56px_1fr] bg-gray-900 text-white">
      {/* Navbar */}
      <header className="h-14 border-b border-white/10 backdrop-blur bg-black/30">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="font-bold text-lg">👨‍⚕️ Doctor Panel</div>
            <nav className="flex items-center gap-2">
              <NavLink to="/doctor" end className={navClass}>
                لوحة التحكم
              </NavLink>
              <NavLink to="/doctor/conditions" className={navClass}>
                  المرضى
              </NavLink>
              <NavLink to="/doctor/prescribe" className={navClass}>
                وصفة جديدة
              </NavLink>
               
              <NavLink to="/doctor/visits" className={navClass}>
                الزيارات
              </NavLink>
              <NavLink to="/doctor/labs" className={navClass}>
                التحاليل
              </NavLink>
              <NavLink to="/doctor/notifications" className={navClass}>
                الإشعارات
              </NavLink>
              <Link to={"/login"}>
              خروج

              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-4 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
