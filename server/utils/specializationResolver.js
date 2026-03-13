
const canonicalSpecializations = [
  {
    name: "Anesthesiology",
    description: "Specialists in anesthesia, perioperative care, and pain control.",
    icon: "stethoscope",
    aliases: ["anesthesiology", "anesthesiology & pain"],
  },
  {
    name: "Biochemistry",
    description: "Specialists in biochemical diagnostics and laboratory medicine.",
    icon: "flask-conical",
    aliases: ["biochemistry"],
  },
  {
    name: "Cardiology",
    description: "Specialists in heart and cardiovascular system disorders.",
    icon: "heart-pulse",
    aliases: [
      "cardiology",
      "cardiologist & medicine",
      "medicine & cardiology",
      "cardiac care",
      "echocardiography",
    ],
  },
  {
    name: "Cardiac Surgery",
    description: "Specialists in surgical treatment of heart and major vessel diseases.",
    icon: "heart",
    aliases: ["cardiac surgery"],
  },
  {
    name: "Cancer / Oncology",
    description: "Specialists in diagnosis and treatment of cancer.",
    icon: "shield-plus",
    aliases: ["cancer", "oncology", "oncology cancer", "surgical oncology", "surigical oncology"],
  },
  {
    name: "Chest Medicine / Pulmonology",
    description: "Specialists in lung, breathing, asthma, COPD, and chest diseases.",
    icon: "lungs",
    aliases: [
      "chest medicine",
      "respiratory / pulmonology medicine",
      "respiratory medicine",
      "respiratory & chest diseases",
      "medicine asthma & chest",
      "asthma/copd diabetes",
    ],
  },
  {
    name: "Colorectal Surgery",
    description: "Specialists in colon, rectum, and anal surgical diseases.",
    icon: "scissors",
    aliases: ["colorectal surgery", "colerectal surgeon"],
  },
  {
    name: "Dental",
    description: "Specialists in oral health, teeth, gums, and dental procedures.",
    icon: "smile",
    aliases: [
      "dental",
      "dental doctor",
      "dental unit",
      "oral & dental surgery",
      "oral & maxillofacial surgery",
    ],
  },
  {
    name: "Dermatology",
    description: "Specialists in skin, hair, nail, allergy, and sexually transmitted skin conditions.",
    icon: "scan-face",
    aliases: [
      "dermatology",
      "dermatology /skin and sex",
      "skin & sex",
      "skin & sex specialist",
      "skin & vd",
      "skin & vd dermatology",
      "skin allergy & vd",
      "skin vd & skin laser surgery",
      "skin vd allergy & sex",
    ],
  },
  {
    name: "Diabetology",
    description: "Specialists in diabetes and metabolic disease care.",
    icon: "activity",
    aliases: [
      "diabetes",
      "medicine & diabetes",
      "diabetes thyroid & hormone",
      "endocrinology & diabetes",
      "endocrinology diabetes hormone & medicine",
      "endocrinology medicine diabetes thyroid & hormone",
      "outdoor doctor general physician diabetes specialist",
    ],
  },
  {
    name: "Dietitian & Nutrition",
    description: "Specialists in diet planning, nutrition, and food-related health management.",
    icon: "apple",
    aliases: [
      "dietitian & nutritionist",
      "nutrition",
      "nutrition & dietetics",
      "nutrition & food",
      "nutrition consultant",
      "nutrition specialist",
      "nutritionist & critical diet consultant",
    ],
  },
  {
    name: "Endocrinology",
    description: "Specialists in hormone, thyroid, metabolic, and endocrine disorders.",
    icon: "pill",
    aliases: ["endocrinology", "endocrionology"],
  },
  {
    name: "ENT",
    description: "Specialists in ear, nose, throat, and related head-neck disorders.",
    icon: "ear",
    aliases: [
      "ent",
      "e.n.t",
      "ent & head neck surgery",
      "ent ear nose & throat",
      "ent head & neck surgery",
      "speech therapy ent",
    ],
  },
  {
    name: "Gastroenterology",
    description: "Specialists in digestive system, stomach, intestine, and related disorders.",
    icon: "circle-dot",
    aliases: [
      "gastroenterology",
      "gastro enterology liver",
      "gastroenterology & liver",
      "gastroenterology liver",
      "internal medicine gastro liver",
      "liver & gastroenterology",
      "liver gastro enterology medicine",
      "medicine & gastroenterology",
      "pediatric gastrology",
    ],
  },
  {
    name: "General Medicine",
    description: "Physicians for common adult medical problems and primary internal medicine care.",
    icon: "briefcase-medical",
    aliases: [
      "medicine",
      "general physician",
      "medicine & general physician",
      "natural medicine",
      "tropical medicine",
    ],
  },
  {
    name: "General Surgery",
    description: "Specialists in common surgical procedures and general operative care.",
    icon: "scalpel",
    aliases: ["general surgery", "surgery"],
  },
  {
    name: "Gynaecology & Obstetrics",
    description: "Specialists in women’s reproductive health, pregnancy, and childbirth.",
    icon: "baby",
    aliases: [
      "gynae & obs",
      "gynae & obs specialist & surgeon",
      "gynae obs",
      "gynaecology & obstetrics",
      "gynecology & obstetrics",
      "obs & gynae",
      "obs. & gynae",
    ],
  },
  {
    name: "Gynaecological Oncology",
    description: "Specialists in cancers of the female reproductive system.",
    icon: "shield-plus",
    aliases: ["gynaecological oncology", "gynecological oncology"],
  },
  {
    name: "Haematology",
    description: "Specialists in blood disorders and blood-related diseases.",
    icon: "droplet",
    aliases: ["haematology", "haematology & medicine", "hematology"],
  },
  {
    name: "Hepatology",
    description: "Specialists in liver, gallbladder, and hepatobiliary disorders.",
    icon: "activity",
    aliases: ["hepatology", "hepatobiliary", "liver / hepatobiliary"],
  },
  {
    name: "Hepatobiliary Surgery",
    description: "Specialists in surgical treatment of liver, gallbladder, and biliary tract diseases.",
    icon: "scissors",
    aliases: ["hepato biliary surgery"],
  },
  {
    name: "IVF & Infertility",
    description: "Specialists in fertility treatment, IVF, and reproductive medicine.",
    icon: "test-tube-diagonal",
    aliases: ["ivf & infertility consultant & laparoscopy surgeon", "infertility"],
  },
  {
    name: "Microbiology",
    description: "Specialists in microorganisms, infections, and laboratory infectious disease diagnostics.",
    icon: "microscope",
    aliases: ["microbiology"],
  },
  {
    name: "Neonatology",
    description: "Specialists in medical care of newborn infants, especially ill or premature babies.",
    icon: "baby",
    aliases: ["neonatal and pediatrics"],
  },
  {
    name: "Nephrology",
    description: "Specialists in kidney diseases and renal care.",
    icon: "bean",
    aliases: ["nephrology", "nephrology & medicine", "medicine & nephrology", "nephrology kidney"],
  },
  {
    name: "Neurology",
    description: "Specialists in brain, nerve, and neurological disorders.",
    icon: "brain",
    aliases: [
      "neurology",
      "neuro medicine",
      "neuro medicine",
      "neuromedicine",
      "child neurology",
      "pediatric / neonatal and child neurology",
      "neurology & medicine",
    ],
  },
  {
    name: "Neurosurgery",
    description: "Specialists in surgical treatment of brain, spine, and nervous system disorders.",
    icon: "brain-circuit",
    aliases: [
      "neuro surgery",
      "neuro & spine surgery",
      "neurosurgery",
      "neurosurgery brain & spine surgeon",
    ],
  },
  {
    name: "Ophthalmology",
    description: "Specialists in eye diseases, vision problems, and eye surgery.",
    icon: "eye",
    aliases: [
      "eye",
      "eye specialist",
      "eye ophthalmology",
      "ophthalmology",
      "ophthalmology eye specialist & surgeon",
      "ophthalmology eye",
      "opthalmogy specialist & surgeon",
    ],
  },
  {
    name: "Orthopedic Surgery",
    description: "Specialists in bones, joints, spine, trauma, and musculoskeletal disorders.",
    icon: "bone",
    aliases: [
      "orthopedic surgery",
      "orthopedic",
      "orthopedics",
      "orthopaedic",
      "orthopaedic surgery",
      "orthopaedics",
      "orthopedic & trauma surgeon",
      "orthopaedic & spine surgery",
      "orthopedic surgery spine",
      "orthopadics",
      "ortho & spine",
      "orthopaedics specialist & surgeon",
    ],
  },
  {
    name: "Paediatric Cardiology",
    description: "Specialists in heart diseases in infants and children.",
    icon: "heart-pulse",
    aliases: [
      "paediatric cardiology",
      "paediatric & paediatric cardiology",
      "paediatrics cardiology",
      "pediatric cardiology",
    ],
  },
  {
    name: "Paediatric Neurology",
    description: "Specialists in neurological disorders in infants and children.",
    icon: "brain",
    aliases: [
      "paediatric neurology",
      "paediatric neurology & neurophysiology",
      "pediatric neurology",
      "pediatric neurology & neurophysiology",
    ],
  },
  {
    name: "Paediatric Nephrology",
    description: "Specialists in kidney diseases in infants and children.",
    icon: "bean",
    aliases: ["pediatric nephrology"],
  },
  {
    name: "Paediatrics",
    description: "Specialists in medical care of infants, children, and adolescents.",
    icon: "baby",
    aliases: ["pediatrics", "pediatric", "paediatrics", "paediatric & neonatoligst"],
  },
  {
    name: "Paediatric Surgery",
    description: "Specialists in surgical treatment for infants and children.",
    icon: "scissors",
    aliases: ["paediatric surgery", "pediatric surgery"],
  },
  {
    name: "Pathology",
    description: "Specialists in laboratory diagnosis of disease.",
    icon: "flask-conical",
    aliases: ["pathology"],
  },
  {
    name: "Physical Medicine & Rehabilitation",
    description: "Specialists in rehabilitation, pain management, physical recovery, and disability care.",
    icon: "accessibility",
    aliases: [
      "physical medicine",
      "physical medicine & rehabilitation",
      "physiotherapist",
      "physiotherapy",
      "pysiotherapist",
    ],
  },
  {
    name: "Plastic & Cosmetic Surgery",
    description: "Specialists in reconstructive, burn, and cosmetic surgical procedures.",
    icon: "sparkles",
    aliases: [
      "plastic surgery",
      "plastic & cosmetic surgery",
      "plastic surgery burn",
      "breast & cosmetic surgery",
      "breast surgery and cosmetic",
      "breast surgery",
    ],
  },
  {
    name: "Psychiatry",
    description: "Specialists in mental health, emotional disorders, and psychiatric treatment.",
    icon: "brain",
    aliases: ["psychiatry", "psychiatric", "psychology মনোবিজ্ঞান"],
  },
  {
    name: "Radiology & Imaging",
    description: "Specialists in diagnostic imaging including X-ray, CT, MRI, ultrasound, and related interpretation.",
    icon: "scan",
    aliases: ["radiology", "radiology imaging", "ct & mri", "x ray", "ultrasonograpy", "sonologist", "sonology"],
  },
  {
    name: "Rheumatology",
    description: "Specialists in arthritis, autoimmune, joint, and connective tissue disorders.",
    icon: "activity",
    aliases: [
      "rheumatology",
      "rheumatology & medicine",
      "rheumatology and medicine",
      "medicine & rheumatology",
      "medicine rheumatology",
    ],
  },
  {
    name: "Thoracic Surgery",
    description: "Specialists in surgery of chest organs excluding the heart.",
    icon: "lungs",
    aliases: ["thoracic surgery", "thoracic surgeon"],
  },
  {
    name: "Transfusion Medicine",
    description: "Specialists in blood transfusion services and transfusion-related care.",
    icon: "droplet",
    aliases: ["transfusion medicine", "transfushion medicine"],
  },
  {
    name: "Urology",
    description: "Specialists in urinary tract and male reproductive system disorders.",
    icon: "droplets",
    aliases: ["urology", "urology & uro oncology"],
  },
  {
    name: "Vascular Surgery",
    description: "Specialists in diseases and surgery of blood vessels.",
    icon: "heart",
    aliases: ["vascular surgery", "vascular endovascular surgeon"],
  },
];


/*
Normalize messy text
*/
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s&]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/*
Alias lookup map
*/
const specializationLookup = new Map();

/*
Build lookup once on server start
*/
for (const spec of canonicalSpecializations) {
  const canonicalName = spec.name;

  specializationLookup.set(normalize(canonicalName), canonicalName);

  for (const alias of spec.aliases) {
    specializationLookup.set(normalize(alias), canonicalName);
  }
}

/*
Resolve messy specialization
*/
export function resolveSpecializationName(input) {
  if (!input || typeof input !== "string") return null;

  const normalizedInput = normalize(input);

  // direct lookup (fastest)
  if (specializationLookup.has(normalizedInput)) {
    return specializationLookup.get(normalizedInput);
  }

  // partial match fallback
  for (const [alias, canonical] of specializationLookup.entries()) {
    if (normalizedInput.includes(alias)) {
      return canonical;
    }
  }

  return null;
}