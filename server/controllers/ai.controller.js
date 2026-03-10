import { analyzeSymptomsFlow } from "../modules/ai/ai.service.js";
import { callOpenRouter } from "../modules/ai/ai.openRouter.js";

export async function analyzeSymptomsController(req, res) {
  try {
    const result = await analyzeSymptomsFlow(req.body);

    return res.status(result.status).json(result);
  } catch (error) {
    console.error("AI analyze error:", error);

    return res.status(500).json({
      success: false,
      stage: "server",
      message: "Failed to analyze symptoms.",
      error: error.message,
    });
  }
}

export async function aiHealthController(req, res) {
  try {
    const content = await callOpenRouter({
      model:
        process.env.OPENROUTER_GATEKEEPER_MODEL || "qwen/qwen3-4b:free",
      messages: [
        {
          role: "system",
          content: "Reply with exactly: OPENROUTER_OK",
        },
        {
          role: "user",
          content: "ping",
        },
      ],
      temperature: 0,
      max_tokens: 20,
    });

    return res.status(200).json({
      success: true,
      message: content,
    });
  } catch (error) {
    console.error("AI health error:", error);

    return res.status(500).json({
      success: false,
      message: "OpenRouter connection failed",
      error: error.message,
    });
  }
}