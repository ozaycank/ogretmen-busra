"use client";

import React, { useState, useTransition } from "react";
import { User, Role } from "@prisma/client";
import { createStaffMember, unlockUserAccount, deleteStaffMember } from "@/app/admin/users/actions";
import { Shield, ShieldAlert, Key, Trash2, Plus, X, Loader2, LockOpen } from "lucide-react";

interface StaffTableProps {
  staffList: User[];
}

export default function StaffTable({ staffList }: StaffTableProps) {
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await createStaffMember(formData);
      if (res.success) setIsModalOpen(false);
      else setError(res.error || "Hata oluştu");
    });
  };

  const handleUnlock = (id: string) => {
    if (confirm("Bu hesabın kilidini açmak istediğinize emin misiniz?")) {
      startTransition(() => { unlockUserAccount(id); });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Bu personeli sistemden kalıcı olarak silmek istediğinize emin misiniz?")) {
      startTransition(() => { deleteStaffMember(id); });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors">
          <Plus size={18} /> Yeni Personel Ekle
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Personel</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Rol</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Durum</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staffList.map((user) => {
              const isLocked = user.lockedUntil && new Date(user.lockedUntil) > new Date();
              
              return (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${user.role === Role.ADMIN ? "bg-indigo-100 text-indigo-700 border-indigo-200" : "bg-sky-100 text-sky-700 border-sky-200"}`}>
                      <Shield size={12} /> {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {isLocked ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200">
                        <ShieldAlert size={12} /> Kilitli (Brute-Force)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">
                        Aktif
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {isLocked && (
                        <button onClick={() => handleUnlock(user.id)} disabled={isPending} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Kilidi Aç">
                          <LockOpen size={18} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(user.id)} disabled={isPending} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Sil">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal: Yeni Personel Ekle */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">Sistem Yetkilisi Ekle</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            
            {error && <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-sm font-bold rounded-xl border border-rose-100">{error}</div>}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Ad Soyad</label>
                <input required name="name" type="text" className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">E-posta</label>
                <input required name="email" type="email" className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Yetki Rolü</label>
                <select required name="role" className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 outline-none focus:ring-2 focus:ring-sky-500">
                  <option value={Role.MODERATOR}>MODERATOR (Sadece Onay/Red Yapar)</option>
                  <option value={Role.ADMIN}>ADMIN (Tam Yetkili)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Geçici Şifre</label>
                <input required name="password" type="text" placeholder="En az 8 karakter" className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-sky-500" />
              </div>

              <button type="submit" disabled={isPending} className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 disabled:opacity-50">
                {isPending ? <Loader2 className="animate-spin" size={20} /> : "Personeli Kaydet"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}