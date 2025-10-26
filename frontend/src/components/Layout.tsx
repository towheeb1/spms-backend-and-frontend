import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../store/auth";
import { applyUiSettings, loadSettings, type UiSettings } from "../utils/ui";
import navConfig from "../config/navigation.json";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { useToast } from "./ui/Toast";
import { ThemeToggle } from "./ui/ThemeToggle";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { fetchPharmacistNotificationsCount, markNotificationsViewed } from "../services/notifications";
import {
  FiHome,
  FiUser,
  FiBox,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiChevronUp,
  FiZap,
  FiSearch,
  FiPlus,
} from "react-icons/fi";

type NavDetail = {
  label: string;
  to: string;
};

type NavEntry = {
  to: string;
  label: string;
  description?: string;
  icon?: string;
  details?: NavDetail[];
};

type RoleConfig = {
  brand: {
    title: string;
    subtitle?: string;
  };
  primary: NavEntry[];
  quickAccess?: NavEntry[];
};

const NAV_PER_ROLE: Record<string, RoleConfig> = navConfig as Record<string, RoleConfig>;

const getIcon = (iconName?: string) => {
  if (!iconName) return null;
  const iconMap: Record<string, JSX.Element> = {
    home: <FiHome className="w-5 h-5" />,
    user: <FiUser className="w-5 h-5" />,
    box: <FiBox className="w-5 h-5" />,
    chart: <FiBarChart2 className="w-5 h-5" />,
    settings: <FiSettings className="w-5 h-5" />,
    logout: <FiLogOut className="w-5 h-5" />,
    zap: <FiZap className="w-5 h-5" />,
    search: <FiSearch className="w-5 h-5" />,
    plus: <FiPlus className="w-5 h-5" />,
  };
  return iconMap[iconName] || null;
};

export function Layout() {
  const { user, isAuthed, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const role = user?.role;
  const toast = useToast();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadCount = async () => {
      try {
        const count = await fetchPharmacistNotificationsCount();
        setUnreadCount(count);
      } catch (error) {
        console.error("Failed to load notifications count", error);
      }
    };

    loadCount();
  }, []);

  useEffect(() => {
    const s = loadSettings<UiSettings>({ rtl: true, theme: "system", language: "ar", textScale: 100 });
    applyUiSettings(s);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("تم تسجيل الخروج بنجاح");
    nav("/login", { replace: true });
  };

  const isPatientRoute = loc.pathname.startsWith("/patient");
  const isDoctorRoute = loc.pathname.startsWith("/doctor");

  const roleConfig = useMemo<RoleConfig>(() => {
    if (!role) return NAV_PER_ROLE.Pharmacist;
    return NAV_PER_ROLE[role] || NAV_PER_ROLE.Pharmacist;
  }, [role]);

  const navItems = roleConfig.primary;
  const quickAccessItems = roleConfig.quickAccess || [];
  const hasQuickAccess = quickAccessItems.length > 0;

  const [expandedNavItems, setExpandedNavItems] = useState<Record<string, boolean>>({});

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 ${
      isActive
        ? "bg-gradient-to-r from-blue-600/40 to-indigo-600/40 text-white shadow-xl border border-white/30 backdrop-blur-sm"
        : "text-white/80 hover:bg-white/10 hover:text-white hover:shadow-md"
    }`;

  const quickAccessClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-gradient-to-r from-green-500/30 to-teal-500/30 text-white shadow-md border border-white/20"
        : "text-white/70 hover:bg-white/5 hover:text-white hover:shadow-sm"
    }`;

  const handleToggleDetails = (key: string) => {
    setExpandedNavItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // إذا كانت الصفحة لـ مريض أو دكتور، نعرض بدون sidebar
  if (isPatientRoute || isDoctorRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white font-sans">
        <main className="container mx-auto px-4 py-6 min-w-0">
          <Outlet />
        </main>

        <ConfirmDialog
          open={showLogoutDialog}
          title="تسجيل الخروج"
          message="هل أنت متأكد من رغبتك في تسجيل الخروج؟"
          confirmText="تسجيل الخروج"
          cancelText="إلغاء"
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutDialog(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white font-sans">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col border-r border-white/10 bg-black/30 backdrop-blur-2xl bg-gradient-to-b from-slate-900/60 to-slate-800/60 shadow-2xl">
          {/* Brand Header */}
          <div className="px-5 py-6 border-b border-white/10">
            <Link to="/dashboard" className="flex flex-col gap-1 group">
              <span className="text-xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:from-blue-300 group-hover:to-cyan-300 transition-all">
                {roleConfig.brand.title}
              </span>
              {roleConfig.brand.subtitle && (
                <span className="text-xs text-white/50 font-light">{roleConfig.brand.subtitle}</span>
              )}
            </Link>
          </div>

          {/* Quick Access Panel */}
          {(hasQuickAccess || true) && (
            <div className="px-4 py-4 border-b border-white/10 space-y-3">
              <Link
                to="/notifications"
                onClick={async () => {
                  setUnreadCount(0);
                  try {
                    await markNotificationsViewed();
                  } catch (error) {
                    console.error("Failed to mark notifications viewed", error);
                  }
                }}
                className="relative flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-2">
                  <FiZap className="w-4 h-4 text-amber-300" />
                  <span>الإشعارات</span>
                </div>
                {unreadCount > 0 && (
                  <span className="inline-flex min-w-[22px] justify-center rounded-full bg-red-500 px-2 text-xs font-semibold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              {hasQuickAccess && quickAccessItems.length > 0 && (
                <div className="space-y-1">
                  {quickAccessItems
                    .filter((item) => item.to !== "/notifications")
                    .map((item) => (
                      <NavLink key={item.to} to={item.to} className={quickAccessClass}>
                        <div className="text-green-400">
                          {getIcon(item.icon) || <FiZap className="w-4 h-4" />}
                        </div>
                        <span className="text-sm">{item.label}</span>
                      </NavLink>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-2">
            {navItems.map((item) => {
              const details = item.details || [];
              const hasDetails = details.length > 0;
              const isExpanded = expandedNavItems[item.to];

              return (
                <div key={item.to} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <NavLink to={item.to} className={navClass}>
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-blue-400">
                          {getIcon(item.icon) || <FiBox className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{item.label}</div>
                          {item.description && (
                            <div className="text-[10px] text-white/50 truncate">{item.description}</div>
                          )}
                        </div>
                      </div>
                    </NavLink>
                    {hasDetails && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`shrink-0 w-8 h-8 flex items-center justify-center px-2 py-1 text-xs border border-white/10 hover:border-white/30 transition-all ${
                          isExpanded ? "bg-white/10 shadow-md" : ""
                        }`}
                        onClick={() => handleToggleDetails(item.to)}
                      >
                        {isExpanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>

                  {hasDetails && isExpanded && (
                    <div className="ms-9 space-y-1 border-s border-white/10 ps-3 animate-fade-in">
                      {details.map((detail) => (
                        <NavLink
                          key={detail.to}
                          to={detail.to}
                          className={({ isActive }) =>
                            `block rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                              isActive
                                ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-white border border-white/10 shadow-sm"
                                : "text-white/60 hover:bg-white/5 hover:text-white hover:shadow-sm"
                            }`
                          }
                        >
                          {detail.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="px-5 py-5 border-t border-white/10 space-y-4">
            <div className="pt-2 flex items-center justify-between gap-2">
              <ThemeToggle variant="icon" />
              <Button
                variant="ghost"
                className="text-sm flex items-center gap-2 hover:bg-red-500/20 hover:text-red-300 transition-all"
                onClick={handleLogoutClick}
                >
                <FiLogOut />
                <span>تسجيل الخروج</span>
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content Area — FIXED SIZE */}
        <div className="flex flex-col min-h-screen md:min-h-0">
          {/* Mobile Header */}
          <header className="md:hidden px-4 py-3 border-b border-white/10 bg-black/30 backdrop-blur-xl bg-gradient-to-r from-slate-900/60 to-slate-800/60 shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <Link to="/dashboard" className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-300 hover:to-cyan-300 transition-all">
                {roleConfig.brand.title}
              </Link>
              <div className="flex items-center gap-2">
                <ThemeToggle variant="icon" />
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1 hover:bg-red-500/20 hover:border-red-300 transition-all"
                  onClick={handleLogoutClick}
                  >
                  <FiLogOut size={16} />
                </Button>
                <Link
                  to="/notifications"
                  onClick={async () => {
                    setUnreadCount(0);
                    try {
                      await markNotificationsViewed();
                    } catch (error) {
                      console.error("Failed to mark notifications viewed", error);
                    }
                  }}
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 hover:bg-white/10 transition"
                >
                  <FiZap className="w-5 h-5 text-amber-300" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] px-1 rounded-full bg-red-500 text-white text-xs font-semibold text-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </header>

          {/* Desktop Fixed Content */}
          <div className="hidden md:block flex-1 relative">
            <div className="absolute inset-0 px-4 py-6 md:px-6 md:py-8 overflow-hidden">
              <Card className="shadow-2xl border-white/10 bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl rounded-2xl h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-6">
                  <Outlet />
                </div>
              </Card>
            </div>
          </div>

          {/* Mobile Scrollable Content (no fixed height needed) */}
          <div className="md:hidden flex-1 px-4 py-6">
            <Card className="shadow-2xl border-white/10 bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl rounded-2xl">
              <div className="p-6">
                <Outlet />
              </div>
            </Card>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={showLogoutDialog}
        title="تسجيل الخروج"
        message="هل أنت متأكد من رغبتك في تسجيل الخروج؟"
        confirmText="تسجيل الخروج"
        cancelText="إلغاء"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />
    </div>
  );
}