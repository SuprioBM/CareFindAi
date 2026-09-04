import "dotenv/config";
import Groq from "groq-sdk";

function requireGroqConfig() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY in environment");
  }

  return { apiKey };
}

function buildGroqClient() {
  const { apiKey } = requireGroqConfig();
  return new Groq({ apiKey });
}

function extractErrorMessage(error) {
  if (!error) return "Unknown Groq error";

  if (typeof error === "string") return error;

  if (error?.error?.message) return error.error.message;
  if (error?.message) return error.message;

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown Groq error";
  }
}

function isRetryableGroqError(error) {
  const status = error?.status || error?.response?.status;
  const msg = extractErrorMessage(error).toLowerCase();

  if (status === 429) return true;
  if (status >= 500) return true;

  return (
    msg.includes("rate limit") ||
    msg.includes("rate-limited") ||
    msg.includes("temporarily unavailable") ||
    msg.includes("timeout") ||
    msg.includes("overloaded") ||
    msg.includes("try again")
  );
}

function extractTextFromGroqResponse(json) {
  const choice = json?.choices?.[0];
  const message = choice?.message;

  if (typeof message?.content === "string" && message.content.trim()) {
    return message.content.trim();
  }

  if (Array.isArray(message?.content)) {
    const text = message.content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part?.type === "text" && typeof part.text === "string") {
          return part.text;
        }
        return "";
      })
      .join("")
      .trim();

    if (text) return text;
  }

  return null;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// gpt-oss models (Groq's replacement for the retired llama-3.x line) do
// internal chain-of-thought reasoning before emitting the final answer, and
// those reasoning tokens count against max_tokens. Left at its default
// ("medium"), reasoning alone can burn through a max_tokens budget sized for
// the old direct-answer llama models before any actual JSON is produced,
// causing a 400 json_validate_failed ("max completion tokens reached before
// generating a valid document"). Default reasoning down to "low" for these
// models - our prompts are short structured-extraction/classification tasks
// that don't need deep reasoning - while still letting a caller override it.
function isGptOssModel(model = "") {
  return /gpt-oss/i.test(model);
}

export async function callGroq({
  model,
  messages,
  temperature = 0,
  max_tokens = 300,
  response_format,
  reasoning_effort,
  retries = 2,
  label = "Groq",
}) {
  const groq = buildGroqClient();
  const effectiveReasoningEffort =
    reasoning_effort ?? (isGptOssModel(model) ? "low" : undefined);
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const json = await groq.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens,
        response_format,
        ...(effectiveReasoningEffort ? { reasoning_effort: effectiveReasoningEffort } : {}),
      });

      console.log(`${label} raw response:`, JSON.stringify(json, null, 2));

      const text = extractTextFromGroqResponse(json);
      if (text) return text;

      throw new Error(
        `${label} returned no usable content. finish_reason=${json?.choices?.[0]?.finish_reason}; model=${json?.model}`
      );
    } catch (error) {
      lastError = error;

      if (attempt < retries && isRetryableGroqError(error)) {
        await delay(400 * (attempt + 1));
        continue;
      }

      break;
    }
  }

  throw new Error(`${label} failed: ${extractErrorMessage(lastError)}`);
}

export function safeJsonParse(text) {
  if (!text || typeof text !== "string") {
    const err = new Error("Model returned empty or non-string content.");
    err.rawOutput = text;
    throw err;
  }

  let cleaned = text.trim();
  cleaned = cleaned.replace(/```json\s*/gi, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {}

  const objectMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    try {
      return JSON.parse(objectMatch[0]);
    } catch {}
  }

  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]);
    } catch {}
  }

  const err = new Error(`Model did not return valid JSON. Raw output: ${text}`);
  err.rawOutput = text;
  throw err;
}