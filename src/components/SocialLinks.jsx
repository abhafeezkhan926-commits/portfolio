import { RiGithubFill, RiInstagramFill, RiLinkedinFill } from 'react-icons/ri';
import { socials } from '../data/profile';

const ICONS = {
  github: RiGithubFill,
  linkedin: RiLinkedinFill,
  instagram: RiInstagramFill,
};

const LABELS = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
};

const ORDER = ['github', 'linkedin', 'instagram'];

/**
 * Social profile links. Every href comes from src/data/socials.js so the URLs
 * are defined in exactly one place.
 */
export default function SocialLinks({ className = '', size = 'md', variant = 'icon' }) {
  const dimension = size === 'lg' ? 'h-12 w-12 text-[22px]' : 'h-11 w-11 text-[19px]';

  if (variant === 'inline') {
    return (
      <ul className={`flex flex-wrap items-center gap-x-6 gap-y-3 ${className}`}>
        {ORDER.map((key) => {
          const Icon = ICONS[key];
          return (
            <li key={key}>
              <a
                href={socials[key]}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-sm text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-ink)]"
              >
                <Icon className="text-[18px] text-[color:var(--color-plasma-soft)]" aria-hidden="true" />
                <span className="border-b border-transparent pb-0.5 transition-colors group-hover:border-[color:var(--color-plasma)]">
                  {LABELS[key]}
                </span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className={`flex items-center gap-3 ${className}`}>
      {ORDER.map((key) => {
        const Icon = ICONS[key];
        return (
          <li key={key}>
            <a
              href={socials[key]}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${LABELS[key]} profile (opens in a new tab)`}
              title={LABELS[key]}
              className={`${dimension} inline-flex items-center justify-center rounded-full border border-[rgba(140,180,255,0.18)] bg-[rgba(10,18,34,0.6)] text-[color:var(--color-muted)] backdrop-blur transition-all hover:-translate-y-0.5 hover:border-[rgba(77,166,255,0.55)] hover:text-[color:var(--color-ink)] hover:shadow-[0_0_24px_-6px_rgba(77,166,255,0.6)]`}
            >
              <Icon aria-hidden="true" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
