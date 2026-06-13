import { ApplicationData, ExtractedLabelData, FieldComparison, ReviewFieldStatus } from "@/types/label";
import {
  normalizeAlcohol,
  normalizeBasic,
  normalizeLoose,
  normalizeNetContents,
  normalizeWarning,
} from "@/lib/normalize";

function statusForMatch(exists: boolean, exact: boolean, possible = false): ReviewFieldStatus {
  if (!exists) return "missing";
  if (exact) return "match";
  if (possible) return "possible_match";
  return "mismatch";
}

export function compareFields(
  application: ApplicationData,
  extracted: ExtractedLabelData
): FieldComparison[] {
  const rawText = extracted.rawText || "";
  const rawLoose = normalizeLoose(rawText);

  const compareTextPresence = (
    field: keyof ApplicationData,
    appValue: string,
    extractedValue?: string
  ): FieldComparison => {
    const appNorm = normalizeLoose(appValue);
    const labelValue = extractedValue || "";
    const labelNorm = normalizeLoose(labelValue);

    const exact = !!labelValue && appNorm === labelNorm;
    const possible = rawLoose.includes(appNorm);
    const exists = !!labelValue || possible;

    return {
      field,
      application: appValue,
      label: labelValue || (possible ? "Found in OCR text" : ""),
      status: statusForMatch(exists, exact, possible),
      notes: exact ? "Exact normalized match" : possible ? "Present in OCR text" : "Not found",
    };
  };

  const alcoholExact =
    normalizeAlcohol(application.alcoholContent) === normalizeAlcohol(extracted.alcoholContent || "");

  const proofExact =
    normalizeBasic(application.proof).replace(/proof/i, "").trim() ===
    normalizeBasic(extracted.proof || "").replace(/proof/i, "").trim();

  const netExact =
    normalizeNetContents(application.netContents) === normalizeNetContents(extracted.netContents || "");

  const warningExact =
    normalizeWarning(application.governmentWarning) === normalizeWarning(extracted.governmentWarning || "");

  return [
    compareTextPresence("brandName", application.brandName),
    compareTextPresence("classType", application.classType),
    {
      field: "alcoholContent",
      application: application.alcoholContent,
      label: extracted.alcoholContent || "",
      status: statusForMatch(!!extracted.alcoholContent, alcoholExact),
      notes: alcoholExact ? "Alcohol content matches" : "Alcohol content differs or missing",
    },
    {
      field: "proof",
      application: application.proof,
      label: extracted.proof || "",
      status: statusForMatch(!!extracted.proof, proofExact),
      notes: proofExact ? "Proof matches" : "Proof differs or missing",
    },
    {
      field: "netContents",
      application: application.netContents,
      label: extracted.netContents || "",
      status: statusForMatch(!!extracted.netContents, netExact),
      notes: netExact ? "Net contents match" : "Net contents differ or missing",
    },
    compareTextPresence("producer", application.producer),
    compareTextPresence("countryOfOrigin", application.countryOfOrigin),
    {
      field: "governmentWarning",
      application: application.governmentWarning,
      label: extracted.governmentWarning || "",
      status: statusForMatch(!!extracted.governmentWarning, warningExact),
      notes: warningExact ? "Exact warning match" : "Warning missing or not exact",
    },
  ];
}