import { generateAIResponse } from "../services/ai/ai.service.js";


export async function healthCheckGrok(req, res) {
  try {
    const text = await generateAIResponse({
      system: "You are a test assistant.",
      prompt: "Testing. Just say hi and hello world and nothing else.",
    });

    return res.status(200).json({
      success: true,
      message: "Gemini connection successful",
      data: text,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gemini connection failed",
      error: error.message,
    });
  }
}

