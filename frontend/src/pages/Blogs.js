import React, { useState, useEffect } from 'react';
import './Blogs.css'; // Assuming a Blogs.css will be created
import { trackClick } from '../utils/trackClick'; // Import trackClick
import ReactQuill from 'react-quill'; // Import ReactQuill
import 'react-quill/dist/quill.snow.css'; // Import Quill's CSS

const Blogs = ({ onBackClick }) => {
  const [choice, setChoice] = useState(null); // 'create' or 'view'
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showSetup, setShowSetup] = useState(true); // true if no credentials set, or user wants to change
  const [message, setMessage] = useState('');

  // Input fields for login
  const [inputUserId, setInputUserId] = useState('');
  const [inputUserPassword, setInputUserPassword] = useState('');

  // Input fields for setting/changing credentials
  const [newUserId, setNewUserId] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');

  // State for blog creation (placeholders)
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [chargeForViewing, setChargeForViewing] = useState(false);
  const [viewingPrice, setViewingPrice] = useState('');
  const [blogBanner, setBlogBanner] = useState('');
  const [selectedCategoryToView, setSelectedCategoryToView] = useState(null); // New state for filtering blogs by sport

  // State for editing blogs
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [editBlogTitle, setEditBlogTitle] = useState('');
  const [editBlogContent, setEditBlogContent] = useState('');
  const [editSelectedCategory, setEditSelectedCategory] = useState('');
  const [editChargeForViewing, setEditChargeForViewing] = useState(false);
  const [editViewingPrice, setEditViewingPrice] = useState('');
  const [editBlogBanner, setEditBlogBanner] = useState('');

  const [blogs, setBlogs] = useState([]); // Internal state for blogs

  useEffect(() => {
    trackClick('page-load-blogs-page', 'page-load', window.location.pathname); // Track page load

    const storedId = localStorage.getItem('blogUserId');
    const storedPassword = localStorage.getItem('blogUserPassword');

    if (storedId && storedPassword) {
      setUserId(storedId);
      setUserPassword(storedPassword);
      setShowSetup(false); // Credentials exist, show login form
    } else {
      setShowSetup(true); // No credentials, show setup form
    }
  }, []);

  useEffect(() => {
    const storedBlogs = localStorage.getItem('sportsBlogs');
    if (storedBlogs) {
      try {
        setBlogs(JSON.parse(storedBlogs));
      } catch (e) {
        console.error("Error parsing stored blogs from localStorage:", e);
        setBlogs([]); // Fallback to empty array on error
      }
    }
  }, [setBlogs]);

  const handleSetCredentials = () => {
    if (newUserId && newUserPassword) {
      localStorage.setItem('blogUserId', newUserId);
      localStorage.setItem('blogUserPassword', newUserPassword);
      setUserId(newUserId);
      setUserPassword(newUserPassword);
      setMessage('Account created/updated successfully! Please log in.');
      setShowSetup(false); // Go to login screen
      setNewUserId('');
      setNewUserPassword('');
      setInputUserId(''); // Clear login inputs too
      setInputUserPassword('');
      trackClick('button-blogs-set-credentials', 'button', window.location.pathname); // Track click
    } else {
      setMessage('Please enter both ID and Password.');
    }
  };

  const handleLogin = () => {
    if (inputUserId === userId && inputUserPassword === userPassword) {
      setLoggedIn(true);
      setMessage('Login successful!');
      setInputUserId('');
      setInputUserPassword('');
      trackClick('button-blogs-login', 'button', window.location.pathname); // Track click
    } else {
      setMessage('Invalid ID or Password.');
      setInputUserPassword(''); // Clear password on failed attempt
    }
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

  const handleEditBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditBlogBanner(reader.result);
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
      author: userId, // Assuming the logged-in user is the author
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
    trackClick('button-blogs-create-submit', 'button', window.location.pathname); // Track click
  };

  const handleEditClick = (blog) => {
    setEditingBlogId(blog.id);
    setEditBlogTitle(blog.title);
    setEditBlogContent(blog.content);
    setEditSelectedCategory(blog.category);
    setEditChargeForViewing(blog.charge);
    setEditViewingPrice(blog.price);
    setEditBlogBanner(blog.banner);
    trackClick(`button-blogs-edit-${blog.id}`, 'button', window.location.pathname); // Track click
  };

  const handleUpdateBlog = () => {
    if (!editBlogTitle || !editBlogContent || !editSelectedCategory) {
      setMessage('Please fill in all required blog fields (Title, Content, Category).');
      return;
    }

    const updatedBlogs = blogs.map(blog =>
      blog.id === editingBlogId
        ? {
            ...blog,
            title: editBlogTitle,
            content: editBlogContent,
            category: editSelectedCategory,
            banner: editBlogBanner,
            charge: editChargeForViewing,
            price: editChargeForViewing ? editViewingPrice : 0,
          }
        : blog
    );

    setBlogs(updatedBlogs);
    localStorage.setItem('sportsBlogs', JSON.stringify(updatedBlogs));
    setMessage(`Blog "${editBlogTitle}" updated successfully!`);
    setEditingBlogId(null); // Exit edit mode
    // Clear edit form states
    setEditBlogTitle('');
    setEditBlogContent('');
    setEditSelectedCategory('');
    setEditBlogBanner('');
    setEditChargeForViewing(false);
    setEditViewingPrice('');
    trackClick(`button-blogs-update-submit-${editingBlogId}`, 'button', window.location.pathname); // Track click
  };

  const blogCategories = ['Sports', 'Politics', 'GeoPolitics', 'Entertainment', 'Technology', 'Agriculture', 'Horticulture', 'Education', 'Songs'];

  return (
    <div className="blogs-container" style={{ backgroundImage: 'url("/background.jpg")', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', minHeight: '100vh', color: 'white', padding: '20px' }}>
      <button onClick={(e) => { onBackClick(e); trackClick('button-blogs-back-top', 'button', window.location.pathname); }} style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1, backgroundColor: 'skyblue' }}>Back</button>

      

      {!choice ? (
        // Initial choice screen
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: '20px', borderRadius: '8px' }}>
          <h2 style={{ marginBottom: '30px' }}>Are you here to create a Blog or view Blogs?</h2>
          
          <button onClick={(e) => { setChoice('create'); trackClick('button-blogs-choice-create', 'button', window.location.pathname); }} style={{ backgroundColor: 'blue', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2em', margin: '10px' }}>
            Create Blog
          </button>
          <button onClick={(e) => { setChoice('view'); trackClick('button-blogs-choice-view', 'button', window.location.pathname); }} style={{ backgroundColor: 'green', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2em', margin: '10px' }}>
            View Blogs
          </button>
        </div>
      ) : choice === 'create' ? (
        // Create Blog section
        loggedIn ? (
          // Blog Creation Interface
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
              <ReactQuill
                theme="snow"
                value={blogContent}
                onChange={setBlogContent}
                style={{ backgroundColor: 'white', color: 'black' }} // Adjust styles for Quill
                placeholder="Write your blog content here..."
              />
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
            <button onClick={(e) => { setLoggedIn(false); trackClick('button-blogs-logout', 'button', window.location.pathname); }} style={{ backgroundColor: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px', display: 'block', width: '100%' }}>
              Logout
            </button>
          </div>
        ) : (
          // Account Setup/Login for Blog Creation
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: '20px', borderRadius: '8px' }}>
            <div style={{
              position: 'absolute',
              left: '0',
              top: '60%',
              transform: 'translateY(-50%)', // Centers vertically
              textAlign: 'center',
              zIndex: 10,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              padding: '20px',
              borderRadius: '10px',
            }}>
              <img src={process.env.PUBLIC_URL + '/GP.png'} alt="Payment Gateway" style={{ maxWidth: '150px', display: 'block', margin: '0 auto' }} />
              <p style={{ color: 'lightgreen', fontSize: '1.5em', marginTop: '10px' }}>PAY for Charity</p>
            </div>
            {message && <p style={{ color: 'yellow', marginBottom: '10px' }}>{message}</p>}

            {showSetup ? (
              // Setup/Change Credentials Form
              <div style={{ padding: '20px', border: '1px solid white', borderRadius: '8px' }}>
                <h2 style={{ marginBottom: '20px' }}>{userId ? 'Change Blog Account Credentials' : 'Set Up Blog Account'}</h2>
                <input
                  type="text"
                  placeholder="New User ID"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  style={{ padding: '10px', margin: '5px', borderRadius: '5px', border: 'none' }}
                />
                <input
                  type="password"
                  placeholder="New User Password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  style={{ padding: '10px', margin: '5px', borderRadius: '5px', border: 'none' }}
                />
                <button onClick={handleSetCredentials} style={{ backgroundColor: 'blue', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', margin: '10px' }}>
                  {userId ? 'Change Credentials' : 'Set Up Account'}
                </button>
                {!userId && (
                  <button onClick={(e) => { setShowSetup(false); trackClick('button-blogs-go-to-login', 'button', window.location.pathname); }} style={{ backgroundColor: 'gray', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', margin: '10px' }}>
                    Go to Login
                  </button>
                )}
              </div>
            ) : (
              // Login Form
              <div style={{ padding: '20px', border: '1px solid white', borderRadius: '8px' }}>
                <h2 style={{ marginBottom: '20px' }}>Blog Account Login</h2>
                <input
                  type="text"
                  placeholder="User ID"
                  value={inputUserId}
                  onChange={(e) => setInputUserId(e.target.value)}
                  style={{ padding: '10px', margin: '5px', borderRadius: '5px', border: 'none' }}
                />
                <input
                  type="password"
                  placeholder="User Password"
                  value={inputUserPassword}
                  onChange={(e) => setInputUserPassword(e.target.value)}
                  style={{ padding: '10px', margin: '5px', borderRadius: '5px', border: 'none' }}
                />
                <button onClick={handleLogin} style={{ backgroundColor: 'green', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', margin: '10px' }}>
                  Login
                </button>
                <button onClick={(e) => { setShowSetup(true); trackClick('button-blogs-change-account-details', 'button', window.location.pathname); }} style={{ backgroundColor: 'orange', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', margin: '10px' }}>
                  Change Account Details
                </button>
              </div>
            )}
            <button onClick={(e) => { setChoice(null); trackClick('button-blogs-back-to-choices', 'button', window.location.pathname); }} style={{ backgroundColor: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' }}>
              Back to Choices
            </button>
          </div>
        )
      ) : (
        // View Blogs section
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: '20px', borderRadius: '8px', maxWidth: '800px', margin: '50px auto', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '20px' }}>View Blogs ({blogs.length} Total)</h2>

          

          {message && <p style={{ color: 'yellow', marginBottom: '10px' }}>{message}</p>}

          {!loggedIn ? (
            showSetup ? (
              <div style={{ padding: '20px', border: '1px solid white', borderRadius: '8px', marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '20px' }}>{userId ? 'Change Blog Account Credentials' : 'Set Up Blog Account'}</h3>
                <input type="text" placeholder="New User ID" value={newUserId} onChange={(e) => setNewUserId(e.target.value)} style={{ padding: '10px', margin: '5px', borderRadius: '5px', border: 'none' }} />
                <input type="password" placeholder="New User Password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} style={{ padding: '10px', margin: '5px', borderRadius: '5px', border: 'none' }} />
                <button onClick={handleSetCredentials} style={{ backgroundColor: 'blue', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', margin: '10px' }}>
                  {userId ? 'Change Credentials' : 'Set Up Account'}
                </button>
                {!userId && <button onClick={() => setShowSetup(false)} style={{ backgroundColor: 'gray', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', margin: '10px' }}>Go to Login</button>}
              </div>
            ) : (
              <div style={{ padding: '20px', border: '1px solid white', borderRadius: '8px', marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '20px' }}>Blog Account Login</h3>
                <input type="text" placeholder="User ID" value={inputUserId} onChange={(e) => setInputUserId(e.target.value)} style={{ padding: '10px', margin: '5px', borderRadius: '5px', border: 'none' }} />
                <input type="password" placeholder="User Password" value={inputUserPassword} onChange={(e) => setInputUserPassword(e.target.value)} style={{ padding: '10px', margin: '5px', borderRadius: '5px', border: 'none' }} />
                <button onClick={handleLogin} style={{ backgroundColor: 'green', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', margin: '10px' }}>Login</button>
                <button onClick={() => setShowSetup(true)} style={{ backgroundColor: 'orange', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', margin: '10px' }}>Create or Change Account</button>
              </div>
            )
          ) : (
            <div style={{ padding: '10px', border: '1px solid white', borderRadius: '8px', marginBottom: '20px' }}>
              <p>Welcome, {userId}!</p>
              <button onClick={(e) => { setLoggedIn(false); setMessage('You have been logged out.'); trackClick('button-blogs-view-logout', 'button', window.location.pathname); }} style={{ backgroundColor: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', margin: '10px' }}>Logout</button>
            </div>
          )}

          {editingBlogId ? (
            // Edit Blog Form
            <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: '20px', borderRadius: '8px', maxWidth: '800px', margin: '50px auto', textAlign: 'left' }}>
              <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Edit Your Blog</h2>

              {message && <p style={{ color: 'lightgreen', marginBottom: '10px' }}>{message}</p>}

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Blog Title:</label>
                <input
                  type="text"
                  value={editBlogTitle}
                  onChange={(e) => setEditBlogTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#333', color: 'white' }}
                  placeholder="Enter blog title"
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Blog Banner Image:</label>
                {editBlogBanner && <img src={editBlogBanner} alt="Current Banner" style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'cover', marginBottom: '10px' }} />}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditBannerChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#333', color: 'white' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Select Category:</label>
                <select
                  value={editSelectedCategory}
                  onChange={(e) => setEditSelectedCategory(e.target.value)}
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
                <ReactQuill
                  theme="snow"
                  value={editBlogContent}
                  onChange={setEditBlogContent}
                  style={{ backgroundColor: 'white', color: 'black' }} // Adjust styles for Quill
                  placeholder="Write your blog content here..."
                />
              </div>

              <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={editChargeForViewing}
                  onChange={(e) => setEditChargeForViewing(e.target.checked)}
                  style={{ marginRight: '10px' }}
                />
                <label>Charge for viewing this blog?</label>
                {editChargeForViewing && (
                  <input
                    type="number"
                    value={editViewingPrice}
                    onChange={(e) => setEditViewingPrice(e.target.value)}
                    placeholder="Price (e.g., 50)"
                    style={{ padding: '8px', borderRadius: '5px', border: 'none', backgroundColor: '#333', color: 'white', marginLeft: '10px', width: '100px' }}
                  />
                )}
              </div>

              <button onClick={handleUpdateBlog} style={{ backgroundColor: 'purple', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2em', display: 'block', width: '100%', marginTop: '20px' }}>
                Update Blog
              </button>
              <button onClick={(e) => { setEditingBlogId(null); trackClick('button-blogs-cancel-edit', 'button', window.location.pathname); }} style={{ backgroundColor: 'gray', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px', display: 'block', width: '100%' }}>
                Cancel Edit
              </button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
                <button
              onClick={(e) => { setSelectedCategoryToView(null); trackClick('button-blogs-filter-all-categories', 'button', window.location.pathname); }}
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
                onClick={(e) => { setSelectedCategoryToView(category); trackClick(`button-blogs-filter-${category.toLowerCase()}`, 'button', window.location.pathname); }}
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
                <p>No blogs created yet. Go to "Create Blog" to add one!</p>
              ) : (
                <div style={{ textAlign: 'left' }}>
                  {blogCategories.map(category => {
                    // Filter blogs based on selectedCategoryToView
                    const blogsForCategory = blogs.filter(blog => 
                      selectedCategoryToView === null || blog.category === selectedCategoryToView
                    ).filter(blog => blog.category === category); // This second filter ensures correct grouping

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
                                <div
                                  dangerouslySetInnerHTML={{ __html: blog.content }}
                                  style={{
                                    lineHeight: '1.6',
                                    fontSize: '1.1em',
                                    marginBottom: '10px',
                                    color: '#e0e0e0',
                                    padding: '15px', // Added padding
                                    backgroundColor: '#2a2a2a', // Slightly lighter background for content area
                                    borderRadius: '8px', // Rounded corners
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Subtle shadow
                                    wordWrap: 'break-word', // Ensure long words break
                                    overflowWrap: 'break-word', // Ensure long words break
                                  }}
                                ></div>
                                {blog.charge ? (
                                  <p style={{ color: 'lightgreen' }}><strong>Price:</strong> ${blog.price} (Payment simulated)</p>
                                ) : (
                                  <p style={{ color: 'lightgray' }}>Free to view</p>
                                )}
                                {loggedIn && userId === blog.author && (
                                  <button onClick={() => handleEditClick(blog)} style={{ backgroundColor: 'blue', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px', marginRight: '5px' }}>
                                    Edit
                                  </button>
                                )}
                                
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
            </>
          )}
          <button onClick={(e) => { setChoice(null); trackClick('button-blogs-view-back-to-choices', 'button', window.location.pathname); }} style={{ backgroundColor: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' }}>
            Back to Choices
          </button>
        </div>
      )}
    </div>
  );
};

export default Blogs;