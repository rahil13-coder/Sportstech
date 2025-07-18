import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import Cricket3 from './pages/cricket3'; // ✅ Correct


function App() {
  return (
    <Router>
      <div
        className="App"
        style={{
          //backgroundImage: `url(${process.env.PUBLIC_URL}/pexels-pixelcop-2799556.jpg)`,
          backgroundImage: `url(${process.env.PUBLIC_URL}/Cric-stadium.jpg)`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          minHeight: '100vh',
        }}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/fantasy" element={<Cricket3 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
