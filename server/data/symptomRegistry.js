export const SYMPTOM_REGISTRY = {
  fever: {
    symptom: "fever",
    requiredQuestions: [
      "duration",
      "severity",
      "associated_symptoms",
      "temperature"
    ],
    redFlags: [
      "stiff_neck",
      "confusion",
      "difficulty_breathing",
      "high_fever_above_103"
    ],
    specialties: [
      "Internal Medicine",
      "General Medicine"
    ]
  },
  cough: {
    symptom: "cough",
    requiredQuestions: [
      "duration",
      "cough_type",
      "sputum_color",
      "severity"
    ],
    redFlags: [
      "hemoptysis",
      "shortness_of_breath",
      "unexplained_weight_loss"
    ],
    specialties: [
      "Pulmonology",
      "Internal Medicine",
      "General Medicine"
    ]
  },
  headache: {
    symptom: "headache",
    requiredQuestions: [
      "duration",
      "severity",
      "location",
      "headache_type"
    ],
    redFlags: [
      "sudden_severe_onset",
      "stiff_neck",
      "visual_disturbances",
      "confusion",
      "head_injury_history"
    ],
    specialties: [
      "Neurology",
      "Internal Medicine"
    ]
  },
  chest_pain: {
    symptom: "chest_pain",
    requiredQuestions: [
      "duration",
      "severity",
      "location",
      "radiation"
    ],
    redFlags: [
      "shortness_of_breath",
      "fainting",
      "jaw_pain",
      "left_arm_pain"
    ],
    specialties: [
      "Cardiology",
      "Emergency Medicine"
    ]
  },
  shortness_of_breath: {
    symptom: "shortness_of_breath",
    requiredQuestions: [
      "duration",
      "severity",
      "onset_type",
      "triggering_factors"
    ],
    redFlags: [
      "chest_pain",
      "cyanosis",
      "unable_to_speak_in_full_sentences",
      "fainting"
    ],
    specialties: [
      "Pulmonology",
      "Cardiology",
      "Emergency Medicine"
    ]
  },
  abdominal_pain: {
    symptom: "abdominal_pain",
    requiredQuestions: [
      "duration",
      "severity",
      "location",
      "abdominal_pain_type"
    ],
    redFlags: [
      "severe_sudden_pain",
      "high_fever",
      "persistent_vomiting",
      "blood_in_stool",
      "guarding_or_rigidity"
    ],
    specialties: [
      "Gastroenterology",
      "General Surgery",
      "Internal Medicine"
    ]
  },
  nausea: {
    symptom: "nausea",
    requiredQuestions: [
      "duration",
      "severity",
      "triggering_factors"
    ],
    redFlags: [
      "severe_headache",
      "chest_pain",
      "confusion",
      "unable_to_keep_fluids_down"
    ],
    specialties: [
      "Gastroenterology",
      "Internal Medicine"
    ]
  },
  vomiting: {
    symptom: "vomiting",
    requiredQuestions: [
      "duration",
      "severity",
      "vomit_content",
      "frequency"
    ],
    redFlags: [
      "hematemesis",
      "fecal_vomiting",
      "signs_of_severe_dehydration",
      "severe_abdominal_pain"
    ],
    specialties: [
      "Gastroenterology",
      "Internal Medicine",
      "General Medicine"
    ]
  },
  diarrhea: {
    symptom: "diarrhea",
    requiredQuestions: [
      "duration",
      "severity",
      "frequency",
      "stool_consistency"
    ],
    redFlags: [
      "blood_in_stool",
      "high_fever",
      "severe_dehydration",
      "severe_abdominal_pain"
    ],
    specialties: [
      "Gastroenterology",
      "Internal Medicine",
      "General Medicine"
    ]
  },
  sore_throat: {
    symptom: "sore_throat",
    requiredQuestions: [
      "duration",
      "severity",
      "difficulty_swallowing",
      "fever_presence"
    ],
    redFlags: [
      "difficulty_breathing",
      "unable_to_open_mouth_fully",
      "drooling"
    ],
    specialties: [
      "Otolaryngology",
      "General Physic",
      "Internal Medicine"
    ]
  },
  rash: {
    symptom: "rash",
    requiredQuestions: [
      "duration",
      "severity",
      "location",
      "itchiness"
    ],
    redFlags: [
      "rapidly_spreading",
      "fever_presence",
      "blistering_peeling",
      "signs_of_infection"
    ],
    specialties: [
      "Dermatology"
    ]
  },
  back_pain: {
    symptom: "back_pain",
    requiredQuestions: [
      "duration",
      "severity",
      "location",
      "injury_history"
    ],
    redFlags: [
      "bowel_bladder_incontinence",
      "saddle_anesthesia",
      "progressive_bilateral_weakness",
      "unexplained_weight_loss"
    ],
    specialties: [
      "Orthopedics",
      "Neurology",
      "Physical Medicine and Rehabilitation",
      "General Medicine"
    ]
  },
  neck_pain: {
    symptom: "neck_pain",
    requiredQuestions: [
      "duration",
      "severity",
      "injury_history"
    ],
    redFlags: [
      "stiff_neck",
      "radiating_arm_pain_or_numbness",
      "bowel_bladder_incontinence",
      "progressive_weakness",
      "head_injury_history"
    ],
    specialties: [
      "Orthopedic Surgery",
      "Neurology",
      "Physical Medicine and Rehabilitation",
      "General Medicine"
    ]
  },
  joint_pain: {
    symptom: "joint_pain",
    requiredQuestions: [
      "duration",
      "severity",
      "joints_affected",
      "swelling_presence"
    ],
    redFlags: [
      "joint_redness_warmth",
      "high_fever",
      "inability_to_bear_weight",
      "sudden_severe_onset"
    ],
    specialties: [
      "Rheumatology",
      "Orthopedics"
    ]
  }
};
