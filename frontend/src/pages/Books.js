import React from 'react';

const Books = ({ onBackClick, isAdminMode }) => {
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f4f4f4',
      fontFamily: 'Arial, sans-serif',
      padding: '5vh 0',
      gap: '30px',
      position: 'relative', // Needed for absolute positioning of back button
    },
    title: {
        fontSize: '3em',
        fontWeight: 'bold',
        color: '#333',
        textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
        textAlign: 'center',
    },
    buttonContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '20px',
      width: '90%',
      maxWidth: '1400px',
    },
    button: {
      backgroundColor: '#28a745',
      color: 'white',
      padding: '20px',
      fontSize: '1.2em',
      fontWeight: 'bold',
      border: 'none',
      borderRadius: '20px',
      cursor: 'pointer',
      textDecoration: 'none',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
      transition: 'background-color 0.3s ease-in-out, transform 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      width: '100%',
      minHeight: '80px',
    },
    buttonHover: {
      backgroundColor: '#218838',
      transform: 'translateY(-2px)',
    },
    newReleaseButton: {
        backgroundColor: '#007bff',
    },
    newReleaseButtonHover: {
        backgroundColor: '#0056b3',
        transform: 'translateY(-2px)',
    },
    genreButton: {
        backgroundColor: '#ffc107',
        color: 'black',
    },
    genreButtonHover: {
        backgroundColor: '#e0a800',
        transform: 'translateY(-2px)',
    },
    listopiaButton: {
        backgroundColor: '#dc3545',
    },
    listopiaButtonHover: {
        backgroundColor: '#c82333',
        transform: 'translateY(-2px)',
    },
    authorsButton: {
        backgroundColor: '#17a2b8',
    },
    authorsButtonHover: {
        backgroundColor: '#138496',
        transform: 'translateY(-2px)',
    },
    languagesButton: {
        backgroundColor: '#6f42c1',
    },
    languagesButtonHover: {
        backgroundColor: '#5a32a3',
        transform: 'translateY(-2px)',
    },
    magazinesButton: {
        backgroundColor: '#6c757d',
    },
    magazinesButtonHover: {
        backgroundColor: '#5a6268',
        transform: 'translateY(-2px)',
    },
    webnovelsButton: {
        backgroundColor: '#fd7e14',
    },
    webnovelsButtonHover: {
        backgroundColor: '#e66a00',
        transform: 'translateY(-2px)',
    },
    latestReleaseButton: {
        backgroundColor: '#20c997',
    },
    latestReleaseButtonHover: {
        backgroundColor: '#1baa80',
        transform: 'translateY(-2px)',
    },
    charityContainer: {
        marginTop: '40px',
        textAlign: 'center',
    },
    charityImage: {
        width: '150px',
        height: '150px',
        objectFit: 'contain',
    },
    charityText: {
        marginTop: '10px',
        fontSize: '1.2em',
        fontWeight: 'bold',
        color: '#555',
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
  };

  const openLink = (url) => {
    window.open(url, '_blank');
  };

  const [isUnlimitedHovered, setIsUnlimitedHovered] = React.useState(false);
  const [isNewReleaseHovered, setIsNewReleaseHovered] = React.useState(false);
  const [isGenreHovered, setIsGenreHovered] = React.useState(false);
  const [isListopiaHovered, setIsListopiaHovered] = React.useState(false);
  const [isAuthorsHovered, setIsAuthorsHovered] = React.useState(false);
  const [isLanguagesHovered, setIsLanguagesHovered] = React.useState(false);
  const [isMagazinesHovered, setIsMagazinesHovered] = React.useState(false);
  const [isWebnovelsHovered, setIsWebnovelsHovered] = React.useState(false);
  const [isLatestReleaseHovered, setIsLatestReleaseHovered] = React.useState(false);
  const [isBackHovered, setIsBackHovered] = React.useState(false);

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
      <h1 style={styles.title}>Welcome To Books Infinity</h1>
      <div style={styles.buttonContainer}>
        <button
          onClick={() => openLink('https://oceanofpdf.com/')}
          style={{ 
            ...styles.button, 
            ...(isUnlimitedHovered ? styles.buttonHover : {}) 
          }}
          onMouseEnter={() => setIsUnlimitedHovered(true)}
          onMouseLeave={() => setIsUnlimitedHovered(false)}
        >
          Unlimited Books
        </button>
        <button
          onClick={() => openLink('https://oceanofpdf.com/new-releases/')}
          style={{ 
            ...styles.button, 
            ...styles.newReleaseButton,
            ...(isNewReleaseHovered ? styles.newReleaseButtonHover : {}) 
          }}
          onMouseEnter={() => setIsNewReleaseHovered(true)}
          onMouseLeave={() => setIsNewReleaseHovered(false)}
        >
          <span role="img" aria-label="rocket">🚀</span>
          New release
        </button>
        <button
          onClick={() => openLink('https://oceanofpdf.com/books-by-genre/')}
          style={{ 
            ...styles.button, 
            ...styles.genreButton,
            ...(isGenreHovered ? styles.genreButtonHover : {}) 
          }}
          onMouseEnter={() => setIsGenreHovered(true)}
          onMouseLeave={() => setIsGenreHovered(false)}
        >
          <span role="img" aria-label="books">📚</span>
          Genre
        </button>
        <button
          onClick={() => openLink('https://oceanofpdf.com/listopia/')}
          style={{ 
            ...styles.button, 
            ...styles.listopiaButton,
            ...(isListopiaHovered ? styles.listopiaButtonHover : {}) 
          }}
          onMouseEnter={() => setIsListopiaHovered(true)}
          onMouseLeave={() => setIsListopiaHovered(false)}
        >
          <span role="img" aria-label="clipboard">📋</span>
          Listopia
        </button>
        <button
          onClick={() => openLink('https://oceanofpdf.com/books-by-authors/')}
          style={{ 
            ...styles.button, 
            ...styles.authorsButton,
            ...(isAuthorsHovered ? styles.authorsButtonHover : {}) 
          }}
          onMouseEnter={() => setIsAuthorsHovered(true)}
          onMouseLeave={() => setIsAuthorsHovered(false)}
        >
          <span role="img" aria-label="authors">👤</span>
          Authors
        </button>
        <button
          onClick={() => openLink('https://oceanofpdf.com/books-by-languages/')}
          style={{ 
            ...styles.button, 
            ...styles.languagesButton,
            ...(isLanguagesHovered ? styles.languagesButtonHover : {}) 
          }}
          onMouseEnter={() => setIsLanguagesHovered(true)}
          onMouseLeave={() => setIsLanguagesHovered(false)}
        >
          <span role="img" aria-label="globe">🌐</span>
          Languages
        </button>
        <button
          onClick={() => openLink('https://oceanofpdf.com/magazines-newspapers/')}
          style={{ 
            ...styles.button, 
            ...styles.magazinesButton,
            ...(isMagazinesHovered ? styles.magazinesButtonHover : {}) 
          }}
          onMouseEnter={() => setIsMagazinesHovered(true)}
          onMouseLeave={() => setIsMagazinesHovered(false)}
        >
          <span role="img" aria-label="newspaper">📰</span>
          Magazines & Newspapers
        </button>
        <button
          onClick={() => openLink('https://oceanofpdf.com/webnovels/')}
          style={{ 
            ...styles.button, 
            ...styles.webnovelsButton,
            ...(isWebnovelsHovered ? styles.webnovelsButtonHover : {}) 
          }}
          onMouseEnter={() => setIsWebnovelsHovered(true)}
          onMouseLeave={() => setIsWebnovelsHovered(false)}
        >
          <span role="img" aria-label="web">🕸️</span>
          Webnovels
        </button>
        <button
          onClick={() => openLink('https://oceanofpdf.com/recently-added/')}
          style={{ 
            ...styles.button, 
            ...styles.latestReleaseButton,
            ...(isLatestReleaseHovered ? styles.latestReleaseButtonHover : {}) 
          }}
          onMouseEnter={() => setIsLatestReleaseHovered(true)}
          onMouseLeave={() => setIsLatestReleaseHovered(false)}
        >
          <span role="img" aria-label="sparkles">✨</span>
          Latest Release
        </button>
      </div>
      <div style={styles.charityContainer}>
        <img src={`${process.env.PUBLIC_URL}/GP.png`} alt="GP for Charity" style={styles.charityImage} />
        <p style={styles.charityText}>PAY for Charity</p>
      </div>
    </div>
  );
};

export default Books;
