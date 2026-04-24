/**
 * AI Question Generation Service
 * Converts missing clinical parameters into natural questions
 */

export class AIService {
  constructor() {}

  /**
   * Main entry: generate next question
   */
  generateQuestion(domain, parameterKey, parameterConfig) {
    if (!domain || !parameterKey || !parameterConfig) {
      throw new Error("Missing inputs for question generation");
    }

    return this.buildQuestion(domain, parameterKey, parameterConfig);
  }

  /**
   * Core logic for transforming parameter → question
   */
  buildQuestion(domain, key, config) {
    const domainLabel = this.formatDomain(domain);
    const humanLabel = this.formatParameterLabel(key);
    const template = this.getQuestionTemplate(key);

    switch (config.type) {
      case "boolean":
        return {
          type: "boolean",
          key,
          question: template || this.booleanQuestion(humanLabel, domainLabel),
        };

      case "scale":
        return {
          type: "scale",
          key,
          range: config.range || [1, 10],
          question: template || this.scaleQuestion(humanLabel, domainLabel, config.range),
        };

      case "enum":
        return {
          type: "enum",
          key,
          options: config.values,
          question: template || this.enumQuestion(humanLabel, domainLabel),
        };

      default:
        return {
          type: "text",
          key,
          question: template || this.genericQuestion(humanLabel, domainLabel),
        };
    }
  }

  getQuestionTemplate(key) {
    const templates = {
      pain_severity: "How severe is the pain right now on a scale from 1 to 10?",
      pain_location: "Where do you feel the pain most (chest, arm, jaw, back, or somewhere else)?",
      pain_radiation: "Does the pain spread to your arm, jaw, or back?",
      breathing_difficulty: "Are you having trouble breathing right now?",
      weakness_one_side: "Do you feel weakness or numbness on one side of your body?",
      speech_issue: "Are you having slurred speech or trouble speaking clearly?",
      vision_loss: "Have you noticed sudden vision loss or blurred vision?",
      blood_in_stool: "Have you seen any blood in your stool?",
      abdominal_pain: "Do you currently have abdominal pain?",
      urine_output: "How would you describe your urine output right now: normal, reduced, or none?",
      fever_duration_days: "For how many days has the fever been present?",
      recent_sick_contact: "Have you recently been in close contact with someone who was ill?",
      travel_history: "Have you traveled recently before these symptoms started?",
      joint_swelling: "Do you have visible joint swelling?",
      morning_stiffness: "Do your joints feel stiff in the morning for more than 30 minutes?",
      symmetrical_joint_pain: "Is the joint pain present on both sides of your body?",
      photosensitivity: "Does sunlight make your rash or joint symptoms worse?"
    };

    return templates[key] || null;
  }

  /**
   * BOOLEAN questions (yes/no)
   */
  booleanQuestion(label, domain) {
    return `Do you have ${label}?`;
  }

  /**
   * SCALE questions (1–10 type)
   */
  scaleQuestion(label, domain, range) {
    const [min, max] = range || [1, 10];
    return `On a scale of ${min} to ${max}, how would you rate your ${label}?`;
  }

  /**
   * ENUM questions (choices)
   */
  enumQuestion(label, domain) {
    return `Which of the following best describes your ${label}?`;
  }

  /**
   * fallback
   */
  genericQuestion(label) {
    return `Can you describe your ${label} in more detail?`;
  }

  /**
   * Convert parameter key → readable text
   */
  formatParameterLabel(key) {
    return key
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .toLowerCase();
  }

  /**
   * Convert domain → readable label (optional enhancement)
   */
  formatDomain(domain) {
    return domain.replace(/_/g, " ");
  }
}