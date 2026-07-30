import { EmergencyLayer } from "../services/emergencyLayer.service.js";
import { MissingInfoEngine } from "../services/missingInfoEngine.service.js";
import { PriorityEngine } from "../services/priorityEngine.service.js";

describe("CareFind V3 Clinical Engines", () => {
  let emergencyLayer;
  let missingInfoEngine;
  let priorityEngine;

  beforeEach(() => {
    emergencyLayer = new EmergencyLayer();
    missingInfoEngine = new MissingInfoEngine();
    priorityEngine = new PriorityEngine();
  });

  describe("Emergency Detection Layer", () => {
    test("should detect emergency for combined chest pain and shortness of breath", () => {
      const state = {
        symptoms: ["chest_pain", "shortness_of_breath"],
        redFlags: [],
      };
      const result = emergencyLayer.check(state);
      expect(result.emergencyDetected).toBe(true);
      expect(result.emergencyReason).toContain("Potential cardiac event");
    });

    test("should detect emergency for stroke indicators", () => {
      const state = {
        symptoms: ["slurred_speech"],
        redFlags: [],
      };
      const result = emergencyLayer.check(state);
      expect(result.emergencyDetected).toBe(true);
      expect(result.emergencyReason).toContain("Potential stroke event");
    });

    test("should not detect emergency for fever only", () => {
      const state = {
        symptoms: ["fever"],
        redFlags: [],
      };
      const result = emergencyLayer.check(state);
      expect(result.emergencyDetected).toBe(false);
      expect(result.emergencyReason).toBeNull();
    });
  });

  describe("Missing Information Engine", () => {
    test("should find missing parameters for chest pain symptom", () => {
      const state = {
        symptoms: ["chest_pain"],
        symptomTimeline: { chest_pain: "3 days" }, // duration answered
        severity: {}, // severity missing
        answeredQuestions: ["chest_pain_location"], // location answered
      };

      const missing = missingInfoEngine.findMissing(state);
      const missingKeys = missing.map((m) => m.key);

      // Should contain chest_pain_severity, chest_pain_radiation, and red flag questions (e.g. shortness_of_breath, fainting)
      expect(missingKeys).toContain("chest_pain_severity");
      expect(missingKeys).toContain("chest_pain_radiation");
      expect(missingKeys).not.toContain("chest_pain_duration");
      expect(missingKeys).not.toContain("chest_pain_location");
      expect(missingKeys).toContain("shortness_of_breath");
    });
  });

  describe("Question Priority Engine", () => {
    test("should rank red flags above severity and duration", () => {
      const missingList = [
        { key: "chest_pain_duration", type: "required", paramName: "duration" },
        { key: "chest_pain_severity", type: "required", paramName: "severity" },
        { key: "shortness_of_breath", type: "red_flag", paramName: "shortness_of_breath" },
      ];

      const prioritized = priorityEngine.prioritize(missingList);
      expect(prioritized[0].key).toBe("shortness_of_breath");
      expect(prioritized[1].key).toBe("chest_pain_severity");
      expect(prioritized[2].key).toBe("chest_pain_duration");
    });
  });
});
