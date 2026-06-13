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

function getLines(rawText: string): string[] {
  return rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function tokenize(value: string): string[] {
  return normalizeLoose(value)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);
}

function getTokenOverlapScore(target: string, candidate: string): number {
  const targetTokens = tokenize(target);
  if (!targetTokens.length) return 0;

  const normalizedCandidate = normalizeLoose(candidate);
  const matched = targetTokens.filter((token) => normalizedCandidate.includes(token));

  return matched.length / targetTokens.length;
}

function getBestMatchingLine(appValue: string, rawText: string): { line: string; score: number } | null {
  const lines = getLines(rawText);
  let bestLine = "";
  let bestScore = 0;

  for (const line of lines) {
    const score = getTokenOverlapScore(appValue, line);
    if (score > bestScore) {
      bestScore = score;
      bestLine = line;
    }
  }

  if (!bestLine || bestScore < 0.4) {
    return null;
  }

  return { line: bestLine, score: bestScore };
}

function compareTextField(
  field: keyof ApplicationData,
  appValue: string,
  extractedValue: string | undefined,
  rawText: string
): FieldComparison {
  const appNorm = normalizeLoose(appValue);
  const labelValue = extractedValue || "";
  const labelNorm = normalizeLoose(labelValue);

  if (labelValue && appNorm === labelNorm) {
    return {
      field,
      application: appValue,
      label: labelValue,
      status: "match",
      notes: "Exact normalized match",
    };
  }

  const bestLine = getBestMatchingLine(appValue, rawText);

  if (bestLine) {
    return {
      field,
      application: appValue,
      label: bestLine.line,
      status: bestLine.score >= 0.85 ? "match" : "possible_match",
      notes:
        bestLine.score >= 0.85
          ? "Matched strongly against OCR text"
          : `Partial OCR line match (${Math.round(bestLine.score * 100)}% token overlap)`,
    };
  }

  return {
    field,
    application: appValue,
    label: "",
    status: "missing",
    notes: "Not found in OCR text",
  };
}

function compareAlcoholField(applicationValue: string, extractedValue: string, rawText: string): FieldComparison {
  const exact =
    normalizeAlcohol(applicationValue) === normalizeAlcohol(extractedValue || "");

  if (extractedValue) {
    return {
      field: "alcoholContent",
      application: applicationValue,
      label: extractedValue,
      status: exact ? "match" : "mismatch",
      notes: exact ? "Alcohol content matches" : "Detected alcohol content differs",
    };
  }

  const percentLine = getLines(rawText).find((line) => /\d{1,2}(?:\.\d+)?\s*%/.test(line));

  if (percentLine) {
    return {
      field: "alcoholContent",
      application: applicationValue,
      label: percentLine,
      status: "possible_match",
      notes: "Potential alcohol content found in OCR text",
    };
  }

  return {
    field: "alcoholContent",
    application: applicationValue,
    label: "",
    status: "missing",
    notes: "Alcohol content not found",
  };
}

function compareProofField(applicationValue: string, extractedValue: string, rawText: string): FieldComparison {
  const exact =
    normalizeBasic(applicationValue).replace(/proof/i, "").trim() ===
    normalizeBasic(extractedValue || "").replace(/proof/i, "").trim();

  if (extractedValue) {
    return {
      field: "proof",
      application: applicationValue,
      label: extractedValue,
      status: exact ? "match" : "mismatch",
      notes: exact ? "Proof matches" : "Detected proof differs",
    };
  }

  const proofLine = getLines(rawText).find((line) => /proof/i.test(line));

  if (proofLine) {
    return {
      field: "proof",
      application: applicationValue,
      label: proofLine,
      status: "possible_match",
      notes: "Potential proof value found in OCR text",
    };
  }

  return {
    field: "proof",
    application: applicationValue,
    label: "",
    status: "missing",
    notes: "Proof not found",
  };
}

function compareNetContentsField(applicationValue: string, extractedValue: string, rawText: string): FieldComparison {
  const exact =
    normalizeNetContents(applicationValue) === normalizeNetContents(extractedValue || "");

  if (extractedValue) {
    return {
      field: "netContents",
      application: applicationValue,
      label: extractedValue,
      status: exact ? "match" : "mismatch",
      notes: exact ? "Net contents match" : "Detected net contents differ",
    };
  }

  const sizeLine = getLines(rawText).find((line) => /\b(ml|l|fl\.?\s*oz|pint|oz)\b/i.test(line));

  if (sizeLine) {
    return {
      field: "netContents",
      application: applicationValue,
      label: sizeLine,
      status: "possible_match",
      notes: "Potential net contents found in OCR text",
    };
  }

  return {
    field: "netContents",
    application: applicationValue,
    label: "",
    status: "missing",
    notes: "Net contents not found",
  };
}

function compareWarningField(applicationValue: string, extractedValue: string, rawText: string): FieldComparison {
  const warningText = extractedValue || rawText;
  const normalizedDetected = normalizeWarning(warningText);
  const normalizedExpected = normalizeWarning(applicationValue);

  if (normalizedDetected && normalizedDetected === normalizedExpected) {
    return {
      field: "governmentWarning",
      application: applicationValue,
      label: extractedValue,
      status: "match",
      notes: "Exact warning match",
    };
  }

  const warningPhrases = [
    "government warning",
    "surgeon general",
    "during pregnancy",
    "birth defects",
    "drive a car",
    "operate machinery",
    "health problems",
  ];

  const matchedCount = warningPhrases.filter((phrase) =>
    normalizeLoose(warningText).includes(normalizeLoose(phrase))
  ).length;

  if (matchedCount >= 4) {
    return {
      field: "governmentWarning",
      application: applicationValue,
      label: extractedValue || warningText,
      status: "possible_match",
      notes: `Warning partially matched (${matchedCount}/${warningPhrases.length} key phrases found)`,
    };
  }

  return {
    field: "governmentWarning",
    application: applicationValue,
    label: extractedValue || "",
    status: extractedValue ? "mismatch" : "missing",
    notes: extractedValue ? "Warning detected but not close enough to expected text" : "Warning not found",
  };
}

export function compareFields(
  application: ApplicationData,
  extracted: ExtractedLabelData
): FieldComparison[] {
  const rawText = extracted.rawText || "";

  return [
    compareTextField("brandName", application.brandName, extracted.brandName, rawText),
    compareTextField("classType", application.classType, extracted.classType, rawText),
    compareAlcoholField(application.alcoholContent, extracted.alcoholContent || "", rawText),
    compareProofField(application.proof, extracted.proof || "", rawText),
    compareNetContentsField(application.netContents, extracted.netContents || "", rawText),
    compareTextField("producer", application.producer, extracted.producer, rawText),
    compareTextField("countryOfOrigin", application.countryOfOrigin, extracted.countryOfOrigin, rawText),
    compareWarningField(application.governmentWarning, extracted.governmentWarning || "", rawText),
  ];
}