import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const weeklyFocusChoiceSchema = z.object({
  selectedLeadMeasureId: z.number().int(),
});

export async function breakWeeklyFocusTie(input: {
  apiKey: string;
  goalName: string;
  candidates: Array<{
    id: number;
    name: string;
    description?: string | null;
    achieved: number;
    expected: number;
    rate: number;
  }>;
}) {
  try {
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY || "",
    });

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: weeklyFocusChoiceSchema,
      prompt: [
        `WIG goal: ${input.goalName}`,
        "Choose exactly one lead measure id that should be nudged first this week.",
        "Only choose from the candidates below.",
        JSON.stringify(input.candidates),
      ].join("\n\n"),
    });

    return input.candidates.some(
      (candidate) => candidate.id === object.selectedLeadMeasureId,
    )
      ? object.selectedLeadMeasureId
      : null;
  } catch {
    return null;
  }
}
