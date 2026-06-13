import { FieldComparison } from "@/types/label";

const statusStyles: Record<string, string> = {
  match: "bg-green-100 text-green-800",
  possible_match: "bg-yellow-100 text-yellow-800",
  mismatch: "bg-red-100 text-red-800",
  missing: "bg-gray-100 text-gray-800",
};

const fieldLabels: Record<string, string> = {
  brandName: "Brand Name",
  classType: "Class / Type",
  alcoholContent: "Alcohol Content",
  proof: "Proof",
  netContents: "Net Contents",
  producer: "Producer / Bottler",
  countryOfOrigin: "Country of Origin",
  governmentWarning: "Government Warning",
};

export function ResultsTable({ results }: { results: FieldComparison[] }) {
  if (!results.length) return null;

  return (
    <div className="rounded-xl border p-6 shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-4">Comparison Results</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4">Field</th>
              <th className="py-2 pr-4">Application</th>
              <th className="py-2 pr-4">Detected on Label</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.field} className="border-b align-top">
                <td className="py-3 pr-4 font-medium">
                  {fieldLabels[result.field] ?? result.field}
                </td>
                <td className="py-3 pr-4">{result.application || "—"}</td>
                <td className="py-3 pr-4">{result.label || "—"}</td>
                <td className="py-3 pr-4">
                  <span className={`rounded-full px-2 py-1 text-xs ${statusStyles[result.status]}`}>
                    {result.status.replace("_", " ")}
                  </span>
                </td>
                <td className="py-3">{result.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}