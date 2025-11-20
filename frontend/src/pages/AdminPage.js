import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const AdminPage = () => {
  const navigate = useNavigate(); // Initialize navigate

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: '10px', left: '80px', zIndex: 1, backgroundColor: 'skyblue' }}>Back</button>
      <h1>Admin Page</h1>
      <p>Welcome to the Admin section!</p>
    </div>
  );
};

export default AdminPage;