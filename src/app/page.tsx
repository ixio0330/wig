"use client";

import { useMockData } from "@/context/MockDataContext";
import {
  Calendar,
  Check,
  Settings,
  Target,
  User as UserIcon,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { user, scoreboard, updateLog, logout } = useMockData();
  const router = useRouter();

  // Get current week dates (Mon-Sun)
  const [weekDates, setWeekDates] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }

    const today = new Date();
    const day = today.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(today.setDate(diff));

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d.toISOString().split("T")[0]);
    }
    setWeekDates(dates);
  }, [user, router]);

  if (!user || !scoreboard) return null;

  return (
    <div className="min-h-screen bg-background font-pretendard">
      <div className="max-w-[1000px] mx-auto p-8 space-y-12 animate-linear-in">
        {/* Header */}
        <header className="flex justify-between items-end border-b border-border pb-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </span>
              {user.nickname}님의 점수판
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 bg-sub-background rounded-md border border-border">
              <Settings className="w-4 h-4 text-text-muted" />
            </button>
            <button
              onClick={logout}
              className="p-2 bg-sub-background rounded-md border border-border"
            >
              <UserIcon className="w-4 h-4 text-text-muted" />
            </button>
          </div>
        </header>

        {/* Compact WIG Section */}
        <section className="card-linear px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-[0.1em]">
              <Zap className="w-3.5 h-3.5" />
              가중목
            </div>
            <h2 className="text-xl font-bold text-text-primary tracking-tight leading-none">
              {scoreboard.goalName}
            </h2>
          </div>

          <div className="flex-1 md:border-l md:border-border md:pl-8">
            <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-[0.1em]">
              후행지표
            </div>
            <div className="text-base font-bold text-text-primary font-inter mt-1">
              {scoreboard.lagMeasure}
            </div>
          </div>
        </section>

        {/* Lead Measures Table */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Calendar className="w-4 h-4 text-text-muted" />
              주간 선행지표
            </h3>
            <span className="text-[11px] text-text-muted bg-sub-background px-2 py-1 rounded border border-border">
              {weekDates[0]} ~ {weekDates[6]}
            </span>
          </div>

          <div className="card-linear overflow-hidden border-border transition-none">
            <table className="w-full text-left border-collapse table-fixed">
              <colgroup>
                <col className="w-auto" />
                <col className="w-[8%]" />
                <col className="w-[8%]" />
                <col className="w-[8%]" />
                <col className="w-[8%]" />
                <col className="w-[8%]" />
                <col className="w-[8%]" />
                <col className="w-[8%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead>
                <tr className="bg-sub-background border-b border-border">
                  <th className="py-4 px-6 text-[11px] font-bold text-text-muted uppercase tracking-widest">
                    선행지표 항목
                  </th>
                  {["월", "화", "수", "목", "금", "토", "일"].map((day, i) => (
                    <th
                      key={i}
                      className="py-4 px-1 text-center text-[11px] font-bold text-text-muted uppercase tracking-widest"
                    >
                      {day}
                    </th>
                  ))}
                  <th className="py-4 px-6 text-center text-[11px] font-bold text-text-muted uppercase tracking-widest">
                    달성률
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {scoreboard.leadMeasures.map((lm) => {
                  const achievedCount = weekDates.filter(
                    (date) => lm.logs.find((l) => l.logDate === date)?.value,
                  ).length;
                  const rate = Math.round(
                    (achievedCount / lm.targetValue) * 100,
                  );

                  return (
                    <tr key={lm.id} className="bg-white">
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-bold text-text-primary truncate">
                            {lm.name}
                          </span>
                          <span className="text-[11px] text-text-muted">
                            목표: 주 {lm.targetValue}회
                          </span>
                        </div>
                      </td>
                      {weekDates.map((date) => {
                        const log = lm.logs.find((l) => l.logDate === date);
                        const isAchieved = log?.value;

                        return (
                          <td key={date} className="py-4 px-1 text-center">
                            <button
                              onClick={() =>
                                updateLog(lm.id, date, !isAchieved)
                              }
                              className={`
                                w-8 h-8 mx-auto rounded-md flex items-center justify-center transition-all duration-200
                                ${
                                  isAchieved
                                    ? "bg-primary text-white scale-100"
                                    : "bg-sub-background text-text-muted/30 border border-border select-none active:bg-primary/5"
                                }
                              `}
                            >
                              {isAchieved ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <span className="text-[10px] font-bold">X</span>
                              )}
                            </button>
                          </td>
                        );
                      })}
                      <td className="py-5 px-6 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="w-12 h-1.5 bg-sub-background rounded-full overflow-hidden border border-border">
                            <div
                              className={`h-full transition-all duration-500 ${rate >= 100 ? "bg-accent" : "bg-primary"}`}
                              style={{ width: `${Math.min(rate, 100)}%` }}
                            />
                          </div>
                          <span
                            className={`text-[10px] font-bold font-inter ${rate >= 100 ? "text-accent" : "text-text-primary"}`}
                          >
                            {rate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
