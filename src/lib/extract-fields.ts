import { ExtractedLabelData } from "@/types/label";

function getLines(rawText: string): string[] {
  return rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function findLine(rawText: string, matcher: RegExp): string {
  return getLines(rawText).find((line) => matcher.test(line)) ?? "";
}

function findWarningBlock(rawText: string): string {
  const lines = getLines(rawText);
  const startIndex = lines.findIndex((line) => /government warning/i.test(line));

  if (startIndex === -1) return "";

  return lines.slice(startIndex, Math.min(startIndex + 8, lines.length)).join(" ");
}

export function extractFields(rawText: string): ExtractedLabelData {
  const alcoholMatch =
    rawText.match(/(\d{1,2}(?:\.\d+)?)\s*%\s*(?:alc|aic)[^\n]{0,12}(?:vol)?/i) ||
    rawText.match(/(\d{1,2}(?:\.\d+)?)\s*%/i);

  const proofMatch = rawText.match(/(\d{1,3})\s*Proof/i);

  const netContentsMatch =
    rawText.match(/(\d+(?:\.\d+)?)\s*(mL|ml|L|l|FL\.?\s*OZ\.?)/i) ||
    rawText.match(/(\d+(?:\.\d+)?)\s*(PINT|PINTS|OZ|OZS)/i);

  const producerLine =
    findLine(rawText, /\b(hyattsville|distillery|brewery|bottled by|brewed & bottled by|produced by)\b/i);

  const countryLine =
    findLine(rawText, /\b(product of|produced in|made in|imported from)\b/i) ||
    findLine(rawText, /\b(united states|usa|france|italy|mexico|canada|scotland|ireland|japan)\b/i);

  const classTypeLine =
    findLine(rawText, /\b(whiskey|whisky|bourbon|vodka|rum|tequila|gin|wine|beer|ale|lager|stout|porter|cider)\b/i);

  const brandLine =
    findLine(rawText, /\b(brewery|distillery|cellars|vineyards)\b/i) ||
    getLines(rawText).find((line) => /^[A-Z&\s]{6,}$/.test(line)) ||
    "";

  return {
    rawText,
    brandName: brandLine,
    classType: classTypeLine,
    alcoholContent: alcoholMatch ? `${alcoholMatch[1]}% Alc./Vol.` : "",
    proof: proofMatch ? `${proofMatch[1]} Proof` : "",
    netContents: netContentsMatch ? `${netContentsMatch[1]} ${netContentsMatch[2]}` : "",
    producer: producerLine,
    countryOfOrigin: countryLine,
    governmentWarning: findWarningBlock(rawText),
  };
}