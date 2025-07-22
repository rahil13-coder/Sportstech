import React, { Suspense, lazy } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ✅ Lazy load pages to reduce initial load
const HomePage = lazy(() => import('./pages/HomePage'));
const Cricket3 = lazy(() => import('./pages/cricket3'));

// ✅ Global error handler
window.onerror = function (message, source, lineno, colno, error) {
  console.error("🌐 Global Error Caught:", {
    message,
    source,
    lineno,
    colno,
    error,
  });
};

function App() {
  return (
    <Router>
      <div
        className="App"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/Cric-stadium.webp)`,
          backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  imageRendering: "auto",
        }}
      >
        {/* ✅ Suspense fallback to show while route loads */}
        <Suspense
          fallback={
            <div style={{ color: 'white', padding: '2rem', textAlign: 'center', fontSize: '1.5rem' }}>
              Loading SportsTech Explorer...
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/fantasy" element={<Cricket3 />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
