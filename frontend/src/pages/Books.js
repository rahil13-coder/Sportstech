import React from 'react';

const Books = ({ onBackClick, isAdminMode }) => {
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f4f4f4',
      fontFamily: 'Arial, sans-serif',
    },
    button: {
      backgroundColor: '#28a745',
      color: 'white',
      padding: '20px 40px',
      fontSize: '1.5em',
      fontWeight: 'bold',
      border: 'none',
      borderRadius: '30px',
      cursor: 'pointer',
      textDecoration: 'none',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
      transition: 'background-color 0.3s ease-in-out, transform 0.2s ease',
    },
    buttonHover: {
      backgroundColor: '#218838',
      transform: 'translateY(-2px)',
    }
  };

  const handleButtonClick = () => {
    window.open('https://oceanofpdf.com/', '_blank');
  };

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div style={styles.container}>
      <button
        onClick={handleButtonClick}
        style={{ ...styles.button, ...(isHovered ? styles.buttonHover : {}) }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        Unlimited Books
      </button>
    </div>
  );
};

export default Books;