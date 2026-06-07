import React from "react";
import { Metadata } from "next";
import LoginForm from "@/modules/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Yönetici Girişi | Büşra Öğretmen",
  description: "Büşra Öğretmen platformu yetkili giriş ekranı.",
  robots: { index: false, follow: false }, // Güvenlik: Admin panelini arama motorlarından gizle
};

export default function AdminLoginPage() {
  return (
    // Admin layout'unun dışına çıkıp tam ekran (h-screen) bir odaklanma arayüzü sunuyoruz
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-sky-500/20 blur-[120px] rounded-full" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] bg-indigo-500/20 blur-[120px] rounded-full" />
      </div>
      
      <div className="relative z-10 w-full flex justify-center">
        <LoginForm />
      </div>
    </div>
  );
}