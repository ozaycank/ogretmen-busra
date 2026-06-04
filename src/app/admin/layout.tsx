import React from "react";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { AdminLayoutProvider } from "@/shared/providers/AdminLayoutProvider";
import AdminSidebar from "@/shared/layout/admin/AdminSidebar";
import AdminTopbar from "@/shared/layout/admin/AdminTopbar";

// NOT: İlerleyen adımlarda next-auth veya custom auth entegre edildiğinde, 
// buradaki mock session gerçek auth()'a çevrilecektir.
async function getMockSession() {
  return {
    user: {
      id: "admin-1",
      name: "Büşra Öğretmen",
      email: "admin@ogretmenbusra.com",
      role: Role.ADMIN, // veya Role.MODERATOR
    }
  };
}

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  // 1. Sunucu Tarafı Güvenlik Kontrolü (Server-side Protected Route)
  const session = await getMockSession();

  if (!session) {
    redirect("/admin/login");
  }

  // Sadece Admin ve Moderatorler bu panele girebilir
  if (session.user.role !== Role.ADMIN && session.user.role !== Role.MODERATOR) {
    redirect("/"); // Yetkisiz kullanıcıyı ana sayfaya postala
  }

  return (
    <AdminLayoutProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        
        {/* Sol Menü (Server'dan rol bilgisini alır) */}
        <AdminSidebar userRole={session.user.role} />

        {/* Sağ Taraf (Topbar + Dinamik İçerik) */}
        <div className="flex-1 flex flex-col w-full overflow-hidden">
          
          <AdminTopbar userName={session.user.name} />
          
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
            {children}
          </main>
          
        </div>

      </div>
    </AdminLayoutProvider>
  );
}