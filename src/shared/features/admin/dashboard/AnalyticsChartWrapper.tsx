import React from "react";
import { prisma } from "@/infrastructure/database/prisma";
import ClientChart from "./ClientChart";

export default async function AnalyticsChartWrapper() {
  // Gerçek senaryoda bu veri SiteStats tablosundan son 7 güne göre çekilir.
  // Prototip için mock veri üretiyoruz.
  const data = [
    { name: "Pzt", indirme: 400, goruntulenme: 2400 },
    { name: "Sal", indirme: 300, goruntulenme: 1398 },
    { name: "Çar", indirme: 200, goruntulenme: 9800 },
    { name: "Per", indirme: 278, goruntulenme: 3908 },
    { name: "Cum", indirme: 189, goruntulenme: 4800 },
    { name: "Cmt", indirme: 239, goruntulenme: 3800 },
    { name: "Paz", indirme: 349, goruntulenme: 4300 },
  ];

  return <ClientChart data={data} />;
}