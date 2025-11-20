import React from 'react';
import './Menu.css'; // Import the CSS file
import { trackClick } from '../utils/trackClick'; // Import trackClick
import { Link } from 'react-router-dom'; // Import Link

const Menu = () => {

  const handleMenuClick = (elementId, originalOnClick) => (e) => {
    if (originalOnClick) {
      originalOnClick(e);
    }
    trackClick(elementId, 'navbar-link', window.location.pathname);
  };

  return (
    <div className="menu-container" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
      <Link to="/" className="menu-link" onClick={handleMenuClick('navbar-home', null)}>Home</Link>
      <Link to="/admin" className="menu-link" onClick={handleMenuClick('navbar-admin', null)}>Admin</Link>
      <Link to="/blogs" className="menu-link" onClick={handleMenuClick('navbar-blogs', null)}>Blogs</Link>
      <Link to="/books" className="menu-link" onClick={handleMenuClick('navbar-books', null)}>Books</Link>
      <Link to="/contact" className="menu-link" onClick={handleMenuClick('navbar-contact', null)}>Contact</Link>
      <Link to="/jobs" className="menu-link" onClick={handleMenuClick('navbar-jobs', null)}>Jobs</Link>
      
      <Link to="/football" className="menu-link" onClick={handleMenuClick('navbar-football', null)}>Football</Link>
      <Link to="/tennis" className="menu-link" onClick={handleMenuClick('navbar-tennis', null)}>Tennis</Link>
      <Link to="/basketball" className="menu-link" onClick={handleMenuClick('navbar-basketball', null)}>Basketball</Link>
      <Link to="/games" className="menu-link" onClick={handleMenuClick('navbar-games', null)}>Games</Link>
      <Link to="/rental" className="menu-link" onClick={handleMenuClick('navbar-rental', null)}>Rental</Link>
      <Link to="/movies" className="menu-link" onClick={handleMenuClick('navbar-movies', null)}>Movies</Link>
      <Link to="/meme-generator" className="menu-link" onClick={handleMenuClick('navbar-meme-generator', null)}>Meme Generator</Link>
    </div>
  );
};

export default Menu;
