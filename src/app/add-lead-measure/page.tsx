"use client";

import { useMockData } from "@/context/MockDataContext";
import { ArrowLeft, Save, Target, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddLeadMeasurePage() {
  const { scoreboard, addLeadMeasure } = useMockData();
  const router = useRouter();

  type MeasureInput = {
    id: number;
    name: string;
    period: "WEEKLY" | "MONTHLY";
    targetValue: number;
  };

  const [measures, setMeasures] = useState<MeasureInput[]>([
    { id: Date.now(), name: "", period: "WEEKLY", targetValue: 3 },
  ]);

  const handleMeasureChange = (
    id: number,
    field: keyof MeasureInput,
    value: string | number,
  ) => {
    setMeasures((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );
  };

  const addMeasureRow = () => {
    setMeasures((prev) => [
      ...prev,
      { id: Date.now(), name: "", period: "WEEKLY", targetValue: 3 },
    ]);
  };

  const removeMeasureRow = (id: number) => {
    setMeasures((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validMeasures = measures.filter((m) => m.name.trim() !== "");
    if (validMeasures.length === 0) return;

    validMeasures.forEach((m) => {
      addLeadMeasure(m.name, m.targetValue, m.period);
    });

    router.push("/dashboard");
  };

  if (!scoreboard) return null;

  return (
    <div className="min-h-screen bg-background font-pretendard py-12 px-4">
      <div className="max-w-[600px] mx-auto space-y-8 animate-linear-in">
        <nav>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            돌아가기
          </Link>
        </nav>

        {/* WIG Context Re-reminder */}
        <div className="rounded-lg border border-border bg-white shadow-sm shadow-black/5">
          {/* 가중목 (WIG) Section */}
          <div className="p-4">
            <div className="text-xs font-bold text-primary uppercase tracking-widest">
              현재 가중목
            </div>
            <div className="mt-1 text-base font-bold text-text-primary">
              {scoreboard.goalName}
            </div>
          </div>

          {/* Divider */}
          <div className="border-b border-border"></div>

          {/* 후행지표 (Lag Measure) Section */}
          <div className="p-4">
            <div className="text-xs font-bold text-text-muted">
              후행지표
            </div>
            <div className="mt-1 text-base text-text-secondary">
              {scoreboard.lagMeasure}
            </div>
          </div>
        </div>

        <header className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
            <Zap className="w-3.5 h-3.5" />
            선행지표 설계
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            새로운 행동 지표 추가하기
          </h1>
          <p className="text-[13px] text-text-muted leading-relaxed">
            목표를 달성하기 위해 매일 또는 매주 반복할 수 있는 '행동'을
            정의하세요. 한 번에 여러 지표를 추가할 수 있습니다.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-8">
            {measures.map((measure, index) => (
              <section
                key={measure.id}
                className="card-linear p-8 space-y-10 border-t pt-10"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-text-primary">
                    선행지표 #{index + 1}
                  </h2>
                  {measures.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMeasureRow(measure.id)}
                      className="text-xs text-red-500 font-bold"
                    >
                      삭제
                    </button>
                  )}
                </div>

                {/* Name Input */}
                <div className="space-y-4">
                  <label className="text-sm block font-bold text-text-primary ml-0.5">
                    어떤 행동을 반복할까요?
                  </label>
                  <input
                    value={measure.name}
                    onChange={(e) =>
                      handleMeasureChange(measure.id, "name", e.target.value)
                    }
                    placeholder="예: 주 3회 30분 달리기"
                    className="w-full text-base p-4 bg-sub-background border border-border rounded-2xl focus:border-primary outline-none transition-all placeholder:text-text-muted/30"
                    required
                  />
                </div>

                {/* Period Selection */}
                <div className="space-y-4">
                  <label className="text-sm block font-bold text-text-primary ml-0.5">
                    반복 주기
                  </label>
                  <div className="flex p-1 bg-sub-background rounded-2xl border border-border gap-1">
                    {(["WEEKLY", "MONTHLY"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          const newTarget = p === "WEEKLY" ? 3 : 1;
                          handleMeasureChange(measure.id, "period", p);
                          handleMeasureChange(
                            measure.id,
                            "targetValue",
                            newTarget,
                          );
                        }}
                        className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${
                          measure.period === p
                            ? "bg-white text-primary shadow-sm ring-1 ring-border/50"
                            : "text-text-muted hover:text-text-primary"
                        }`}
                      >
                        {p === "WEEKLY" ? "주 단위" : "월 단위"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Setting */}
                <div className="space-y-4">
                  <label className="text-sm block font-bold text-text-primary ml-0.5">
                    {measure.period === "WEEKLY"
                      ? "일주일에 몇 번 반복할까요?"
                      : "한 달에 몇 번 반복할까요?"}
                  </label>
                  <div className="flex items-center gap-6 bg-sub-background/50 p-4 rounded-2xl border border-border/50">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        max={measure.period === "WEEKLY" ? 7 : 31}
                        value={measure.targetValue}
                        onChange={(e) =>
                          handleMeasureChange(
                            measure.id,
                            "targetValue",
                            parseInt(e.target.value) || 1,
                          )
                        }
                        className="w-16 text-center text-xl p-2 bg-white border border-border rounded-xl focus:border-primary outline-none transition-all font-bold shadow-sm"
                      />
                      <span className="text-sm font-bold text-text-primary">
                        회 실행
                      </span>
                    </div>
                    <div className="h-4 w-px bg-border mx-2" />
                    <p className="text-[11px] text-text-muted font-medium leading-relaxed">
                      {measure.period === "WEEKLY"
                        ? "일주일 동안의 목표 횟수를 설정합니다."
                        : "한 달 동안의 목표 횟수를 설정합니다."}
                    </p>
                  </div>
                </div>
              </section>
            ))}
          </div>

          <div className="space-y-4 pt-4">
            <button
              type="button"
              onClick={addMeasureRow}
              className="w-full border-2 border-dashed border-border hover:border-primary hover:text-primary text-text-muted transition-all rounded-2xl py-3 text-sm font-bold"
            >
              + 다른 지표 추가하기
            </button>
            <button
              type="submit"
              className="w-full btn-linear-primary py-4 flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-primary/10 transition-all hover:translate-y-[-1px] active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              <span>선행지표 저장하기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
