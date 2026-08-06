import Link from 'next/link';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] px-4 py-16 text-white sm:px-6">
      <div className="mx-auto w-full max-w-3xl rounded-[32px] border border-[#334155] bg-[#111827]/90 p-6 shadow-[0_0_60px_rgba(16,185,129,0.15)] sm:p-10">
        <h1 className="text-4xl font-semibold">Features</h1>
        <p className="mt-6 text-base leading-7 text-[#CBD5E1]">
          This placeholder page can describe the core Wealth Growth features, such as expense tracking, budgeting, AI insights, and reports.
        </p>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-[#10B981] px-6 py-3 text-sm font-semibold text-[#020617] transition hover:bg-[#34d399]">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
