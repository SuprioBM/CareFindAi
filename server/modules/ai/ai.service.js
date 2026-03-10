import { runInitialCheck } from "./ai.initialCheck.js";
import { runGatekeeperAI } from "./ai.gateKeeper.js";
import { queryMedicalContext, buildContextText } from "./ai.retrieval.js";
import { runMainAI } from "./ai.mainAI.js";
import { runBackendCheck } from "./ai.backendCheck.js";

export async function analyzeSymptomsFlow(body) {
  const checked = runInitialCheck(body);

  if (!checked.ok) {
    return {
      success: false,
      stage: "initial_check",
      status: checked.status,
      message: checked.message,
    };
  }

  const { symptoms, language } = checked.data;
  console.log(symptoms,language);
  

  const gatekeeper = await runGatekeeperAI(symptoms);
  console.log(gatekeeper);
  

  if (!gatekeeper.allowed) {
    return {
      success: false,
      stage: "gatekeeper",
      status: 400,
      message:
        "Please enter symptoms or a health-related concern so I can recommend the right specialist.",
      debug: {
        category: gatekeeper.category,
        reason: gatekeeper.reason,
      },
    };
  }

  const queryText = gatekeeper.cleaned_query || symptoms;
  const matches = await queryMedicalContext(queryText, 5);

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

  const analysis = await runMainAI({
    symptoms,
    language,
    contextText,
  });

  const finalData = runBackendCheck({
    userSymptoms: symptoms,
    analysis,
  });

  return {
    success: true,
    status: 200,
    data: finalData,
  };
}