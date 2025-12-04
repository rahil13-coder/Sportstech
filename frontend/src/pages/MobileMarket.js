import React from 'react';
import { useNavigate } from 'react-router-dom';

const MobileMarket = () => {
  const navigate = useNavigate();

  return (
    <div style={{ color: 'white', padding: '20px', textAlign: 'center' }}>
      <h2>Mobile Market</h2>
      <p>Welcome to the mobile market. Here you can find the latest mobile analytics.</p>
      {/* Add more content here as needed */}
      <button 
        onClick={() => navigate(-1)} 
        style={{ 
          background: '#2d8cff', 
          color: 'white', 
          padding: '10px 20px', 
          borderRadius: '8px', 
          border: 'none', 
          cursor: 'pointer', 
          fontWeight: '600',
          marginTop: '20px'
        }}
      >
        Back
      </button>
    </div>
  );
};

export default MobileMarket;
