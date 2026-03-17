import fs from "fs/promises";
import path from "path";

const INPUT_JSON_PATH = path.join(
  process.cwd(),
  "Rag",
  "medlineplus-topics.json"
);

const OUTPUT_JSON_PATH = path.join(
  process.cwd(),
  "Rag",
  "carefind-seeds.json"
);

const CANONICAL_SPECIALIZATIONS = new Set([
  "Anesthesiology",
  "Biochemistry",
  "Cardiology",
  "Cardiac Surgery",
  "Cancer / Oncology",
  "Chest Medicine / Pulmonology",
  "Colorectal Surgery",
  "Dental",
  "Dermatology",
  "Diabetology",
  "Dietitian & Nutrition",
  "Endocrinology",
  "ENT",
  "Gastroenterology",
  "General Medicine",
  "General Surgery",
  "Gynaecology & Obstetrics",
  "Gynaecological Oncology",
  "Haematology",
  "Hepatology",
  "Hepatobiliary Surgery",
  "IVF & Infertility",
  "Microbiology",
  "Neonatology",
  "Nephrology",
  "Neurology",
  "Neurosurgery",
  "Ophthalmology",
  "Orthopedic Surgery",
  "Paediatric Cardiology",
  "Paediatric Neurology",
  "Paediatric Nephrology",
  "Paediatrics",
  "Paediatric Surgery",
  "Pathology",
  "Physical Medicine & Rehabilitation",
  "Plastic & Cosmetic Surgery",
  "Psychiatry",
  "Radiology & Imaging",
  "Rheumatology",
  "Thoracic Surgery",
  "Transfusion Medicine",
  "Urology",
  "Vascular Surgery",
]);

function normalizeText(text = "") {
  return String(text).toLowerCase().replace(/\s+/g, " ").trim();
}

function uniqueClean(arr = []) {
  return [...new Set(arr.map((x) => String(x).trim()).filter(Boolean))];
}

function includesAny(text, keywords = []) {
  const lower = normalizeText(text);
  return keywords.some((k) => lower.includes(normalizeText(k)));
}

function getPrimaryText(topic) {
  return normalizeText(
    [
      topic.title || "",
      ...(topic.synonyms || []),
      ...(topic.groups || []),
      ...(topic.seeReferences || []),
      ...(topic.meshDescriptors || []),
    ].join(" ")
  );
}

function getSecondaryText(topic) {
  return normalizeText(
    [
      topic.metaDesc || "",
      topic.summary || "",
    ].join(" ")
  );
}

function buildTopicText(topic) {
  return normalizeText([getPrimaryText(topic), getSecondaryText(topic)].join(" "));
}

function isNonRoutingTopic(topic) {
  const title = normalizeText(topic.title || "");
  const primaryText = getPrimaryText(topic);
  const secondaryText = getSecondaryText(topic);
  const text = `${primaryText} ${secondaryText}`;
  const groups = (topic.groups || []).map(normalizeText);

  const excludedExactTitles = [
    "advance directives",
    "after surgery",
    "air pollution",
    "acupuncture",
    "anatomy",
    "wildfires",
    "veterans and military family health",
    "alzheimers caregivers",
    "alzheimer's caregivers",
    "caregivers",
    "caregiver support",
    "health fraud",
    "health literacy",
    "how to quit smoking",
    "talking with your doctor",
    "patient rights",
    "choosing a doctor or health care service",
    "choosing a doctor",
    "health care service",
    "biopsy",
    "blood count tests",
    "complete blood count",
    "cbc",
  ];

  if (excludedExactTitles.includes(title)) return true;

  const excludedPrimaryKeywords = [
    "advance directives",
    "living wills",
    "durable power of attorney",
    "medical test",
    "diagnostic test",
    "diagnostic tests",
    "screening test",
    "screening tests",
    "lab test",
    "lab tests",
    "blood test",
    "blood tests",
    "care planning",
    "health planning",
    "complementary and alternative therapies",
    "air pollution",
    "acupuncture",
    "after surgery",
    "military family health",
    "child safety",
    "disaster preparedness",
    "wildfires",
    "caregivers",
    "choosing a doctor",
    "health care service",
    "delivery of health care",
    "physician-patient relations",
    "health system",
    "biopsy",
    "blood count tests",
    "complete blood count",
    "cbc",
  ];

  const excludedGroupKeywords = [
    "diagnostic tests",
    "complementary and alternative therapies",
    "personal health issues",
    "social/family issues",
    "social and family issues",
  ];

  const onlyExcludedGroup =
    groups.length > 0 && groups.every((g) => excludedGroupKeywords.includes(g));

  if (includesAny(primaryText, excludedPrimaryKeywords)) return true;
  if (onlyExcludedGroup) return true;

  const weakMedicalSignalKeywords = [
    "pain",
    "fever",
    "cough",
    "headache",
    "disease",
    "disorder",
    "syndrome",
    "infection",
    "cancer",
    "tumor",
    "arthritis",
    "failure",
    "injury",
    "bleeding",
    "rash",
    "vomiting",
    "diarrhea",
    "constipation",
    "swelling",
    "anxiety",
    "depression",
    "stroke",
    "seizure",
    "asthma",
    "diabetes",
    "pregnancy",
    "infertility",
    "allergy",
    "anaphylaxis",
    "alcohol use disorder",
  ];

  const hasWeakMedicalSignal =
    includesAny(primaryText, weakMedicalSignalKeywords) ||
    includesAny(secondaryText, weakMedicalSignalKeywords);

  const planningOrEducationKeywords = [
    "legal document",
    "planning ahead",
    "end of life planning",
    "general wellness",
    "healthy living guide",
    "pollution exposure",
    "caregiver support",
    "disaster",
    "environmental exposure",
    "choosing a doctor",
    "health care service",
    "delivery of health care",
    "physician-patient relations",
    "health system",
    "biopsy",
    "blood count tests",
    "complete blood count",
    "cbc",
  ];

  if (includesAny(text, planningOrEducationKeywords) && !hasWeakMedicalSignal) {
    return true;
  }

  return false;
}

function shouldKeepTopic(topic) {
  if (!topic) return false;
  if (topic.language !== "English") return false;
  if (!topic.title || !topic.summary) return false;
  if (isNonRoutingTopic(topic)) return false;

  const primaryText = getPrimaryText(topic);
  const secondaryText = getSecondaryText(topic);
  const groups = (topic.groups || []).map(normalizeText);

  const usefulGroupKeywords = [
    "symptoms",
    "cancers",
    "digestive system",
    "blood, heart and circulation",
    "brain and nerves",
    "lungs and breathing",
    "skin, hair and nails",
    "ear, nose and throat",
    "female reproductive system",
    "male reproductive system",
    "endocrine system",
    "immune system",
    "infections",
    "bones, joints and muscles",
    "kidneys and urinary system",
    "mouth and teeth",
    "mental health and behavior",
    "children and teenagers",
    "pregnancy and reproduction",
  ];

  const symptomKeywords = [
    "pain",
    "fever",
    "cough",
    "shortness of breath",
    "difficulty breathing",
    "headache",
    "migraine",
    "dizziness",
    "vomiting",
    "diarrhea",
    "constipation",
    "rash",
    "itching",
    "swelling",
    "palpitations",
    "anxiety",
    "depression",
    "fatigue",
    "weakness",
    "burning urination",
    "frequent urination",
    "joint pain",
    "back pain",
    "chest pain",
    "pelvic pain",
    "abdominal pain",
    "bellyache",
    "stomach ache",
    "blurred vision",
    "ear pain",
    "sore throat",
    "bleeding",
    "lump",
    "weight loss",
  ];

  const diseaseKeywords = [
    "disease",
    "disorder",
    "syndrome",
    "infection",
    "cancer",
    "tumor",
    "tumour",
    "failure",
    "arthritis",
    "stroke",
    "seizure",
    "diabetes",
    "asthma",
    "bronchitis",
    "pneumonia",
    "hepatitis",
    "infertility",
    "kidney",
    "liver",
    "thyroid",
    "allergy",
    "anaphylaxis",
    "alcohol use disorder",
    "amyloidosis",
  ];

  const hasUsefulGroup = groups.some((g) => usefulGroupKeywords.includes(g));
  const hasSymptomSignal =
    includesAny(primaryText, symptomKeywords) ||
    includesAny(secondaryText, symptomKeywords);
  const hasDiseaseSignal =
    includesAny(primaryText, diseaseKeywords) ||
    includesAny(secondaryText, diseaseKeywords);

  return hasUsefulGroup || hasSymptomSignal || hasDiseaseSignal;
}

function inferEmergency(topic) {
  const text = buildTopicText(topic);

  const emergencyKeywords = [
    "call 911",
    "get medical help immediately",
    "seek emergency care",
    "seek immediate medical help",
    "seek medical help immediately",
    "life-threatening",
    "sudden and sharp",
    "severe chest pain",
    "vomiting blood",
    "blood in your stool",
    "loss of consciousness",
    "can't breathe",
    "cannot breathe",
    "difficulty breathing",
    "heavy bleeding",
    "stroke",
    "heart attack",
    "seizure",
    "severe allergic reaction",
    "anaphylaxis",
    "respiratory failure",
    "brain damage",
    "go to the emergency room",
    "get help right away",
  ];

  return includesAny(text, emergencyKeywords);
}

function inferDirectSpecialist(topic) {
  const title = normalizeText(topic.title || "");
  const primaryText = getPrimaryText(topic);
  const secondaryText = getSecondaryText(topic);

  // Strong title-first overrides

  if (includesAny(title, ["anesthesia", "anaesthesia"])) {
    return "Anesthesiology";
  }

  if (includesAny(title, ["aneurysm", "aneurysms"])) {
    return "Vascular Surgery";
  }
  if (includesAny(title, ["alzheimer disease", "alzheimers disease", "dementia", "parkinson disease"])) {
    return "Neurology";
  }

  if (includesAny(title, ["alcohol use disorder", "alcohol withdrawal", "anxiety", "depression", "panic disorder", "bipolar disorder", "schizophrenia"])) {
    return "Psychiatry";
  }

  if (includesAny(title, ["alcohol"])) {
    return "General Medicine";
  }

  if (includesAny(title, ["allergy"])) {
    return "ENT";
  }

  if (includesAny(title, ["anaphylaxis"])) {
    return "General Medicine";
  }

  if (includesAny(title, ["amyloidosis"])) {
    return "General Medicine";
  }

  if (includesAny(title, ["acoustic neuroma"])) {
    return "Neurosurgery";
  }

  if (includesAny(title, ["adhesions", "appendicitis", "hernia", "bowel obstruction"])) {
    return "General Surgery";
  }

  if (includesAny(title, ["foot health"])) {
    return "Orthopedic Surgery";
  }

  if (includesAny(title, ["anal disorders"])) {
    return "General Surgery";
  }

  if (includesAny(title, ["anal cancer"])) {
    return "Cancer / Oncology";
  }

  if (includesAny(title, ["addison disease", "adrenal gland disorders"])) {
    return "Endocrinology";
  }

  // Pediatric subspecialties
  if (
    includesAny(primaryText, [
      "pediatric cardiology",
      "paediatric cardiology",
      "child heart disease",
      "congenital heart disease in children",
    ])
  ) {
    return "Paediatric Cardiology";
  }

  if (
    includesAny(primaryText, [
      "pediatric neurology",
      "paediatric neurology",
      "child neurology",
    ])
  ) {
    return "Paediatric Neurology";
  }

  if (
    includesAny(primaryText, [
      "pediatric nephrology",
      "paediatric nephrology",
      "kidney disease in children",
    ])
  ) {
    return "Paediatric Nephrology";
  }

  if (
    includesAny(primaryText, [
      "neonatal",
      "newborn disorders",
      "premature infant",
      "nicu",
      "neonate",
    ])
  ) {
    return "Neonatology";
  }

  if (
    includesAny(primaryText, [
      "leukemia",
      "lymphoma",
      "myeloma",
      "hemophilia",
      "thalassemia",
      "aplastic anemia",
      "sickle cell",
      "blood cancer",
      "bone marrow disorder",
      "clotting disorder",
      "platelet disorder",
      "anemia",
      "bleeding disorder",
    ])
  ) {
    return "Haematology";
  }

  if (
    includesAny(primaryText, [
      "ovarian cancer",
      "cervical cancer",
      "uterine cancer",
      "endometrial cancer",
      "gynecologic cancer",
      "gynaecological oncology",
      "gynecological oncology",
    ])
  ) {
    return "Gynaecological Oncology";
  }

  if (
    includesAny(primaryText, [
      "skin cancer",
      "melanoma",
      "basal cell carcinoma",
      "squamous cell skin",
    ])
  ) {
    return "Dermatology";
  }

  if (
    includesAny(primaryText, [
      "cancer",
      "tumor",
      "tumour",
      "malignancy",
      "oncology",
      "carcinoma",
      "sarcoma",
      "neoplasm",
    ])
  ) {
    return "Cancer / Oncology";
  }

  if (
    includesAny(primaryText, [
      "kidney failure",
      "chronic kidney disease",
      "ckd",
      "nephrotic syndrome",
      "glomerulonephritis",
      "nephritis",
      "proteinuria",
      "dialysis",
      "renal failure",
      "kidney disease",
      "nephrology",
    ])
  ) {
    return "Nephrology";
  }

  if (
    includesAny(primaryText, [
      "fatty liver",
      "cirrhosis",
      "hepatitis",
      "liver failure",
      "liver disease",
      "autoimmune hepatitis",
      "liver fibrosis",
      "hepatology",
    ])
  ) {
    return "Hepatology";
  }

  if (
    includesAny(primaryText, [
      "rheumatoid arthritis",
      "systemic lupus",
      "lupus",
      "ankylosing spondylitis",
      "psoriatic arthritis",
      "vasculitis",
      "sjogren",
      "scleroderma",
      "gout",
      "connective tissue disease",
      "autoimmune arthritis",
      "polymyalgia rheumatica",
    ])
  ) {
    return "Rheumatology";
  }

  if (
    includesAny(primaryText, [
      "diabetes",
      "type 1 diabetes",
      "type 2 diabetes",
      "prediabetes",
      "diabetic ketoacidosis",
      "diabetic neuropathy",
      "diabetic nephropathy",
      "diabetic retinopathy",
    ])
  ) {
    return "Diabetology";
  }

  if (
    includesAny(primaryText, [
      "thyroid",
      "hyperthyroidism",
      "hypothyroidism",
      "graves disease",
      "hashimoto",
      "pituitary",
      "adrenal insufficiency",
      "addison disease",
      "cushing syndrome",
      "parathyroid",
      "hormone disorder",
      "endocrine disorder",
      "adrenal gland disorders",
    ])
  ) {
    return "Endocrinology";
  }

  if (
    includesAny(primaryText, [
      "dengue",
      "typhoid",
      "malaria",
      "tuberculosis",
      "sepsis",
      "hiv",
      "aids",
      "infectious disease",
      "meningitis",
      "encephalitis",
      "viral infection",
      "bacterial infection",
      "parasitic infection",
      "zika",
      "covid",
      "influenza",
    ])
  ) {
    return "General Medicine";
  }

  if (
    includesAny(primaryText, [
      "allergy",
      "allergic",
      "anaphylaxis",
      "hives",
      "hay fever",
      "food allergy",
      "drug allergy",
      "immune deficiency",
      "immunodeficiency",
    ])
  ) {
    return "ENT";
  }

  if (
    includesAny(primaryText, [
      "infertility",
      "ivf",
      "in vitro fertilization",
      "fertility treatment",
      "reproductive medicine",
    ])
  ) {
    return "IVF & Infertility";
  }

  if (
    includesAny(primaryText, [
      "tooth",
      "teeth",
      "gum disease",
      "dental",
      "mouth ulcer",
      "jaw pain",
      "toothache",
      "oral disease",
    ])
  ) {
    return "Dental";
  }

  if (
    includesAny(primaryText, [
      "glaucoma",
      "cataract",
      "retinal",
      "retina",
      "eye disease",
      "vision loss",
    ])
  ) {
    return "Ophthalmology";
  }

  if (
    includesAny(primaryText, [
      "sinusitis",
      "tonsillitis",
      "hearing loss",
      "otitis",
      "ear infection",
      "adenoids",
      "laryngitis",
    ])
  ) {
    return "ENT";
  }

  if (
    includesAny(primaryText, [
      "brain tumor",
      "brain tumour",
      "spinal cord compression",
      "brain hemorrhage",
      "brain haemorrhage",
      "hydrocephalus",
      "disc prolapse requiring surgery",
      "acoustic neuroma",
    ])
  ) {
    return "Neurosurgery";
  }

  if (
    includesAny(primaryText, [
      "aortic aneurysm",
      "coronary bypass",
      "heart valve surgery",
    ])
  ) {
    return "Cardiac Surgery";
  }

  if (
    includesAny(primaryText, [
      "varicose veins surgery",
      "vascular surgery",
      "peripheral artery disease surgery",
      "endovascular",
    ])
  ) {
    return "Vascular Surgery";
  }

  if (
    includesAny(primaryText, [
      "thoracic surgery",
      "lung surgery",
      "chest surgery",
      "mediastinal mass",
    ])
  ) {
    return "Thoracic Surgery";
  }

  if (
    includesAny(primaryText, [
      "gallbladder surgery",
      "bile duct surgery",
      "hepatobiliary surgery",
    ])
  ) {
    return "Hepatobiliary Surgery";
  }

  if (
    includesAny(primaryText, [
      "colorectal surgery",
      "hemorrhoid surgery",
      "rectal prolapse",
      "anal fistula",
      "colon surgery",
      "rectal surgery",
    ])
  ) {
    return "Colorectal Surgery";
  }

  if (
    includesAny(primaryText, [
      "pediatric surgery",
      "paediatric surgery",
      "child surgery",
      "surgical disease in children",
    ])
  ) {
    return "Paediatric Surgery";
  }

  if (
    includesAny(primaryText, [
      "burn reconstruction",
      "cleft lip",
      "cleft palate",
      "cosmetic surgery",
      "plastic surgery",
      "reconstructive surgery",
      "breast reconstruction",
    ])
  ) {
    return "Plastic & Cosmetic Surgery";
  }

  if (
    includesAny(primaryText, [
      "rehabilitation",
      "physical medicine",
      "chronic pain",
      "mobility problem",
      "stroke rehabilitation",
    ])
  ) {
    return "Physical Medicine & Rehabilitation";
  }

  if (
    includesAny(primaryText, [
      "x-ray",
      "ct scan",
      "mri",
      "ultrasound",
      "imaging",
      "radiology",
    ])
  ) {
    return "Radiology & Imaging";
  }

  if (
    includesAny(primaryText, [
      "biopsy result",
      "pathology",
      "histopathology",
      "tissue diagnosis",
    ])
  ) {
    return "Pathology";
  }

  if (
    includesAny(primaryText, [
      "microbiology",
      "culture sensitivity",
      "microbial diagnosis",
    ])
  ) {
    return "Microbiology";
  }

  if (
    includesAny(primaryText, [
      "transfusion",
      "blood transfusion",
      "transfusion reaction",
    ])
  ) {
    return "Transfusion Medicine";
  }

  if (
    includesAny(primaryText, [
      "biochemistry",
      "lab chemistry",
      "chemical pathology",
    ])
  ) {
    return "Biochemistry";
  }

  if (
    includesAny(primaryText, [
      "anesthesia",
      "anaesthesia",
      "perioperative",
      "pain control",
      "pain management",
    ])
  ) {
    return "Anesthesiology";
  }

  if (includesAny(secondaryText, ["alcohol dependence", "alcohol addiction", "substance use disorder"])) {
    return "Psychiatry";
  }

  return null;
}

function inferBodySystem(topic) {
  const primaryText = getPrimaryText(topic);
  const secondaryText = getSecondaryText(topic);

  if (
    includesAny(primaryText, [
      "blood, heart and circulation",
      "heart",
      "angina",
      "palpitations",
      "high blood pressure",
      "hypertension",
      "coronary artery disease",
      "arrhythmia",
      "chest pain",
    ])
  ) return "cardiovascular";

  if (
    includesAny(primaryText, [
      "lungs and breathing",
      "respiratory",
      "asthma",
      "copd",
      "bronchitis",
      "pneumonia",
      "shortness of breath",
      "difficulty breathing",
      "wheezing",
      "lung",
    ])
  ) return "respiratory";

  if (
    includesAny(primaryText, [
      "digestive system",
      "abdominal pain",
      "bellyache",
      "stomach ache",
      "vomiting",
      "diarrhea",
      "constipation",
      "reflux",
      "gerd",
      "ulcer",
      "bowel",
      "colon",
      "intestine",
      "pancreas",
      "gallbladder",
      "adhesions",
      "anal disorders",
    ])
  ) return "digestive";

  if (
    includesAny(primaryText, [
      "brain and nerves",
      "headache",
      "migraine",
      "seizure",
      "stroke",
      "neuropathy",
      "brain",
      "nerve",
      "parkinson",
      "multiple sclerosis",
      "epilepsy",
      "dementia",
      "alzheimer",
      "acoustic neuroma",
    ])
  ) return "neurological";

  if (
    includesAny(primaryText, [
      "mental health and behavior",
      "anxiety",
      "depression",
      "panic",
      "bipolar",
      "schizophrenia",
      "ocd",
      "ptsd",
      "eating disorder",
      "addiction",
      "alcohol use disorder",
    ])
  ) return "mental health";

  if (
    includesAny(primaryText, [
      "skin, hair and nails",
      "skin",
      "rash",
      "itching",
      "eczema",
      "psoriasis",
      "acne",
      "hives",
      "mole",
      "fungal skin",
    ])
  ) return "skin";

  if (
    includesAny(primaryText, [
      "eye",
      "eyes",
      "vision",
      "blurred vision",
      "glaucoma",
      "cataract",
      "retina",
      "eye diseases",
    ])
  ) return "eye";

  if (
    includesAny(primaryText, [
      "ear, nose and throat",
      "ear pain",
      "hearing loss",
      "sinus",
      "tonsil",
      "sore throat",
      "nasal",
      "nose",
      "throat",
      "ear",
      "adenoids",
      "allergy",
      "allergic rhinitis",
    ])
  ) return "ear/nose/throat";

  if (
    includesAny(primaryText, [
      "kidneys and urinary system",
      "urinary",
      "urination",
      "bladder",
      "kidney stone",
      "uti",
      "burning urination",
      "frequent urination",
      "kidney",
    ])
  ) return "urinary";

  if (
    includesAny(primaryText, [
      "female reproductive system",
      "pregnancy and reproduction",
      "pregnancy",
      "uterus",
      "ovary",
      "vaginal",
      "menstrual",
      "pelvic pain",
      "cervix",
      "breastfeeding",
      "miscarriage",
    ])
  ) return "female reproductive";

  if (
    includesAny(primaryText, [
      "male reproductive system",
      "prostate",
      "testicle",
      "penis",
      "male infertility",
      "erectile dysfunction",
    ])
  ) return "male reproductive";

  if (
    includesAny(primaryText, [
      "bones, joints and muscles",
      "bone",
      "joint",
      "muscle",
      "fracture",
      "back pain",
      "arthritis",
      "sprain",
      "tendon",
      "ligament",
      "osteoporosis",
      "foot health",
    ])
  ) return "musculoskeletal";

  if (
    includesAny(primaryText, [
      "endocrine system",
      "diabetes",
      "thyroid",
      "hormone",
      "pituitary",
      "adrenal",
      "parathyroid",
      "addison disease",
      "adrenal gland disorders",
    ])
  ) return "endocrine";

  if (
    includesAny(primaryText, [
      "immune system",
      "autoimmune",
      "allergy",
      "allergic",
      "immune deficiency",
      "immunodeficiency",
      "amyloidosis",
    ])
  ) return "immune";

  if (
    includesAny(primaryText, [
      "children and teenagers",
      "pediatric",
      "paediatric",
      "child",
      "children",
      "teen",
      "adolescent",
      "infant",
      "newborn",
    ])
  ) return "pediatric";

  if (
    includesAny(primaryText, [
      "mouth and teeth",
      "dental",
      "tooth",
      "teeth",
      "gum",
      "oral",
      "mouth",
      "jaw",
    ])
  ) return "oral";

  if (
    includesAny(primaryText, [
      "infection",
      "infections",
      "virus",
      "bacterial",
      "fungal",
      "parasitic",
      "infectious",
      "anaphylaxis",
    ])
  ) return "infectious";

  if (includesAny(primaryText, ["cancer", "tumor", "tumour", "malignancy"])) {
    return "oncology";
  }

  if (includesAny(primaryText, ["liver", "hepatitis", "cirrhosis", "fatty liver"])) {
    return "liver";
  }

  if (includesAny(secondaryText, ["chest pain", "palpitations", "heart attack"])) {
    return "cardiovascular";
  }
  if (includesAny(secondaryText, ["shortness of breath", "difficulty breathing", "wheezing", "lung"])) {
    return "respiratory";
  }
  if (includesAny(secondaryText, ["abdominal pain", "stomach", "vomiting", "diarrhea", "constipation"])) {
    return "digestive";
  }
  if (includesAny(secondaryText, ["headache", "stroke", "seizure", "migraine", "numbness"])) {
    return "neurological";
  }
  if (includesAny(secondaryText, ["anxiety", "depression", "panic attack", "mental health"])) {
    return "mental health";
  }
  if (includesAny(secondaryText, ["rash", "itching", "skin lesion", "eczema"])) {
    return "skin";
  }
  if (includesAny(secondaryText, ["kidney", "urination", "bladder", "urinary"])) {
    return "urinary";
  }
  if (includesAny(secondaryText, ["arthritis", "joint pain", "back pain", "muscle pain"])) {
    return "musculoskeletal";
  }

  return "general";
}

function mapSpecialist(bodySystem) {
  switch (bodySystem) {
    case "skin":
      return "Dermatology";
    case "eye":
      return "Ophthalmology";
    case "ear/nose/throat":
      return "ENT";
    case "cardiovascular":
      return "Cardiology";
    case "respiratory":
      return "Chest Medicine / Pulmonology";
    case "digestive":
      return "Gastroenterology";
    case "urinary":
      return "Urology";
    case "female reproductive":
      return "Gynaecology & Obstetrics";
    case "male reproductive":
      return "Urology";
    case "musculoskeletal":
      return "Orthopedic Surgery";
    case "neurological":
      return "Neurology";
    case "mental health":
      return "Psychiatry";
    case "endocrine":
      return "Endocrinology";
    case "pediatric":
      return "Paediatrics";
    case "immune":
      return "General Medicine";
    case "infectious":
      return "General Medicine";
    case "oral":
      return "Dental";
    case "oncology":
      return "Cancer / Oncology";
    case "liver":
      return "Hepatology";
    default:
      return "General Medicine";
  }
}

function inferAlternativeSpecialists(topic, recommendedSpecialist, bodySystem) {
  const text = buildTopicText(topic);
  const alts = new Set();

  const add = (...items) =>
    items
      .filter(Boolean)
      .forEach((x) => {
        if (CANONICAL_SPECIALIZATIONS.has(x)) alts.add(x);
      });

  if (recommendedSpecialist === "General Medicine") {
    if (bodySystem === "cardiovascular") add("Cardiology");
    if (bodySystem === "digestive") add("Gastroenterology", "General Surgery");
    if (bodySystem === "skin") add("Dermatology");
    if (bodySystem === "neurological") add("Neurology");
    if (bodySystem === "respiratory") add("Chest Medicine / Pulmonology");
    if (bodySystem === "endocrine") add("Endocrinology", "Diabetology");
    if (bodySystem === "urinary") add("Urology", "Nephrology");
    if (bodySystem === "female reproductive") add("Gynaecology & Obstetrics");
    if (bodySystem === "ear/nose/throat") add("ENT");
  }

  if (recommendedSpecialist === "Cancer / Oncology") {
    if (includesAny(text, ["breast"])) {
      add("Gynaecology & Obstetrics", "Plastic & Cosmetic Surgery");
    }
    if (includesAny(text, ["ovary", "uterus", "cervix", "endometrial"])) {
      add("Gynaecological Oncology", "Gynaecology & Obstetrics");
    }
    if (includesAny(text, ["lung"])) add("Chest Medicine / Pulmonology", "Thoracic Surgery");
    if (includesAny(text, ["colon", "rectum", "stomach", "pancreas", "anal"])) {
      add("Gastroenterology", "General Surgery", "Colorectal Surgery");
    }
    if (includesAny(text, ["liver", "gallbladder", "bile duct"])) {
      add("Hepatology", "Gastroenterology", "Hepatobiliary Surgery");
    }
    if (includesAny(text, ["prostate", "testicle", "bladder", "kidney"])) {
      add("Urology", "Nephrology");
    }
    if (includesAny(text, ["brain", "spine"])) {
      add("Neurology", "Neurosurgery");
    }
  }

  if (recommendedSpecialist === "Gynaecological Oncology") {
    add("Gynaecology & Obstetrics", "Cancer / Oncology");
  }

  if (recommendedSpecialist === "Haematology") {
    add("Cancer / Oncology", "Transfusion Medicine");
  }

  if (recommendedSpecialist === "Nephrology") {
    add("Urology", "General Medicine");
  }

  if (recommendedSpecialist === "Rheumatology") {
    add("Orthopedic Surgery", "General Medicine", "Physical Medicine & Rehabilitation");
  }

  if (recommendedSpecialist === "Dermatology") {
    if (includesAny(text, ["hives", "eczema", "skin allergy"])) {
      add("General Medicine");
    }
    if (includesAny(text, ["skin cancer", "melanoma"])) {
      add("Cancer / Oncology");
    }
  }

  if (recommendedSpecialist === "ENT") {
    if (includesAny(text, ["allergy", "anaphylaxis"])) {
      add("General Medicine");
    }
  }

  if (recommendedSpecialist === "Hepatology") {
    add("Gastroenterology", "Hepatobiliary Surgery");
  }

  if (recommendedSpecialist === "Diabetology") {
    add("Endocrinology", "General Medicine");
  }

  if (recommendedSpecialist === "Chest Medicine / Pulmonology") {
    if (includesAny(text, ["asthma", "allergy"])) add("General Medicine");
    if (includesAny(text, ["lung mass", "lung cancer"])) add("Cancer / Oncology");
  }

  if (recommendedSpecialist === "Neurology") {
    if (includesAny(text, ["brain tumor", "brain haemorrhage", "brain hemorrhage"])) {
      add("Neurosurgery");
    }
    add("General Medicine");
  }

  if (recommendedSpecialist === "Neurosurgery") {
    add("Neurology");
  }

  if (recommendedSpecialist === "Orthopedic Surgery") {
    add("Physical Medicine & Rehabilitation");
  }

  if (recommendedSpecialist === "Dental") {
    if (includesAny(text, ["jaw surgery", "facial trauma", "oral cancer"])) {
      add("Plastic & Cosmetic Surgery");
    }
  }

  if (recommendedSpecialist === "Psychiatry") {
    add("General Medicine");
  }

  return [...alts].filter((x) => x !== recommendedSpecialist);
}

function buildSearchText(seed) {
  return [
    `Title: ${seed.title}`,
    `Symptom cluster: ${seed.symptomCluster.join(", ")}`,
    `Synonyms: ${seed.synonyms.join(", ")}`,
    `Groups: ${seed.groups.join(", ")}`,
    `Body system: ${seed.bodySystem}`,
    `Recommended specialist: ${seed.recommendedSpecialist}`,
    `Alternative specialists: ${seed.alternativeSpecialists.join(", ")}`,
    `Emergency: ${seed.emergency}`,
    `Summary: ${seed.summary}`,
    `Explanation: ${seed.explanationSnippet}`,
    `Source: ${seed.source}`,
  ].join("\n");
}

function buildSeed(topic) {
  const directSpecialist = inferDirectSpecialist(topic);
  const bodySystem = inferBodySystem(topic);
  const recommendedSpecialist = directSpecialist || mapSpecialist(bodySystem);
  const alternativeSpecialists = inferAlternativeSpecialists(
    topic,
    recommendedSpecialist,
    bodySystem
  );
  const emergency = inferEmergency(topic);

  const symptomCluster = uniqueClean([
    topic.title,
    ...(topic.seeReferences || []),
  ]);

  const synonyms = uniqueClean([
    ...(topic.synonyms || []),
    ...(topic.seeReferences || []),
    ...(topic.meshDescriptors || []),
  ]);

  const explanationSnippet =
    (topic.metaDesc || "").trim() ||
    (topic.summary || "").slice(0, 240).trim() ||
    "";

  const shortSummary = (topic.summary || "").slice(0, 500).trim();

  const seed = {
    id: `cf_${topic.id}`,
    medlineplusId: String(topic.id),
    title: topic.title,
    symptomCluster,
    synonyms,
    groups: uniqueClean(topic.groups || []),
    bodySystem,
    recommendedSpecialist,
    alternativeSpecialists,
    emergency,
    explanationSnippet,
    summary: shortSummary,
    source: topic.source || "MedlinePlus",
  };

  return {
    ...seed,
    searchText: buildSearchText(seed),
  };
}

function isClearlyBadSeed(seed) {
  const title = normalizeText(seed.title);
  const specialist = seed.recommendedSpecialist;

    const badPairs = [
    ["addison disease", "Cancer / Oncology"],
    ["adrenal gland disorders", "Neonatology"],
    ["adhesions", "Nephrology"],
    ["advance directives", "Cancer / Oncology"],
    ["after surgery", "Dental"],
    ["air pollution", "Urology"],
    ["alcohol", "Cancer / Oncology"],
    ["alcohol", "Dermatology"],
    ["alcohol use disorder", "Cancer / Oncology"],
    ["alcohol use disorder treatment", "Diabetology"],
    ["alzheimer disease", "ENT"],
    ["anal cancer", "Gynaecological Oncology"],
    ["anal disorders", "Cancer / Oncology"],
    ["foot health", "Nephrology"],
    ["acupuncture", "Gastroenterology"],
    ["wildfires", "Psychiatry"],
    ["veterans and military family health", "Psychiatry"],
    ["anatomy", "General Medicine"],
    ["amyloidosis", "Urology"],
    ["allergy", "Dermatology"],
    ["anesthesia", "Physical Medicine & Rehabilitation"],
    ["aneurysms", "Cardiology"],
    ["aneurysm", "Cardiology"],
    ["choosing a doctor or health care service", "Hepatology"],
    ["biopsy", "Cancer / Oncology"],
    ["blood count tests", "Haematology"],
    ["complete blood count", "Haematology"],
    ["cbc", "Haematology"],
  ];

  return badPairs.some(
    ([badTitle, badSpecialist]) =>
      title.includes(badTitle) && specialist === badSpecialist
  );
}

function dedupeSeeds(seeds) {
  const map = new Map();

  for (const seed of seeds) {
    const key = normalizeText(seed.title);

    if (!map.has(key)) {
      map.set(key, seed);
      continue;
    }

    const existing = map.get(key);

    if (
      existing.recommendedSpecialist === "General Medicine" &&
      seed.recommendedSpecialist !== "General Medicine"
    ) {
      map.set(key, seed);
      continue;
    }

    const existingScore =
      (existing.summary?.length || 0) +
      (existing.explanationSnippet?.length || 0) +
      existing.alternativeSpecialists.length * 25;

    const newScore =
      (seed.summary?.length || 0) +
      (seed.explanationSnippet?.length || 0) +
      seed.alternativeSpecialists.length * 25;

    if (newScore > existingScore) {
      map.set(key, seed);
    }
  }

  return [...map.values()];
}

async function main() {
  const raw = await fs.readFile(INPUT_JSON_PATH, "utf8");
  const topics = JSON.parse(raw);

  const filtered = topics.filter(shouldKeepTopic);
  const seeds = filtered.map(buildSeed);
  const deduped = dedupeSeeds(seeds);
  const cleaned = deduped.filter((seed) => !isClearlyBadSeed(seed));

  await fs.writeFile(
    OUTPUT_JSON_PATH,
    JSON.stringify(cleaned, null, 2),
    "utf8"
  );

  const counts = cleaned.reduce((acc, seed) => {
    acc[seed.recommendedSpecialist] = (acc[seed.recommendedSpecialist] || 0) + 1;
    return acc;
  }, {});

  console.log(`Loaded topics: ${topics.length}`);
  console.log(`Filtered useful topics: ${filtered.length}`);
  console.log(`Built seeds: ${seeds.length}`);
  console.log(`Deduped seeds: ${deduped.length}`);
  console.log(`Final CareFind seeds: ${cleaned.length}`);
  console.log(`Saved to: ${OUTPUT_JSON_PATH}`);

  console.log("\nSpecialist distribution:");
  console.log(counts);

  console.log("\nSample seed:");
  console.log(JSON.stringify(cleaned[0], null, 2));
}

main().catch((err) => {
  console.error("Failed to build CareFind seeds:", err);
  process.exit(1);
});