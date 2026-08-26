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
    <div className="border-y border-white/10 divide-y divide-white/10">
      {faqs.map((faq, index) => (
        <details key={faq.slug} id={faq.slug} open={index === 0} className="group scroll-mt-28">
          {/*
            The whole row is one control. The question sits left behind a small
            index, the toggle is flush to the right edge - aligned with the
            dividers - and the row lifts on hover so the distant toggle still
            reads as belonging to the question it opens.

            `list-none` alone leaves the disclosure triangle in place on Safari,
            which needs its own pseudo-element knocked out. Both are declared so
            the marker is the one this component draws, on every engine.
          */}
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-lg px-3 py-6 transition-colors duration-200 hover:bg-white/[0.035] group-open:bg-white/[0.02] [&::-webkit-details-marker]:hidden sm:px-4">
            <div className="flex items-baseline gap-4 sm:gap-5">
              <span className="hidden font-sans text-[0.8125rem] font-semibold tabular-nums text-brass-300/80 sm:inline">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="font-serif text-lg text-bone-50 transition-colors group-hover:text-brass-100 group-open:text-brass-100 sm:text-xl">
                {faq.question}
              </h3>
            </div>
            <span
              aria-hidden="true"
              className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink-600 text-bone-300 transition-all duration-300 group-hover:border-brass-400/60 group-hover:text-brass-200 group-open:rotate-45 group-open:border-brass-400/70 group-open:bg-brass-400/10 group-open:text-brass-200"
            >
              <span className="absolute h-3.5 w-px bg-current" />
              <span className="absolute h-px w-3.5 bg-current" />
            </span>
          </summary>

          <p className="max-w-2xl px-3 pb-7 text-[1.0625rem] leading-[1.75] text-bone-200 sm:px-4 sm:pl-[3.25rem]">
            {faq.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
