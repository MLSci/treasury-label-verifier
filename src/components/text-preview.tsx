export function TextPreview({ text }: { text: string }) {
  if (!text) return null;

  return (
    <div className="rounded-xl border p-6 shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-4">Extracted OCR Text</h2>
      <pre className="whitespace-pre-wrap text-sm text-slate-700">{text}</pre>
    </div>
  );
}