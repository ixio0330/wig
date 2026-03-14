import { beforeEach, describe, it, vi } from "vitest";
// @ts-ignore

describe("Auth Service - login", () => {
  const mockDb = {
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
    }),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("유효한 아이디와 비밀번호로 로그인 성공 시 사용자 정보와 세션을 반환한다", async () => {
    // Phase 1 (Red): 이 테스트는 login 함수가 없어서 실패함
    const mockUser = {
      id: 1,
      customId: "john123",
      passwordHash: "hashed_user",
      nickname: "John",
      isFirstLogin: true,
    };

    mockDb.query.users.findFirst.mockResolvedValue(mockUser);

    // 세션 생성 모킹 등 추가 필요

    // const result = await login(mockDb, 'john123', 'user');
    // expect(result.user.id).toBe(1);
  });

  it("잘못된 비밀번호로 로그인 시 에러를 던진다", async () => {
    // ...
  });
});
