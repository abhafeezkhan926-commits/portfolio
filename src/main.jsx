import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import './styles/index.css';

/* The hidden state for scroll-reveal is only applied when scripting and
   IntersectionObserver are both available, so the page is fully readable
   without JavaScript. */
if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('js-reveal');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
