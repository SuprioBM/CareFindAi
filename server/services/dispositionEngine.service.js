import { callGroq, safeJsonParse } from "../modules/ai/ai.groq.js";
import { SYMPTOM_REGISTRY } from "../data/symptomRegistry.js";
import Specialization from "../models/specialization.model.js";
import Doctor from "../models/doctor.model.js";
import { findOrCreateSpecialization } from "../utils/specializationFinder.js";

const MODEL = process.env.GROQ_MAIN_MODEL || "openai/gpt-oss-20b";

export class DispositionEngine {
  /**
   * Evaluates clinical state to generate final disposition, specialties, and explanation
   * @param {Object} clinicalState - The complete clinical state
   * @param {boolean} isEmergencyDetected - Whether the emergency layer flagged an emergency
   * @param {string} emergencyReason - The reason for emergency if flagged
   * @returns {Promise<Object>} Final recommendation details
   */
  async evaluate(clinicalState, isEmergencyDetected = false, emergencyReason = null) {
    if (isEmergencyDetected) {
      return {
        specialist: "General Medicine",
        urgencyLevel: "emergency",
        explanation: emergencyReason || "Life-threatening symptoms detected. Please seek emergency medical care immediately.",
        matchedSymptoms: clinicalState.symptoms || [],
        warningMessage: "GO TO THE NEAREST EMERGENCY ROOM OR CALL AMBULANCE SERVICES IMMEDIATELY.",
        canShowDoctors: true,
        specialties: ["General Medicine", "Cardiology", "Neurology"]
      };
    }

    // Determine baseline specialties using registry
    const baseSpecialties = new Set();
    const symptoms = clinicalState.symptoms || [];
    
    for (const symptom of symptoms) {
      const reg = SYMPTOM_REGISTRY[symptom];
      if (reg && Array.isArray(reg.specialties)) {
        reg.specialties.forEach(spec => baseSpecialties.add(spec));
      }
    }

    if (baseSpecialties.size === 0) {
      baseSpecialties.add("General Medicine");
    }

    // Fetch unique specialization IDs from doctors to only recommend specialties with doctors
    let dbSpecializations = [];
    try {
      const activeSpecializationIds = await Doctor.distinct("specialization");
      const specs = await Specialization.find({
        _id: { $in: activeSpecializationIds },
        isActive: { $ne: false }
      }).select("name");
      dbSpecializations = specs.map(s => s.name);
    } catch (err) {
      console.error("Failed to fetch specializations with doctors in DispositionEngine:", err);
    }

    const specsListText = dbSpecializations.length > 0
      ? dbSpecializations.map(name => `"${name}"`).join(", ")
      : `"General Medicine", "Cardiology", "Dermatology", "Neurology", "Orthopedic Surgery", "Paediatrics"`; // sensible fallback

    const timeline = clinicalState.symptomTimeline instanceof Map 
      ? Object.fromEntries(clinicalState.symptomTimeline.entries()) 
      : (clinicalState.symptomTimeline || {});

    const severity = clinicalState.severity instanceof Map 
      ? Object.fromEntries(clinicalState.severity.entries()) 
      : (clinicalState.severity || {});

    const prompt = `
You are a senior clinical triage system evaluating a patient's final symptom session state.

### Clinical State:
- Demographics: Age: ${clinicalState.demographics?.age || "N/A"}, Gender: ${clinicalState.demographics?.gender || "N/A"}
- Symptoms: ${symptoms.join(", ")}
- Duration Timeline: ${JSON.stringify(timeline)}
- Symptom Severities: ${JSON.stringify(severity)}
- Risk Factors: ${(clinicalState.riskFactors || []).join(", ")}
- Medications: ${(clinicalState.medications || []).join(", ")}
- Medical History: ${(clinicalState.medicalHistory || []).join(", ")}
- Red Flags Checked: ${(clinicalState.redFlags || []).join(", ")}

### Baseline Mapped Specialties (from symptom registry):
${Array.from(baseSpecialties).join(", ")}

### Task:
1. Determine the appropriate 'urgencyLevel' from: "emergency", "urgent", "same-day", "routine", "self-care".
2. Recommend appropriate specialties (e.g. Cardiology, Dermatology, Pulmonology, Orthopedics) in order of priority. Align with or refine the baseline mapped specialties.
3. Write a clear, brief explanation (maximum 2-3 sentences) explaining why this urgency and specialist are recommended.
4. Extract the warning message (safety warnings, red-flag triggers) if any.
5. Provide a confidence score (0.0 to 1.0) for this triage.

### CRITICAL SPECIALIST RULE:
You MUST recommend specialties that are EXACTLY from the following list of active specialties with registered doctors in our database. Do NOT recommend any name or specialty outside this list:
[ ${specsListText} ]

Return ONLY a valid JSON object. No markdown, no conversation, no greetings.

### Format:
{
  "urgencyLevel": "emergency" | "urgent" | "same-day" | "routine" | "self-care",
  "specialties": ["Specialty1", "Specialty2", ...],
  "explanation": "A concise, compassionate summary explanation...",
  "warningMessage": "Warning alerts or safety instructions...",
  "confidenceScore": number
}
`;

    try {
      const response = await callGroq({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "You are a clinical decision engine. Reply only with valid JSON. No conversational text.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
        response_format: { type: "json_object" },
        label: "Disposition Engine",
      });

      const parsed = safeJsonParse(response);

      const resolvedSpecialties = Array.isArray(parsed.specialties) && parsed.specialties.length > 0
        ? parsed.specialties
        : Array.from(baseSpecialties);

      // Map each resolved specialty to the exact canonical database document name
      const mappedSpecialties = [];
      for (const specName of resolvedSpecialties) {
        const matched = await findOrCreateSpecialization(specName);
        if (matched && !mappedSpecialties.includes(matched.name)) {
          mappedSpecialties.push(matched.name);
        }
      }

      if (mappedSpecialties.length === 0) {
        mappedSpecialties.push("General Medicine");
      }

      return {
        specialist: mappedSpecialties[0] || "General Medicine",
        urgencyLevel: parsed.urgencyLevel || "routine",
        explanation: parsed.explanation || "Recommended consultation based on symptom criteria.",
        matchedSymptoms: symptoms,
        warningMessage: parsed.warningMessage || "",
        canShowDoctors: parsed.urgencyLevel !== "self-care",
        specialties: mappedSpecialties,
        confidenceScore: typeof parsed.confidenceScore === "number" ? parsed.confidenceScore : 0.8,
      };
    } catch (error) {
      console.error("Disposition Engine error, falling back to rule-based defaults:", error);
      
      const specialtiesArray = Array.from(baseSpecialties);
      const mappedSpecialties = [];
      for (const specName of specialtiesArray) {
        const matched = await findOrCreateSpecialization(specName);
        if (matched && !mappedSpecialties.includes(matched.name)) {
          mappedSpecialties.push(matched.name);
        }
      }

      if (mappedSpecialties.length === 0) {
        mappedSpecialties.push("General Medicine");
      }

      return {
        specialist: mappedSpecialties[0] || "General Medicine",
        urgencyLevel: (clinicalState.redFlags || []).length > 0 ? "urgent" : "routine",
        explanation: `Recommended to consult a specialist for: ${symptoms.join(", ")}.`,
        matchedSymptoms: symptoms,
        warningMessage: (clinicalState.redFlags || []).length > 0 ? "Please seek care soon as red flags are reported." : "",
        canShowDoctors: true,
        specialties: mappedSpecialties,
        confidenceScore: 0.7,
      };
    }
  }
}
