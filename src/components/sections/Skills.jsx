import { skillGroups } from '../../data/skills';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';
import TechIcon from '../TechIcon';

export default function Skills() {
  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <div className="shell">
        <SectionHeading
          id="skills-title"
          eyebrow="Skills"
          title="The toolkit behind the work"
          lead="Grouped by where each technology sits in a build. This is a map of what I work with, not a scorecard — the projects below show how it gets used."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {skillGroups.map((group, index) => (
            <Reveal
              key={group.id}
              className="glass edge-glow lift relative overflow-hidden p-6"
              delay={index * 70}
            >
              <span
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-25 blur-2xl"
                style={{ background: group.accent }}
                aria-hidden="true"
              />

              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-lg text-[color:var(--color-ink)]">
                    {group.title}
                  </h3>
                  <p className="mt-1.5 text-[0.88rem] leading-relaxed text-[color:var(--color-muted)]">
                    {group.blurb}
                  </p>
                </div>
                <span
                  className="mt-1 h-2 w-2 shrink-0 rounded-full"
                  style={{ background: group.accent, boxShadow: `0 0 12px ${group.accent}` }}
                  aria-hidden="true"
                />
              </div>

              <ul className="relative mt-6 flex flex-wrap gap-2.5">
                {group.skills.map((skill) => (
                  <li
                    key={skill.name}
                    className="group flex items-center gap-2 rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-void)]/50 px-3 py-2 transition-colors duration-200 hover:border-[color:var(--color-plasma)]/45"
                  >
                    <span
                      className="transition-transform duration-200 group-hover:scale-110"
                      style={{ color: skill.color }}
                    >
                      <TechIcon icon={skill.icon} size={19} />
                    </span>
                    <span className="text-[0.86rem] text-[color:var(--color-ink)]/90">
                      {skill.name}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
