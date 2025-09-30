import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios

const Books = ({ onBackClick, isAdminMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allBooks, setAllBooks] = useState([]); // State to store fetched books
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBookId, setEditingBookId] = useState(null);
  const [editedBook, setEditedBook] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    cover: '',
    link: '',
  });

  const fetchBooks = async () => {
    try {
      const response1 = await axios.get(`${process.env.PUBLIC_URL}/books_data.json`);
      const existingBooks = response1.data;

      const combinedBooks = existingBooks; // All books are now in books_data.json
      console.log("Combined books after fetch:", combinedBooks); // Added for debugging
      setAllBooks(combinedBooks);
    } catch (err) {
      console.error("Error fetching books data:", err);
      setError("Failed to load books. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadBooks = async () => {
      const storedBooks = localStorage.getItem('booksData');
      if (storedBooks) {
        setAllBooks(JSON.parse(storedBooks));
        setLoading(false);
      } else {
        fetchBooks(); // Fallback to fetching from JSON file if not in local storage
      }
    };
    loadBooks();
  }, []); // Empty dependency array means this effect runs once on mount

  const filteredBooks = allBooks.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Admin functions
  const handleEditClick = (book) => {
    console.log("Editing book:", book); // Debug log
    setEditingBookId(book.id);
    setEditedBook({ ...book });
  };

  const handleSaveEdit = async () => {
    console.log("Saving edited book:", editedBook); // Debug log
    const updatedBooks = allBooks.map((book) =>
      book.id === editedBook.id ? editedBook : book
    );
    await updateBooksDataFile(updatedBooks);
    setAllBooks(updatedBooks);
    setEditingBookId(null);
  };

  const handleCancelEdit = () => {
    setEditingBookId(null);
    setEditedBook({});
  };

  const handleDeleteBook = async (id) => {
    console.log("Deleting book with ID:", id); // Debug log
    const updatedBooks = allBooks.filter((book) => book.id !== id);
    await updateBooksDataFile(updatedBooks);
    setAllBooks(updatedBooks);
  };

  const handleAddBook = async () => {
    console.log("Adding new book:", newBook); // Debug log
    const newId = allBooks.length > 0 ? Math.max(...allBooks.map(book => book.id)) + 1 : 1;
    const bookToAdd = { ...newBook, id: newId };
    const updatedBooks = [...allBooks, bookToAdd];
    await updateBooksDataFile(updatedBooks);
    setAllBooks(updatedBooks);
    setNewBook({ title: '', author: '', cover: '', link: '' });
    setShowAddForm(false);
  };

  // This function simulates writing to books_data.json
  // In a real application, this would be an API call to a backend.
  const updateBooksDataFile = async (updatedData) => {
    console.log("Simulating update to books_data.json with:", JSON.stringify(updatedData, null, 2));
    // The actual file write will be handled by the tool after this component is rendered.
    // The tool will intercept this and perform the write.
    // For now, we just return a promise to simulate async operation.
    localStorage.setItem('booksData', JSON.stringify(updatedData));
    return new Promise(resolve => setTimeout(resolve, 500));
  };

  const handleCoverImageUpload = (e, isNewBook = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("Cover image uploaded (base64):", reader.result.substring(0, 100) + "..."); // Debug log
        if (isNewBook) {
          setNewBook({ ...newBook, cover: reader.result });
        } else {
          setEditedBook({ ...editedBook, cover: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      maxWidth: isAdminMode ? '100%' : '1200px',
      margin: '0 auto',
      backgroundColor: isAdminMode ? 'transparent' : '#f4f4f4',
      minHeight: '100vh',
      position: 'relative',
      color: isAdminMode ? 'white' : '#333',
    },
    header: {
      textAlign: 'center',
      color: isAdminMode ? 'white' : '#333',
      marginBottom: '30px',
      fontSize: '2.5em',
      fontWeight: 'bold',
      textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
    },
    searchContainer: {
      marginBottom: '30px',
      textAlign: 'center',
    },
    searchInput: {
      width: '80%',
      maxWidth: '500px',
      padding: '12px 20px',
      border: '2px solid #ddd',
      borderRadius: '25px',
      fontSize: '1.1em',
      outline: 'none',
      transition: 'border-color 0.3s ease-in-out',
    },
    searchInputFocus: {
      borderColor: '#007bff',
      boxShadow: '0 0 8px rgba(0, 123, 255, 0.2)',
    },
    bookGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '25px',
      justifyContent: 'center',
    },
    bookCard: {
      backgroundColor: isAdminMode ? 'rgba(255, 255, 255, 0.1)' : '#fff',
      borderRadius: '10px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      padding: '15px',
      textAlign: 'center',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      color: isAdminMode ? 'white' : '#333',
    },
    bookCardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    },
    bookCover: {
      width: '100%',
      height: '250px',
      objectFit: 'cover',
      borderRadius: '5px',
      marginBottom: '15px',
      border: '1px solid #eee',
    },
    bookTitle: {
      fontSize: '1.2em',
      fontWeight: 'bold',
      color: isAdminMode ? 'white' : '#333',
      marginBottom: '5px',
      flexGrow: 1,
    },
    bookAuthor: {
      fontSize: '0.9em',
      color: isAdminMode ? '#ccc' : '#666',
      marginBottom: '15px',
    },
    readButton: {
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      padding: '10px 15px',
      borderRadius: '20px',
      cursor: 'pointer',
      fontSize: '1em',
      fontWeight: 'bold',
      transition: 'background-color 0.3s ease-in-out',
      textDecoration: 'none',
      display: 'inline-block',
      marginTop: 'auto',
    },
    readButtonHover: {
      backgroundColor: '#0056b3',
    },
    noBooksFound: {
      textAlign: 'center',
      color: isAdminMode ? 'white' : '#666',
      fontSize: '1.2em',
      marginTop: '50px',
    },
    backButton: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      padding: '10px 15px',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '1em',
      zIndex: 10,
      transition: 'background-color 0.3s ease',
    },
    backButtonHover: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    unlimitedBooksButtonContainer: {
      textAlign: 'center',
      margin: '20px 0',
    },
    unlimitedBooksButton: {
      backgroundColor: '#28a745',
      color: 'white',
      padding: '15px 30px',
      fontSize: '1.2em',
      fontWeight: 'bold',
      border: 'none',
      borderRadius: '30px',
      cursor: 'pointer',
      textDecoration: 'none',
      transition: 'background-color 0.3s ease-in-out, transform 0.2s ease',
      display: 'inline-block',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
    },
    unlimitedBooksButtonHover: {
      backgroundColor: '#218838',
      transform: 'translateY(-2px)',
    },
    loadingMessage: {
      textAlign: 'center',
      color: isAdminMode ? 'white' : '#333',
      fontSize: '1.2em',
      marginTop: '50px',
    },
    errorMessage: {
      textAlign: 'center',
      color: 'red',
      fontSize: '1.2em',
      marginTop: '50px',
    },
    // Admin specific styles
    adminActions: {
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      marginTop: '10px',
      flexWrap: 'wrap',
    },
    adminButton: {
      padding: '8px 12px',
      margin: '5px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.9em',
    },
    editButton: {
      backgroundColor: '#ffc107',
      color: 'black',
    },
    deleteButton: {
      backgroundColor: '#dc3545',
      color: 'white',
    },
    saveButton: {
      backgroundColor: '#28a745',
      color: 'white',
    },
    cancelButton: {
      backgroundColor: '#6c757d',
      color: 'white',
    },
    adminInput: {
      width: 'calc(100% - 20px)',
      padding: '8px',
      margin: '5px 0',
      border: '1px solid #ccc',
      borderRadius: '4px',
      backgroundColor: '#333',
      color: 'white',
    },
    addBookForm: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      padding: '20px',
      borderRadius: '8px',
      marginTop: '20px',
      marginBottom: '20px',
      border: '1px dashed #ccc',
    },
    addBookButton: {
      backgroundColor: '#17a2b8',
      color: 'white',
      padding: '10px 15px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      marginTop: '10px',
    },
  };

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [hoveredBookId, setHoveredBookId] = useState(null);
  const [isBackHovered, setIsBackHovered] = useState(false);
  const [isUnlimitedBooksHovered, setIsUnlimitedBooksHovered] = useState(false);

  if (loading) {
    return <div style={styles.loadingMessage}>Loading books...</div>;
  }

  if (error) {
    return <div style={styles.errorMessage}>{error}</div>;
  }

  return (
    <div style={styles.container}>
      <button
        onClick={onBackClick}
        style={{ ...styles.backButton, ...(isBackHovered ? styles.backButtonHover : {}) }}
        onMouseEnter={() => setIsBackHovered(true)}
        onMouseLeave={() => setIsBackHovered(false)}
      >
        ← Back
      </button>

      <h1 style={styles.header}>Digital Library {isAdminMode && "(Admin Mode)"}</h1>

      {isAdminMode && (
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <button onClick={() => setShowAddForm(!showAddForm)} style={{ ...styles.adminButton, ...styles.addBookButton }}>
            {showAddForm ? 'Hide Add Book Form' : 'Add New Book'}
          </button>
        </div>
      )}

      {isAdminMode && showAddForm && (
        <div style={styles.addBookForm}>
          <h3>Add New Book</h3>
          <input
            type="text"
            placeholder="Title"
            value={newBook.title}
            onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
            style={styles.adminInput}
          />
          <input
            type="text"
            placeholder="Author"
            value={newBook.author}
            onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
            style={styles.adminInput}
          />
          <label style={{ display: 'block', marginTop: '10px', marginBottom: '5px' }}>Cover Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleCoverImageUpload(e, true)}
            style={styles.adminInput}
          />
          {newBook.cover && <img src={newBook.cover} alt="New Book Cover Preview" style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover', marginTop: '10px' }} />}
          <input
            type="text"
            placeholder="PDF Link (e.g., /Books/pdfs/my_book.pdf)"
            value={newBook.link}
            onChange={(e) => setNewBook({ ...newBook, link: e.target.value })}
            style={styles.adminInput}
          />
          <div style={styles.adminActions}>
            <button onClick={handleAddBook} style={{ ...styles.adminButton, ...styles.saveButton }}>Add Book</button>
            <button onClick={() => setShowAddForm(false)} style={{ ...styles.adminButton, ...styles.cancelButton }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by title or author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          style={{ ...styles.searchInput, ...(isSearchFocused ? styles.searchInputFocus : {}) }}
        />
      </div>

      {!isAdminMode && (
        <div style={styles.unlimitedBooksButtonContainer}>
          <a
            href="https://theoceanofpdf.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...styles.unlimitedBooksButton, ...(isUnlimitedBooksHovered ? styles.unlimitedBooksButtonHover : {}) }}
            onMouseEnter={() => setIsUnlimitedBooksHovered(true)}
            onMouseLeave={() => setIsUnlimitedBooksHovered(false)}
          >
            Unlimited Books
          </a>
        </div>
      )}

      {filteredBooks.length > 0 ? (
        <div style={styles.bookGrid}>
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              style={{ ...styles.bookCard, ...(hoveredBookId === book.id ? styles.bookCardHover : {}) }}
              onMouseEnter={() => setHoveredBookId(book.id)}
              onMouseLeave={() => setHoveredBookId(null)}
            >
              {editingBookId === book.id ? (
                <div style={{ padding: '10px' }}>
                  <input
                    type="text"
                    value={editedBook.title}
                    onChange={(e) => setEditedBook({ ...editedBook, title: e.target.value })}
                    style={styles.adminInput}
                  />
                  <input
                    type="text"
                    value={editedBook.author}
                    onChange={(e) => setEditedBook({ ...editedBook, author: e.target.value })}
                    style={styles.adminInput}
                  />
                  <label style={{ display: 'block', marginTop: '10px', marginBottom: '5px' }}>Cover Image:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleCoverImageUpload(e, false)}
                    style={styles.adminInput}
                  />
                  {editedBook.cover && <img src={editedBook.cover} alt="Cover Preview" style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover', marginTop: '10px' }} />}
                  <input
                    type="text"
                    value={editedBook.link}
                    onChange={(e) => setEditedBook({ ...editedBook, link: e.target.value })}
                    style={styles.adminInput}
                  />
                  <div style={styles.adminActions}>
                    <button onClick={handleSaveEdit} style={{ ...styles.adminButton, ...styles.saveButton }}>Save</button>
                    <button onClick={handleCancelEdit} style={{ ...styles.adminButton, ...styles.cancelButton }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <img src={book.cover} alt={book.title} style={styles.bookCover} />
                  <h3 style={styles.bookTitle}>{book.title}</h3>
                  <p style={styles.bookAuthor}>{book.author}</p>
                  {!isAdminMode && (
                    <a
                      href={book.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ ...styles.readButton, ...(hoveredBookId === book.id ? styles.readButtonHover : {}) }}
                    >
                      Read Now
                    </a>
                  )}
                  {isAdminMode && (
                    <div style={styles.adminActions}>
                      <button onClick={() => handleEditClick(book)} style={{ ...styles.adminButton, ...styles.editButton }}>Edit</button>
                      <button onClick={() => handleDeleteBook(book.id)} style={{ ...styles.adminButton, ...styles.deleteButton }}>Delete</button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p style={styles.noBooksFound}>No books found matching your search.</p>
      )}
    </div>
  );
};

export default Books;
