import { analyzeSymptomsFlow } from "../modules/ai/ai.service.js";
import { callOpenRouter } from "../modules/ai/ai.openRouter.js";
import { Analysis } from "../models/analysisSymptoms.model.js";

export async function analyzeSymptomsController(req, res) {
  try {
    const result = await analyzeSymptomsFlow(req.body); 
    console.log(result);
    
    
    const saved = await Analysis.create({
      symptoms: req.body.symptoms,
      language: req.body.language || "en",

      specialist: result.data.specialist || "",
      matchedSymptoms: result.data.matchedSymptoms || [],
      canShowDoctors: result.data.canShowDoctors || false,

      urgency: result.data.urgency || "low",
      warningMessage: result.data.warningMessage || "",

      explanation: result.data.explanation || "",
      rawResult: result.data,
    });

    return res.status(result.status).json(result.data);
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


export async function checkEmergencyController(req, res) {
  try {
    const { symptoms } = req.body;

    if (!symptoms) {
      return res.status(400).json({
        success: false,
        message: "Symptoms are required.",
      });
    }

    const analysis = await Analysis.findOne({ symptoms })
      .sort({ createdAt: -1 });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "No analysis found for these symptoms.",
      });
    }

    return res.status(200).json({
      success: true,
      symptoms: analysis.symptoms,
      urgency: analysis.urgency,
      warningMessage: analysis.warningMessage,
    });

  } catch (error) {
    console.error("checkEmergencyController error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch emergency result.",
      error: error.message,
    });
  }
}


export async function explainRecommendationController(req, res) {
  try {
    const { symptoms } = req.body;

    if (!symptoms) {
      return res.status(400).json({
        success: false,
        message: "Symptoms are required.",
      });
    }

    const analysis = await Analysis.findOne({ symptoms })
      .sort({ createdAt: -1 });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "No analysis found for these symptoms.",
      });
    }

    return res.status(200).json({
      success: true,
      symptoms: analysis.symptoms,
      specialist: analysis.specialist,
      matchedSymptoms: analysis.matchedSymptoms,
      explanation: analysis.explanation,
    });

  } catch (error) {
    console.error("explainRecommendationController error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch explanation result.",
      error: error.message,
    });
  }
}