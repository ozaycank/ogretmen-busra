import React from "react";
import { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import MaterialTable from "@/components/features/admin/materials/MaterialTable";
import { FileStatus } from "@prisma/client";

export const metadata: Metadata = {
  title: "Materyal Yönetimi | Admin",
};

const ITEMS_PER_PAGE = 20;

export default async function AdminMaterialsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const q = params.q || "";
  const statusFilter = params.status as FileStatus | undefined;
  const page = Number(params.page) || 1;
  const skip = (page - 1) * ITEMS_PER_PAGE;

  // Prisma Dinamik Arama Sorgusu
  const whereClause = {
    ...(statusFilter && { status: statusFilter }),
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { authorName: { contains: q, mode: "insensitive" as const } },
        { originalName: { contains: q, mode: "insensitive" as const } }
      ]
    })
  };

  // Paralel Veri Çekimi (Performans için)
  const [materials, totalCount] = await Promise.all([
    prisma.material.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.material.count({ where: whereClause })
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Materyal Kütüphanesi</h1>
          <p className="text-slate-500 mt-1">
            Sistemdeki toplam <span className="font-bold text-slate-700">{totalCount}</span> materyali buradan yönetebilirsiniz.
          </p>
        </div>
      </div>

      <MaterialTable materials={materials} totalCount={totalCount} />
      
      {/* Gelecekte buraya Pagination bileşeni eklenebilir */}
    </div>
  );
}