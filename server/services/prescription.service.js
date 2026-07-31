import { GoogleGenAI } from "@google/genai";

// Parse Base64 Data URI into raw base64 and mimeType
function parseBase64DataURI(dataURI) {
  const matches = dataURI.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return {
      mimeType: "image/jpeg",
      data: dataURI
    };
  }
  return {
    mimeType: matches[1],
    data: matches[2]
  };
}

export class PrescriptionService {
  constructor() {
    const geminiKey = process.env.GEMINI_API_KEY;
    const googleKey = process.env.GOOGLE_API_KEY;

    console.log("-----------------------------------------------------------------");
    console.log("PrescriptionService: Initializing...");
    console.log("Detected GEMINI_API_KEY:", geminiKey ? `Present (Length: ${geminiKey.length})` : "MISSING");
    console.log("Detected GOOGLE_API_KEY:", googleKey ? `Present (Length: ${googleKey.length})` : "MISSING");

    const apiKey = geminiKey || googleKey;
    if (apiKey) {
      try {
        this.ai = new GoogleGenAI({ apiKey });
        this.isMock = false;
        console.log("PrescriptionService: SUCCESS - Google Gen AI SDK initialized with gemini-3.6-flash.");
      } catch (err) {
        this.isMock = true;
        console.error("PrescriptionService: FAILED to initialize Google Gen AI SDK. Falling back to mock mode.");
        console.error("Initialization Error Stack:", err.stack || err);
      }
    } else {
      this.isMock = true;
      console.log("PrescriptionService: WARNING - Running in sandbox/mock mode because no API keys were found in the environment.");
      console.log("To use live Gemini Flash parsing, please add 'GEMINI_API_KEY' to your server/.env or server/.env.local file and restart the server.");
    }
    console.log("-----------------------------------------------------------------");
  }

  async analyze(base64Image) {
    console.log("\n[Prescription Analyzer] Incoming request received.");

    if (this.isMock) {
      console.log("[Prescription Analyzer] Info: Running in Sandbox Mock Mode (no API key detected).");
      console.log("[Prescription Analyzer] Simulating 2.5s network delay...");
      await new Promise(resolve => setTimeout(resolve, 2500));
      console.log("[Prescription Analyzer] Returning simulated clinical mock payload.");
      return this.getMockData();
    }

    try {
      console.log("[Prescription Analyzer] Real Mode: Parsing Base64 image data...");
      const parsedImage = parseBase64DataURI(base64Image);
      console.log(`[Prescription Analyzer] MimeType: ${parsedImage.mimeType}. Image base64 data length: ${parsedImage.data.length} characters.`);
      
      const singlePrompt = `
        You are a highly precise clinical pharmacist in Bangladesh. Your task is to process this handwritten prescription image in exactly ONE step:
        
        1. Parse the handwritten text to identify all prescribed medications (including strengths and dosage instructions).
        
        2. For each medication found, perform a Google Search grounding search to retrieve:
           - Exact generic group name.
           - Active manufacturer/company name in Bangladesh.
           - Current retail price in BDT (৳) per unit (capsule/tablet/bottle) or strip.
           - Brief clinical description of its uses.
           - Key side effects.
           - Brief visual/packaging reference description.
           
        3. For each medication's generic group, perform a Google Search grounding search to find 6-7 lower-cost or direct bioequivalent alternative brands based on generic group name available in Bangladesh. For each alternative brand, retrieve:
           - Brand name.
           - Generic Group name.
           - Manufacturer (e.g. Square, Incepta, Beximco, Opsonin, Eskayef, Acme).
           - Retail price in BDT (৳) per unit.
           - Brief description of availability or usage.
           - Clear savings comparison information against the prescribed brand.
        
        Return the result strictly as a valid JSON object matching the following structure (no markdown wrappers, no backticks, just raw JSON text):
        {
          "prescribedMedications": [
            {
              "medicineName": "string (brand name extracted from prescription)",
              "strength": "string (e.g. 500mg, 20mg)",
              "dosage": "string (e.g. 1 tablet three times daily)",
              "genericName": "string",
              "manufacturer": "string",
              "priceBDT": "string (e.g. ৳ 2.50 per tablet)",
              "description": "string",
              "sideEffects": "string",
              "packagingRef": "string"
            }
          ],
          "alternativeMedications": [
            {
              "prescribedName": "string (brand name matching medicineName from prescribedMedications)",
              "genericName": "string",
              "alternatives": [
                {
                  "brandName": "string",
                  "genericName": "string",
                  "manufacturer": "string",
                  "priceBDT": "string (e.g. ৳ 2.00 per tablet)",
                  "description": "string",
                  "savingsInfo": "string (e.g. Saves ৳ 0.50 per tablet)"
                }
              ]
            }
          ]
        }
      `;

      let visionRes;
      try {
        console.log("[Prescription Analyzer] Attempting single unified grounding call with 'gemini-2.5-flash-lite'...");
        visionRes = await this.ai.models.generateContent({
          model: "gemini-3.5-flash-lite",
          contents: [
            {
              role: "user",
              parts: [
                { text: singlePrompt },
                {
                  inlineData: {
                    mimeType: parsedImage.mimeType,
                    data: parsedImage.data
                  }
                }
              ]
            }
          ],
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json"
          }
        });
      } catch (groundingError) {
        console.warn("[Prescription Analyzer] Search Grounding call failed (likely due to free-tier API quota restrictions on search tools):");
        console.warn(groundingError.message || groundingError);
        console.log("[Prescription Analyzer] Retrying analysis using standard model generation (without Google Search Grounding)...");

        const standardPrompt = `${singlePrompt}\n\nIMPORTANT: Since external search tools are currently disabled on this key, please rely on your internal clinical knowledge of the Bangladesh pharmaceutical market to estimate current BDT (৳) prices and select bioequivalent local alternative brands (e.g., matching Napa, Ace, Seclo, Losectil, etc.).`;

        visionRes = await this.ai.models.generateContent({
          model: "gemini-3.5-flash-lite",
          contents: [
            {
              role: "user",
              parts: [
                { text: standardPrompt },
                {
                  inlineData: {
                    mimeType: parsedImage.mimeType,
                    data: parsedImage.data
                  }
                }
              ]
            }
          ],
          config: {
            responseMimeType: "application/json"
          }
        });
        console.log("[Prescription Analyzer] Standard generation backup call succeeded.");
      }

      console.log("[Prescription Analyzer] Grounded response received. Parsing text content...");
      const result = JSON.parse(visionRes.text);
      console.log("[Prescription Analyzer] Successfully completed analysis. Returning results.");
      
      return {
        success: true,
        prescribedMedications: result.prescribedMedications || [],
        alternativeMedications: result.alternativeMedications || []
      };

    } catch (error) {
      console.error("[Prescription Analyzer] FATAL SERVICE ERROR:");
      console.error(error.stack || error);
      throw new Error(`Prescription analysis failed: ${error.message}`);
    }
  }

  getMockData() {
    return {
      success: true,
      prescribedMedications: [
        {
          medicineName: "Napa Extra",
          strength: "500mg + 65mg",
          dosage: "1 tablet three times daily after food",
          genericName: "Paracetamol + Caffeine",
          manufacturer: "Beximco Pharmaceuticals Ltd.",
          priceBDT: "৳ 2.50 per tablet",
          description: "A combination medication used for rapid relief of severe headache, migraine, toothache, and fever.",
          sideEffects: "Mild stomach discomfort, skin rashes, insomnia on excessive intake.",
          packagingRef: "Red and blue blister pack of 10 tablets"
        },
        {
          medicineName: "Seclo 20",
          strength: "20mg",
          dosage: "1 capsule twice daily, 30 minutes before food",
          genericName: "Omeprazole",
          manufacturer: "Square Pharmaceuticals PLC",
          priceBDT: "৳ 7.00 per capsule",
          description: "A proton pump inhibitor (PPI) that decreases the amount of acid produced in the stomach. Used to treat GERD, ulcers, and acid reflux.",
          sideEffects: "Flatulence, headache, diarrhea, abdominal pain.",
          packagingRef: "Silver foil strip with light green typography"
        }
      ],
      alternativeMedications: [
        {
          prescribedName: "Napa Extra",
          genericName: "Paracetamol + Caffeine",
          alternatives: [
            {
              brandName: "Ace Plus",
              manufacturer: "Square Pharmaceuticals PLC",
              priceBDT: "৳ 2.50 per tablet",
              description: "Equivalent strength formulation from Square. Indicated for severe headache, muscle aches, and fever.",
              savingsInfo: "Identical price point. Excellent alternative option."
            },
            {
              brandName: "Fast Plus",
              manufacturer: "Acme Laboratories Ltd.",
              priceBDT: "৳ 2.50 per tablet",
              description: "Acme's equivalent caffeine-paracetamol combination. Fast acting pain relief.",
              savingsInfo: "Identical pricing structure. Widely available."
            }
          ]
        },
        {
          prescribedName: "Seclo 20",
          genericName: "Omeprazole",
          alternatives: [
            {
              brandName: "Losectil 20",
              manufacturer: "SK+F (Eskayef Pharmaceuticals)",
              priceBDT: "৳ 6.00 per capsule",
              description: "High quality Omeprazole formulation by Eskayef. Effectively controls gastric acidity.",
              savingsInfo: "Saves ৳ 1.00 per capsule (14% savings)"
            },
            {
              brandName: "Proceptin 20",
              manufacturer: "Incepta Pharmaceuticals Ltd.",
              priceBDT: "৳ 5.00 per capsule",
              description: "Incepta's widely prescribed brand. Trusted quality with cost-effective pricing.",
              savingsInfo: "Saves ৳ 2.00 per capsule (28% savings)"
            }
          ]
        }
      ]
    };
  }
}
