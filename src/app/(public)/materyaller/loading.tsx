import React from "react";
import SkeletonCard from "@/components/ui/Skeleton";

export default function MaterialsLoading() {
  return (
    <div className="flex flex-col md:flex-row gap-8 items-start pb-12 animate-pulse">
      {/* Sidebar Skeleton */}
      <div className="w-full md:w-64 flex-shrink-0 bg-white border border-slate-100 rounded-3xl h-[600px] shadow-sm" />

      {/* Main Content Skeleton */}
      <div className="flex-1 w-full space-y-8">
        <div className="space-y-4">
          <div className="h-10 w-64 bg-slate-200 rounded-lg" />
          <div className="h-6 w-96 bg-slate-200 rounded-lg" />
          <div className="h-14 w-full max-w-2xl bg-slate-200 rounded-2xl mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}