/**
 * AI Controller
 * 
 * Handles AI-powered medical analysis operations including:
 * - Symptom analysis and specialization recommendation
 * - AI service health checks
 * 
 * Uses Groq API for natural language processing and symptom classification.
 * Integrates with specialization management to find or create matching specializations.
 */

import { analyzeSymptomsFlow } from "../modules/ai/ai.service.js";
import { callGroq } from "../modules/ai/ai.groq.js";
import SymptomSearch from "../models/symptomSearch.model.js";
import { findOrCreateSpecialization } from "../utils/specializationFinder.js";

/**
 * Analyze Patient Symptoms and Recommend Specialization
 * 
 * POST /api/ai/analyze-symptoms
 * Requires authentication
 * 
 * Processes patient-provided symptom descriptions through Groq AI to:
 * 1. Analyze symptoms and determine medical severity
 * 2. Recommend appropriate medical specialization
 * 3. Extract matched symptoms and warning indicators
 * 4. Store analysis results for record-keeping and analytics
 * 
 * Request Body:
 * {
 *   "symptoms": "I have a persistent cough and chest pain",
 *   "language": "en"
 * }
 * 
 * Response includes:
 * - recommendedSpecialization: ID of matched medical specialty
 * - recommendedSpecializationName: Name of the specialization
 * - urgencyLevel: "low", "medium", or "high"
 * - warningMessage: Alert if emergency symptoms detected
 * - canShowDoctors: Whether safe to recommend doctors
 * - analysisReason: Explanation of the analysis
 * - matchedSymptoms: Array of identified symptoms
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user
 * @param {Object} req.body - Request body with symptoms text
 * @param {Object} res - Express response object
 * @returns {Object} Analysis result with specialization recommendation
 * @status 200 - Analysis successful
 * @status 400 - Invalid input or analysis failed
 * @status 500 - Server error
 */
export async function analyzeSymptomsController(req, res) {
  try {
    // Call AI service to analyze symptoms using Groq
    const result = await analyzeSymptomsFlow(req.body);

    
    // Log analysis result for debugging
    console.log(result.data);

    // Return error if analysis failed
    if (!result.success) {
      return res.status(result.status || 400).json({
        success: false,
        stage: result.stage,
        message: result.message,
      });
    }

    // Find or create specialization based on AI recommendation
    // Uses fuzzy matching to find existing specializations or creates new ones
    const specialization = await findOrCreateSpecialization(
      result.data.specialist || ""
    );

    // Save analysis to database for record-keeping and analytics
    const saved = await SymptomSearch.create({
      user: req.user.id,
      symptomsText: req.body.symptoms || "",
      inputLanguage: req.body.language || "unknown",

      // Store specialization recommendation
      recommendedSpecialization: specialization?._id || null,
      recommendedSpecializationName: specialization?.name || result.data.specialist || "",

      // Store AI analysis details
      analysisReason: result.data.explanation || "",
      urgencyLevel: result.data.urgency || "low",
      warningMessage: result.data.warningMessage || "",

      // Store clinical findings
      matchedSymptoms: result.data.matchedSymptoms || [],
      canShowDoctors: result.data.canShowDoctors || false,
      retrievalQuery: result.data.retrievalQuery || "",
    });

    // Return analysis results to client
    return res.status(result.status || 200).json({
      success: true,
      data: result.data,
      });
  } catch (error) {
    console.error("AI analyze error:", error);

    // Return error response with details
    return res.status(500).json({
      success: false,
      stage: "server",
      message: "Failed to analyze symptoms.",
      error: error.message,
    });
  }
}

/**
 * Health Check for Groq AI Service
 * 
 * GET /api/ai/health
 * Requires authentication
 * 
 * Verifies that the Groq API is accessible and responsive.
 * Performs a simple ping request to ensure the AI service is operational.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Health status message
 * @status 200 - Groq API is healthy
 * @status 500 - Groq API connection failed
 */
export async function aiHealthController(req, res) {
  try {
    // Send a simple ping to Groq to verify service is operational
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

    // Return success if Groq responds
    return res.status(200).json({
      success: true,
      message: content,
    });
  } catch (error) {
    console.error("AI health error:", error);

    // Return error if Groq connection fails
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