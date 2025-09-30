import React, { useState, useEffect, lazy, Suspense } from 'react';
import axios from 'axios'; // Import axios
import './Home.css'; // Admin.js will use the same CSS as Home.js
import Blogs from './Blogs'; // Import the Blogs component
import { trackClick } from '../utils/trackClick'; // Import trackClick

const Books = lazy(() => import('./Books')); // Lazy load the Books component

const Admin = ({ onBackClick }) => {
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [showSetup, setShowSetup] = useState(true); // true if no credentials set, or user wants to change
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [showSportsContent, setShowSportsContent] = useState(false); // New state for Sports content visibility
  const [showBlogs, setShowBlogs] = useState(false); // New state for Blogs content visibility
  const [showCreateBlog, setShowCreateBlog] = useState(false); // New state for Create Blog section
  const [showTraffic, setShowTraffic] = useState(false); // New state for Traffic section
  const [showBooksSection, setShowBooksSection] = useState(false); // New state for Books section
  const [trafficStats, setTrafficStats] = useState(null); // State for traffic statistics
  const [blogs, setBlogs] = useState([]); // New state for blogs

  const [selectedCategoryToView, setSelectedCategoryToView] = useState(null); // New state for filtering blogs by sport
  const blogCategories = ['Sports', 'Politics', 'GeoPolitics', 'Entertainment', 'Technology', 'Agriculture', 'Horticulture', 'Dance', 'Songs'];

  // State for blog creation
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [chargeForViewing, setChargeForViewing] = useState(false);
  const [viewingPrice, setViewingPrice] = useState('');
  const [blogBanner, setBlogBanner] = useState('');

  // Input fields for login
  const [inputAdminId, setInputAdminId] = useState('');
  const [inputAdminPassword, setInputAdminPassword] = useState('');

  // Input fields for setting/changing credentials
  const [newAdminId, setNewAdminId] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');

  useEffect(() => {
    trackClick('page-load-admin-page', 'page-load', window.location.pathname); // Track page load

    const storedId = localStorage.getItem('adminId');
    const storedPassword = localStorage.getItem('adminPassword');

    if (storedId && storedPassword) {
      setAdminId(storedId);
      setAdminPassword(storedPassword);
      setShowSetup(false); // Credentials exist, show login form
    } else {
      setShowSetup(true); // No credentials, show setup form
    }

    const storedBlogs = localStorage.getItem('sportsBlogs');
    if (storedBlogs) {
      setBlogs(JSON.parse(storedBlogs));
    }
  }, []); // Empty dependency array for initial load

  useEffect(() => {
    if (showTraffic && loggedIn) {
      const fetchTrafficStats = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/traffic/stats`);
          setTrafficStats(response.data);
        } catch (err) {
          console.error('Failed to fetch traffic stats:', err);
          setMessage('Failed to load traffic statistics.');
        }
      };
      fetchTrafficStats();
    } else {
      setTrafficStats(null); // Clear stats when not showing traffic
    }
  }, [showTraffic, loggedIn]); // Fetch when showTraffic or loggedIn changes

  const handleSetCredentials = () => {
    if (newAdminId && newAdminPassword) {
      localStorage.setItem('adminId', newAdminId);
      localStorage.setItem('adminPassword', newAdminPassword);
      setAdminId(newAdminId);
      setAdminPassword(newAdminPassword);
      setMessage('Credentials set successfully! Please log in.');
      setShowSetup(false); // Go to login screen
      setNewAdminId('');
      setNewAdminPassword('');
      setInputAdminId(''); // Clear login inputs too
      setInputAdminPassword('');
      trackClick('button-set-admin-credentials', 'button', window.location.pathname); // Track click
    } else {
      setMessage('Please enter both ID and Password.');
    }
  };

  const handleLogin = () => {
    if (inputAdminId === adminId && inputAdminPassword === adminPassword) {
      setLoggedIn(true);
      setMessage('Login successful!');
      setInputAdminId('');
      setInputAdminPassword('');
      trackClick('button-admin-login', 'button', window.location.pathname); // Track click
    } else {
      setMessage('Invalid ID or Password.');
      setInputAdminPassword(''); // Clear password on failed attempt
    }
  };

  const handleShowSports = () => { // New function to toggle Sports content
    setShowSportsContent(!showSportsContent);
    setShowBlogs(false); // Hide other sections
    setShowCreateBlog(false);
    setShowTraffic(false);
    setShowBooksSection(false);
    trackClick('button-toggle-sports-content', 'button', window.location.pathname);
  };

  const handleShowBlogs = () => { // New function to toggle Blogs content
    setShowBlogs(!showBlogs);
    setShowSportsContent(false); // Hide other sections
    setShowCreateBlog(false);
    setShowTraffic(false);
    setShowBooksSection(false);
    trackClick('button-toggle-blogs-admin', 'button', window.location.pathname);
  };

  const handleShowCreateBlog = () => {
    setShowCreateBlog(!showCreateBlog);
    setShowSportsContent(false); // Hide other sections
    setShowBlogs(false); // Hide other sections
    setShowTraffic(false); // Hide traffic when showing create blog
    setShowBooksSection(false);
    trackClick('button-toggle-create-blog', 'button', window.location.pathname);
  };

  const handleShowTraffic = () => {
    setShowTraffic(!showTraffic);
    setShowSportsContent(false); // Hide other sections
    setShowBlogs(false); // Hide other sections
    setShowCreateBlog(false); // Hide other sections
    setShowBooksSection(false);
    trackClick('button-toggle-traffic', 'button', window.location.pathname);
  };

  const handleShowBooksSection = () => { // New function to toggle Books section
    setShowBooksSection(!showBooksSection);
    setShowSportsContent(false); // Hide other sections
    setShowBlogs(false);
    setShowCreateBlog(false);
    setShowTraffic(false);
    trackClick('button-toggle-manage-books', 'button', window.location.pathname);
  };

  const handleDeleteBlog = (blogId) => {
    const updatedBlogs = blogs.filter(blog => blog.id !== blogId);
    setBlogs(updatedBlogs);
    localStorage.setItem('sportsBlogs', JSON.stringify(updatedBlogs));
    trackClick(`button-delete-blog-${blogId}`, 'button', window.location.pathname); // Track click
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBlogBanner(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateBlog = () => {
    if (!blogTitle || !blogContent || !selectedCategory) {
      setMessage('Please fill in all required blog fields (Title, Content, Category).');
      return;
    }

    const newBlog = {
      id: Date.now(), // Simple unique ID
      title: blogTitle,
      content: blogContent,
      category: selectedCategory,
      banner: blogBanner,
      charge: chargeForViewing,
      price: chargeForViewing ? viewingPrice : 0,
      author: adminId, // Assuming the logged-in admin is the author
      date: new Date().toLocaleDateString(),
    };

    const updatedBlogs = [...blogs, newBlog];
    setBlogs(updatedBlogs);
    localStorage.setItem('sportsBlogs', JSON.stringify(updatedBlogs));

    setMessage(`Blog "${blogTitle}" for ${selectedCategory} created successfully!`);
    setBlogTitle('');
    setBlogContent('');
    setSelectedCategory('');
    setBlogBanner('');
    setChargeForViewing(false);
    setViewingPrice('');
    trackClick('button-create-blog-submit', 'button', window.location.pathname); // Track click
  };

  // Render the actual Admin content (modified)
  const adminContent = (
    <>
      <button onClick={handleShowSports} style={{ backgroundColor: 'purple', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', margin: '20px auto', display: 'block' }}>
        {showSportsContent ? 'Hide Sports Content' : 'Show Sports Content'}
      </button>

      <button onClick={handleShowBlogs} style={{ backgroundColor: 'orange', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', margin: '20px auto', display: 'block' }}>
        {showBlogs ? 'Hide Blogs' : 'Show Blogs'}
      </button>

      <button onClick={handleShowCreateBlog} style={{ backgroundColor: 'blue', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', margin: '20px auto', display: 'block' }}>
        {showCreateBlog ? 'Hide Create Blog' : 'Create Blog'}
      </button>

      <button onClick={handleShowTraffic} style={{ backgroundColor: 'green', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', margin: '20px auto', display: 'block' }}>
        {showTraffic ? 'Hide Traffic' : 'Show Traffic'}
      </button>

      <button onClick={handleShowBooksSection} style={{ backgroundColor: 'brown', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', margin: '20px auto', display: 'block' }}>
        {showBooksSection ? 'Hide Books' : 'Manage Books'}
      </button>

      {showSportsContent && (
        // Content from Home.js (paid version)
        <>
          <header className="home-header">
            <h1>Revolutionizing Sports with Technology</h1>
            <p className="home-summary" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', padding: '20px', borderRadius: '8px', border: '1px solid #ccc' }}>
              Our platform explores the cutting-edge technology that is transforming the world of sports. We delve into how innovations in data analysis, biomechanics, and broadcasting are enhancing the experience for fans, players, and coaches in sports like Cricket, Football, Tennis, and Basketball.
            </p>
          </header>

          <main className="home-main">
            <section className="headline-section">
              <h2>1. The Data-Driven Athlete</h2>
              <p>Discover how teams are leveraging big data to optimize player performance, prevent injuries, and gain a competitive edge. From wearable sensors to advanced video analysis, data is the new MVP.</p>
              <button style={{ backgroundColor: 'blue', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'block', margin: '15px auto 0 auto' }}>
                1. The Data-Driven Athlete
              </button>
            </section>

            <section className="headline-section">
              <h2>2. Biomechanics and Performance</h2>
              <p>Explore the science of movement and how biomechanical analysis is helping athletes in sports like cricket and tennis to perfect their technique, improve efficiency, and reduce the risk of strain.</p>
              <button style={{ backgroundColor: 'blue', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'block', margin: '15px auto 0 auto' }}>
                2. Biomechanics and Performance
              </button>
            </section>

            <section className="headline-section">
              <h2>3. The Smart Stadium Experience</h2>
              <p>Learn how modern stadiums are becoming more connected, offering fans an immersive experience with features like instant replays on their phones, in-seat ordering, and augmented reality overlays.</p>
              <button style={{ backgroundColor: 'blue', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'block', margin: '15px auto 0 auto' }}>
                3. The Smart Stadium Experience
              </button>
            </section>

            <section className="headline-section">
              <h2>4. VAR and Officiating Technology</h2>
              <p>From VAR in football to Hawk-Eye in tennis and cricket, technology is playing an increasingly important role in ensuring fair play and accurate decision-making by officials.</p>
              <button style={{ backgroundColor: 'blue', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'block', margin: '15px auto 0 auto' }}>
                4. VAR and Officiating Technology
              </button>
            </section>

            <section className="headline-section">
              <h2>5. Broadcasting and Fan Engagement</h2>
              <p>See how innovations in broadcasting, such as 4K streaming, virtual reality, and interactive stats, are bringing fans closer to the action than ever before, whether they're watching football or basketball.</p>
              <button style={{ backgroundColor: 'blue', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'block', margin: '15px auto 0 auto' }}>
                5. Broadcasting and Fan Engagement
              </button>
            </section>

            <section className="headline-section">
              <h2>6. The Future of Sports Equipment</h2>
              <p>From smart basketballs that track your shot arc to cricket bats with embedded sensors, we look at the next generation of sports equipment and how it will change the game.</p>
              <button style={{ backgroundColor: 'blue', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'block', margin: '15px auto 0 auto' }}>
                6. The Future of Sports Equipment
              </button>
            </section>

            <section className="headline-section">
              <h2>7. E-Sports and Virtual Training</h2>
              <p>The line between virtual and reality is blurring. We explore the rise of e-sports and how professional athletes are using virtual reality to supplement their training and recovery.</p>
              <button style={{ backgroundColor: 'blue', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'block', margin: '15px auto 0 auto' }}>
                7. E-Sports and Virtual Training
              </button>
            </section>

            <section className="headline-section">
              <h2>8. The Globalization of Sports Fandom</h2>
              <p>Technology has broken down geographical barriers, allowing fans to follow their favorite teams and players from anywhere in the world. We look at the impact of social media and streaming on global sports culture.</p>
              <button style={{ backgroundColor: 'blue', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'block', margin: '15px auto 0 auto' }}>
                8. The Globalization of Sports Fandom
              </button>
            </section>
          </main>
          <footer className="custom-footer">
            <p className="footer-text">© ZAKRU Technologies Pvt. Ltd.</p>
            <div className="social-icons">
              <a
                href="https://youtube.com/@public_0cassion?si=nswULJf9ZyvFmk-m"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png"
                  alt="YouTube Channel"
                  className="social-icon"
                />
              </a>
              <a
                href="https://www.facebook.com/rahil.patial.9?mibextid=ZbWKwL"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
                  alt="Facebook Profile"
                  className="social-icon"
                />
              </a>
            </div>
          </footer>
        </>
      )}

      {showBlogs && (
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: '20px', borderRadius: '8px', maxWidth: '800px', margin: '50px auto', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '20px' }}>View Blogs ({blogs.length} Total)</h2>

          <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
            <button
              onClick={() => setSelectedCategoryToView(null)}
              style={{
                backgroundColor: selectedCategoryToView === null ? '#007bff' : '#6c757d',
                color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer'
              }}
            >
              All Categories
            </button>
            {blogCategories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategoryToView(category)}
                style={{
                  backgroundColor: selectedCategoryToView === category ? '#007bff' : '#6c757d',
                  color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer'
                }}
              >
                {category}
              </button>
            ))}
          </div>

          {blogs.length === 0 ? (
            <p>No blogs created yet.</p>
          ) : (
            <div style={{ textAlign: 'left' }}>
              {blogCategories.map(category => {
                const blogsForCategory = blogs.filter(blog =>
                  selectedCategoryToView === null || blog.category === selectedCategoryToView
                ).filter(blog => blog.category === category);

                if (blogsForCategory.length > 0) {
                  return (
                    <div key={category} style={{ marginBottom: '30px' }}>
                      <h3 style={{ color: 'lightcoral', borderBottom: '2px solid lightcoral', paddingBottom: '5px', marginBottom: '20px' }}>{category} Blogs ({blogsForCategory.length})</h3>
                      {blogsForCategory.map((blog) => (
                        <div key={blog.id} style={{ border: '1px solid #555', borderRadius: '8px', padding: '15px', marginBottom: '15px', backgroundColor: '#222' }}>
                          {blog.banner && <img src={blog.banner} alt="Blog Banner" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px 8px 0 0' }} />} 
                          <div style={{ padding: '15px' }}>
                            <h4 style={{ color: 'skyblue' }}>{blog.title}</h4>
                            <p><strong>Author:</strong> {blog.author} | <strong>Date:</strong> {blog.date}</p>
                            <p>{blog.content}</p>
                            {blog.charge ? (
                              <p style={{ color: 'lightgreen' }}><strong>Price:</strong> ${blog.price} (Payment simulated)</p>
                            ) : (
                              <p style={{ color: 'lightgray' }}>Free to view</p>
                            )}
                            <button onClick={() => handleDeleteBlog(blog.id)} style={{ backgroundColor: 'red', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}>
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
          <button onClick={() => setShowBlogs(false)} style={{ backgroundColor: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' }}>
            Back to Admin Options
          </button>
        </div>
      )}

      {showCreateBlog && (
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: '20px', borderRadius: '8px', maxWidth: '800px', margin: '50px auto', textAlign: 'left' }}>
          <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Create Your Blog</h2>

          {message && <p style={{ color: 'lightgreen', marginBottom: '10px' }}>{message}</p>}

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Blog Title:</label>
            <input
              type="text"
              value={blogTitle}
              onChange={(e) => setBlogTitle(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#333', color: 'white' }}
              placeholder="Enter blog title"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Blog Banner Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#333', color: 'white' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Select Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#333', color: 'white' }}
            >
              <option value="">-- Select a Category --</option>
              {blogCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Blog Content:</label>
            <textarea
              value={blogContent}
              onChange={(e) => setBlogContent(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#333', color: 'white', minHeight: '200px' }}
              placeholder="Write your blog content here..."
            ></textarea>
          </div>

          <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={chargeForViewing}
              onChange={(e) => setChargeForViewing(e.target.checked)}
              style={{ marginRight: '10px' }}
            />
            <label>Charge for viewing this blog?</label>
            {chargeForViewing && (
              <input
                type="number"
                value={viewingPrice}
                onChange={(e) => setViewingPrice(e.target.value)}
                placeholder="Price (e.g., 50)"
                style={{ padding: '8px', borderRadius: '5px', border: 'none', backgroundColor: '#333', color: 'white', marginLeft: '10px', width: '100px' }}
              />
            )}
          </div>

          <button onClick={handleCreateBlog} style={{ backgroundColor: 'purple', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2em', display: 'block', width: '100%', marginTop: '20px' }}>
            Create Blog
          </button>
          <button onClick={() => setShowCreateBlog(false)} style={{ backgroundColor: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px', display: 'block', width: '100%' }}>
            Cancel
          </button>
        </div>
      )}

      {showTraffic && (
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: '20px', borderRadius: '8px', maxWidth: '800px', margin: '50px auto', textAlign: 'center', color: 'white' }}>
          <h2 style={{ marginBottom: '20px' }}>Website Traffic Statistics</h2>
          {trafficStats ? (
            <>
              <p><strong>Lifetime Clicks:</strong> {trafficStats.lifetimeClicks}</p>
              <p><strong>Yearly Clicks:</strong> {trafficStats.yearlyClicks}</p>
              <p><strong>Monthly Clicks:</strong> {trafficStats.monthlyClicks}</p>
              <p><strong>Weekly Clicks:</strong> {trafficStats.weeklyClicks}</p>
              <p><strong>Most Clicked Button:</strong> {trafficStats.mostClickedButton ? `${trafficStats.mostClickedButton.id} (${trafficStats.mostClickedButton.count} clicks)` : 'N/A'}</p>
              <p><strong>Least Clicked Button:</strong> {trafficStats.leastClickedButton ? `${trafficStats.leastClickedButton.id} (${trafficStats.leastClickedButton.count} clicks)` : 'N/A'}</p>
              <p><strong>Most Used Navbar Link:</strong> {trafficStats.mostUsedNavbar ? `${trafficStats.mostUsedNavbar.id} (${trafficStats.mostUsedNavbar.count} clicks)` : 'N/A'}</p>
              <p><strong>Least Used Navbar Link:</strong> {trafficStats.leastUsedNavbar ? `${trafficStats.leastUsedNavbar.id} (${trafficStats.leastUsedNavbar.count} clicks)` : 'N/A'}</p>

              <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Detailed Click Rates:</h3>
              <h4>Buttons:</h4>
              {trafficStats.buttonClickRates && trafficStats.buttonClickRates.length > 0 ? (
                <ul>
                  {trafficStats.buttonClickRates.map((item, index) => (
                    <li key={index}>{item.id}: {item.count} clicks</li>
                  ))}
                </ul>
              ) : (<p>No button click data.</p>)}

              <h4>Navbar Links:</h4>
              {trafficStats.navbarClickRates && trafficStats.navbarClickRates.length > 0 ? (
                <ul>
                  {trafficStats.navbarClickRates.map((item, index) => (
                    <li key={index}>{item.id}: {item.count} clicks</li>
                  ))}
                </ul>
              ) : (<p>No navbar click data.</p>)}
            </>
          ) : (
            <p>Loading traffic statistics...</p>
          )}
          <button onClick={() => setShowTraffic(false)} style={{ backgroundColor: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' }}>
            Close Traffic
          </button>
        </div>
      )}

      {showBooksSection && (
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: '20px', borderRadius: '8px', maxWidth: '900px', margin: '50px auto', textAlign: 'center', color: 'white' }}>
          <Suspense fallback={<div>Loading Books Management...</div>}>
            <Books isAdminMode={true} onBackClick={handleShowBooksSection} />
          </Suspense>
        </div>
      )}
    </>
  );

  return (
    <div className="home-container" style={{ backgroundImage: 'url("/background.jpg")', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}>
      <button onClick={onBackClick} style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1, backgroundColor: 'skyblue' }}>Back</button>

      {loggedIn ? (
        adminContent
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
          {message && <p style={{ color: 'yellow', marginBottom: '10px' }}>{message}</p>}

          {showSetup ? (
            // Setup/Change Credentials Form
            <div style={{ padding: '20px', border: '1px solid white', borderRadius: '8px' }}>
              <h2 style={{ marginBottom: '20px' }}>{adminId ? 'Change Admin Credentials' : 'Set Admin Credentials'}</h2>
              <input
                type="text"
                placeholder="New Admin ID"
                value={newAdminId}
                onChange={(e) => setNewAdminId(e.target.value)}
                style={{ padding: '10px', margin: '5px', borderRadius: '5px', border: 'none' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', margin: '5px' }}>
                <input
                  type={showPassword ? 'text' : 'password'} // Dynamic type
                  placeholder="New Admin Password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  style={{ padding: '10px', borderRadius: '5px', border: 'none', flexGrow: 1 }}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ backgroundColor: 'gray', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginLeft: '5px' }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <button onClick={handleSetCredentials} style={{ backgroundColor: 'blue', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', margin: '10px' }}>
                {adminId ? 'Change Credentials' : 'Set Credentials'}
              </button>
              {!adminId && (
                <button onClick={() => setShowSetup(false)} style={{ backgroundColor: 'gray', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', margin: '10px' }}>
                  Go to Login
                </button>
              )}
            </div>
          ) : (
            // Login Form
            <div style={{ padding: '20px', border: '1px solid white', borderRadius: '8px' }}>
              <h2 style={{ marginBottom: '20px' }}>Admin Login</h2>
              <input
                type="text"
                placeholder="Admin ID"
                value={inputAdminId}
                onChange={(e) => setInputAdminId(e.target.value)}
                style={{ padding: '10px', margin: '5px', borderRadius: '5px', border: 'none' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', margin: '5px' }}>
                <input
                  type={showPassword ? 'text' : 'password'} // Dynamic type
                  placeholder="Admin Password"
                  value={inputAdminPassword}
                  onChange={(e) => setInputAdminPassword(e.target.value)}
                  style={{ padding: '10px', borderRadius: '5px', border: 'none', flexGrow: 1 }}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ backgroundColor: 'gray', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginLeft: '5px' }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <button onClick={handleLogin} style={{ backgroundColor: 'green', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', margin: '10px' }}>
                Login
              </button>
              <button onClick={() => setShowSetup(true)} style={{ backgroundColor: 'orange', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', margin: '10px' }}>
                Change ID/Password
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
