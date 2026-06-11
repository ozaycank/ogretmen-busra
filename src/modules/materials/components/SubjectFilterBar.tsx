"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { GradeLevel } from "@prisma/client";
import { CURRICULUM_MAP, formatSubject } from "@/shared/constants/curriculum";

export default function SubjectFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  const currentGrade = searchParams.get("grade") as GradeLevel | null;
  const currentSubject = searchParams.get("subject") || "TUM_DERSLER";

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!currentGrade) return null;

  if (!isReady) {
    return <div className="w-full mb-8 h-[48px]" />;
  }

  const subjects = CURRICULUM_MAP[currentGrade] || [];

  const updateSubject = (subjectKey: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (subjectKey === "TUM_DERSLER") {
      params.delete("subject");
    } else {
      params.set("subject", subjectKey);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full relative mb-8 min-h-[48px] animate-in fade-in slide-in-from-top-4 duration-500">
      <div 
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {subjects.map((subjectKey) => {
          const isActive = currentSubject === subjectKey;
          return (
            <button
              key={subjectKey}
              onClick={() => updateSubject(subjectKey)}
              className={`flex-shrink-0 snap-start px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 border ${
                isActive 
                  ? "bg-slate-900 text-white border-slate-900 shadow-md transform scale-105" 
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {formatSubject(subjectKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
}