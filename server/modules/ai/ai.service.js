import { runInitialCheck } from "./ai.initialCheck.js";
import { runQueryNormalizer } from "./ai.queryNormalizer.js";
import { queryMedicalContext, buildContextText } from "./ai.retrieval.js";
import { runMainAI } from "./ai.mainAI.js";
import { runBackendCheck } from "./ai.backendCheck.js";

export async function analyzeSymptomsFlow(body) {
  const checked = runInitialCheck(body);
  console.log(checked);
  

  if (!checked.ok) {
    return {
      success: false,
      stage: "initial_check",
      status: checked.status,
      message: checked.message,
    };
  }

  const {
    originalSymptoms,
    symptoms,
    inputLanguage,
  } = checked.data;

  console.log("Initial check:", {
    originalSymptoms,
    symptoms,
    inputLanguage,
  });

  const normalized = await runQueryNormalizer({
    symptoms,
    inputLanguage,
  });

  console.log("Query normalizer:", normalized);

  if (!normalized.isMedical) {
    return {
      success: false,
      stage: "query_normalizer",
      status: 400,
      message:
        "Please enter symptoms or a health-related concern so I can recommend the right specialist.",
    };
  }

  const queryText = normalized.normalizedQueryEn || symptoms;

  const matches = await queryMedicalContext(queryText, 5, "en");

  if (!matches.length) {
    return {
      success: false,
      stage: "retrieval",
      status: 404,
      message:
        "I could not find enough medical context. Please describe your symptoms in more detail.",
    };
  }

  const contextText = buildContextText(matches);
  console.log(contextText);
  

  const analysis = await runMainAI({
    symptoms,
    originalSymptoms,
    inputLanguage,
    contextText,
  });

  const finalData = runBackendCheck({
    userSymptoms: symptoms,
    originalSymptoms,
    analysis,
  });

  return {
    success: true,
    status: 200,
    data: {
      ...finalData,
      retrievalQuery: queryText,
      intermediateBangla: normalized.intermediateBangla || "",
    },
  };
}