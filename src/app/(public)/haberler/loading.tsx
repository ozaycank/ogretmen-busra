import React from "react";
import SkeletonCard from "@/shared/ui/Skeleton";

export default function NewsLoading() {
  return (
    <div className="max-w-6xl mx-auto pb-12 animate-pulse">
      <div className="mb-10 text-center md:text-left">
        <div className="h-12 w-64 bg-slate-200 rounded-xl mb-4 mx-auto md:mx-0" />
        <div className="h-6 w-96 bg-slate-200 rounded-lg mx-auto md:mx-0" />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-24 bg-slate-200 rounded-full" />
          ))}
        </div>
        <div className="h-10 w-full md:w-72 bg-slate-200 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 h-80 bg-slate-200 rounded-3xl" />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}