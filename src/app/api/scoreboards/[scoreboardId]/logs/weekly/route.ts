import { getDb } from "@/db";
import { DailyLogService } from "@/domain/daily-log/services/daily-log.service";
import { DailyLogStorage } from "@/domain/daily-log/storage/daily-log.storage";
import {
  scoreboardLogsParamSchema,
  weeklyLogsQuerySchema,
} from "@/domain/daily-log/validation";
import { LeadMeasureStorage } from "@/domain/lead-measure/storage/lead-measure.storage";
import { ScoreboardStorage } from "@/domain/scoreboard/storage/scoreboard.storage";
import { WorkspaceStorage } from "@/domain/workspace/storage/workspace.storage";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { withErrorHandler } from "@/lib/with-error-handler";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const GET = withErrorHandler(
  async (
    request: Request,
    context: { params: Promise<{ scoreboardId: string }> },
  ) => {
    const { env } = getCloudflareContext();
    const db = getDb(env.DB);
    const session = await getSession(db);

    if (!session) {
      return apiError("UNAUTHORIZED");
    }

    const params = scoreboardLogsParamSchema.safeParse(await context.params);
    const query = weeklyLogsQuerySchema.safeParse(
      Object.fromEntries(new URL(request.url).searchParams.entries()),
    );

    if (!params.success || !query.success) {
      return apiError("VALIDATION_ERROR", {
        ...(params.success ? {} : params.error.flatten().fieldErrors),
        ...(query.success ? {} : query.error.flatten().fieldErrors),
      });
    }

    const service = new DailyLogService(
      new WorkspaceStorage(db),
      new ScoreboardStorage(db),
      new LeadMeasureStorage(db),
      new DailyLogStorage(db),
    );

    const result = await service.getWeeklyLogs(
      params.data.scoreboardId,
      session.userId,
      query.data.weekStart,
    );

    return apiSuccess(result);
  },
);
