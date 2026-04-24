import { apiFetch } from "../api";

export type TriageUrgency = "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";

export type TriageQuestion = {
  key?: string;
  type?: string;
  question: string;
  options: string[];
};

export type TriageResult = {
  urgency: TriageUrgency;
  score: number;
  specialties: string[];
  next_step: string;
  reasons: string[];
};

export type StartTriagePayload = {
  sessionId?: string;
  message: string;
  age: number;
  gender: string;
  duration: string;
};

export type StartTriageResponse = {
  sessionId: string | null;
  session: Record<string, unknown> | null;
  state: Record<string, unknown> | null;
  nextQuestion: TriageQuestion | null;
  triageResult: TriageResult | null;
};

export type SendTriageMessagePayload = {
  sessionId: string;
  message: string;
};

export type SendTriageMessageResponse = {
  state: Record<string, unknown> | null;
  nextQuestion: TriageQuestion | null;
  triageResult: TriageResult | null;
};

export type TriageSessionResponse = {
  session: Record<string, unknown> | null;
  state: Record<string, unknown> | null;
  nextQuestion: TriageQuestion | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function toUrgency(value: unknown): TriageUrgency {
  if (typeof value !== "string") return "LOW";
  const normalized = value.toUpperCase();
  if (
    normalized === "LOW" ||
    normalized === "MEDIUM" ||
    normalized === "HIGH" ||
    normalized === "EMERGENCY"
  ) {
    return normalized;
  }
  return "LOW";
}

function normalizeQuestion(value: unknown): TriageQuestion | null {
  if (!isRecord(value)) return null;

  const question =
    typeof value.question === "string" ? value.question.trim() : "";

  if (!question) return null;

  const rawType = typeof value.type === "string" ? value.type.toLowerCase() : undefined;
  const rawKey = typeof value.key === "string" ? value.key : undefined;
  const options = toStringArray(value.options);
  const normalizedOptions =
    options.length > 0 ? options : rawType === "boolean" ? ["Yes", "No"] : [];

  return {
    key: rawKey,
    type: rawType,
    question,
    options: normalizedOptions,
  };
}

function normalizeTriageResult(value: unknown): TriageResult | null {
  if (!isRecord(value)) return null;

  const hasWrappedContract =
    isRecord(value.triageResult) ||
    typeof value.urgency === "string" ||
    typeof value.triage_level === "string";

  if (!hasWrappedContract) return null;

  const source = isRecord(value.triageResult) ? value.triageResult : value;

  const urgency = toUrgency(source.urgency ?? source.triage_level);

  const scoreValue =
    typeof source.score === "number"
      ? source.score
      : typeof source.confidence === "number"
        ? Math.round(source.confidence * 100)
        : 0;

  const reasons = toStringArray(source.reasons);

  const specialties = toStringArray(source.specialties);

  const nextStep =
    typeof source.next_step === "string" ? source.next_step : "";

  return {
    urgency,
    score: Number.isFinite(scoreValue) ? scoreValue : 0,
    specialties,
    next_step: nextStep,
    reasons,
  };
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}

function normalizeEnvelope(payload: unknown): Record<string, unknown> {
  if (!isRecord(payload)) return {};
  if (isRecord(payload.data)) return payload.data;
  return payload;
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (!isRecord(payload)) return fallback;

  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  if (Array.isArray(payload.reasons) && payload.reasons.length > 0) {
    const firstReason = payload.reasons[0];
    if (typeof firstReason === "string" && firstReason.trim()) {
      return firstReason;
    }
  }

  return fallback;
}

export async function startTriage(
  payload: StartTriagePayload,
): Promise<StartTriageResponse> {
  const response = await apiFetch("/triage/start", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const body = await parseBody(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(body, "Unable to start triage."));
  }

  const normalized = normalizeEnvelope(body);
  const state = isRecord(normalized.state) ? normalized.state : null;
  const session = isRecord(normalized.session) ? normalized.session : null;

  const nextQuestion = normalizeQuestion(
    normalized.nextQuestion ?? (isRecord(state) ? state.nextQuestion : null),
  );

  const triageResult = normalizeTriageResult(normalized.triageResult ?? normalized);

  const sessionIdHeader = response.headers.get("x-session-id");
  const sessionIdBody =
    typeof normalized.sessionId === "string" ? normalized.sessionId : null;

  return {
    sessionId: sessionIdHeader || sessionIdBody,
    session,
    state,
    nextQuestion,
    triageResult,
  };
}

export async function sendTriageMessage(
  payload: SendTriageMessagePayload,
): Promise<SendTriageMessageResponse> {
  const response = await apiFetch("/triage/message", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const body = await parseBody(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(body, "Unable to continue triage."));
  }

  const normalized = normalizeEnvelope(body);
  const state = isRecord(normalized.state) ? normalized.state : null;

  const nextQuestion = normalizeQuestion(
    normalized.nextQuestion ?? (isRecord(state) ? state.nextQuestion : null),
  );

  const triageResult = normalizeTriageResult(normalized.triageResult ?? normalized);

  return {
    state,
    nextQuestion,
    triageResult,
  };
}

export async function getTriageSession(
  sessionId: string,
): Promise<TriageSessionResponse> {
  const response = await apiFetch(`/triage/session/${encodeURIComponent(sessionId)}`);

  const body = await parseBody(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(body, "Unable to fetch triage session."));
  }

  const normalized = normalizeEnvelope(body);

  const session = isRecord(normalized) ? normalized : null;
  const state = isRecord(normalized.state) ? normalized.state : null;

  const nextQuestion = normalizeQuestion(
    normalized.nextQuestion ?? (isRecord(state) ? state.nextQuestion : null),
  );

  return {
    session,
    state,
    nextQuestion,
  };
}

export async function resetTriageSession(sessionId: string): Promise<void> {
  const response = await apiFetch(
    `/triage/session/${encodeURIComponent(sessionId)}/reset`,
    {
      method: "POST",
    },
  );

  const body = await parseBody(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(body, "Unable to reset triage session."));
  }
}
