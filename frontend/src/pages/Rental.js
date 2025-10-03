import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Rental.css'; // Assuming you'll create a CSS file for styling

const Rental = () => {
  const [properties, setProperties] = useState([]);
  const [newProperty, setNewProperty] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    currency: '£', // New: Default currency
    images: [],
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [currentView, setCurrentView] = useState('location_select'); // 'location_select', 'buttons_display', 'view_properties', 'rent_property'
  const [selectedLocation, setSelectedLocation] = useState('');
  const [locationInput, setLocationInput] = useState(''); // For autocomplete input
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [searchLocation, setSearchLocation] = useState('');
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [showCustomCurrencyInput, setShowCustomCurrencyInput] = useState(false); // New state for custom currency input

  const navigate = useNavigate(); // Initialize useNavigate

  // Debounce for location input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (locationInput.length > 2) { // Only search if input is at least 3 characters
        fetchLocationSuggestions(locationInput);
      } else {
        setAutocompleteSuggestions([]);
      }
    }, 500); // Debounce for 500ms

    return () => {
      clearTimeout(handler);
    };
  }, [locationInput]);

  const fetchLocationSuggestions = async (input) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/places-autocomplete`, { // Call your backend endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: input }),
      });
      const data = await response.json();
      if (data && data.suggestions) {
        setAutocompleteSuggestions(data.suggestions.map(s => s.placePrediction.text.text));
      } else {
        setAutocompleteSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching location suggestions from backend:", error);
      setAutocompleteSuggestions([]);
    }
  };

  const handleLocationInputChange = (e) => {
    setLocationInput(e.target.value);
    setSelectedLocation(e.target.value); // Also update selectedLocation for immediate display
  };

  const handleSuggestionClick = (suggestion) => {
    setLocationInput(suggestion);
    setSelectedLocation(suggestion);
    setAutocompleteSuggestions([]); // Clear suggestions after selection
  };

  const handleConfirmLocation = () => {
    if (selectedLocation.trim() !== '') {
      setCurrentView('buttons_display');
    } else {
      alert('Please select or enter a location.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProperty({ ...newProperty, [name]: value });
  };

  const handleCurrencyChange = (e) => {
    setNewProperty({ ...newProperty, currency: e.target.value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewProperty({ ...newProperty, images: files });

    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newProperty.title || !newProperty.description || !newProperty.location || !newProperty.price) {
      alert('Please fill in all required fields.');
      return;
    }
    setProperties([...properties, { ...newProperty, id: Date.now() }]);
    setNewProperty({
      title: '',
      description: '',
      location: '',
      price: '',
      currency: '£', // Reset currency to default
      images: [],
    });
    setImagePreviews([]);
    alert('Property added successfully!');
    setCurrentView('buttons_display'); // Go back to buttons after submission
  };

  const handleSearchProperties = () => {
    if (searchLocation.trim() === '') {
      setFilteredProperties(properties);
    } else {
      const lowerCaseSearch = searchLocation.toLowerCase();
      const filtered = properties.filter(prop =>
        prop.location.toLowerCase().includes(lowerCaseSearch)
      );
      setFilteredProperties(filtered);
    }
  };

  // Initialize filtered properties when entering view_properties for the first time
  useEffect(() => {
    if (currentView === 'view_properties') {
      setFilteredProperties(properties);
    }
  }, [currentView, properties]);

  return (
    <div className="rental-container">
      <button onClick={() => navigate(-1)} className="back-to-previous-button">← Back</button>
      <h1>Property Rental</h1>

      {currentView === 'location_select' && (
        <section className="location-select-section">
          <h2>Select Your Location</h2>
          <p>Start typing to find locations worldwide.</p>
          <div className="form-group">
            <label htmlFor="locationInput">Location:</label>
            <input
              type="text"
              id="locationInput"
              name="locationInput"
              value={locationInput}
              onChange={handleLocationInputChange}
              placeholder="e.g., London, England, United Kingdom"
              className="location-input"
              list="location-suggestions" // Link to datalist
            />
            {autocompleteSuggestions.length > 0 && (
              <ul className="autocomplete-suggestions">
                {autocompleteSuggestions.map((suggestion, index) => (
                  <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
            <button onClick={handleConfirmLocation} className="confirm-location-button">
              Confirm Location
            </button>
          </div>
          <p className="note">Note</p>
        </section>
      )}

      {currentView === 'buttons_display' && (
        <section className="action-buttons-section">
          <h2>Welcome to {selectedLocation || 'your chosen location'}!</h2>
          <div className="button-group">
            <button onClick={() => setCurrentView('view_properties')} className="action-button view-button">
              View Properties
            </button>
            <button onClick={() => setCurrentView('rent_property')} className="action-button rent-button">
              Rent Your Property
            </button>
          </div>
          <button onClick={() => setCurrentView('location_select')} className="back-button">Change Location</button>
        </section>
      )}

      {currentView === 'view_properties' && (
        <section className="property-listings">
          <h2>Properties in {selectedLocation || 'All Locations'}</h2>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search properties by location (e.g., London)"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="search-input"
            />
            <button onClick={handleSearchProperties} className="search-button">Search</button>
            <button onClick={() => {
              setSearchLocation('');
              setFilteredProperties(properties);
            }} className="search-button clear-search-button">View All</button>
          </div>

          {filteredProperties.length === 0 ? (
            <p>No properties listed yet for this search. Be the first to add one!</p>
          ) : (
            <div className="property-grid">
              {filteredProperties.map((property) => (
                <div key={property.id} className="property-card">
                  <h3>{property.title}</h3>
                  <p><strong>Location:</strong> {property.location}</p>
                  <p><strong>Price:</strong> {property.currency}{property.price} / month</p>
                  <p>{property.description}</p>
                  <div className="property-images">
                    {property.images.length > 0 ? (
                      <div className="image-carousel">
                        {property.images.map((image, index) => (
                          <img
                            key={index}
                            src={URL.createObjectURL(image)}
                            alt={`${property.title} - ${index + 1}`}
                            className="carousel-image"
                          />
                        ))}
                      </div>
                    ) : (
                      <p>No images available</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setCurrentView('buttons_display')} className="back-button">Back to Options</button>
        </section>
      )}

      {currentView === 'rent_property' && (
        <section className="landlord-section high-class-form">
          <h2>List Your Property for Rent</h2>
          <form onSubmit={handleSubmit} className="property-form">
            <div className="form-group">
              <label htmlFor="title">Property Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newProperty.title}
                onChange={handleInputChange}
                placeholder="e.g., Spacious 2-bed flat in London"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={newProperty.description}
                onChange={handleInputChange}
                placeholder="Describe your property in detail..."
                rows="4"
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="location">Location (Postcode/Area):</label>
              <input
                type="text"
                id="location"
                name="location"
                value={newProperty.location}
                onChange={handleInputChange}
                placeholder="e.g., SW1A 0AA, Central London"
                required
              />
            </div>
            <div className="form-group price-currency-group">
              <label htmlFor="price">Rent per month:</label>
              <select
                id="currency"
                name="currency"
                value={newProperty.currency}
                onChange={handleCurrencyChange}
                className="currency-select"
              >
                <option value="£">£ (GBP)</option>
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
                <option value="₹">₹ (INR)</option>
                {/* Add more currencies as needed */}
              </select>
              <input
                type="number"
                id="price"
                name="price"
                value={newProperty.price}
                onChange={handleInputChange}
                placeholder="e.g., 1500"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="images">Upload Images:</label>
              <input
                type="file"
                id="images"
                name="images"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />
              <div className="image-previews">
                {imagePreviews.map((src, index) => (
                  <img key={index} src={src} alt="Property Preview" className="preview-image" />
                ))}
              </div>
            </div>
            <button type="submit" className="submit-button">Add Property</button>
          </form>
          <button onClick={() => setCurrentView('buttons_display')} className="back-button">Back to Options</button>
        </section>
      )}
    </div>
  );
};

export default Rental;

