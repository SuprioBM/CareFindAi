import "dotenv/config";

function requireOpenRouterConfig() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseUrl =
    process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY in environment");
  }

  return { apiKey, baseUrl };
}

function extractErrorMessage(payloadText) {
  try {
    const parsed = JSON.parse(payloadText);
    return parsed?.error?.message || payloadText;
  } catch {
    return payloadText;
  }
}

function isRetryableOpenRouterError(status, payloadText) {
  if (status === 429) return true;
  if (status >= 500) return true;

  const msg = String(payloadText || "").toLowerCase();

  return (
    msg.includes("rate-limited") ||
    msg.includes("temporarily rate-limited") ||
    msg.includes("provider returned error") ||
    msg.includes("overloaded") ||
    msg.includes("timeout")
  );
}

function extractTextFromOpenRouterResponse(json) {
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

  if (typeof message?.reasoning === "string" && message.reasoning.trim()) {
    return message.reasoning.trim();
  }

  if (typeof message?.refusal === "string" && message.refusal.trim()) {
    return message.refusal.trim();
  }

  return null;
}

export async function callOpenRouter({
  model,
  messages,
  temperature = 0.2,
  max_tokens = 500,
  response_format,
  provider,
  reasoning,
  retries = 2,
}) {
  const { apiKey, baseUrl } = requireOpenRouterConfig();
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-OpenRouter-Title": "CareFind",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens,
          response_format,
          provider,
          reasoning,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();

        if (attempt < retries && isRetryableOpenRouterError(res.status, errText)) {
          continue;
        }

        throw new Error(
          `OpenRouter failed: ${res.status} ${extractErrorMessage(errText)}`
        );
      }

      const json = await res.json();
      console.log("OpenRouter raw response:", JSON.stringify(json, null, 2));

      const text = extractTextFromOpenRouterResponse(json);
      if (text) return text;

      throw new Error(
        `OpenRouter returned no usable content. finish_reason=${json?.choices?.[0]?.finish_reason}; model=${json?.model}`
      );
    } catch (error) {
      lastError = error;
      if (attempt < retries) continue;
    }
  }

  throw lastError;
}

export function safeJsonParse(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Model returned empty or non-string content.");
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

  throw new Error(`Model did not return valid JSON. Raw output: ${text}`);
}