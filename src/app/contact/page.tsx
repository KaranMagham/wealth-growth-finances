import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-[#334155] bg-[#111827]/90 p-10 shadow-[0_0_60px_rgba(16,185,129,0.15)]">
        <h1 className="text-4xl font-semibold">Contact</h1>
        <p className="mt-6 text-base leading-7 text-[#CBD5E1]">
          This placeholder Contact page can include email, messaging, and support options for Wealth Growth.
        </p>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-[#10B981] px-6 py-3 text-sm font-semibold text-[#020617] transition hover:bg-[#34d399]">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
