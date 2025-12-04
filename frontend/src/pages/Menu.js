import React from 'react';
import './Menu.css'; // Import the CSS file
import { trackClick } from '../utils/trackClick'; // Import trackClick
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate

const Menu = ({ toggleHome }) => { // Accept toggleHome prop

  const navigate = useNavigate(); // Initialize useNavigate

  const handleMenuClick = (elementId, originalOnClick) => (e) => {
    if (originalOnClick) {
      originalOnClick(e);
    }
    trackClick(elementId, 'navbar-link', window.location.pathname);
  };

  const handleHomeClick = (e) => {
    if (typeof toggleHome === 'function') {
      toggleHome();
    }
    handleMenuClick('navbar-home', null)(e);
  };

  

  return (
    <div className="menu-container" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
      <button onClick={handleHomeClick} className="menu-link">Home</button>
      <Link to="/admin" className="menu-link" onClick={handleMenuClick('navbar-admin', null)}>Admin</Link>
      <Link to="/blogs" className="menu-link" onClick={handleMenuClick('navbar-blogs', null)}>Blogs</Link>
      <Link to="/books" className="menu-link" onClick={handleMenuClick('navbar-books', null)}>Books</Link>
      <Link to="/contact" className="menu-link" onClick={handleMenuClick('navbar-contact', null)}>Contact</Link>
      <Link to="/jobs" className="menu-link" onClick={handleMenuClick('navbar-jobs', null)}>Jobs</Link>
      <Link to="/cricket" className="menu-link" onClick={handleMenuClick('navbar-cricket', null)}>Cricket Tech</Link>
      
      
      <Link to="/football" className="menu-link" onClick={handleMenuClick('navbar-football', null)}>Football Tech</Link>
      <Link to="/tennis" className="menu-link" onClick={handleMenuClick('navbar-tennis', null)}>Tennis Tech</Link>
      <Link to="/basketball" className="menu-link" onClick={handleMenuClick('navbar-basketball', null)}>Basketball Tech</Link>
      <Link to="/games" className="menu-link" onClick={handleMenuClick('navbar-games', null)}>Enjoy Games</Link>
      <Link to="/rental" className="menu-link" onClick={handleMenuClick('navbar-rental', null)}>Rental</Link>
      <Link to="/movies" className="menu-link" onClick={handleMenuClick('navbar-movies', null)}>Wrestling</Link>
      <Link to="/meme-generator" className="menu-link" onClick={handleMenuClick('navbar-meme-generator', null)}>Meme Generator</Link>
      <a href="https://mobile-os-analytics-5gmz078.public.builtwithrocket.new/" target="_blank" rel="noopener noreferrer" className="menu-link" onClick={handleMenuClick('navbar-mobile-market', null)}>Mobile Market</a>
      
    </div>
  );
};

export default Menu;

