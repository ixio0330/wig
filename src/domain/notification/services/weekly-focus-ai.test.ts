import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { breakWeeklyFocusTie } from "@/domain/notification/services/weekly-focus-ai";

vi.mock("ai", () => ({
  generateObject: vi.fn(),
}));

vi.mock("@ai-sdk/google", () => ({
  google: vi.fn(),
}));

const mockGenerateObject = vi.mocked(generateObject);
const mockGoogle = vi.mocked(google);

describe("breakWeeklyFocusTie", () => {
  const candidates = [
    {
      id: 11,
      name: "매일 물 2L",
      description: null,
      achieved: 1,
      expected: 4,
      rate: 25,
    },
    {
      id: 12,
      name: "주 3회 운동",
      description: "cardio",
      achieved: 2,
      expected: 8,
      rate: 25,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGoogle.mockReturnValue("mock-model" as never);
  });

  it("returns selected id when Gemini chooses a valid candidate", async () => {
    mockGenerateObject.mockResolvedValue({
      object: {
        selectedLeadMeasureId: 12,
      },
    } as never);

    await expect(
      breakWeeklyFocusTie({
        apiKey: "test-api-key",
        goalName: "이번 주는 흔들리지 않기",
        candidates,
      }),
    ).resolves.toBe(12);
  });

  it("returns null when Gemini returns an id outside the candidate set", async () => {
    mockGenerateObject.mockResolvedValue({
      object: {
        selectedLeadMeasureId: 999,
      },
    } as never);

    await expect(
      breakWeeklyFocusTie({
        apiKey: "test-api-key",
        goalName: "이번 주는 흔들리지 않기",
        candidates,
      }),
    ).resolves.toBeNull();
  });

  it("returns null when generateObject throws", async () => {
    mockGenerateObject.mockRejectedValue(new Error("provider failure"));

    await expect(
      breakWeeklyFocusTie({
        apiKey: "test-api-key",
        goalName: "이번 주는 흔들리지 않기",
        candidates,
      }),
    ).resolves.toBeNull();
  });
});
