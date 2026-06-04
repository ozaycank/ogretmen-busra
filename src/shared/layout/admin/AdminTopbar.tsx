"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAdminLayout } from "@/providers/AdminLayoutProvider";
import { Menu, Bell, Search, ChevronRight } from "lucide-react";

export default function AdminTopbar({ userName }: { userName: string }) {
  const { toggleSidebar } = useAdminLayout();
  const pathname = usePathname();

  // URL'den dinamik Breadcrumb üretme (Örn: /admin/materials -> Admin > Materials)
  const paths = pathname.split('/').filter(p => p !== '');
  
  return (
    <header className="h-20 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={24} />
        </button>

        {/* Dinamik Breadcrumb */}
        <nav className="hidden sm:flex items-center text-sm font-medium text-slate-500 capitalize">
          {paths.map((path, index) => (
            <React.Fragment key={path}>
              <span className={index === paths.length - 1 ? "text-slate-900 font-bold" : ""}>
                {path.replace(/-/g, ' ')}
              </span>
              {index < paths.length - 1 && <ChevronRight size={16} className="mx-2" />}
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden md:flex relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Ara..." 
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all w-64"
          />
        </div>

        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Bell size={24} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-tight">{userName}</p>
            <p className="text-xs text-slate-500 font-medium">Yönetici</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold border-2 border-white shadow-sm">
            {userName.charAt(0)}
          </div>
        </div>
      </div>

    </header>
  );
}