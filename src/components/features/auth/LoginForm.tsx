"use client";

import React, { useActionState, useEffect } from "react";
import { loginAction, AuthState } from "@/app/(admin)/login/actions";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";

declare global {
  interface Window {
    turnstile?: { reset: () => void; };
  }
}

const initialState: AuthState = { success: false, message: "" };

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.push("/admin/dashboard");
    } else if (state.message && window.turnstile) {
      // Hata varsa bot doğrulamasını güvenliğe karşı sıfırla
      window.turnstile.reset();
    }
  }, [state, router]);

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />

      <form action={formAction} className="bg-white border border-slate-100 rounded-[2rem] p-8 md:p-10 shadow-2xl w-full max-w-md relative overflow-hidden">
        {/* Güvenlik Deseni */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-500 to-indigo-500" />

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Yetkili Girişi</h1>
          <p className="text-sm text-slate-500 mt-2">Sisteme erişmek için kimliğinizi doğrulayın.</p>
        </div>

        {state.message && !state.success && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 flex items-start gap-3">
            <AlertCircle className="mt-0.5 flex-shrink-0" size={18} />
            <p className="text-sm font-bold">{state.message}</p>
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-slate-900 mb-2">E-posta Adresi</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required
              disabled={isPending || state.success}
              autoComplete="email"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-60" 
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-bold text-slate-900">Şifre</label>
            </div>
            <input 
              type="password" 
              id="password" 
              name="password" 
              required
              disabled={isPending || state.success}
              autoComplete="current-password"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-60" 
            />
          </div>

          <div className="cf-turnstile pt-2" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"} data-theme="light"></div>

          <button 
            type="submit" 
            disabled={isPending || state.success}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-4"
          >
            {isPending || state.success ? <><Loader2 className="animate-spin" size={20} /> Doğrulanıyor...</> : "Giriş Yap"}
          </button>
        </div>
      </form>
    </>
  );
}