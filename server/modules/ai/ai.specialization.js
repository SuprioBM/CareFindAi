function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/\//g, " ")
    .replace(/\./g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function normalizeSpecializationText(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/\//g, " ")
    .replace(/\./g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "")
    .trim();
}

export const canonicalSpecializations = [
  {
    name: "Anesthesiology",
    slug: "anesthesiology",
    description:
      "Specialists in anesthesia, perioperative care, and pain control.",
    icon: "stethoscope",
    aliases: [
      "anesthesiology",
      "anesthesiology & pain",
      "anesthesiologist",
      "anaesthesiologist",
    ],
  },
  {
    name: "Biochemistry",
    slug: "biochemistry",
    description:
      "Specialists in biochemical diagnostics and laboratory medicine.",
    icon: "flask-conical",
    aliases: ["biochemistry"],
  },
  {
    name: "Cardiology",
    slug: "cardiology",
    description:
      "Specialists in heart and cardiovascular system disorders.",
    icon: "heart-pulse",
    aliases: [
      "cardiology",
      "cardiologist",
      "cardiologist & medicine",
      "medicine & cardiology",
      "cardiac care",
      "echocardiography",
    ],
  },
  {
    name: "Cardiac Surgery",
    slug: "cardiac-surgery",
    description:
      "Specialists in surgical treatment of heart and major vessel diseases.",
    icon: "heart",
    aliases: ["cardiac surgery"],
  },
  {
    name: "Cancer / Oncology",
    slug: "cancer-oncology",
    description: "Specialists in diagnosis and treatment of cancer.",
    icon: "shield-plus",
    aliases: [
      "cancer",
      "oncology",
      "oncologist",
      "cancer specialist",
      "oncology (cancer)",
      "surgical oncology",
      "surigical oncology",
    ],
  },
  {
    name: "Chest Medicine / Pulmonology",
    slug: "chest-medicine-pulmonology",
    description:
      "Specialists in lung, breathing, asthma, COPD, and chest diseases.",
    icon: "lungs",
    aliases: [
      "chest medicine",
      "pulmonology",
      "pulmonologist",
      "respiratory / pulmonology medicine",
      "respiratory medicine",
      "respiratory & chest diseases",
      "medicine asthma & chest",
      "asthma/copd, diabetes",
    ],
  },
  {
    name: "Colorectal Surgery",
    slug: "colorectal-surgery",
    description:
      "Specialists in colon, rectum, and anal surgical diseases.",
    icon: "scissors",
    aliases: [
      "colorectal surgery",
      "colerectal surgeon",
      "colorectal surgeon",
    ],
  },
  {
    name: "Dental",
    slug: "dental",
    description:
      "Specialists in oral health, teeth, gums, and dental procedures.",
    icon: "smile",
    aliases: [
      "dental",
      "dentist",
      "dental doctor",
      "dental unit",
      "oral & dental surgery",
      "oral & maxillofacial surgery",
    ],
  },
  {
    name: "Dermatology",
    slug: "dermatology",
    description:
      "Specialists in skin, hair, nail, allergy, and sexually transmitted skin conditions.",
    icon: "scan-face",
    aliases: [
      "dermatology",
      "dermatologist",
      "dermatology /skin and sex",
      "skin & sex",
      "skin & sex specialist",
      "skin & vd",
      "skin & vd (dermatology)",
      "skin, allergy & vd",
      "skin, vd & skin laser surgery",
      "skin, vd, allergy & sex",
    ],
  },
  {
    name: "Diabetology",
    slug: "diabetology",
    description:
      "Specialists in diabetes and metabolic disease care.",
    icon: "activity",
    aliases: [
      "diabetes",
      "medicine & diabetes",
      "diabetes, thyroid & hormone",
      "endocrinology & diabetes",
      "endocrinology (diabetes,hormone & medicine)",
      "endocrinology (medicine,diabetes,thyroid & hormone)",
      "outdoor doctor (general physician diabetes specialist)",
    ],
  },
  {
    name: "Dietitian & Nutrition",
    slug: "dietitian-nutrition",
    description:
      "Specialists in diet planning, nutrition, and food-related health management.",
    icon: "apple",
    aliases: [
      "dietitian",
      "nutritionist",
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
    slug: "endocrinology",
    description:
      "Specialists in hormone, thyroid, metabolic, and endocrine disorders.",
    icon: "pill",
    aliases: [
      "endocrinology",
      "endocrinologist",
      "endocrionology",
    ],
  },
  {
    name: "ENT",
    slug: "ent",
    description:
      "Specialists in ear, nose, throat, and related head-neck disorders.",
    icon: "ear",
    aliases: [
      "ent",
      "e.n.t",
      "ent specialist",
      "otolaryngologist",
      "ent & head neck surgery",
      "ent (ear, nose & throat)",
      "ent (head & neck surgery)",
      "speech therapy - ent",
    ],
  },
  {
    name: "Gastroenterology",
    slug: "gastroenterology",
    description:
      "Specialists in digestive system, stomach, intestine, and related disorders.",
    icon: "circle-dot",
    aliases: [
      "gastroenterology",
      "gastroenterologist",
      "gastro-enterology liver",
      "gastroenterology & liver",
      "gastroenterology (liver)",
      "internal medicine / gastro-liver",
      "liver & gastroenterology",
      "liver, gastro-enterology medicine",
      "medicine & gastroenterology",
      "pediatric gastrology",
    ],
  },
  {
    name: "General Medicine",
    slug: "general-medicine",
    description:
      "Physicians for common adult medical problems and primary internal medicine care.",
    icon: "briefcase-medical",
    aliases: [
      "medicine",
      "general physician",
      "general practitioner",
      "physician",
      "medicine & general physician",
      "natural medicine",
      "tropical medicine",
    ],
  },
  {
    name: "General Surgery",
    slug: "general-surgery",
    description:
      "Specialists in common surgical procedures and general operative care.",
    icon: "scalpel",
    aliases: [
      "general surgery",
      "surgery",
      "surgeon",
    ],
  },
  {
    name: "Gynaecology & Obstetrics",
    slug: "gynaecology-obstetrics",
    description:
      "Specialists in women’s reproductive health, pregnancy, and childbirth.",
    icon: "baby",
    aliases: [
      "gynae & obs",
      "gynae & obs. specialist & surgeon",
      "gynae obs",
      "gynaecology & obstetrics",
      "gynecology & obstetrics",
      "gynecologist",
      "gynaecologist",
      "obstetrician",
      "gynecologist / obstetrician",
      "obs & gynae",
      "obs. & gynae",
    ],
  },
  {
    name: "Gynaecological Oncology",
    slug: "gynaecological-oncology",
    description:
      "Specialists in cancers of the female reproductive system.",
    icon: "shield-plus",
    aliases: [
      "gynaecological oncology",
      "gynecological oncology",
    ],
  },
  {
    name: "Haematology",
    slug: "haematology",
    description:
      "Specialists in blood disorders and blood-related diseases.",
    icon: "droplet",
    aliases: [
      "haematology",
      "haematologist",
      "haematology & medicine",
      "hematology",
      "hematologist",
    ],
  },
  {
    name: "Hepatology",
    slug: "hepatology",
    description:
      "Specialists in liver, gallbladder, and hepatobiliary disorders.",
    icon: "activity",
    aliases: [
      "hepatology",
      "hepatologist",
      "hepatobiliary",
      "liver / hepatobiliary",
    ],
  },
  {
    name: "Hepatobiliary Surgery",
    slug: "hepatobiliary-surgery",
    description:
      "Specialists in surgical treatment of liver, gallbladder, and biliary tract diseases.",
    icon: "scissors",
    aliases: [
      "hepato-biliary surgery",
      "hepatobiliary surgery",
    ],
  },
  {
    name: "IVF & Infertility",
    slug: "ivf-infertility",
    description:
      "Specialists in fertility treatment, IVF, and reproductive medicine.",
    icon: "test-tube-diagonal",
    aliases: [
      "ivf specialist",
      "infertility specialist",
      "ivf & infertility consultant & laparoscopy surgeon",
      "infertility",
    ],
  },
  {
    name: "Microbiology",
    slug: "microbiology",
    description:
      "Specialists in microorganisms, infections, and laboratory infectious disease diagnostics.",
    icon: "microscope",
    aliases: [
      "microbiology",
      "microbiologist",
    ],
  },
  {
    name: "Neonatology",
    slug: "neonatology",
    description:
      "Specialists in medical care of newborn infants, especially ill or premature babies.",
    icon: "baby",
    aliases: [
      "neonatology",
      "neonatologist",
      "neonatal and pediatrics",
    ],
  },
  {
    name: "Nephrology",
    slug: "nephrology",
    description: "Specialists in kidney diseases and renal care.",
    icon: "bean",
    aliases: [
      "nephrology",
      "nephrologist",
      "nephrology & medicine",
      "medicine & nephrology",
      "nephrology (kidney)",
    ],
  },
  {
    name: "Neurology",
    slug: "neurology",
    description:
      "Specialists in brain, nerve, and neurological disorders.",
    icon: "brain",
    aliases: [
      "neurology",
      "neurologist",
      "neuro medicine",
      "neuro-medicine",
      "neuromedicine",
      "child neurology",
      "pediatric / neonatal and child neurology",
      "neurology & medicine",
    ],
  },
  {
    name: "Neurosurgery",
    slug: "neurosurgery",
    description:
      "Specialists in surgical treatment of brain, spine, and nervous system disorders.",
    icon: "brain-circuit",
    aliases: [
      "neuro surgery",
      "neuro & spine surgery",
      "neurosurgery",
      "neurosurgeon",
      "neurosurgery (brain & spine surgeon)",
    ],
  },
  {
    name: "Ophthalmology",
    slug: "ophthalmology",
    description:
      "Specialists in eye diseases, vision problems, and eye surgery.",
    icon: "eye",
    aliases: [
      "eye",
      "eye specialist",
      "eye/ophthalmology",
      "ophthalmology",
      "ophthalmologist",
      "ophthalmology (eye specialist & surgeon)",
      "ophthalmology(eye)",
      "opthalmogy specialist & surgeon",
    ],
  },
  {
    name: "Orthopedic Surgery",
    slug: "orthopedic-surgery",
    description:
      "Specialists in bones, joints, spine, trauma, and musculoskeletal disorders.",
    icon: "bone",
    aliases: [
      "orthopedic surgery",
      "orthopedic",
      "orthopedics",
      "orthopaedic",
      "orthopaedic surgery",
      "orthopaedics",
      "orthopedic surgeon",
      "orthopedic & trauma surgeon",
      "orthopaedic & spine surgery",
      "orthopedic surgery (spine)",
      "orthopadics",
      "ortho & spine",
      "orthopaedics specialist & surgeon",
    ],
  },
  {
    name: "Paediatric Cardiology",
    slug: "paediatric-cardiology",
    description:
      "Specialists in heart diseases in infants and children.",
    icon: "heart-pulse",
    aliases: [
      "paediatric cardiology",
      "paediatric & paediatric cardiology",
      "paediatrics cardiology",
      "pediatric cardiology",
      "pediatric cardiologist",
      "paediatric cardiologist",
    ],
  },
  {
    name: "Paediatric Neurology",
    slug: "paediatric-neurology",
    description:
      "Specialists in neurological disorders in infants and children.",
    icon: "brain",
    aliases: [
      "paediatric neurology",
      "paediatric neurology & neurophysiology",
      "pediatric neurology",
      "pediatric neurology & neurophysiology",
      "pediatric neurologist",
      "paediatric neurologist",
    ],
  },
  {
    name: "Paediatric Nephrology",
    slug: "paediatric-nephrology",
    description:
      "Specialists in kidney diseases in infants and children.",
    icon: "bean",
    aliases: [
      "pediatric nephrology",
      "paediatric nephrology",
      "pediatric nephrologist",
      "paediatric nephrologist",
    ],
  },
  {
    name: "Paediatrics",
    slug: "paediatrics",
    description:
      "Specialists in medical care of infants, children, and adolescents.",
    icon: "baby",
    aliases: [
      "pediatrics",
      "pediatric",
      "pediatrician",
      "paediatrician",
      "paediatrics",
      "paediatric & neonatoligst",
    ],
  },
  {
    name: "Paediatric Surgery",
    slug: "paediatric-surgery",
    description:
      "Specialists in surgical treatment for infants and children.",
    icon: "scissors",
    aliases: [
      "paediatric surgery",
      "pediatric surgery",
    ],
  },
  {
    name: "Pathology",
    slug: "pathology",
    description:
      "Specialists in laboratory diagnosis of disease.",
    icon: "flask-conical",
    aliases: [
      "pathology",
      "pathologist",
    ],
  },
  {
    name: "Physical Medicine & Rehabilitation",
    slug: "physical-medicine-rehabilitation",
    description:
      "Specialists in rehabilitation, pain management, physical recovery, and disability care.",
    icon: "accessibility",
    aliases: [
      "physical medicine",
      "physical medicine and rehabilitation",
      "physical medicine & rehabilitation",
      "physiatrist",
      "physiotherapist",
      "physiotherapy",
      "pysiotherapist",
    ],
  },
  {
    name: "Plastic & Cosmetic Surgery",
    slug: "plastic-cosmetic-surgery",
    description:
      "Specialists in reconstructive, burn, and cosmetic surgical procedures.",
    icon: "sparkles",
    aliases: [
      "plastic surgeon",
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
    slug: "psychiatry",
    description:
      "Specialists in mental health, emotional disorders, and psychiatric treatment.",
    icon: "brain",
    aliases: [
      "psychiatry",
      "psychiatrist",
      "psychiatric",
      "psychology (মনোবিজ্ঞান)",
    ],
  },
  {
    name: "Radiology & Imaging",
    slug: "radiology-imaging",
    description:
      "Specialists in diagnostic imaging including X-ray, CT, MRI, ultrasound, and related interpretation.",
    icon: "scan",
    aliases: [
      "radiology",
      "radiologist",
      "radiology imaging",
      "ct & mri",
      "x-ray",
      "ultrasonograpy",
      "sonologist",
      "sonology",
    ],
  },
  {
    name: "Rheumatology",
    slug: "rheumatology",
    description:
      "Specialists in arthritis, autoimmune, joint, and connective tissue disorders.",
    icon: "activity",
    aliases: [
      "rheumatology",
      "rheumatologist",
      "rheumatology & medicine",
      "rheumatology and medicine",
      "medicine & rheumatology",
      "medicine rheumatology",
    ],
  },
  {
    name: "Thoracic Surgery",
    slug: "thoracic-surgery",
    description:
      "Specialists in surgery of chest organs excluding the heart.",
    icon: "lungs",
    aliases: [
      "thoracic surgery",
      "thoracic surgeon",
    ],
  },
  {
    name: "Transfusion Medicine",
    slug: "transfusion-medicine",
    description:
      "Specialists in blood transfusion services and transfusion-related care.",
    icon: "droplet",
    aliases: [
      "transfusion medicine",
      "transfushion medicine",
    ],
  },
  {
    name: "Urology",
    slug: "urology",
    description:
      "Specialists in urinary tract and male reproductive system disorders.",
    icon: "droplets",
    aliases: [
      "urology",
      "urologist",
      "urology & uro-oncology",
    ],
  },
  {
    name: "Vascular Surgery",
    slug: "vascular-surgery",
    description:
      "Specialists in diseases and surgery of blood vessels.",
    icon: "heart",
    aliases: [
      "vascular surgery",
      "vascular surgeon",
      "vascular endovascular surgeon",
    ],
  },
];

export const SPECIALIZATION_NAME_SET = new Set(
  canonicalSpecializations.map((item) => item.name)
);

export const SPECIALIZATION_SLUG_SET = new Set(
  canonicalSpecializations.map((item) => item.slug)
);

export const specializationSelectOptions = canonicalSpecializations.map(
  (item) => ({
    label: item.name,
    value: item.slug,
  })
);

export function findSpecializationBySlug(slug = "") {
  const normalizedSlug = slugify(slug);
  return (
    canonicalSpecializations.find((item) => item.slug === normalizedSlug) ||
    null
  );
}

export function resolveCanonicalSpecialization(input = "") {
  const normalizedInput = normalizeSpecializationText(input);
  if (!normalizedInput) return null;

  const inputSlug = slugify(input);

  for (const item of canonicalSpecializations) {
    if (normalizeSpecializationText(item.name) === normalizedInput) {
      return item;
    }

    if (item.slug === inputSlug) {
      return item;
    }

    if (
      Array.isArray(item.aliases) &&
      item.aliases.some(
        (alias) => normalizeSpecializationText(alias) === normalizedInput
      )
    ) {
      return item;
    }
  }

  return null;
}

export function resolveCanonicalSpecializationName(input = "") {
  return resolveCanonicalSpecialization(input)?.name || "";
}

export function resolveCanonicalSpecializationSlug(input = "") {
  return resolveCanonicalSpecialization(input)?.slug || "";
}

export function isAllowedSpecializationName(name = "") {
  return SPECIALIZATION_NAME_SET.has(name);
}

export function isAllowedSpecializationSlug(slug = "") {
  return SPECIALIZATION_SLUG_SET.has(slugify(slug));
}

export const FALLBACK_SPECIALIZATION_SLUG = "general-medicine";

export function getFallbackSpecialization() {
  return findSpecializationBySlug(FALLBACK_SPECIALIZATION_SLUG);
}