"use client";

import { useMockData } from "@/context/MockDataContext";
import {
  Activity,
  Archive,
  ArrowLeft,
  Plus,
  Save,
  Target,
  Trash2,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Re-defining here as it's a core type for this page's logic
type MeasureInput = {
  id: number;
  name: string;
  period: "WEEKLY" | "MONTHLY";
  targetValue: number;
};

export default function SetupPage() {
  const {
    scoreboard,
    createScoreboard,
    updateScoreboard,
    deleteScoreboard,
    archiveScoreboard,
  } = useMockData();
  const router = useRouter();

  const param = useParams<{ mode: string }>(); // Get mode parameter
  const mode = param?.mode;

  const [goalName, setGoalName] = useState("");
  const [lagMeasure, setLagMeasure] = useState("");
  const [measures, setMeasures] = useState<MeasureInput[]>([]);

  const isEditMode = !!scoreboard || mode === "update"; // Updated isEditMode logic

  useEffect(() => {
    if (isEditMode && scoreboard) {
      setGoalName(scoreboard.goalName);
      setLagMeasure(scoreboard.lagMeasure);
      setMeasures(
        scoreboard.leadMeasures.map((lm) => ({
          id: Math.random(), // Simple ID for client-side keys
          name: lm.name,
          // Period can be "DAILY" in the backend, but we converted it to "WEEKLY" in the UI for simplicity
          // So if it's DAILY, default to WEEKLY for editing.
          period: lm.period === "DAILY" ? "WEEKLY" : lm.period,
          targetValue: lm.targetValue,
        })),
      );
    } else {
      // For new scoreboards, start with one empty lead measure
      setMeasures([
        { id: Date.now(), name: "", period: "WEEKLY", targetValue: 3 },
      ]);
    }
  }, [isEditMode, scoreboard]);

  const handleMeasureChange = (
    id: number,
    field: keyof MeasureInput,
    value: string | number | "WEEKLY" | "MONTHLY",
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
    // Keep at least one row
    if (measures.length > 1) {
      setMeasures((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validMeasures = measures.filter((m) => m.name.trim() !== "");

    if (!goalName.trim() || !lagMeasure.trim() || validMeasures.length === 0) {
      alert(
        "가중목, 후행지표, 그리고 최소 1개의 선행지표를 모두 입력해야 합니다.",
      );
      return;
    }

    if (isEditMode) {
      // --- EDIT LOGIC ---
      updateScoreboard(goalName, lagMeasure, validMeasures);
    } else {
      // --- CREATE LOGIC ---
      createScoreboard(goalName, lagMeasure, validMeasures);
    }
    router.push("/dashboard");
  };

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

        <header className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
            <Target className="w-3.5 h-3.5" />
            점수판 설정
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            {isEditMode ? "현재 목표 수정하기" : "새로운 목표 설정하기"}
          </h1>
          <p className="text-[13px] text-text-muted leading-relaxed">
            하나의 목표(WIG), 성공 척도(후행지표), 그리고 핵심 행동(선행지표)을
            모두 여기서 설정하세요.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1 & 2: WIG and Lag Measure */}
          <section className="card-linear p-8 space-y-10">
            <div className="space-y-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-text-primary tracking-wide">
                <Zap className="w-4 h-4 text-primary" />
                1. 가중목
              </h3>
              <div className="space-y-2">
                <label className="text-sm block font-bold text-text-primary ml-0.5">
                  가장 중요한 목표는 무엇인가요?
                </label>
                <input
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="예: 연말까지 영업이익 20% 증대"
                  className="w-full text-base p-3 bg-sub-background border border-border rounded-xl focus:border-primary outline-none transition-all placeholder:text-text-muted/40"
                  required
                />
              </div>
            </div>

            <div className="space-y-5 pt-10 border-t border-border">
              <h3 className="flex items-center gap-2 text-sm font-bold text-text-primary tracking-wide">
                <TrendingUp className="w-4 h-4 text-success" />
                2. 후행지표
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm block font-bold text-text-primary ml-0.5">
                    성공을 어떻게 측정할 건가요? (X에서 Y로)
                  </label>
                  <div className="group relative">
                    <div className="cursor-help flex items-center gap-1.5 text-[10px] bg-sub-background px-2 py-1 rounded-md text-text-muted font-bold transition-colors hover:text-primary hover:bg-primary/5">
                      <Target className="w-3 h-3" />
                      지표 가이드
                    </div>
                    {/* Tooltip */}
                    <div className="absolute right-0 bottom-full mb-2 w-64 p-4 bg-white border border-border rounded-xl shadow-xl shadow-black/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <div className="text-xs font-bold text-text-primary mb-2">
                        좋은 후행지표의 요건
                      </div>
                      <ul className="space-y-2">
                        <li className="flex gap-2 text-[11px] text-text-muted leading-relaxed">
                          <span className="text-success font-bold">1.</span>
                          <div>
                            <b className="text-text-primary">측정 가능성:</b>{" "}
                            명확한 시작점(X)과 목표점(Y)이 있나요?
                          </div>
                        </li>
                        <li className="flex gap-2 text-[11px] text-text-muted leading-relaxed">
                          <span className="text-success font-bold">2.</span>
                          <div>
                            <b className="text-text-primary">결과 중심:</b> 최종
                            목표 달성 여부를 보여주나요?
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <input
                  value={lagMeasure}
                  onChange={(e) => setLagMeasure(e.target.value)}
                  placeholder="예: 1,000만 원에서 1,200만 원으로"
                  className="w-full text-base p-3 bg-sub-background border border-border rounded-xl focus:border-primary outline-none transition-all placeholder:text-text-muted/40"
                  required
                />
              </div>
            </div>
          </section>

          {/* Section 3: Lead Measures */}
          <section className="card-linear p-8 space-y-8">
            <h3 className="flex items-center gap-2 text-sm font-bold text-text-primary tracking-wide">
              <Activity className="w-4 h-4 text-rose-500" />
              3. 선행지표
            </h3>
            <p className="text-xs text-text-muted -mt-6 ml-7">
              후행지표에 가장 큰 영향을 미치는 예측 가능하고 통제 가능한
              행동들입니다.
            </p>

            <div className="space-y-8">
              {measures.map((measure, index) => (
                <div
                  key={measure.id}
                  className="space-y-6 border-t border-border pt-8"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-text-primary">
                      핵심 행동 #{index + 1}
                    </h4>
                    {measures.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMeasureRow(measure.id)}
                        className="text-xs text-red-500 font-bold px-2 py-1 rounded-md hover:bg-red-500/10 transition-colors"
                      >
                        삭제
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm block font-bold text-text-primary ml-0.5">
                        어떤 행동을 반복할까요?
                      </label>
                      <div className="group relative">
                        <div className="cursor-help flex items-center gap-1.5 text-[10px] bg-sub-background px-2 py-1 rounded-md text-text-muted font-bold transition-colors hover:text-primary hover:bg-primary/5">
                          <Target className="w-3 h-3" />
                          4DX 지표 가이드
                        </div>
                        <div className="absolute right-0 bottom-full mb-2 w-64 p-4 bg-white border border-border rounded-xl shadow-xl shadow-black/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                          <div className="text-xs font-bold text-text-primary mb-2">
                            좋은 선행지표의 요건
                          </div>
                          <ul className="space-y-2">
                            <li className="flex gap-2 text-[11px] text-text-muted leading-relaxed">
                              <span className="text-rose-500 font-bold">
                                1.
                              </span>
                              <div>
                                <b className="text-text-primary">예측성:</b> 이
                                행동이 후행지표를 움직일까요?
                              </div>
                            </li>
                            <li className="flex gap-2 text-[11px] text-text-muted leading-relaxed">
                              <span className="text-rose-500 font-bold">
                                2.
                              </span>
                              <div>
                                <b className="text-text-primary">영향력:</b>{" "}
                                팀이 직접 통제하고 실행할 수 있나요?
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <input
                      value={measure.name}
                      onChange={(e) =>
                        handleMeasureChange(measure.id, "name", e.target.value)
                      }
                      placeholder="예: 주 5회 핵심 고객에게 연락"
                      className="w-full text-base p-3 bg-sub-background border border-border rounded-xl focus:border-primary outline-none transition-all placeholder:text-text-muted/40"
                      required
                    />
                  </div>

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
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addMeasureRow}
              className="w-full border-2 border-dashed border-border hover:border-primary hover:text-primary text-text-muted transition-all rounded-xl py-2.5 text-sm font-bold"
            >
              <Plus className="w-4 h-4 inline-block -mt-0.5 mr-1" />
              핵심 행동 추가하기
            </button>
          </section>

          {/* Submit Button */}
          <div className="space-y-10 pt-4">
            <button
              type="submit"
              className="w-full btn-linear-primary py-3.5 flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-primary/10"
            >
              <Save className="w-4 h-4" />
              <span>
                {isEditMode ? "변경사항 저장하기" : "점수판 생성하기"}
              </span>
            </button>

            {/* Danger Zone */}
            {isEditMode && (
              <div className="space-y-6 pt-10 border-t border-border">
                <h3 className="text-sm font-bold text-danger">위험 구역</h3>
                <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-text-primary">
                        점수판 보관하기
                      </div>
                      <div className="text-xs text-text-muted leading-relaxed">
                        현재 목표를 안전하게 종료하고 실행 기록으로 저장합니다.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("이 점수판을 보관하시겠습니까?")) {
                          archiveScoreboard();
                          router.push("/dashboard");
                        }
                      }}
                      className="px-4 py-2 border border-border text-text-muted hover:text-text-primary hover:bg-sub-background rounded-lg text-xs font-bold transition-colors flex items-center gap-2 h-fit"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      보관
                    </button>
                  </div>

                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-danger">
                        점수판 삭제하기
                      </div>
                      <div className="text-xs text-text-muted leading-relaxed">
                        이 점수판과 관련된 모든 기록을 영구히 삭제합니다.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm("정말 이 점수판을 영구 삭제하시겠습니까?")
                        ) {
                          deleteScoreboard();
                          router.push("/dashboard");
                        }
                      }}
                      className="px-4 py-2 bg-danger text-white rounded-lg text-xs font-bold transition-transform active:scale-95 flex items-center gap-2 h-fit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
