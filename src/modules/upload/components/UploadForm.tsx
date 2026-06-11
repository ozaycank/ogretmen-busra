"use client";

import React, { useState, useRef, useMemo } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, File, X } from "lucide-react";
import { GradeLevel, ContentCategory } from "@prisma/client";
import Script from "next/script";
import { CURRICULUM_MAP, formatSubject } from "@/shared/constants/curriculum";

declare global {
  interface Window {
    turnstile?: {
      reset: () => void;
    };
  }
}

const ALLOWED_MAGIC_BYTES: Record<string, string[]> = {
  "pdf": ["25504446"],
  "docx": ["504b0304"], 
  "zip": ["504b0304"],
  "png": ["89504e47"],
  "jpeg": ["ffd8ffe0", "ffd8ffe1", "ffd8ffee", "ffd8ffdb"],
  "jpg": ["ffd8ffe0", "ffd8ffe1", "ffd8ffee", "ffd8ffdb"],
};

const formatEnum = (text: string) => text.replace(/_/g, " ").replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase());

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "validating" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | "">("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = async (selectedFile: File) => {
    setStatus("validating");
    setErrorMessage("");

    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMessage("Dosya boyutu 10MB'dan büyük olamaz.");
      setStatus("error");
      return;
    }

    const extension = selectedFile.name.split('.').pop()?.toLowerCase() || "";
    if (!ALLOWED_MAGIC_BYTES[extension]) {
      setErrorMessage("Sadece PDF, DOCX, ZIP, PNG ve JPG dosyaları yüklenebilir.");
      setStatus("error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = function(e) {
      if (e.target?.readyState === FileReader.DONE) {
        const arr = (new Uint8Array(e.target.result as ArrayBuffer)).subarray(0, 4);
        let header = "";
        for (let i = 0; i < arr.length; i++) header += arr[i].toString(16).padStart(2, '0');
        
        const isValid = ALLOWED_MAGIC_BYTES[extension].some(magic => header.startsWith(magic) || magic.startsWith(header));
        
        if (!isValid) {
          setErrorMessage("Güvenlik Uyarısı: Dosya uzantısı ile içerik uyuşmuyor. Lütfen güvenilir dosyalar yükleyin.");
          setStatus("error");
        } else {
          setFile(selectedFile);
          setStatus("idle");
        }
      }
    };
    reader.readAsArrayBuffer(selectedFile.slice(0, 4));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setStatus("uploading");
    setUploadProgress(0);
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const turnstileToken = formData.get("cf-turnstile-response") as string;

    if (!turnstileToken) {
        setErrorMessage("Lütfen robot olmadığınızı doğrulayın.");
        setStatus("error");
        return;
    }

    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      authorName: formData.get("authorName") as string,
      grade: formData.get("grade") as string,
      subject: formData.get("subject") as string,
      category: formData.get("category") as string,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || "application/octet-stream",
      turnstileToken 
    };

    try {
      const res = await fetch("/api/materials/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      const responseData = await res.json(); 
      if (!responseData.success && responseData.error) {
          throw new Error(responseData.error);
      }

      const { signedUrl, materialId } = responseData;

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) setUploadProgress(Math.round((event.loaded / event.total) * 100));
        };
        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              await fetch("/api/materials/confirm-upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ materialId }) 
              });
              resolve(true);
            } catch (e) {
              reject(new Error("Onay bildiriminde hata oluştu."));
            }
          } else reject(new Error("Dosya yüklenirken R2 reddetti."));
        };
        xhr.onerror = () => reject(new Error("Ağ hatası oluştu."));
        
        xhr.open("PUT", signedUrl, true);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      setStatus("success");
      if (window.turnstile) window.turnstile.reset();
    } catch (err: any) {
      setErrorMessage(err.message || "Yükleme sırasında bilinmeyen bir hata oluştu.");
      setStatus("error");
      if (window.turnstile) window.turnstile.reset();
    }
  };

  // Dinamik ders listesi
  const availableSubjects = selectedGrade ? CURRICULUM_MAP[selectedGrade] : [];

  if (status === "success") {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-12 text-center flex flex-col items-center">
        <div className="bg-emerald-100 p-4 rounded-full text-emerald-600 mb-6"><CheckCircle2 size={48} /></div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Materyaliniz Başarıyla Gönderildi!</h2>
        <p className="text-slate-600 max-w-md mb-8">
          Dosyanız güvenlik taramasından ve editör onayından geçtikten sonra sistemde yayınlanacaktır. Eğitime katkınız için teşekkür ederiz.
        </p>
        <button onClick={() => { setFile(null); setStatus("idle"); setUploadProgress(0); setSelectedGrade(""); }} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-colors">
          Yeni Materyal Ekle
        </button>
      </div>
    );
  }

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-3xl p-6 md:p-10 shadow-sm space-y-8">
        {status === "error" && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-rose-500 mt-0.5" size={20} />
            <p className="text-sm font-medium text-rose-700">{errorMessage}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-slate-900 mb-3">Materyal Dosyası (PDF, DOCX, ZIP, Resim)</label>
          <div 
            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${isDragging ? "border-sky-500 bg-sky-50" : "border-slate-200 hover:border-sky-400 hover:bg-slate-50"} ${status === "uploading" ? "pointer-events-none opacity-50" : ""}`}
          >
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx,.zip,.png,.jpg,.jpeg" onChange={(e) => e.target.files && validateAndSetFile(e.target.files[0])} />
            
            {!file ? (
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4"><UploadCloud className="text-sky-500" size={32} /></div>
                <p className="text-slate-700 font-medium">Dosyayı buraya sürükleyin veya seçmek için tıklayın</p>
                <p className="text-slate-400 text-xs mt-2">Maksimum 10MB</p>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <File className="text-sky-500" size={24} />
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                {status !== "uploading" && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
          </div>
          
          {status === "uploading" && (
            <div className="mt-4">
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>Yükleniyor...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-sky-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Başlık <span className="text-rose-500">*</span></label>
            <input required name="title" maxLength={150} type="text" placeholder="Örn: 1. Sınıf E Sesi Okuma Metni" disabled={status === "uploading"} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition-all disabled:opacity-60" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Adınız Soyadınız (Yazar) <span className="text-rose-500">*</span></label>
            <input required name="authorName" maxLength={100} type="text" placeholder="Örn: Büşra Öğretmen" disabled={status === "uploading"} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition-all disabled:opacity-60" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Sınıf Seviyesi <span className="text-rose-500">*</span></label>
            <select 
              required 
              name="grade" 
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value as GradeLevel)}
              disabled={status === "uploading"} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition-all disabled:opacity-60"
            >
              <option value="">Seçiniz...</option>
              {Object.keys(GradeLevel).map(k => <option key={k} value={k}>{formatEnum(k)}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Ders Seçimi <span className="text-rose-500">*</span></label>
            <select 
              required 
              name="subject" 
              disabled={!selectedGrade || status === "uploading"} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition-all disabled:opacity-60"
            >
              <option value="">Seçiniz...</option>
              {availableSubjects.map(sub => <option key={sub} value={sub}>{formatSubject(sub)}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Kategori <span className="text-rose-500">*</span></label>
            <select required name="category" disabled={status === "uploading"} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition-all disabled:opacity-60">
              <option value="">Seçiniz...</option>
              {Object.keys(ContentCategory).map(k => <option key={k} value={k}>{formatEnum(k)}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">Açıklama (Opsiyonel)</label>
          <textarea name="description" maxLength={500} rows={4} placeholder="Materyalin içeriği, nasıl kullanılacağı hakkında kısa bir bilgi verin..." disabled={status === "uploading"} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition-all resize-none disabled:opacity-60" />
        </div>

        <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"} data-theme="light"></div>

        <button type="submit" disabled={!file || status === "uploading" || status === "validating"} className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed">
          {status === "uploading" ? <><Loader2 className="animate-spin" size={20} /> Yükleniyor...</> : "Materyali Paylaş"}
        </button>
      </form>
    </>
  );
}