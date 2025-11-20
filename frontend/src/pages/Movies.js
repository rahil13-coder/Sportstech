
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // OMDb API: Some basic searches might work without a key, but it's recommended to get one.
        // Get a free API key from http://www.omdbapi.com/apikey.aspx
        const apiKey = 'YOUR_OMDB_API_KEY'; // Replace with your OMDb API key if you get one
        
        // Example search for popular movies (OMDb doesn't have a direct "discover popular" endpoint like TMDb)
        // We'll search for a generic term and limit results, or you can search by specific titles.
        // For a more comprehensive list of popular movies, TMDb (with an API key) is generally better.
        const response = await fetch(`http://www.omdbapi.com/?s=movie&type=movie&apikey=${apiKey}`);

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (data.Response === "True") {
          setMovies(data.Search);
        } else {
          setError(data.Error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: '10px', left: '80px', zIndex: 1, backgroundColor: 'skyblue' }}>Back</button>
      <h1 style={{ textAlign: 'center' }}>Movies</h1>
      {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}
      {error && <p style={{ textAlign: 'center', color: 'red' }}>Error: {error}</p>}
      {movies.length === 0 && !loading && !error && <p style={{textAlign: 'center'}}>No movies found. If you have an OMDb API key, please add it to frontend/src/pages/Movies.js.</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {movies.map(movie => (
          <div key={movie.imdbID} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '10px', textAlign: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
            <img src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/150?text=No+Image'} alt={movie.Title} style={{ width: '100%', borderRadius: '8px' }} />
            <h5 style={{ marginTop: '10px' }}>{movie.Title}</h5>
            <p>{movie.Year}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Movies;
