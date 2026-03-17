import { analyzeSymptomsFlow } from "../modules/ai/ai.service.js";
import { callGroq } from "../modules/ai/ai.groq.js";
import SymptomSearch from "../models/symptomSearch.model.js";
import { findOrCreateSpecialization } from "../utils/specializationFinder.js";

export async function analyzeSymptomsController(req, res) {
  try {
    const result = await analyzeSymptomsFlow(req.body);

    
    console.log(result.data);

    if (!result.success) {
      return res.status(result.status || 400).json({
        success: false,
        stage: result.stage,
        message: result.message,
      });
    }

    const specialization = await findOrCreateSpecialization(
      result.data.specialist || ""
    );

    const saved = await SymptomSearch.create({
      user: req.user.id,
      symptomsText: req.body.symptoms || "",
      inputLanguage: req.body.language || "unknown",

      recommendedSpecialization: specialization?._id || null,
      recommendedSpecializationName: specialization?.name || result.data.specialist || "",

      analysisReason: result.data.explanation || "",
      urgencyLevel: result.data.urgency || "low",
      warningMessage: result.data.warningMessage || "",

      matchedSymptoms: result.data.matchedSymptoms || [],
      canShowDoctors: result.data.canShowDoctors || false,
      retrievalQuery: result.data.retrievalQuery || "",
    });

    return res.status(result.status || 200).json({
      success: true,
      data: result.data,
      });
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
    const content = await callGroq({
      model: process.env.GROQ_TRANSLATE_MODEL || "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "Reply with exactly: GROQ_OK",
        },
        {
          role: "user",
          content: "ping",
        },
      ],
      temperature: 0,
      max_tokens: 20,
      label: "Groq health check",
    });

    return res.status(200).json({
      success: true,
      message: content,
    });
  } catch (error) {
    console.error("AI health error:", error);

    return res.status(500).json({
      success: false,
      message: "Groq connection failed",
      error: error.message,
    });
  }
}

// export async function checkEmergencyController(req, res) {
//   try {
//     const { symptoms } = req.body;

//     if (!symptoms) {
//       return res.status(400).json({
//         success: false,
//         message: "Symptoms are required.",
//       });
//     }

//     const analysis = await Analysis.findOne({ symptoms }).sort({ createdAt: -1 });

//     if (!analysis) {
//       return res.status(404).json({
//         success: false,
//         message: "No analysis found for these symptoms.",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       symptoms: analysis.symptoms,
//       urgency: analysis.urgency,
//       warningMessage: analysis.warningMessage,
//     });
//   } catch (error) {
//     console.error("checkEmergencyController error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch emergency result.",
//       error: error.message,
//     });
//   }
// }

// export async function explainRecommendationController(req, res) {
//   try {
//     const { symptoms } = req.body;

//     if (!symptoms) {
//       return res.status(400).json({
//         success: false,
//         message: "Symptoms are required.",
//       });
//     }

//     const analysis = await Analysis.findOne({ symptoms }).sort({ createdAt: -1 });

//     if (!analysis) {
//       return res.status(404).json({
//         success: false,
//         message: "No analysis found for these symptoms.",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       symptoms: analysis.symptoms,
//       specialist: analysis.specialist,
//       matchedSymptoms: analysis.matchedSymptoms,
//       explanation: analysis.explanation,
//     });
//   } catch (error) {
//     console.error("explainRecommendationController error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch explanation result.",
//       error: error.message,
//     });
//   }
// }