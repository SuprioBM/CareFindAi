"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getTriageSession,
  resetTriageSession,
  sendTriageMessage,
  startTriage,
  type SendTriageMessageResponse,
  type StartTriageResponse,
  type TriageQuestion,
  type TriageResult,
} from "@/lib/api/triage";

export type TriageMessageItem = {
  id: string;
  role: "system" | "user";
  text: string;
  kind: "prompt" | "question" | "note";
};

type PersistedTriageState = {
  hasStarted: boolean;
  messages: TriageMessageItem[];
  nextQuestion: TriageQuestion | null;
  triageResult: TriageResult | null;
  age: string;
  gender: string;
  duration: string;
};

const SESSION_STORAGE_KEY = "system-analyzer-session-id";
const UI_STORAGE_KEY = "system-analyzer-ui-state";

const INITIAL_PROMPT: TriageMessageItem = {
  id: "prompt-initial",
  role: "system",
  kind: "prompt",
  text: "Please describe your symptoms.",
};

function createClientId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `triage-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createMessage(
  role: TriageMessageItem["role"],
  text: string,
  kind: TriageMessageItem["kind"],
): TriageMessageItem {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    text,
    kind,
  };
}

function isValidPersistedState(value: unknown): value is PersistedTriageState {
  if (!value || typeof value !== "object") return false;

  const candidate = value as PersistedTriageState;

  return (
    typeof candidate.hasStarted === "boolean" &&
    Array.isArray(candidate.messages) &&
    typeof candidate.age === "string" &&
    typeof candidate.gender === "string" &&
    typeof candidate.duration === "string"
  );
}

export function useTriageSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<TriageMessageItem[]>([INITIAL_PROMPT]);
  const [nextQuestion, setNextQuestion] = useState<TriageQuestion | null>(null);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [state, setState] = useState<Record<string, unknown> | null>(null);

  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [duration, setDuration] = useState("");
  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedSessionId = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (storedSessionId) {
      setSessionId(storedSessionId);
      setHasStarted(true);
    }

    const storedUiState = window.localStorage.getItem(UI_STORAGE_KEY);
    if (!storedUiState) return;

    try {
      const parsed = JSON.parse(storedUiState) as unknown;
      if (!isValidPersistedState(parsed)) return;

      setHasStarted(parsed.hasStarted);
      setMessages(parsed.messages.length > 0 ? parsed.messages : [INITIAL_PROMPT]);
      setNextQuestion(parsed.nextQuestion);
      setTriageResult(parsed.triageResult);
      setAge(parsed.age);
      setGender(parsed.gender);
      setDuration(parsed.duration);
    } catch {
      // Ignore malformed persisted state.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (sessionId) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    } else {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [sessionId]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const payload: PersistedTriageState = {
      hasStarted,
      messages,
      nextQuestion,
      triageResult,
      age,
      gender,
      duration,
    };

    window.localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(payload));
  }, [age, duration, gender, hasStarted, messages, nextQuestion, triageResult]);

  const shouldStop = useMemo(() => {
    if (!state || typeof state !== "object") return false;

    return (state as Record<string, unknown>).shouldStop === true;
  }, [state]);

  const isEmergencyStop = useMemo(
    () => triageResult?.urgency === "EMERGENCY",
    [triageResult],
  );

  const isComplete = useMemo(
    () => Boolean(triageResult && !nextQuestion && (shouldStop || isEmergencyStop)),
    [triageResult, nextQuestion, shouldStop, isEmergencyStop],
  );

  const applyResponse = useCallback(
    (response: StartTriageResponse | SendTriageMessageResponse) => {
      setState(response.state ?? null);
      setNextQuestion(response.nextQuestion ?? null);
      setTriageResult(response.triageResult ?? null);

      setMessages((previous) => {
        if (!response.nextQuestion) {
          return previous;
        }

        const lastMessage = previous[previous.length - 1];
        const isDuplicateLatestQuestion =
          lastMessage?.role === "system" &&
          lastMessage?.kind === "question" &&
          lastMessage?.text === response.nextQuestion.question;

        if (isDuplicateLatestQuestion) {
          return previous;
        }

        return [
          ...previous,
          createMessage("system", response.nextQuestion.question, "question"),
        ];
      });
    },
    [],
  );

  useEffect(() => {
    if (!hasStarted || !sessionId) return;

    let isActive = true;

    const hydrateSession = async () => {
      try {
        const snapshot = await getTriageSession(sessionId);

        if (!isActive) return;

        applyResponse({
          state: snapshot.state,
          nextQuestion: snapshot.nextQuestion,
          triageResult,
        });
      } catch {
        // Keep local state if session snapshot cannot be fetched.
      }
    };

    void hydrateSession();

    return () => {
      isActive = false;
    };
  }, [applyResponse, hasStarted, sessionId, triageResult]);

  const ensureSessionId = useCallback(() => {
    if (sessionId) return sessionId;

    const nextId = createClientId();
    setSessionId(nextId);
    return nextId;
  }, [sessionId]);

  const enrichResponseFromSession = useCallback(
    async (
      response: StartTriageResponse | SendTriageMessageResponse,
      activeSessionId: string,
    ): Promise<StartTriageResponse | SendTriageMessageResponse> => {
      if (response.state && response.nextQuestion) {
        return response;
      }

      try {
        const snapshot = await getTriageSession(activeSessionId);

        return {
          ...response,
          state: response.state ?? snapshot.state,
          nextQuestion: response.nextQuestion ?? snapshot.nextQuestion,
        };
      } catch {
        return response;
      }
    },
    [],
  );

  const submitMessage = useCallback(
    async (rawMessage: string) => {
      const message = rawMessage.trim();
      if (!message || loading || isEmergencyStop) return false;

      if (!hasStarted) {
        if (!age.trim() || !gender.trim() || !duration.trim()) {
          setError("Age, gender, and duration are required to start triage.");
          return false;
        }
      }

      setError(null);
      setLoading(true);

      setMessages((previous) => [
        ...previous,
        createMessage("user", message, "note"),
      ]);

      try {
        if (!hasStarted) {
          const currentSessionId = ensureSessionId();

          const response = await startTriage({
            sessionId: currentSessionId,
            message,
            age: Number(age),
            gender: gender.trim(),
            duration: duration.trim(),
          });

          const activeSessionId = response.sessionId || currentSessionId;

          if (response.sessionId) {
            setSessionId(activeSessionId);
          }

          const enrichedResponse = await enrichResponseFromSession(
            response,
            activeSessionId,
          );

          setHasStarted(true);
          applyResponse(enrichedResponse);
        } else {
          const currentSessionId = ensureSessionId();

          const response = await sendTriageMessage({
            sessionId: currentSessionId,
            message,
          });

          const enrichedResponse = await enrichResponseFromSession(
            response,
            currentSessionId,
          );

          applyResponse(enrichedResponse);
        }

        return true;
      } catch (submissionError) {
        const nextError =
          submissionError instanceof Error
            ? submissionError.message
            : "Failed to communicate with triage service.";

        setError(nextError);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [
      age,
      applyResponse,
      duration,
      enrichResponseFromSession,
      ensureSessionId,
      gender,
      hasStarted,
      isEmergencyStop,
      loading,
    ],
  );

  const submitCurrentInput = useCallback(async () => {
    const current = input;
    const isSuccess = await submitMessage(current);
    if (isSuccess) {
      setInput("");
    }
  }, [input, submitMessage]);

  const submitOption = useCallback(
    async (option: string) => {
      await submitMessage(option);
    },
    [submitMessage],
  );

  const resetSession = useCallback(() => {
    if (sessionId) {
      void resetTriageSession(sessionId).catch(() => {
        // Local reset remains authoritative for UX even if backend reset fails.
      });
    }

    setSessionId(null);
    setHasStarted(false);
    setMessages([INITIAL_PROMPT]);
    setNextQuestion(null);
    setTriageResult(null);
    setState(null);
    setInput("");
    setError(null);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      window.localStorage.removeItem(UI_STORAGE_KEY);
    }
  }, [sessionId]);

  return {
    sessionId,
    hasStarted,
    messages,
    nextQuestion,
    triageResult,
    isEmergencyStop,
    state,
    age,
    setAge,
    gender,
    setGender,
    duration,
    setDuration,
    input,
    setInput,
    loading,
    error,
    isComplete,
    submitCurrentInput,
    submitOption,
    resetSession,
  };
}
