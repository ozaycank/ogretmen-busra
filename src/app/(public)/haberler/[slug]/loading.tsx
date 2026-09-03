import React from "react";

export default function NewsDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-10 animate-pulse">
      {/* Breadcrumb */}
      <div className="h-4 w-64 bg-slate-200 rounded my-2" />

      {/* Header */}
      <div className="space-y-6">
        <div className="h-8 w-24 bg-rose-100 rounded-full" />
        <div className="space-y-3">
          <div className="h-10 w-full bg-slate-200 rounded-lg" />
          <div className="h-10 w-3/4 bg-slate-200 rounded-lg" />
        </div>
        <div className="h-8 w-full bg-slate-100 rounded-lg border-y border-slate-50" />
      </div>

      {/* Görsel */}
      <div className="w-full aspect-[21/9] bg-slate-200 rounded-3xl" />

      {/* İçerik */}
      <div className="space-y-4 pt-4">
        <div className="h-4 w-full bg-slate-200 rounded" />
        <div className="h-4 w-full bg-slate-200 rounded" />
        <div className="h-4 w-11/12 bg-slate-200 rounded" />
        <div className="h-4 w-full bg-slate-200 rounded" />
        <div className="h-4 w-4/5 bg-slate-200 rounded" />
      </div>
    </div>
  );
}