import React from "react";

export default function MaterialDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12 animate-pulse">
      <div className="h-4 w-64 bg-slate-200 rounded my-2" />
      
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm flex flex-col md:flex-row gap-10 items-start">
        <div className="w-full md:w-64 aspect-square bg-slate-200 rounded-3xl flex-shrink-0" />
        
        <div className="flex-1 w-full space-y-6">
          <div className="flex gap-2">
            <div className="h-6 w-24 bg-slate-200 rounded-full" />
            <div className="h-6 w-32 bg-slate-200 rounded-full" />
          </div>
          <div className="h-10 w-3/4 bg-slate-200 rounded-lg" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-slate-200 rounded" />
            <div className="h-4 w-full bg-slate-200 rounded" />
            <div className="h-4 w-2/3 bg-slate-200 rounded" />
          </div>
          <div className="h-14 w-full md:w-1/2 bg-slate-200 rounded-2xl mt-8" />
        </div>
      </div>
    </div>
  );
}