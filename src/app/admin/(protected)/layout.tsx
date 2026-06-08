import React from "react";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { AdminLayoutProvider } from "@/shared/providers/AdminLayoutProvider";
import AdminSidebar from "@/shared/layout/admin/AdminSidebar";
import AdminTopbar from "@/shared/layout/admin/AdminTopbar";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  // 1. Gerçek NextAuth Oturumunu Çek
  const session = await auth();

  // Oturum yoksa login'e at
  if (!session?.user) {
    redirect("/admin/login");
  }

  // Sadece Admin ve Moderatorler bu panele girebilir
  if (session.user.role !== Role.ADMIN && session.user.role !== Role.MODERATOR) {
    redirect("/"); 
  }

  return (
    <AdminLayoutProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        
        {/* Sol Menü (Server'dan rol bilgisini alır) */}
        <AdminSidebar userRole={session.user.role as Role} />

        <div className="flex-1 flex flex-col w-full overflow-hidden">
          <AdminTopbar userName={session.user.name || "Kullanıcı"} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
            {children}
          </main>
        </div>

      </div>
    </AdminLayoutProvider>
  );
}