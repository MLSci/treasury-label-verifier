export type ReviewFieldStatus = "match" | "possible_match" | "mismatch" | "missing";

export type ApplicationData = {
  brandName: string;
  classType: string;
  alcoholContent: string;
  proof: string;
  netContents: string;
  producer: string;
  countryOfOrigin: string;
  governmentWarning: string;
};

export type ExtractedLabelData = Partial<ApplicationData> & {
  rawText: string;
};

export type FieldComparison = {
  field: keyof ApplicationData;
  label: string;
  application: string;
  status: ReviewFieldStatus;
  notes: string;
};