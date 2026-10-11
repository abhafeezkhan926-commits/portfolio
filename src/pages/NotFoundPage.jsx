import { ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="section flex min-h-[70svh] items-center">
      <div className="shell flex flex-col items-center gap-5 text-center">
        <span className="eyebrow">Error 404</span>
        <h1 className="text-gradient">Lost in deep space</h1>
        <p className="max-w-md text-[1rem] leading-relaxed text-[color:var(--color-muted)]">
          This page does not exist — the link may be broken, or the route may have moved. The way
          back is right here.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/" className="btn btn-primary">
            <Home size={16} aria-hidden="true" />
            Back to the portfolio
          </Link>
          <Link to="/book-call" className="btn btn-ghost">
            <ArrowLeft size={16} aria-hidden="true" />
            Book a 15-minute call
          </Link>
        </div>
      </div>
    </main>
  );
}
