import React from "react";
import { Metadata } from "next";
import { prisma } from "@/infrastructure/database/prisma";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import StaffTable from "@/modules/admin/components/StaffTable";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Sistem Personeli | Admin",
  robots: { index: false, follow: false },
};

async function verifySuperAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "ADMIN") redirect("/admin/dashboard");
}

export default async function AdminUsersPage() {
  await verifySuperAdmin();

  const staffList = await prisma.user.findMany({
    where: { role: { in: [Role.ADMIN, Role.MODERATOR] } },
    orderBy: { createdAt: "asc" }
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sistem Yöneticileri</h1>
        <p className="text-slate-500 mt-1">Platformun moderasyonunu ve yönetimini sağlayan yetkili personeller.</p>
      </div>

      <StaffTable staffList={staffList} />

      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h3 className="font-bold text-amber-800 mb-2">Güvenlik Notu</h3>
        <p className="text-sm text-amber-700">
          Bu panelden oluşturduğunuz personeller, e-posta adresleri ve belirlediğiniz şifre ile <strong>/admin/login</strong> adresi üzerinden panele erişebilirler. "Moderatör" rolündeki kullanıcılar sistem ayarları ve bu sayfayı görüntüleyemezler, sadece materyal onayı yapabilirler.
        </p>
      </div>
    </div>
  );
}