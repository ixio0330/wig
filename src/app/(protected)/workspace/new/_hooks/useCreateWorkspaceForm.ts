"use client";

import { useState } from "react";

type UseCreateWorkspaceFormParams = {
  onSubmitName: (name: string) => void;
};

export const useCreateWorkspaceForm = ({
  onSubmitName,
}: UseCreateWorkspaceFormParams) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleNameChange = (value: string) => {
    setName(value);

    if (error) {
      setError("");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("워크스페이스 이름을 입력해주세요.");
      return;
    }

    setError("");
    onSubmitName(trimmedName);
  };

  return {
    error,
    name,
    setError,
    handleNameChange,
    handleSubmit,
  };
};
