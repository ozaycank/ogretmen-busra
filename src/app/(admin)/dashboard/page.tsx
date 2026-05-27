import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { CheckCircle2, XCircle, Clock, FileText, Download, LogOut, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

// Server Action: Materyal Durumunu Güncelleme
async function updateMaterialStatus(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const status = formData.get("status") as "APPROVED" | "REJECTED";

  if (!id || !status) return;

  await prisma.material.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/admin/dashboard");
}

export default async function AdminDashboard() {
  // 1. Oturum Kontrolü
  const session = await auth();
  if (!session?.user || !["ADMIN", "MODERATOR"].includes(session.user.role)) {
    redirect("/admin/login");
  }

  // 2. İstatistikleri ve Onay Bekleyenleri Çek
  const [pendingMaterials, totalApproved, totalRejected] = await Promise.all([
    prisma.material.findMany({
      where: { status: { in: ["UPLOAD_PENDING", "PROCESSING"] } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.material.count({ where: { status: "APPROVED" } }),
    prisma.material.count({ where: { status: "REJECTED" } }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col h-auto md:h-screen sticky top-0">
        <div className="p-6 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-2">
            <ShieldAlert className="text-[#e11d48]" size={24} />
            <span className="text-xl font-bold text-white tracking-tight">Admin Paneli</span>
          </Link>
          <p className="text-xs text-slate-500 mt-2">Hoş geldin, {session.user.name}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin/dashboard" className="flex items-center gap-3 bg-slate-800 text-white px-4 py-3 rounded-xl font-medium transition-colors">
            <Clock size={18} /> Onay Bekleyenler
          </Link>
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium hover:bg-slate-800 hover:text-white transition-colors">
            <FileText size={18} /> Siteye Dön
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          {/* Gelecekte Logout formuna dönüştürülebilir */}
          <Link href="/api/auth/signout" className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-rose-400 hover:bg-rose-500/10 transition-colors">
            <LogOut size={18} /> Çıkış Yap
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">İçerik Moderasyonu</h1>
          <p className="text-slate-500 mt-2">Kullanıcılar tarafından yüklenen materyalleri inceleyin ve onaylayın.</p>
        </header>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-xl"><Clock size={24} /></div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Bekleyen İşlem</p>
              <p className="text-2xl font-black text-slate-900">{pendingMaterials.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 size={24} /></div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Onaylanan</p>
              <p className="text-2xl font-black text-slate-900">{totalApproved}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-rose-50 text-rose-600 rounded-xl"><XCircle size={24} /></div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Reddedilen</p>
              <p className="text-2xl font-black text-slate-900">{totalRejected}</p>
            </div>
          </div>
        </div>

        {/* Tablo Alanı */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">İşlem Bekleyen Materyaller</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Materyal Adı</th>
                  <th className="px-6 py-4">Yükleyen</th>
                  <th className="px-6 py-4">Kategori / Sınıf</th>
                  <th className="px-6 py-4">Dosya</th>
                  <th className="px-6 py-4 text-right">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Şu an onay bekleyen herhangi bir materyal bulunmuyor. 🎉
                    </td>
                  </tr>
                ) : (
                  pendingMaterials.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 truncate max-w-xs" title={item.title}>
                        {item.title}
                        <div className="text-xs text-slate-500 font-normal mt-1">{item.status}</div>
                      </td>
                      <td className="px-6 py-4">{item.authorName}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <a href={item.fileUrl || "#"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#0284c7] hover:underline">
                          <Download size={14} /> İncele
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <form action={updateMaterialStatus}>
                            <input type="hidden" name="id" value={item.id} />
                            <input type="hidden" name="status" value="REJECTED" />
                            <button type="submit" className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Reddet">
                              <XCircle size={20} />
                            </button>
                          </form>
                          <form action={updateMaterialStatus}>
                            <input type="hidden" name="id" value={item.id} />
                            <input type="hidden" name="status" value="APPROVED" />
                            <button type="submit" className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" title="Onayla">
                              <CheckCircle2 size={20} />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}