import React from 'react';
import './Menu.css'; // Import the CSS file
import { trackClick } from '../utils/trackClick'; // Import trackClick
import { Link } from 'react-router-dom'; // Import Link

const Menu = ({ toggleHome, toggleAdmin, toggleBlogs, toggleBooks, toggleGames, toggleContact, toggleJobs }) => { // New: Accept toggleJobs prop

  const handleMenuClick = (elementId, originalOnClick) => (e) => {
    if (originalOnClick) {
      originalOnClick(e);
    }
    trackClick(elementId, 'navbar-link', window.location.pathname);
  };

  return (
    <div className="menu-container">
      <Link to="/" className="menu-link" onClick={handleMenuClick('navbar-home', toggleHome)}>Home</Link>
      <div className="menu-link" onClick={handleMenuClick('navbar-admin', toggleAdmin)}>Admin</div>
      <div className="menu-link" onClick={handleMenuClick('navbar-blogs', toggleBlogs)}>Blogs</div>
      <div className="menu-link" onClick={handleMenuClick('navbar-books', toggleBooks)}>Books</div>
      <div className="menu-link" onClick={handleMenuClick('navbar-contact', toggleContact)}>Contact</div>
      <div className="menu-link" onClick={handleMenuClick('navbar-jobs', toggleJobs)}>Jobs</div>
      <Link to="/cricket" className="menu-link" onClick={handleMenuClick('navbar-cricket', null)}>Cricket</Link>
      <Link to="/football" className="menu-link" onClick={handleMenuClick('navbar-football', null)}>Football</Link>
      <Link to="/tennis" className="menu-link" onClick={handleMenuClick('navbar-tennis', null)}>Tennis</Link>
      <Link to="/basketball" className="menu-link" onClick={handleMenuClick('navbar-basketball', null)}>Basketball</Link>
      <div className="menu-link" onClick={handleMenuClick('navbar-games', toggleGames)}>Games</div>
      <Link to="/rental" className="menu-link" onClick={handleMenuClick('navbar-rental', null)}>Rental</Link>
    </div>
  );
};

export default Menu;
