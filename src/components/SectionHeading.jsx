import Reveal from './Reveal';

/**
 * Shared section header: eyebrow label, display title and optional lead.
 * `id` is applied to the heading so sections can be labelled by it.
 */
export default function SectionHeading({ eyebrow, title, lead, id, align = 'left' }) {
  const alignment = align === 'center' ? 'items-center text-center mx-auto' : 'items-start text-left';

  return (
    <Reveal className={`flex max-w-3xl flex-col gap-4 ${alignment}`}>
      {eyebrow && (
        <span className="eyebrow">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--color-cyan)] shadow-[0_0_10px_rgba(34,211,238,0.9)]" aria-hidden="true" />
          {eyebrow}
        </span>
      )}

      <h2 id={id} className="text-balance">
        {title}
      </h2>

      {lead && (
        <p className="max-w-2xl text-[1.02rem] leading-relaxed text-[color:var(--color-muted)]">
          {lead}
        </p>
      )}

      <span className="hairline w-24" aria-hidden="true" />
    </Reveal>
  );
}
