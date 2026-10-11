import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import SpaceEnvironment from './components/space/SpaceEnvironment';
import HomePage from './pages/HomePage';
import CvPage from './pages/CvPage';
import BookCallPage from './pages/BookCallPage';
import NotFoundPage from './pages/NotFoundPage';
import { isHomePath } from './lib/scroll';

function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) return;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname, location.hash]);

  return null;
}

export default function App() {
  const location = useLocation();

  useEffect(() => {
    document.documentElement.dataset.route = isHomePath(location.pathname) ? 'home' : 'page';
  }, [location.pathname]);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      <SpaceEnvironment />

      <SiteHeader />

      <div id="main" role="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cv" element={<CvPage />} />
          <Route path="/book-call" element={<BookCallPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      <SiteFooter />

      <ScrollManager />
    </>
  );
}
