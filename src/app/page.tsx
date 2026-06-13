import { LabelReviewForm } from "@/components/label-review-form";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-2">AI-Powered Alcohol Label Verification</h1>
        <p className="text-slate-600 mb-8">
          Upload a label image, enter application data, and review field-level discrepancies.
        </p>
        <LabelReviewForm />
      </div>
    </main>
  );
}