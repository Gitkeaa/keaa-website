import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

/**
 * createRoot, not hydrateRoot. This is deliberate and was measured twice.
 *
 * THE PROBLEM IT WOULD SOLVE: every page is prerendered, the browser paints it, and then
 * createRoot throws that markup away and rebuilds. The document collapses for a frame and
 * everything below snaps back, which is a Cumulative Layout Shift of 0.31 on the home page
 * against Google's 0.1 threshold. hydrateRoot would adopt the markup instead.
 *
 * WHY IT IS NOT USED: hydration requires React's FIRST render to match what the build
 * produced, and the build snapshots each page once its effects have SETTLED. Anything whose
 * appearance is set by an effect therefore differs: entry animations, a counter that starts at
 * zero, an image that fades in once loaded. Two rounds of fixes were attempted, gating entry
 * animations on first paint (lib/firstPaint.js, still in use and still worth having) and then
 * the counter and the image fade. CLS was 0.310 before, 0.310 after the first, and 0.310 after
 * the second, with four hydration errors per page throughout. The mismatch is somewhere else
 * again, and React rejects the whole tree on any single one.
 *
 * So hydrateRoot here buys nothing and costs four console errors on every page load, which is
 * strictly worse than the shift it fails to fix.
 *
 * TO FINISH THIS PROPERLY: build React in development mode so the hydration warning names the
 * element it disagreed about, rather than guessing at components one at a time. That is the
 * step that was not taken, and it is where anyone picking this up should start.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
