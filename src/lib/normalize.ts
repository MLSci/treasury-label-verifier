export function normalizeBasic(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export function normalizeLoose(value: string): string {
  return normalizeBasic(value).replace(/[.,'’"]/g, "");
}

export function normalizeAlcohol(value: string): string {
  return normalizeBasic(value)
    .replace(/alc\.?\s*\/\s*vol\.?/g, "")
    .replace(/%/g, "")
    .trim();
}

export function normalizeNetContents(value: string): string {
  return normalizeBasic(value)
    .replace(/\s+/g, "")
    .replace(/milliliters|milliliter/g, "ml")
    .replace(/liters|liter/g, "l");
}

export function normalizeWarning(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}