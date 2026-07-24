interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  id?: string;
  title?: string;
  subtitle?: string;
  faqs: FAQItem[];
}

const FAQ = ({ id, title, subtitle, faqs }: FAQProps) => {
  return (
    <section id={id} className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        {subtitle && (
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#10B981]/80">
            {subtitle}
          </p>
        )}

        {title && (
          <h2 className="mt-4 text-4xl font-semibold text-white">
            {title}
          </h2>
        )}
      </div>

      <div className="mx-auto mt-12 max-w-4xl space-y-4">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group overflow-hidden rounded-[28px] border border-[#334155] bg-[#111827]/90 transition hover:border-[#10B981]"
          >
            <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-lg font-semibold text-white">
              {faq.question}

              <span className="text-[#10B981] transition group-open:rotate-45">
                +
              </span>
            </summary>

            <div className="border-t border-[#1F2937] px-6 py-5 text-[#CBD5E1] leading-7">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
