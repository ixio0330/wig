"use client";

import {
  DashboardTeamMemo,
  TeamDashboardMember,
  TeamDashboardMemberRole,
} from "@/api/generated/wig.schemas";
import { AchievementProgress } from "@/app/(protected)/dashboard/_components/AchievementProgress";
import { useTeamMemos } from "@/app/(protected)/dashboard/_hooks/useTeamMemos";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { toNumberId } from "@/lib/client/frontend-api";
import { ArrowUp, Check, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

type WeeklyTableProps = {
  member: TeamDashboardMember;
  weekDates: string[];
  isMe?: boolean;
  memoMode?: "compose" | "view" | null;
  onToggleCompose?: () => void;
  onToggleView?: () => void;
  currentUserId?: number | null;
  currentUserNickname?: string | null;
  currentUserAvatarKey?: string | null;
  currentUserRole?: TeamDashboardMemberRole | null;
};

export function WeeklyTable({
  member,
  weekDates,
  isMe = false,
  memoMode = null,
  onToggleCompose,
  onToggleView,
  currentUserId,
  currentUserNickname,
  currentUserAvatarKey,
  currentUserRole,
}: WeeklyTableProps) {
  const [memoDraft, setMemoDraft] = useState("");
  const isSubmittingMemoRef = useRef(false);
  const memberUserId = toNumberId(member.userId);
  const {
    memos,
    isLoading: isMemosLoading,
    isFetching: isMemosFetching,
    isError: isMemosError,
    isCreatePending,
    isResolvePending,
    isDeletePending,
    createMemo,
    resolveMemo,
    deleteMemo,
  } = useTeamMemos({
    targetUserId: memberUserId,
    enabled: true,
    currentUser: {
      id: currentUserId,
      nickname: currentUserNickname,
      avatarKey: currentUserAvatarKey,
    },
  });

  if (
    !(member.hasScoreboard ?? false) ||
    (member.leadMeasures?.length ?? 0) === 0
  ) {
    return null;
  }

  const today = new Date().toISOString().split("T")[0];
  const hasMemos = memos.length > 0;
  const isComposeMode = memoMode === "compose";
  const shouldShowMemoRail = memoMode !== null;
  const handleAddMemo = async () => {
    if (isSubmittingMemoRef.current || isCreatePending) {
      return;
    }

    const content = memoDraft.trim();
    if (!content) {
      return;
    }

    isSubmittingMemoRef.current = true;

    try {
      const isSuccess = await createMemo(content);

      if (isSuccess) {
        setMemoDraft("");
      }
    } finally {
      isSubmittingMemoRef.current = false;
    }
  };
  const handleResolveMemo = async (memo: DashboardTeamMemo) => {
    await resolveMemo(memo.id, !memo.isResolved);
  };
  const handleDeleteMemo = async (memoId: number) => {
    await deleteMemo(memoId);
  };

  return (
    <div className="relative space-y-2 xl:pr-0">
      <div className="px-1">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <UserAvatar
              avatarKey={member.avatarKey}
              alt={`${member.nickname ?? "사용자"} 아바타`}
              size={20}
              className="rounded-md"
              fallbackClassName="rounded-md"
              imageClassName="rounded-md"
            />
            <span className="truncate text-xs font-bold text-text-primary">
              {member.nickname}
            </span>
            {isMe ? (
              <span className="rounded border border-primary/25 bg-primary/10 px-1.5 py-0 text-[10px] font-bold text-primary">
                나
              </span>
            ) : null}
            <span className="truncate text-xs text-text-secondary">
              — {member.goalName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {hasMemos ? (
              <Button
                type="button"
                onClick={onToggleView}
                className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
                  memoMode === "view"
                    ? "border-primary/25 bg-primary/10 text-primary"
                    : "border-border bg-white text-text-secondary hover:border-[rgba(205,207,213,1)] hover:text-text-primary"
                }`}
              >
                메모보기
              </Button>
            ) : null}
            <Button
              type="button"
              onClick={onToggleCompose}
              className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
                isComposeMode
                  ? "border-primary/25 bg-primary/10 text-primary"
                  : "border-border bg-white text-text-secondary hover:border-[rgba(205,207,213,1)] hover:text-text-primary"
              }`}
            >
              메모하기
            </Button>
          </div>
        </div>
      </div>

      <div className="min-w-0 space-y-3">
          <div className="space-y-3 md:hidden">
            {member.leadMeasures?.map((leadMeasure) => {
              const achievedCount = leadMeasure.achieved ?? 0;
              const targetValue = leadMeasure.targetValue ?? 0;

              return (
                <div
                  key={`${member.userId}-${leadMeasure.id}-mobile`}
                  className="rounded-lg border border-border bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-primary">
                        {leadMeasure.name}
                      </p>
                      <p className="text-[11px] text-text-muted">
                        목표 {targetValue}회 /{" "}
                        {leadMeasure.period === "DAILY"
                          ? "일"
                          : leadMeasure.period === "WEEKLY"
                            ? "주"
                            : "월"}
                      </p>
                    </div>
                    <AchievementProgress
                      achievedCount={achievedCount}
                      targetValue={targetValue}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-7 gap-1.5">
                    {weekDates.map((date, index) => {
                      const value = leadMeasure.logs?.[date] ?? null;

                      return (
                        <div
                          key={`${member.userId}-${leadMeasure.id}-${date}-mobile`}
                          className="space-y-1 text-center"
                        >
                          <p
                            className={`text-[10px] font-bold ${
                              date === today ? "text-primary" : "text-text-muted"
                            }`}
                          >
                            {DAY_LABELS[index]}
                          </p>
                          <span
                            className={`inline-flex h-7 w-7 items-center justify-center text-sm font-bold ${
                              value === true
                                ? "text-green-600"
                                : date === today
                                  ? "text-primary/50"
                                  : "text-text-muted"
                            }`}
                          >
                            {value === true ? "○" : ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden overflow-hidden rounded-lg border border-border md:block">
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="bg-sub-background border-b border-border">
                  <table className="w-full table-fixed text-xs">
                    <colgroup>
                      <col className="w-[38%]" />
                      {DAY_LABELS.map((day) => (
                        <col key={day} className="w-[8%]" />
                      ))}
                      <col className="w-[14%]" />
                    </colgroup>
                    <thead>
                      <tr>
                        <th className="py-3 px-5 text-left text-[11px] font-bold text-text-muted uppercase tracking-widest">
                          선행지표
                        </th>
                        {DAY_LABELS.map((day, index) => (
                          <th
                            key={day}
                            className={`py-3 text-center text-[11px] font-bold uppercase tracking-widest ${
                              weekDates[index] === today
                                ? "text-primary"
                                : weekDates[index] > today
                                  ? "text-text-muted/50"
                                  : "text-text-muted"
                            }`}
                          >
                            {day}
                          </th>
                        ))}
                        <th className="py-3 px-3 text-center text-[11px] font-bold text-text-muted uppercase tracking-widest">
                          달성
                        </th>
                      </tr>
                    </thead>
                  </table>
                </div>

                <table className="w-full table-fixed text-xs">
                  <colgroup>
                    <col className="w-[38%]" />
                    {DAY_LABELS.map((day) => (
                      <col key={day} className="w-[8%]" />
                    ))}
                    <col className="w-[14%]" />
                  </colgroup>
                  <tbody className="divide-y divide-border">
                    {member.leadMeasures?.map((leadMeasure) => {
                      const achievedCount = leadMeasure.achieved ?? 0;
                      const targetValue = leadMeasure.targetValue ?? 0;
                      const rate =
                        targetValue > 0
                          ? Math.round((achievedCount / targetValue) * 100)
                          : 0;

                      return (
                        <tr key={leadMeasure.id} className="bg-white">
                          <td className="py-4 px-5">
                            <p className="block font-semibold text-text-primary truncate text-sm">
                              {leadMeasure.name}
                            </p>
                            <span className="text-[10px] text-text-muted">
                              목표 {targetValue}회 /{" "}
                              {leadMeasure.period === "DAILY"
                                ? "일"
                                : leadMeasure.period === "WEEKLY"
                                  ? "주"
                                  : "월"}
                            </span>
                          </td>
                          {weekDates.map((date) => {
                            const value = leadMeasure.logs?.[date] ?? null;

                            return (
                              <td key={date} className="py-3 text-center">
                                <span
                                  className={`inline-flex h-7 w-7 items-center justify-center text-sm font-bold ${
                                    value === true
                                      ? "text-green-600"
                                      : date === today
                                        ? "text-primary/50"
                                        : "text-text-muted"
                                  }`}
                                >
                                  {value === true ? "○" : ""}
                                </span>
                              </td>
                            );
                          })}
                          <td className="py-4 px-3 text-center">
                            <div className="flex flex-col items-center gap-1.5">
                              <div className="w-10 h-1 bg-sub-background rounded-full overflow-hidden border border-border">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    rate >= 100 ? "bg-green-500" : "bg-primary"
                                  }`}
                                  style={{ width: `${Math.min(rate, 100)}%` }}
                                />
                              </div>
                              <span
                                className={`text-[10px] font-bold font-mono ${
                                  rate >= 100
                                    ? "text-green-600"
                                    : "text-text-secondary"
                                }`}
                              >
                                {achievedCount}/{targetValue}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
      </div>

      {shouldShowMemoRail ? (
        <div className="space-y-3 xl:absolute xl:left-[calc(100%+20px)] xl:top-8 xl:w-[300px]">
          {isComposeMode ? (
            <Card className="rounded-2xl border border-border bg-white p-2.5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-2">
                <Input
                  value={memoDraft}
                  onChange={(event) => setMemoDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void handleAddMemo();
                    }
                  }}
                  placeholder="댓글 추가"
                  className="h-8 flex-1 border-0 bg-transparent px-2 text-xs text-text-primary outline-none placeholder:text-text-muted"
                  disabled={isCreatePending}
                />
                <Button
                  type="button"
                  onClick={() => void handleAddMemo()}
                  disabled={!memoDraft.trim() || isCreatePending}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary disabled:opacity-40"
                  aria-label="메모 등록"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ) : null}

          {isMemosLoading ? (
            <MemoStatusCard message="메모를 불러오는 중입니다." />
          ) : isMemosError ? (
            <MemoStatusCard message="메모를 불러오지 못했습니다." />
          ) : hasMemos ? (
            memos.map((memo) => {
              const canManageMemo =
                currentUserRole === TeamDashboardMemberRole.ADMIN ||
                memo.author.userId === currentUserId;

              return (
                <Card
                  key={memo.id}
                  className={`rounded-xl border px-4 py-3 transition-colors ${
                    memo.isResolved
                      ? "border-primary/20 bg-primary/5"
                      : "border-border bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <UserAvatar
                        avatarKey={memo.author.avatarKey}
                        alt={`${memo.author.nickname} 아바타`}
                        size={24}
                        className="rounded-md"
                        fallbackClassName="rounded-md"
                        imageClassName="rounded-md"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-xs font-bold text-text-primary">
                            {memo.author.nickname}
                          </p>
                          <span className="text-[11px] text-text-muted">
                            {formatRelativeTime(memo.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {canManageMemo ? (
                      <div className="flex items-center overflow-hidden rounded-lg border border-border bg-white">
                        <button
                          type="button"
                          onClick={() => void handleResolveMemo(memo)}
                          disabled={isResolvePending}
                          className={`inline-flex h-8 w-8 items-center justify-center transition-colors disabled:opacity-50 ${
                            memo.isResolved
                              ? "border-primary/25 bg-primary/10 text-primary"
                              : "text-text-muted hover:bg-sub-background hover:text-text-primary"
                          }`}
                          aria-label="댓글 확인"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteMemo(memo.id)}
                          disabled={isDeletePending}
                          className="inline-flex h-8 w-8 items-center justify-center border-l border-border text-text-muted transition-colors hover:bg-sub-background hover:text-red-500 disabled:opacity-50"
                          aria-label="댓글 삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <p
                    className={`mt-2 text-sm leading-6 ${
                      memo.isResolved
                        ? "text-text-secondary line-through"
                        : "text-text-primary"
                    }`}
                  >
                    {memo.content}
                  </p>
                </Card>
              );
            })
          ) : null
          }

          {isMemosFetching && !isMemosLoading ? (
            <p className="px-1 text-[11px] text-text-muted">
              메모를 새로고침하는 중입니다.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function MemoStatusCard({ message }: { message: string }) {
  return (
    <Card className="rounded-xl border border-border bg-white px-4 py-4">
      <p className="text-sm text-text-muted">{message}</p>
    </Card>
  );
}

function formatRelativeTime(createdAt: string) {
  const createdAtTime = new Date(createdAt).getTime();

  if (!Number.isFinite(createdAtTime)) {
    return "";
  }

  const diffMin = Math.floor((Date.now() - createdAtTime) / (1000 * 60));
  if (diffMin <= 0) {
    return "지금";
  }
  if (diffMin < 60) {
    return `${diffMin}분 전`;
  }

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return `${diffHour}시간 전`;
  }

  return `${Math.floor(diffHour / 24)}일 전`;
}
