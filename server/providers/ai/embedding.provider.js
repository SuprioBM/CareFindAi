import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_TOKEN);

export async function testEmbedding() {
  const output = await client.featureExtraction({
    model: "BAAI/bge-m3",
    inputs: "itchy red skin with small bumps on my arm",
    provider: "hf-inference",
  });

  console.log("Embedding type:", Array.isArray(output) ? "array" : typeof output);
  console.log("First few values:", output.slice(0, 8));
  console.log("Vector length:", output.length);
}

testEmbedding().catch(console.error);