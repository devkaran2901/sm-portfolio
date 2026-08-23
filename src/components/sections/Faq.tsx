import type { FaqView } from '@/lib/content';

/**
 * FAQ, rendered as native <details> elements.
 *
 * No JavaScript, keyboard accessible for free, and the answers are present in
 * the initial HTML - which is what both crawlers and generative engines read.
 * The first item is open so the page never looks like a wall of closed rows.
 *
 * The row is full-bleed but its contents are not. The dividing rules run the
 * width of the shell, because that is what makes the block read as an index;
 * the question and its toggle share a 48rem measure inside that, because a
 * control sitting eighty characters away from the text it opens does not read
 * as belonging to it - at 1440px the toggle was over 1200px from its question,
 * and a closed row looked like a heading with nothing under it rather than
 * something you could open.
 */
export function Faq({ faqs }: { faqs: FaqView[] }) {
  return (
    <div className="divide-y divide-ink-800 border-y border-ink-800">
      {faqs.map((faq, index) => (
        <details key={faq.slug} id={faq.slug} open={index === 0} className="group scroll-mt-28 py-5">
          {/*
            `list-none` alone leaves the disclosure triangle in place on Safari,
            which needs its own pseudo-element knocked out. Both are declared so
            the marker is the one this component draws, on every engine.
          */}
          <summary className="cursor-pointer list-none py-1 [&::-webkit-details-marker]:hidden">
            <div className="flex max-w-3xl items-center justify-between gap-6 text-left">
              <h3 className="font-serif text-lg text-bone-50 transition-colors group-hover:text-brass-100 sm:text-xl">
                {faq.question}
              </h3>
              <span
                aria-hidden="true"
                className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink-600 text-bone-300 transition-all duration-300 group-hover:border-brass-400/60 group-hover:text-brass-200 group-open:rotate-45 group-open:border-brass-400/60 group-open:text-brass-200"
              >
                <span className="absolute h-3 w-px bg-current" />
                <span className="absolute h-px w-3 bg-current" />
              </span>
            </div>
          </summary>

          <p className="mt-3 max-w-3xl pr-12 text-[1.0625rem] leading-relaxed text-bone-300">
            {faq.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
