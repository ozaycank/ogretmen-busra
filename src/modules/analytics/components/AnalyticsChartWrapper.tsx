import React from "react";
import ClientChart from "./ClientChart";
import { AnalyticsService } from "../services/analytics.service";

export default async function AnalyticsChartWrapper() {
  const data = await AnalyticsService.getWeeklyTraffic();

  return <ClientChart data={data} />;
}