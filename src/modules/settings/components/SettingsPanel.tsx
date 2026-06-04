"use client";

import React, { useState, useTransition } from "react";
import { updateModerationSettings } from "@/app/admin/materials/settings/actions";
import { ModerationSettingsData } from "@/modules/settings/schemas/settings.schema";
import { Settings, Shield, Activity, Clock, AlertTriangle, Save, Loader2 } from "lucide-react";

interface SettingsPanelProps {
  initialSettings: ModerationSettingsData;
}

export default function SettingsPanel({ initialSettings }: SettingsPanelProps) {
  const [settings, setSettings] = useState<ModerationSettingsData>(initialSettings);
  const [activeTab, setActiveTab] = useState<"upload" | "security" | "risk" | "danger">("upload");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState({ type: "", text: "" });

  const [dangerConfirm, setDangerConfirm] = useState("");
  const [dangerReason, setDangerReason] = useState("");

  const handleChange = (key: keyof ModerationSettingsData, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setMessage({ type: "", text: "" });
    startTransition(async () => {
      const res = await updateModerationSettings(settings);
      if (res.success) setMessage({ type: "success", text: "Ayarlar başarıyla kaydedildi." });
      else setMessage({ type: "error", text: res.error || "Hata oluştu." });
    });
  };

  const handleDangerousDisable = () => {
    if (dangerConfirm !== "DISABLE") return;
    if (dangerReason.length < 10) {
      setMessage({ type: "error", text: "Geçerli bir sebep girmelisiniz." });
      return;
    }
    
    startTransition(async () => {
      const newSettings = { ...settings, requireAntivirusScan: false, requireMagicByteCheck: false, preventDuplicateHashes: false };
      const res = await updateModerationSettings(newSettings, dangerReason);
      if (res.success) {
        setSettings(newSettings);
        setDangerConfirm("");
        setDangerReason("");
        setMessage({ type: "success", text: "Güvenlik protokolleri devre dışı bırakıldı." });
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Sol Menü (Tabs) */}
      <div className="lg:col-span-3">
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-2 sticky top-24">
          <button onClick={() => setActiveTab("upload")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === "upload" ? "bg-sky-50 text-sky-700" : "text-slate-500 hover:bg-slate-50"}`}><Settings size={18}/> Yükleme Kuralları</button>
          <button onClick={() => setActiveTab("security")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === "security" ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:bg-slate-50"}`}><Shield size={18}/> Güvenlik İlkeleri</button>
          <button onClick={() => setActiveTab("risk")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === "risk" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50"}`}><Activity size={18}/> Risk ve SLA</button>
          <div className="my-2 border-t border-slate-100"></div>
          <button onClick={() => setActiveTab("danger")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === "danger" ? "bg-rose-50 text-rose-700" : "text-slate-500 hover:bg-slate-50"}`}><AlertTriangle size={18}/> Tehlikeli İşlemler</button>
        </div>
      </div>

      {/* Sağ İçerik (Form) */}
      <div className="lg:col-span-9">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl font-bold text-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
              {message.text}
            </div>
          )}

          {activeTab === "upload" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">Yükleme Kuralları</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Maksimum Dosya Boyutu (MB)</label>
                  <input type="number" value={settings.maxFileSizeMB} onChange={(e) => handleChange("maxFileSizeMB", Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-sky-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">IP Başına Günlük Yükleme Limiti</label>
                  <input type="number" value={settings.dailyUploadLimitPerIP} onChange={(e) => handleChange("dailyUploadLimitPerIP", Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-sky-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">İzin Verilen Uzantılar (Virgülle ayırın)</label>
                <input type="text" value={settings.allowedExtensions.join(", ")} onChange={(e) => handleChange("allowedExtensions", e.target.value.split(",").map(s => s.trim()))} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-sky-500 outline-none" />
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">Güvenlik İlkeleri (Trust & Safety)</h2>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                  <div>
                    <p className="font-bold text-slate-900">Magic-Byte Doğrulaması</p>
                    <p className="text-xs text-slate-500">Dosya uzantısı değiştirilmiş sahte dosyaları (Örn: exe'den pdf'e) tespit eder.</p>
                  </div>
                  <input type="checkbox" checked={settings.requireMagicByteCheck} onChange={(e) => handleChange("requireMagicByteCheck", e.target.checked)} className="w-5 h-5 text-emerald-600 rounded" />
                </label>

                <label className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                  <div>
                    <p className="font-bold text-slate-900">Anti-Virüs & Kötü Amaçlı Yazılım Taraması</p>
                    <p className="text-xs text-slate-500">Cloudflare üzerinde çalışan işçilerle (Worker) dosyaları otomatik tarar.</p>
                  </div>
                  <input type="checkbox" checked={settings.requireAntivirusScan} onChange={(e) => handleChange("requireAntivirusScan", e.target.checked)} className="w-5 h-5 text-emerald-600 rounded" />
                </label>

                <label className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                  <div>
                    <p className="font-bold text-slate-900">Kopya İçerik Tespiti (SHA256 Hash)</p>
                    <p className="text-xs text-slate-500">Aynı dosyanın sisteme tekrar yüklenmesini engeller.</p>
                  </div>
                  <input type="checkbox" checked={settings.preventDuplicateHashes} onChange={(e) => handleChange("preventDuplicateHashes", e.target.checked)} className="w-5 h-5 text-emerald-600 rounded" />
                </label>
              </div>
            </div>
          )}

          {activeTab === "risk" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">Risk Skoru ve SLA Hedefleri</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Hedef İnceleme Süresi (SLA - Saat)</label>
                  <input type="number" value={settings.targetReviewTimeHours} onChange={(e) => handleChange("targetReviewTimeHours", Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-sky-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Otomatik Onay Risk Limiti (Altı Onaylanır)</label>
                  <input type="number" value={settings.autoApproveRiskThreshold} onChange={(e) => handleChange("autoApproveRiskThreshold", Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4">Risk Ağırlıkları (Puanlama Algoritması)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Yeni Kullanıcı (+)</label>
                    <input type="number" value={settings.weightNewAccount} onChange={(e) => handleChange("weightNewAccount", Number(e.target.value))} className="w-full border border-slate-200 rounded-lg p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Şüpheli Uzantı (+)</label>
                    <input type="number" value={settings.weightDuplicate} onChange={(e) => handleChange("weightDuplicate", Number(e.target.value))} className="w-full border border-slate-200 rounded-lg p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Malware Uyarısı (+)</label>
                    <input type="number" value={settings.weightMalwareWarning} onChange={(e) => handleChange("weightMalwareWarning", Number(e.target.value))} className="w-full border border-slate-200 rounded-lg p-2 text-sm" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "danger" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xl font-black text-rose-600 mb-6 border-b border-rose-100 pb-4 flex items-center gap-2">
                <AlertTriangle /> Tehlikeli Bölge
              </h2>
              
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6">
                <h3 className="font-bold text-rose-800 mb-2">Güvenlik Duvarını Devre Dışı Bırak</h3>
                <p className="text-sm text-rose-600 mb-6">
                  Bu işlem Anti-Virüs, Magic-Byte ve Kopya korumasını anında kapatır. Sadece acil durumlarda veya sistem testlerinde kullanılmalıdır. Bu işlem kalıcı olarak Audit Loglara yazılır.
                </p>
                
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-bold text-rose-800 mb-1">Kapatma Sebebi (Zorunlu)</label>
                    <input type="text" value={dangerReason} onChange={(e) => setDangerReason(e.target.value)} placeholder="Örn: Yükleme sunucusu arızası tespiti" className="w-full border border-rose-200 rounded-xl p-3 focus:ring-2 focus:ring-rose-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-rose-800 mb-1">Onaylamak için <strong>DISABLE</strong> yazın</label>
                    <input type="text" value={dangerConfirm} onChange={(e) => setDangerConfirm(e.target.value)} className="w-full border border-rose-200 rounded-xl p-3 focus:ring-2 focus:ring-rose-500 outline-none" />
                  </div>
                  <button 
                    onClick={handleDangerousDisable} 
                    disabled={isPending || dangerConfirm !== "DISABLE"} 
                    className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2"
                  >
                    {isPending ? <Loader2 className="animate-spin" size={18}/> : "Güvenliği Devre Dışı Bırak"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Ortak Kaydet Butonu (Sadece Danger haricinde gösterilir) */}
          {activeTab !== "danger" && (
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button 
                onClick={handleSave} 
                disabled={isPending}
                className="flex items-center gap-2 bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {isPending ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                Değişiklikleri Kaydet
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}