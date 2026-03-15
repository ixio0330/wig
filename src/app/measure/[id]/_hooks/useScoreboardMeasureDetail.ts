"use client";

import { useGetScoreboardsActive } from "@/api/generated/scoreboard/scoreboard";
import {
  getGetScoreboardsScoreboardIdLeadMeasuresQueryKey,
  useDeleteLeadMeasuresId,
  useGetScoreboardsScoreboardIdLeadMeasures,
  usePostLeadMeasuresIdArchive,
} from "@/api/generated/lead-measure/lead-measure";
import { useGetScoreboardsScoreboardIdLogsWeekly } from "@/api/generated/daily-log/daily-log";
import { useToast } from "@/context/ToastContext";
import { getApiErrorMessage, toNumberId } from "@/lib/client/frontend-api";
import { useQueryClient } from "@tanstack/react-query";

export const useScoreboardMeasureDetail = (rawMeasureId: string) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const measureId = toNumberId(rawMeasureId);

  const { data: activeScoreboardResponse } = useGetScoreboardsActive({
    query: {
      retry: false,
    },
  });

  const activeScoreboard =
    activeScoreboardResponse?.status === 200 ? activeScoreboardResponse.data : null;
  const scoreboardId = toNumberId(activeScoreboard?.id);

  const { data: leadMeasuresResponse } = useGetScoreboardsScoreboardIdLeadMeasures(
    scoreboardId ?? 0,
    undefined,
    {
      query: {
        enabled: scoreboardId !== null,
      },
    },
  );

  const { data: weeklyLogsResponse } = useGetScoreboardsScoreboardIdLogsWeekly(
    scoreboardId ?? 0,
    undefined,
    {
      query: {
        enabled: scoreboardId !== null,
      },
    },
  );

  const archiveLeadMeasureMutation = usePostLeadMeasuresIdArchive();
  const deleteLeadMeasureMutation = useDeleteLeadMeasuresId();

  const measure =
    leadMeasuresResponse?.status === 200
      ? (leadMeasuresResponse.data ?? []).find(
          (leadMeasure) => toNumberId(leadMeasure.id) === measureId,
        )
      : null;

  const weeklyMeasure =
    weeklyLogsResponse?.status === 200
      ? (weeklyLogsResponse.data.leadMeasures ?? []).find(
          (leadMeasure) => toNumberId(leadMeasure.id) === measureId,
        )
      : null;

  const chartData = [
    { name: "4주 전", rate: 60 },
    { name: "3주 전", rate: 85 },
    { name: "2주 전", rate: 45 },
    { name: "지난 주", rate: 90 },
    {
      name: "이번 주",
      rate: weeklyMeasure?.achievementRate ?? 0,
    },
  ];

  const invalidateLeadMeasures = async () => {
    if (scoreboardId !== null) {
      await queryClient.invalidateQueries({
        queryKey: getGetScoreboardsScoreboardIdLeadMeasuresQueryKey(
          scoreboardId,
          undefined,
        ),
      });
    }
  };

  const archive = async () => {
    if (measureId === null) {
      return false;
    }

    try {
      await archiveLeadMeasureMutation.mutateAsync({ id: measureId });
      await invalidateLeadMeasures();
      return true;
    } catch (error) {
      showToast(
        "error",
        getApiErrorMessage(error, "지표 보관에 실패했습니다."),
      );
      return false;
    }
  };

  const remove = async () => {
    if (measureId === null) {
      return false;
    }

    try {
      await deleteLeadMeasureMutation.mutateAsync({ id: measureId });
      await invalidateLeadMeasures();
      return true;
    } catch (error) {
      showToast(
        "error",
        getApiErrorMessage(error, "지표 삭제에 실패했습니다."),
      );
      return false;
    }
  };

  return {
    chartData,
    measure,
    measureId,
    remove,
    archive,
  };
};
