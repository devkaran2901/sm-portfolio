import type { FaqView } from '@/lib/content';

/**
 * FAQ, rendered as native <details> elements.
 *
 * No JavaScript, keyboard accessible for free, and the answers are present in
 * the initial HTML - which is what both crawlers and generative engines read.
 * The first item is open so the page never looks like a wall of closed rows.
 */
export function Faq({ faqs }: { faqs: FaqView[] }) {
  return (
    <div className="divide-y divide-ink-800 border-y border-ink-800">
      {faqs.map((faq, index) => (
        <details
          key={faq.slug}
          id={faq.slug}
          open={index === 0}
          className="group scroll-mt-28 py-5"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-sm py-1 text-left">
            <h3 className="font-display text-lg text-bone-50 transition-colors group-hover:text-brass-100 sm:text-xl">
              {faq.question}
            </h3>
            <span
              aria-hidden="true"
              className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink-600 text-bone-300 transition-all duration-300 group-open:rotate-45 group-open:border-brass-400/60 group-open:text-brass-200"
            >
              <span className="absolute h-3 w-px bg-current" />
              <span className="absolute h-px w-3 bg-current" />
            </span>
          </summary>
          <p className="mt-3 max-w-3xl pr-12 text-[0.9375rem] leading-relaxed text-bone-300">
            {faq.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
