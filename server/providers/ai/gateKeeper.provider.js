import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_TOKEN);

export async function testGatekeeper() {
  const res = await client.chatCompletion({
    model: "meta-llama/Llama-3.1-8B-Instruct:novita",
    messages: [
      {
        role: "system",
        content:
          "You are a gatekeeper for a medical symptom checker. Return only valid JSON.",
      },
      {
        role: "user",
        content: `
Classify this input and extract symptoms.

Input:
"My chest hurts when I breathe deeply and I feel feverish"

Return JSON only in this schema:
{
  "allowed": true,
  "category": "medical_symptom",
  "symptoms": ["..."],
  "possible_emergency": false,
  "needs_clarification": false
}
        `.trim(),
      },
    ],
  });

  console.log(res.choices[0].message.content);
}

