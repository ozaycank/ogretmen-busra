"use client";

import React, { useActionState, useEffect, useRef } from "react";
import { submitContactForm, ActionState } from "@/app/(public)/iletisim/actions";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Script from "next/script";

// TypeScript Global Kapsamı diğer sayfa ile çakışmasın diye eksiksiz tanımlanıyor
declare global {
  interface Window {
    turnstile?: {
      render: (element: string | HTMLElement, options: any) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const initialState: ActionState = {
  success: false,
  message: "",
};

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Explicit Rendering için referanslar
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Turnstile Explicit Başlatma
  useEffect(() => {
    const initTurnstile = () => {
      if (window.turnstile && turnstileContainerRef.current && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA",
          theme: "light",
        });
      }
    };

    if (window.turnstile) {
      initTurnstile();
    }

    return () => {
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []); // Mount / Unmount olduğunda tetiklenir


  // Başarılı olursa formu temizle ve Turnstile'ı sıfırla
  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset();
      // widget id'ye özel reset
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.reset(widgetIdRef.current);
      }
    }
  }, [state.success]);

  return (
    <>
      <Script 
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" 
        strategy="lazyOnload" 
        onLoad={() => {
          if (window.turnstile && turnstileContainerRef.current && !widgetIdRef.current) {
            widgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
              sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA",
              theme: "light",
            });
          }
        }}
      />

      <form ref={formRef} action={formAction} className="bg-white border border-slate-100 rounded-[2rem] p-8 md:p-12 shadow-sm space-y-6">
        
        {state.message && (
          <div className={`p-4 rounded-2xl flex items-start gap-3 ${state.success ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'} border`}>
            {state.success ? <CheckCircle2 className="mt-0.5 flex-shrink-0" size={20} /> : <AlertCircle className="mt-0.5 flex-shrink-0" size={20} />}
            <p className="text-sm font-bold">{state.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-slate-900 mb-2">Adınız Soyadınız</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              disabled={isPending}
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition-all ${state.errors?.name ? 'border-rose-300' : 'border-slate-200'}`} 
            />
            {state.errors?.name && <p className="text-rose-500 text-xs mt-1 font-medium">{state.errors.name[0]}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-bold text-slate-900 mb-2">E-posta Adresiniz</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              disabled={isPending}
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition-all ${state.errors?.email ? 'border-rose-300' : 'border-slate-200'}`} 
            />
            {state.errors?.email && <p className="text-rose-500 text-xs mt-1 font-medium">{state.errors.email[0]}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-bold text-slate-900 mb-2">Konu</label>
          <input 
            type="text" 
            id="subject" 
            name="subject" 
            disabled={isPending}
            className={`w-full bg-slate-50 border rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition-all ${state.errors?.subject ? 'border-rose-300' : 'border-slate-200'}`} 
          />
          {state.errors?.subject && <p className="text-rose-500 text-xs mt-1 font-medium">{state.errors.subject[0]}</p>}
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-bold text-slate-900 mb-2">Mesajınız</label>
          <textarea 
            id="message" 
            name="message" 
            rows={5} 
            disabled={isPending}
            className={`w-full bg-slate-50 border rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition-all resize-none ${state.errors?.message ? 'border-rose-300' : 'border-slate-200'}`} 
          />
          {state.errors?.message && <p className="text-rose-500 text-xs mt-1 font-medium">{state.errors.message[0]}</p>}
        </div>

        {/* DOM Ref: React form yaratıldığında Turnstile buraya manuel enjekte edilir */}
        <div ref={turnstileContainerRef} className="w-full"></div>

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? <><Loader2 className="animate-spin" size={20} /> Gönderiliyor...</> : <><Send size={20} /> Mesajı Gönder</>}
        </button>
      </form>
    </>
  );
}