import React, { Suspense, lazy } from 'react';
import './App.css';
import './pages/GlobalBackground.css'; // Import the new global background CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'; // Import useNavigate

// ✅ Lazy load pages to reduce initial load
const HomePage = lazy(() => import('./pages/HomePage'));
const AdminPage = lazy(() => import('./pages/Admin')); // New lazy import, changed from AdminPage to Admin
const Blogs = lazy(() => import('./pages/Blogs'));
const Books = lazy(() => import('./pages/Books'));
const ContactPage = lazy(() => import('./pages/ContactPage')); // New lazy import, changed from ContactPage to contact
const JobsPage = lazy(() => import('./pages/JobPortal')); // New lazy import, changed from JobsPage to JobPortal
const Cricket = lazy(() => import('./pages/Cricket'));

const FootballTechnologies = lazy(() => import('./pages/FootballTechnologies')); // Assuming this is the Football page
const TennisTechnologies = lazy(() => import('./pages/TennisTechnologies')); // Assuming this is the Tennis page
const BasketballPage = lazy(() => import('./pages/BasketballPage')); // New lazy import for Basketball
const GamesPage = lazy(() => import('./pages/Games')); // New lazy import
const Rental = lazy(() => import('./pages/Rental'));
const Movies = lazy(() => import('./pages/Movies'));
const MemeGenerator = lazy(() => import('./pages/MemeGenerator'));
const AuthPage = lazy(() => import('./pages/AuthPage')); // New lazy import for AuthPage
const DataDrivenAthletePage = lazy(() => import('./pages/DataDrivenAthletePage'));
const MobileMarket = lazy(() => import('./pages/MobileMarket'));

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

const AppContent = () => {
  const navigate = useNavigate(); // Initialize navigate inside a component that is within Router
  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div
      className="App"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/background.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh", // Ensure it covers the full viewport height
      }}
    >
      <video src="/turn_this_into_a_professnial_logo.mp4" style={{ position: 'absolute', top: '10px', left: '10px', height: '50px', zIndex: 1001 }} autoPlay loop muted />
      {/* ✅ Suspense fallback to show while route loads */}
      <Suspense
        fallback={
          <div style={{ color: 'white', padding: '2rem', textAlign: 'center', fontSize: '1.5rem' }}>
            Loading SportsTech Explorer...
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} /> {/* Set HomePage as the default route again */}
          <Route path="/auth" element={<AuthPage />} /> {/* AuthPage is now /auth */}
          <Route path="/admin" element={<AdminPage onBackClick={handleBackClick} />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/books" element={<Books />} />
          <Route path="/contact" element={<ContactPage onBackClick={handleBackClick} />} />
          <Route path="/jobs" element={<JobsPage onBackClick={handleBackClick} />} />
          <Route path="/cricket" element={<Cricket onBackClick={handleBackClick} />} />
          
          <Route path="/football" element={<FootballTechnologies onBackClick={handleBackClick} />} />
          <Route path="/tennis" element={<TennisTechnologies onBackClick={handleBackClick} />} />
          <Route path="/basketball" element={<BasketballPage onBackClick={handleBackClick} />} />
          <Route path="/games" element={<GamesPage onBackClick={handleBackClick} />} />
          <Route path="/rental" element={<Rental />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/meme-generator" element={<MemeGenerator />} />
          <Route path="/data-driven-athlete" element={<DataDrivenAthletePage />} />
          <Route path="/mobile-market" element={<MobileMarket />} />
        </Routes>
      </Suspense>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

