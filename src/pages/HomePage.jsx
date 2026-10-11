import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import Hero from '../components/sections/Hero';
import About from '../components/sections/About';
import Skills from '../components/sections/Skills';
import Projects from '../components/sections/Projects';
import Journey from '../components/sections/Journey';
import CvSection from '../components/sections/CvSection';
import Contact from '../components/sections/Contact';
import TimeTravel from '../components/sections/TimeTravel';
import { scrollToSection } from '../lib/scroll';

export default function HomePage() {
  const location = useLocation();

  /* Deep links such as /#projects should land on the right section even
     though the hash is set before the sections have mounted. */
  useEffect(() => {
    const id = location.hash.replace('#', '');
    if (!id) return;

    let frame = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(() => scrollToSection(id, { updateHash: false }));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.hash]);

  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Journey />
      <CvSection />
      <Contact />
      <TimeTravel />
    </>
  );
}
