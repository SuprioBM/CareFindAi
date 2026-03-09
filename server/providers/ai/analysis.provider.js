import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_TOKEN);

export async function testMainAI() {
  const res = await client.chatCompletion({
    model: "deepseek-ai/DeepSeek-R1-0528:novita",
    messages: [
      {
        role: "system",
        content:
          "You are the reasoning model for a medical specialist recommender. Use only the provided context. Do not diagnose. Return only valid JSON.",
      },
      {
        role: "user",
        content: `
User input:
"My skin is red, itchy, and burning"

Retrieved context:
1. Symptom cluster: rash, itching, redness
   Body system: skin
   Recommended specialist: Dermatologist
   Emergency: false
   Explanation: These symptoms are often related to skin irritation, allergy, or dermatitis-like problems.

2. Symptom cluster: chest pain, shortness of breath
   Body system: cardiovascular/respiratory
   Recommended specialist: Cardiologist
   Emergency: true

Return JSON only in this schema:
{
  "recommended_specialist": "Dermatologist",
  "alternative_specialists": [],
  "matched_symptoms": ["rash", "itching", "redness"],
  "body_system": "skin",
  "emergency": false,
  "reasoning": "..."
}
        `.trim(),
      },
    ],
  });

  console.log(res.choices[0].message.content);
}

