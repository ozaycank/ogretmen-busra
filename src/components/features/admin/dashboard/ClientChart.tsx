"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ChartProps {
  data: Array<{ name: string; indirme: number; goruntulenme: number }>;
}

export default function ClientChart({ data }: ChartProps) {
  return (
    <div className="h-80 w-full">
      {/* ÇÖZÜM BURADA: width="99%" ve height={320} olarak değiştirildi */}
      <ResponsiveContainer width="99%" height={320}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIndirme" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorGoruntulenme" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
          />
          <Area type="monotone" dataKey="goruntulenme" name="Görüntülenme" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorGoruntulenme)" />
          <Area type="monotone" dataKey="indirme" name="İndirme" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorIndirme)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}