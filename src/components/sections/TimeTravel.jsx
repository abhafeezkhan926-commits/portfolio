import SolarSystem from '../space/SolarSystem';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';

/**
 * Decorative interlude between the contact form and the footer — a small
 * solar system that fast-forwards while the pointer is inside its frame.
 */
export default function TimeTravel() {
  return (
    <section id="time-travel" className="section" aria-labelledby="time-travel-title">
      <div className="shell">
        <SectionHeading
          id="time-travel-title"
          eyebrow="Interlude"
          title="A solar system with a time-travel dial"
          lead="By default it keeps a calm, natural pace — every world orbiting the star at its own speed. Move your cursor into the frame and the timeline surges: the clock jumps towards ×40, the view keeps zooming in, and the years race past the playhead on the ruler below. Move the cursor out and everything eases back to the present."
        />

        <Reveal className="mt-14" delay={80}>
          <SolarSystem />
        </Reveal>
      </div>
    </section>
  );
}
