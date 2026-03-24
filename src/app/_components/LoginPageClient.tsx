"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { usePostAuthLogin, usePostAuthSignup } from "@/api/generated/auth/auth";
import { InlineSpinner } from "@/components/InlineSpinner";
import { getApiErrorMessage } from "@/lib/client/frontend-api";
import { LogIn, UserPlus, Zap } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

type AuthMode = "login" | "signup";

const signupFormSchema = z.object({
  customId: z
    .string()
    .regex(/^[a-zA-Z0-9]{3,20}$/, "아이디는 3~20자의 영문/숫자여야 합니다."),
  nickname: z
    .string()
    .min(1, "닉네임을 입력해주세요.")
    .max(50, "닉네임은 50자 이하여야 합니다."),
  password: z
    .string()
    .regex(
      /^[a-zA-Z0-9!@#$%^&*()\-_=+\[\]{}|:<>?,./~]{8,}$/,
      "비밀번호는 8자 이상의 영문/숫자/허용 특수문자 조합이어야 합니다.",
    ),
});

export default function LoginPageClient() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [id, setId] = useState("");
  const [nickname, setNickname] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const loginMutation = usePostAuthLogin();
  const signupMutation = usePostAuthSignup();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPending = loginMutation.isPending || signupMutation.isPending;

  const resetErrorAndSwitchMode = (nextMode: AuthMode) => {
    setError("");
    setMode(nextMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "signup") {
      const parsed = signupFormSchema.safeParse({
        customId: id,
        nickname,
        password: pw,
      });

      if (!parsed.success) {
        const firstError = Object.values(parsed.error.flatten().fieldErrors)
          .flat()
          .find((message) => typeof message === "string");
        setError(firstError ?? "입력값을 확인해주세요.");
        return;
      }

      try {
        const response = await signupMutation.mutateAsync({
          data: {
            customId: parsed.data.customId,
            nickname: parsed.data.nickname,
            password: parsed.data.password,
          },
        });

        if (response.status !== 201 || !response.data.user) {
          setError("회원가입에 실패했습니다.");
          return;
        }

        const nextPath = searchParams.get("next");
        router.push(nextPath || "/dashboard/my");
      } catch (signupError) {
        setError(getApiErrorMessage(signupError, "회원가입에 실패했습니다."));
      }

      return;
    }

    try {
      const response = await loginMutation.mutateAsync({
        data: {
          customId: id,
          password: pw,
        },
      });

      if (response.status !== 200 || !response.data.user) {
        setError("아이디 또는 비밀번호가 올바르지 않습니다.");
        return;
      }

      const nextPath = searchParams.get("next");
      router.push(nextPath || "/dashboard/my");
    } catch (loginError) {
      setError(
        getApiErrorMessage(loginError, "아이디 또는 비밀번호가 올바르지 않습니다."),
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 font-pretendard">
      <Card className="w-full max-w-[380px] bg-white border border-border rounded-2xl p-8 md:p-10 shadow-sm animate-linear-in">
        <div className="flex flex-col items-center text-center space-y-4 mb-10">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
            <Zap className="text-primary w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              WIG
            </h1>
            <p className="text-[13px] text-text-muted">
              가장 중요한 목표에 집중하세요.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-sub-background p-1">
            <Button
              type="button"
              onClick={() => resetErrorAndSwitchMode("login")}
              className={`rounded-lg py-2 text-xs font-bold transition-colors ${
                mode === "login"
                  ? "bg-white text-primary border border-border"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              로그인
            </Button>
            <Button
              type="button"
              onClick={() => resetErrorAndSwitchMode("signup")}
              className={`rounded-lg py-2 text-xs font-bold transition-colors ${
                mode === "signup"
                  ? "bg-white text-primary border border-border"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              회원가입
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider ml-0.5">
                아이디
              </label>
              <Input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="admin"
                className="w-full px-4 py-3 bg-sub-background border border-border rounded-xl text-sm focus:border-primary focus:bg-white outline-none transition-colors placeholder:text-text-muted/40 font-medium"
                required
              />
            </div>

            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider ml-0.5">
                  닉네임
                </label>
                <Input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="홍길동"
                  className="w-full px-4 py-3 bg-sub-background border border-border rounded-xl text-sm focus:border-primary focus:bg-white outline-none transition-colors placeholder:text-text-muted/40 font-medium"
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider ml-0.5">
                비밀번호
              </label>
              <Input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-sub-background border border-border rounded-xl text-sm focus:border-primary focus:bg-white outline-none transition-colors placeholder:text-text-muted/40 font-medium"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-danger/5 border border-danger/20 rounded-xl">
              <p className="text-danger text-[11px] font-bold text-center">
                {error}
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className={`
              w-full py-3.5 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all
              ${
                isPending
                  ? "bg-primary/50 text-white cursor-not-allowed"
                  : "btn-linear-primary shadow-lg shadow-primary/10"
              }
            `}
          >
            {isPending ? (
              <InlineSpinner />
            ) : (
              <>
                {mode === "login" ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>로그인</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>회원가입</span>
                  </>
                )}
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
