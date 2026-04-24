export const DOMAIN_CONFIG = {
  cardiovascular: {
    weight: 0.95,

    specialties: [
      "Cardiology",
      "Cardiac Surgery",
      "Vascular Surgery",
      "General Physician"
    ],

    symptoms: [
      "chest pain",
      "chest pressure",
      "tightness",
      "palpitations",
      "irregular heartbeat",
      "shortness of breath"
    ],

    redFlags: [
      "severe chest pain",
      "pain spreading to arm",
      "jaw pain",
      "collapse",
      "fainting"
    ],

    severitySignals: [
      "pain_level",
      "radiating_pain",
      "breathing_difficulty"
    ],

    // 🧠 NEW LAYER (IMPORTANT UPGRADE)
    parameters: {
      pain_location: {
        type: "enum",
        values: ["chest", "arm", "jaw", "back", "other"],
        required: true,
        importance: "critical"
      },

      pain_severity: {
        type: "scale",
        range: [1, 10],
        required: true,
        importance: "critical"
      },

      breathing_difficulty: {
        type: "boolean",
        required: true,
        importance: "critical"
      },

      pain_radiation: {
        type: "boolean",
        required: true,
        importance: "critical"
      }
    }
  },

  respiratory: {
    weight: 0.8,

    specialties: [
      "Pulmonology",
      "ENT",
      "General Physician"
    ],

    symptoms: [
      "cough",
      "breathing difficulty",
      "wheezing",
      "chest congestion"
    ],

    redFlags: [
      "severe breathing difficulty",
      "bluish lips",
      "cannot breathe"
    ],

    severitySignals: [
      "breathing_difficulty",
      "oxygen_issue"
    ],

    parameters: {
      breathing_difficulty: {
        type: "boolean",
        required: true,
        importance: "critical"
      },

      cough: {
        type: "boolean",
        required: false,
        importance: "medium"
      },

      chest_tightness: {
        type: "boolean",
        required: false,
        importance: "medium"
      }
    }
  },

  neurological: {
    weight: 0.9,

    specialties: [
      "Neurology",
      "Neurosurgery"
    ],

    symptoms: [
      "headache",
      "dizziness",
      "vision loss",
      "weakness",
      "weakness one side",
      "speech issue",
      "numbness",
      "arm numbness",
      "stroke",
      "stroke symptoms"
    ],

    redFlags: [
      "sudden paralysis",
      "slurred speech",
      "loss of consciousness",
      "one sided numbness",
      "stroke symptoms"
    ],

    severitySignals: [
      "motor_loss",
      "speech_issue"
    ],

    parameters: {
      weakness_one_side: {
        type: "boolean",
        required: true,
        importance: "critical"
      },

      arm_numbness: {
        type: "boolean",
        required: false,
        importance: "high"
      },

      speech_issue: {
        type: "boolean",
        required: true,
        importance: "critical"
      },

      vision_loss: {
        type: "boolean",
        required: false,
        importance: "high"
      }
    }
  },

  gastrointestinal: {
    weight: 0.75,

    specialties: [
      "Gastroenterology",
      "Hepatology",
      "General Physician"
    ],

    symptoms: [
      "abdominal pain",
      "nausea",
      "vomiting",
      "diarrhea",
      "constipation"
    ],

    redFlags: [
      "blood in stool",
      "severe abdominal pain",
      "persistent vomiting"
    ],

    severitySignals: [
      "pain_level",
      "duration"
    ],

    parameters: {
      abdominal_pain: {
        type: "boolean",
        required: true,
        importance: "critical"
      },

      blood_in_stool: {
        type: "boolean",
        required: true,
        importance: "critical"
      },

      vomiting: {
        type: "boolean",
        required: false,
        importance: "medium"
      }
    }
  },

  genitourinary: {
    weight: 0.7,

    specialties: [
      "Urology",
      "Nephrology"
    ],

    symptoms: [
      "painful urination",
      "frequent urination",
      "blood in urine"
    ],

    redFlags: [
      "no urine output",
      "severe flank pain"
    ],

    severitySignals: [
      "urinary_issue"
    ],

    parameters: {
      painful_urination: {
        type: "boolean",
        required: false,
        importance: "medium"
      },

      blood_in_urine: {
        type: "boolean",
        required: true,
        importance: "critical"
      },

      urine_output: {
        type: "enum",
        values: ["normal", "reduced", "none"],
        required: true,
        importance: "critical"
      }
    }
  },

  infectious: {
    weight: 0.9,

    specialties: [
      "Infectious Disease",
      "General Physician"
    ],

    symptoms: [
      "fever",
      "chills",
      "skin rash",
      "fatigue",
      "sore throat",
      "body ache"
    ],

    redFlags: [
      "persistent high fever",
      "fever with rash",
      "confusion",
      "dehydration"
    ],

    severitySignals: [
      "fever_present",
      "fever_duration_days"
    ],

    parameters: {
      fever_present: {
        type: "boolean",
        required: true,
        importance: "critical"
      },

      fever_duration_days: {
        type: "scale",
        range: [1, 30],
        required: true,
        importance: "critical"
      },

      recent_sick_contact: {
        type: "boolean",
        required: false,
        importance: "high"
      },

      travel_history: {
        type: "boolean",
        required: false,
        importance: "high"
      }
    }
  },

  rheumatology: {
    weight: 0.88,

    specialties: [
      "Rheumatology",
      "General Physician"
    ],

    symptoms: [
      "joint pain",
      "joint swelling",
      "morning stiffness",
      "skin rash",
      "fatigue",
      "muscle pain"
    ],

    redFlags: [
      "joint swelling with fever",
      "severe joint stiffness",
      "systemic rash"
    ],

    severitySignals: [
      "joint_swelling",
      "morning_stiffness",
      "fever_present"
    ],

    parameters: {
      joint_swelling: {
        type: "boolean",
        required: true,
        importance: "critical"
      },

      morning_stiffness: {
        type: "boolean",
        required: true,
        importance: "critical"
      },

      symmetrical_joint_pain: {
        type: "boolean",
        required: false,
        importance: "high"
      },

      photosensitivity: {
        type: "boolean",
        required: false,
        importance: "high"
      }
    }
  },

  endocrine: {
    weight: 0.55,

    specialties: [
      "Endocrinology",
      "Diabetology"
    ],

    symptoms: [
      "fatigue",
      "weight changes",
      "excess thirst"
    ],

    redFlags: [
      "extreme weakness",
      "confusion"
    ],

    severitySignals: [
      "chronicity"
    ],

    parameters: {
      weight_change: {
        type: "enum",
        values: ["gain", "loss", "none"],
        required: false,
        importance: "medium"
      },

      fatigue: {
        type: "boolean",
        required: false,
        importance: "medium"
      }
    }
  },

  musculoskeletal: {
    weight: 0.6,

    specialties: [
      "Orthopedics",
      "Rheumatology"
    ],

    symptoms: [
      "joint pain",
      "muscle pain",
      "swelling"
    ],

    redFlags: [
      "inability to move",
      "severe trauma"
    ],

    severitySignals: [
      "mobility_loss"
    ],

    parameters: {
      joint_pain: {
        type: "boolean",
        required: false,
        importance: "medium"
      },

      mobility_loss: {
        type: "boolean",
        required: true,
        importance: "critical"
      }
    }
  },

  dermatology: {
    weight: 0.5,

    specialties: ["Dermatology"],

    symptoms: [
      "rash",
      "itching",
      "skin redness"
    ],

    redFlags: [
      "rapid spreading rash",
      "skin infection"
    ],

    severitySignals: [],

    parameters: {
      rash: {
        type: "boolean",
        required: false,
        importance: "medium"
      }
    }
  },

  psychiatric: {
    weight: 0.7,

    specialties: ["Psychiatry"],

    symptoms: [
      "anxiety",
      "depression",
      "panic"
    ],

    redFlags: [
      "suicidal thoughts",
      "loss of control"
    ],

    severitySignals: [
      "mental_distress"
    ],

    parameters: {
      anxiety: {
        type: "boolean",
        required: false,
        importance: "medium"
      },

      suicidal_thoughts: {
        type: "boolean",
        required: true,
        importance: "critical"
      }
    }
  },

  general: {
    weight: 0.5,

    specialties: [
      "General Physician",
      "General Medicine"
    ],

    symptoms: [],

    redFlags: [],

    severitySignals: [],

    parameters: {
      duration: {
        type: "enum",
        values: ["hours", "days", "weeks", "months"],
        required: false,
        importance: "medium"
      }
    }
  }
};