import { prisma } from "@/infrastructure/database/prisma";
import MaterialCard from "@/modules/materials/components/MaterialCard";
import { FileStatus } from "@prisma/client"; 

export default async function LatestMaterials() {
  // Veritabanından sadece ONAYLI olan son 6 materyali çek
  const materials = await prisma.material.findMany({
    where: { status: FileStatus.APPROVED }, // DÜZELTİLDİ
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  if (materials.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-3xl text-slate-500">
        Henüz materyal eklenmemiş. İlk ekleyen siz olun!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {materials.map((material) => (
        <MaterialCard key={material.id} material={material} />
      ))}
    </div>
  );
}