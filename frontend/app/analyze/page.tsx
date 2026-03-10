"use client";

import { useState } from "react";

type AnalyzeSuccess = {
  success: true;
  status: number;
  data: {
    specialist: string;
    explanation: string;
    urgency: "low" | "medium" | "high" | "emergency";
    warningMessage: string;
    matchedSymptoms: string[];
    canShowDoctors: boolean;
  };
};

type AnalyzeFail = {
  success: false;
  status?: number;
  stage?: string;
  message: string;
  debug?: {
    category?: string;
    reason?: string;
  };
  error?: string;
};

type AnalyzeResponse = AnalyzeSuccess | AnalyzeFail;

export default function AnalyzePage() {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://localhost:5000/api/v1/ai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms,
          language: "auto",
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: "Failed to connect to the server.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold">CareFind Symptom Analysis</h1>
        <p className="mt-2 text-sm text-slate-600">
          Describe your symptoms, and CareFind will recommend the most relevant
          specialist.
        </p>

        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Example: I have chest pain, shortness of breath, and sweating."
          className="mt-5 min-h-[160px] w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-slate-500"
        />

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="mt-4 rounded-xl bg-slate-900 px-5 py-3 text-white disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze Symptoms"}
        </button>

        {result && result.success && (
          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <h2 className="text-xl font-semibold">Recommended Specialist</h2>
            <p className="mt-2 text-lg font-bold">{result.data.specialist}</p>

            <div className="mt-4">
              <p className="text-sm font-semibold">Why this specialist</p>
              <p className="mt-1 text-sm text-slate-700">
                {result.data.explanation}
              </p>
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold">Urgency</p>
              <p className="mt-1 capitalize">{result.data.urgency}</p>
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold">Matched symptoms</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.data.matchedSymptoms.map((item, idx) => (
                  <span
                    key={`${item}-${idx}`}
                    className="rounded-full bg-white px-3 py-1 text-sm border border-slate-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {result.data.warningMessage && (
              <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                {result.data.warningMessage}
              </div>
            )}

            <button className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-white">
              See Nearby Doctors
            </button>
          </div>
        )}

        {result && !result.success && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
            <h2 className="text-lg font-semibold text-red-700">
              Could not analyze
            </h2>
            <p className="mt-2 text-sm text-red-700">{result.message}</p>

            {result.stage && (
              <p className="mt-2 text-xs text-red-500">
                Failed at: {result.stage}
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}