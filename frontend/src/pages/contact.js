import React, { useState, useEffect } from 'react';
import JobPortal from './JobPortal'; // Import the new JobPortal component

const Contact = ({ isAdminMode, onBackClick }) => {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState('');
  const [contacts, setContacts] = useState([]);
  const [editingContactId, setEditingContactId] = useState(null);
  const [showJobPortal, setShowJobPortal] = useState(false); // New state for Job Portal visibility

  useEffect(() => {
    const storedContacts = JSON.parse(localStorage.getItem('contacts')) || [];
    setContacts(storedContacts);
  }, [isAdminMode]); // Load contacts on initial render and when isAdminMode changes

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !number || !location || !email) {
      setMessage('Please fill in all required fields.');
      return;
    }

    if (editingContactId) {
      // Update existing contact
      const updatedContacts = contacts.map((contact) =>
        contact.id === editingContactId
          ? { ...contact, name, number, location, email, photo: photo || contact.photo } // Keep old photo if new one not provided
          : contact
      );
      localStorage.setItem('contacts', JSON.stringify(updatedContacts));
      setContacts(updatedContacts);
      setMessage(`Contact ${name} updated successfully!`);
      setEditingContactId(null); // Exit editing mode
    } else {
      // Create new contact
      const newContact = {
        id: Date.now(),
        name,
        number,
        location,
        email,
        photo,
      };

      const existingContacts = JSON.parse(localStorage.getItem('contacts')) || [];
      const updatedContacts = [...existingContacts, newContact];
      localStorage.setItem('contacts', JSON.stringify(updatedContacts));
      setContacts(updatedContacts); // Update state for immediate display

      setMessage(`Contact ${name} created successfully!`);
    }

    setName('');
    setNumber('');
    setLocation('');
    setEmail('');
    setPhoto(null);
    e.target.reset(); // Clear file input
  };

  const handleDeleteContact = (id) => {
    const updatedContacts = contacts.filter(contact => contact.id !== id);
    localStorage.setItem('contacts', JSON.stringify(updatedContacts));
    setContacts(updatedContacts);
    setMessage('Contact deleted successfully!');
  };

  const handleEditContact = (contact) => {
    setEditingContactId(contact.id);
    setName(contact.name);
    setNumber(contact.number);
    setLocation(contact.location);
    setEmail(contact.email);
    setPhoto(contact.photo); // Set existing photo for preview
    setMessage(''); // Clear any previous messages
  };

  const handleCancelEdit = () => {
    setEditingContactId(null);
    setName('');
    setNumber('');
    setLocation('');
    setEmail('');
    setPhoto(null);
    setMessage('');
  };

  if (isAdminMode) {
    return (
      <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: '20px', borderRadius: '8px', maxWidth: '800px', margin: '50px auto', textAlign: 'left', color: 'white' }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Manage Contacts</h2>
        {message && <p style={{ color: 'lightgreen', marginBottom: '10px' }}>{message}</p>}

        {/* Create New Contact Form */}
        <div style={{ marginBottom: '40px', border: '1px solid #555', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>{editingContactId ? 'Edit Contact' : 'Create New Contact'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#333', color: 'white' }}
                placeholder="Enter contact name"
                required
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Number:</label>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#333', color: 'white' }}
                placeholder="Enter contact number"
                required
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Location:</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#333', color: 'white' }}
                placeholder="Enter contact location"
                required
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Email ID:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#333', color: 'white' }}
                placeholder="Enter contact email"
                required
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Photo:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#333', color: 'white' }}
              />
              {photo && <img src={photo} alt="Contact Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: '10px', borderRadius: '5px' }} />}
            </div>

            <button type="submit" style={{ backgroundColor: 'blue', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px', width: '100%' }}>
              {editingContactId ? 'Update Contact' : 'Create Contact'}
            </button>
            {editingContactId && (
              <button type="button" onClick={handleCancelEdit} style={{ backgroundColor: 'gray', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px', width: '100%' }}>
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        {/* Existing Contacts List */}
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Existing Contacts ({contacts.length})</h3>
          {contacts.length === 0 ? (
            <p style={{ textAlign: 'center' }}>No contacts created yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              {contacts.map((contact) => (
                <div key={contact.id} style={{ border: '1px solid #555', borderRadius: '8px', padding: '15px', backgroundColor: '#222', textAlign: 'left' }}>
                  {contact.photo && <img src={contact.photo} alt={contact.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '5px', marginBottom: '10px' }} />}
                  <h4 style={{ color: 'skyblue', marginBottom: '5px' }}>{contact.name}</h4>
                  <p><strong>Phone:</strong> {contact.number}</p>
                  <p><strong>Location:</strong> {contact.location}</p>
                  <p><strong>Email:</strong> {contact.email}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                    <button onClick={() => handleEditContact(contact)} style={{ backgroundColor: 'green', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDeleteContact(contact.id)} style={{ backgroundColor: 'red', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="button" onClick={onBackClick} style={{ backgroundColor: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '30px', width: '100%' }}>
          Back to Admin Options
        </button>

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
                style={{ width: '32px', height: '32px', margin: '0 10px' }}
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
                style={{ width: '32px', height: '32px', margin: '0 10px' }}
              />
            </a>
          </div>
        </footer>
      </div>
    );
  } else {
    return (
      <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: '20px', borderRadius: '8px', maxWidth: '800px', margin: '50px auto', textAlign: 'center', color: 'white' }}>
        <button type="button" onClick={onBackClick} style={{ backgroundColor: 'red', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '30px', width: '100%' }}>
          Back to Home
        </button>

        <button type="button" onClick={() => setShowJobPortal(!showJobPortal)} style={{ backgroundColor: 'darkgreen', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px', width: '100%' }}>
          {showJobPortal ? 'Hide Job Portal' : 'Show Job Portal'}
        </button>

        {showJobPortal ? (
          <JobPortal onBackClick={() => setShowJobPortal(false)} />
        ) : (
          <>
            <h2 style={{ marginBottom: '20px' }}>Our Contacts</h2>
            {contacts.length === 0 ? (
              <p>No contacts available.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                {contacts.map((contact) => (
                  <div key={contact.id} style={{ border: '1px solid #555', borderRadius: '8px', padding: '15px', backgroundColor: '#222', textAlign: 'left' }}>
                    {contact.photo && <img src={contact.photo} alt={contact.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '5px', marginBottom: '10px' }} />}
                    <h3 style={{ color: 'skyblue', marginBottom: '5px' }}>{contact.name}</h3>
                    <p><strong>Phone:</strong> {contact.number}</p>
                    <p><strong>Location:</strong> {contact.location}</p>
                    <p><strong>Email:</strong> {contact.email}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

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
                style={{ width: '32px', height: '32px', margin: '0 10px' }}
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
                style={{ width: '32px', height: '32px', margin: '0 10px' }}
              />
            </a>
          </div>
        </footer>
      </div>
    );
  }
};

export default Contact;