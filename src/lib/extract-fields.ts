import { ExtractedLabelData } from "@/types/label";

function findLine(rawText: string, matcher: RegExp): string {
  const lines = rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return lines.find((line) => matcher.test(line)) ?? "";
}

export function extractFields(rawText: string): ExtractedLabelData {
  const alcoholMatch = rawText.match(/(\d{1,2}(?:\.\d+)?)\s*%\s*Alc\.?\s*\/?\s*Vol\.?/i);
  const proofMatch = rawText.match(/(\d{1,3})\s*Proof/i);
  const netContentsMatch = rawText.match(/(\d+(?:\.\d+)?)\s*(mL|ml|L|l|FL\.?\s*OZ\.?)/i);

  const warningLine = findLine(rawText, /government warning/i);

  return {
    rawText,
    alcoholContent: alcoholMatch ? `${alcoholMatch[1]}% Alc./Vol.` : "",
    proof: proofMatch ? proofMatch[1] : "",
    netContents: netContentsMatch ? `${netContentsMatch[1]} ${netContentsMatch[2]}` : "",
    governmentWarning: warningLine,
  };
}