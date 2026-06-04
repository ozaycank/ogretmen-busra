"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminLayout } from "@/shared/providers/AdminLayoutProvider";
import { LayoutDashboard, Files, CheckSquare, Users, Settings, LogOut, X, Newspaper, ShieldCheck } from "lucide-react";
import { Role } from "@prisma/client";

// ÇÖZÜM: Tüm Materyaller kısmına 'exact: true' parametresi eklendi
const NAV_ITEMS = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, roles: [Role.ADMIN, Role.MODERATOR] },
  { name: "Onay Bekleyenler", href: "/admin/materials/pending", icon: CheckSquare, roles: [Role.ADMIN, Role.MODERATOR] },
  { name: "Tüm Materyaller", href: "/admin/materials", icon: Files, roles: [Role.ADMIN, Role.MODERATOR], exact: true },
  { name: "Haber Yönetimi", href: "/admin/news", icon: Newspaper, roles: [Role.ADMIN, Role.MODERATOR] }, 
  { name: "Kullanıcı Yönetimi", href: "/admin/users", icon: Users, roles: [Role.ADMIN] },
  { name: "Sistem Ayarları", href: "/admin/materials/settings", icon: Settings, roles: [Role.ADMIN] },
  { name: "Güvenlik & Moderasyon", href: "/admin/moderation", icon: ShieldCheck, roles: [Role.ADMIN, Role.MODERATOR] },
];

export default function AdminSidebar({ userRole }: { userRole: Role }) {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useAdminLayout();

  const authorizedNavItems = NAV_ITEMS.filter(item => (item.roles as Role[]).includes(userRole));

  return (
    <>
      {/* Mobil Karartma Arka Planı (Overlay) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-72 bg-[#0f172a] text-slate-300 transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 lg:static lg:flex-shrink-0
      `}>
        
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
          <Link href="/admin/dashboard" className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-rose-500 flex items-center justify-center text-sm">BÖ</span>
            Admin Panel
          </Link>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Ana Menü</p>
          {authorizedNavItems.map((item) => {
            
            // ÇÖZÜM UYGULAMASI: Eğer exact true ise sadece tam eşleşmeye bak, değilse alt klasörlere de izin ver.
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive ? "bg-sky-500 text-white shadow-md shadow-sky-500/20" : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <item.icon size={20} className={isActive ? "text-white" : "text-slate-400"} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors">
            <LogOut size={20} />
            Çıkış Yap
          </button>
        </div>
      </aside>
    </>
  );
}