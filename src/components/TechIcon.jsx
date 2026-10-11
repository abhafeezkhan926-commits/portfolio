import {
  SiAntdesign,
  SiCss,
  SiExpress,
  SiFirebase,
  SiGit,
  SiGithub,
  SiGreensock,
  SiHtml5,
  SiJavascript,
  SiJsonwebtokens,
  SiMongodb,
  SiMongoose,
  SiNodedotjs,
  SiPostman,
  SiReact,
  SiSupabase,
  SiTailwindcss,
  SiVercel,
  SiVite,
} from 'react-icons/si';
import { Cpu, MonitorSmartphone, MousePointerClick, Orbit, RadioTower } from 'lucide-react';

/**
 * Explicit registry keeps the brand-icon bundle tree-shakeable — importing the
 * whole react-icons/si namespace would pull in thousands of unused glyphs.
 */
const REGISTRY = {
  SiAntdesign,
  SiCss,
  SiExpress,
  SiFirebase,
  SiGit,
  SiGithub,
  SiGreensock,
  SiHtml5,
  SiJavascript,
  SiJsonwebtokens,
  SiMongodb,
  SiMongoose,
  SiNodedotjs,
  SiPostman,
  SiReact,
  SiSupabase,
  SiTailwindcss,
  SiVercel,
  SiVite,
  'lucide:MonitorSmartphone': MonitorSmartphone,
  'lucide:MousePointerClick': MousePointerClick,
  'lucide:Orbit': Orbit,
  'lucide:RadioTower': RadioTower,
};

export default function TechIcon({ icon, size = 20, ...rest }) {
  const Component = REGISTRY[icon] || Cpu;
  return <Component size={size} aria-hidden="true" {...rest} />;
}
