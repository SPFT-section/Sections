import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Library = lazy(() => import('./pages/Library'));
const History = lazy(() => import('./pages/History'));
const Profile = lazy(() => import('./pages/Profile'));
const NovelEditor = lazy(() => import('./pages/NovelEditor'));
const NovelReader = lazy(() => import('./pages/NovelReader'));

// Loading component
const PageLoader = () => (
  <div className="page-loader">
    <div className="loader-spinner"></div>
    <p>Loading...</p>
  </div>
);

// Determine basename for BrowserRouter.
// PUBLIC_PATH is injected at build time via webpack's DefinePlugin (see
// webpack.config.js). Do NOT reference process.env.PUBLIC_URL here - it is
// a Create React App convention this project doesn't use, and since
// nothing ever defines it, webpack leaves the raw `process.env.PUBLIC_URL`
// expression in the bundle. There is no `process` global in the browser,
// so evaluating it throws a ReferenceError at script load time - before
// React ever renders - which crashed the whole app into a blank page.
// Normalize by removing a trailing slash. If the result represents the root,
// treat it as '' so BrowserRouter behaves as expected for root deployments.
const rawBase = process.env.PUBLIC_PATH || '/';
const normalized = rawBase.replace(/\/$/, '');
export const basePath = (normalized === '' || normalized === '/') ? '' : normalized;

// Route table only — BrowserRouter now lives in App.js so that layout
// components (Header, Navigation, Footer) are also inside the Router
// context and can safely use <Link>/useNavigate.
export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/editor/new" element={<NovelEditor />} />
        <Route path="/editor/:id" element={<NovelEditor />} />
        <Route path="/reader/:novelId" element={<NovelReader />} />
        <Route path="/reader/:novelId/:chapterId" element={<NovelReader />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

// Navigation helper
export const navigate = (path) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};
