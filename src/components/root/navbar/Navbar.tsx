"use client";

import { Bell, Briefcase, User as UserIcon, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ActivityLogCard from "./ActivityLogCard";
import UserCard from "./UserCard";
import { useActivityLogs } from "@/context/ActivityLogContext";
import ChangePasswordDialog from "./ChangePasswordDialog";
import RegisterUserDialog from "./RegisterUserDialog";
import UpdateProfileDialog, { ProfileFormValues } from "./UpdateProfileDialog";
import { useSession } from "next-auth/react";

const Navbar = () => {
  const { logs, loadingLogs } = useActivityLogs();
  const [profile, setProfile] = useState<ProfileFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showActivityMenu, setShowActvityMenu] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] =
    useState(false);
  const [showUpdateProfileDialog, setShowUpdateProfileDialog] = useState(false);
  const [showRegisterUserDialog, setShowRegisterUserDialog] = useState(false);
  const [hiddenLogIds, setHiddenLogIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const key = process.env.HIDDEN_LOGS_KEY || "hidden_logs";
      const saved = localStorage.getItem(key);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (err) {
      console.error("Error leyendo hidden logs de localStorage", err);
      return new Set();
    }
  });

  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    try {
      const arr = Array.from(hiddenLogIds);
      localStorage.setItem(
        process.env.HIDDEN_LOGS_KEY || "hidden_logs",
        JSON.stringify(arr)
      );
    } catch (err) {
      console.error("Error guardando hidden logs", err);
    }
  }, [hiddenLogIds]);

  const visibleCount = logs.filter((log) => !hiddenLogIds.has(log.id)).length;

  const navLinks = [
    { href: "/proyectos", label: "Proyectos", active: false },
    { href: "/tareas", label: "Tareas", active: false },
    { href: "/clientes", label: "Clientes", active: false },
    { href: "/finanzas", label: "Finanzas", active: false },
    ...(session?.user?.role === "ADMIN"
      ? [{ href: "/usuarios", label: "Usuarios" }]
      : []),
  ];

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/*  Logo */}
            <div className="flex items-center">
              <div className="shrink-0 flex items-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  ProjectHub
                </span>
              </div>
            </div>

            {/*  Links de navegación - ordenador */}
            <div className="hidden sm:flex sm:ml-8 sm:space-x-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`border-b-2 inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      isActive
                        ? "border-blue-600 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Notificaciones + Usuario + Hamburguesa */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowActvityMenu(!showActivityMenu)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors focus:outline-none cursor-pointer"
                >
                  <Bell className="h-5 w-5" />
                  {/* Badge con conteo */}
                  {visibleCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                      {visibleCount > 15 ? "15+" : visibleCount}
                    </span>
                  )}
                </button>
                {showActivityMenu && (
                  <ActivityLogCard
                    logs={logs}
                    loadingLogs={loadingLogs}
                    setShowActvityMenu={setShowActvityMenu}
                    hiddenLogIds={hiddenLogIds}
                    setHiddenLogIds={setHiddenLogIds}
                  />
                )}
              </div>

              {/* Menú usuario */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200 hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                  aria-label="Menú de usuario"
                >
                  <UserIcon className="h-5 w-5" />
                </button>

                {showUserMenu && (
                  <UserCard
                    setShowUserMenu={setShowUserMenu}
                    setShowChangePasswordDialog={setShowChangePasswordDialog}
                    setShowRegisterUserDialog={setShowRegisterUserDialog}
                    setShowUpdateProfileDialog={setShowUpdateProfileDialog}
                    setProfile={setProfile}
                  />
                )}
              </div>

              {/* Botón hamburguesa - solo móvil */}
              <button
                className="sm:hidden p-2 text-gray-500 hover:text-blue-600 focus:outline-none"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                aria-label="Toggle menú móvil"
              >
                {showMobileMenu ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil - dropdown vertical */}
        {showMobileMenu && (
          <div className="sm:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
      <ChangePasswordDialog
        isOpen={showChangePasswordDialog}
        onClose={() => setShowChangePasswordDialog(false)}
        error={error}
        setError={setError}
      />
      <RegisterUserDialog
        isOpen={showRegisterUserDialog}
        onClose={() => setShowRegisterUserDialog(false)}
        error={error}
        setError={setError}
      />
      <UpdateProfileDialog
        isOpen={showUpdateProfileDialog}
        onClose={() => setShowUpdateProfileDialog(false)}
        profile={profile}
        error={error}
        setError={setError}
      />
    </>
  );
};

export default Navbar;
