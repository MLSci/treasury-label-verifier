"use client";

import { useMemo, useState } from "react";
import { runOcr } from "@/lib/ocr";
import { extractFields } from "@/lib/extract-fields";
import { compareFields } from "@/lib/compare-fields";
import { ApplicationData, FieldComparison } from "@/types/label";
import { ResultsTable } from "@/components/results-table";
import { TextPreview } from "@/components/text-preview";

const DEFAULT_WARNING =
  "GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.";

const initialData: ApplicationData = {
  brandName: "OLD TOM DISTILLERY",
  classType: "Kentucky Straight Bourbon Whiskey",
  alcoholContent: "45% Alc./Vol.",
  proof: "90 Proof",
  netContents: "750 mL",
  producer: "Old Tom Distillery, Frankfort, KY",
  countryOfOrigin: "United States",
  governmentWarning: DEFAULT_WARNING,
};

export function LabelReviewForm() {
  const [file, setFile] = useState<File | null>(null);
  const [application, setApplication] = useState<ApplicationData>(initialData);
  const [ocrText, setOcrText] = useState("");
  const [results, setResults] = useState<FieldComparison[]>([]);
  const [loading, setLoading] = useState(false);

  const overallStatus = useMemo(() => {
    if (!results.length) return null;
    return results.some((r) => r.status === "mismatch" || r.status === "missing")
      ? "Flagged for discrepancies"
      : "Ready for human review";
  }, [results]);

  async function handleAnalyze() {
    if (!file) return;
    setLoading(true);
    try {
      const text = await runOcr(file);
      setOcrText(text);
      const extracted = extractFields(text);
      const comparisons = compareFields(application, extracted);
      setResults(comparisons);
    } finally {
      setLoading(false);
    }
  }

  function updateField<K extends keyof ApplicationData>(key: K, value: ApplicationData[K]) {
    setApplication((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-xl border p-6 shadow-sm bg-white">
        <h2 className="text-xl font-semibold mb-4">Upload Label</h2>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full"
        />
      </div>

      <div className="rounded-xl border p-6 shadow-sm bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Application Data</h2>
          <button
            type="button"
            onClick={() => setApplication(initialData)}
            className="rounded-md border px-3 py-2 text-sm"
          >
            Load Sample Data
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(application).map(([key, value]) => (
            <label key={key} className="grid gap-1 text-sm">
              <span className="font-medium">{key}</span>
              <input
                value={value}
                onChange={(e) => updateField(key as keyof ApplicationData, e.target.value)}
                className="rounded-md border px-3 py-2"
              />
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!file || loading}
          className="mt-6 rounded-md bg-black text-white px-4 py-2 disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze Label"}
        </button>
      </div>

      {overallStatus && (
        <div className="rounded-xl border p-4 bg-slate-50">
          <strong>Overall Status:</strong> {overallStatus}
        </div>
      )}

      <ResultsTable results={results} />
      <TextPreview text={ocrText} />
    </div>
  );
}