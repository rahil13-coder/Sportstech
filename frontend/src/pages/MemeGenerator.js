import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MemeGenerator = () => {
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [memeImage, setMemeImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);
      const url = 'https://meme-generator6.p.rapidapi.com/templates';
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'meme-generator6.p.rapidapi.com',
          'x-rapidapi-key': '3a72ff4efemshc2a0fc5f1961b30p16a72bjsn21b71540577c'
        }
      };

      try {
        const response = await fetch(url, options);
        const result = await response.json();

        if (response.ok && result.success) {
          setTemplates(result.data.templates);
          if (result.data.templates.length > 0) {
            setSelectedTemplate(result.data.templates[0].image);
          }
        } else {
          setError(result.error || 'Failed to fetch templates');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const generateMeme = async () => {
    if (!selectedTemplate) {
      setError('Please select a meme template.');
      return;
    }

    setLoading(true);
    setError(null);
    setMemeImage(null);

    const url = `https://meme-generator6.p.rapidapi.com/template/${selectedTemplate}`;
    const options = {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'x-rapidapi-host': 'meme-generator6.p.rapidapi.com',
        'x-rapidapi-key': '3a72ff4efemshc2a0fc5f1961b30p16a72bjsn21b71540577c'
      },
      body: new URLSearchParams({
        text0: topText,
        text1: bottomText
      })
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();

      if (response.ok && result.success) {
        setMemeImage(result.data.url);
      } else {
        setError(result.error || 'Failed to generate meme');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
      <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: '10px', left: '80px', zIndex: 1, backgroundColor: 'skyblue' }}>Back</button>
      <h1 style={{ marginBottom: '20px' }}>Meme Generator</h1>

      {loading && <p>Loading templates...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!loading && templates.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="template-select" style={{ marginRight: '10px' }}>Select Template:</label>
          <select
            id="template-select"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            style={{ padding: '8px', borderRadius: '5px', border: 'none', color: 'black' }}
          >
            {templates.map((template) => (
              <option key={template.image} value={template.image}>
                {template.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Top Text"
          value={topText}
          onChange={(e) => setTopText(e.target.value)}
          style={{ padding: '10px', margin: '5px', borderRadius: '5px', border: 'none', width: '80%', maxWidth: '400px', color: 'black' }}
        />
        <input
          type="text"
          placeholder="Bottom Text"
          value={bottomText}
          onChange={(e) => setBottomText(e.target.value)}
          style={{ padding: '10px', margin: '5px', borderRadius: '5px', border: 'none', width: '80%', maxWidth: '400px', color: 'black' }}
        />
      </div>

      <button
        onClick={generateMeme}
        disabled={loading || !selectedTemplate}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        {loading ? 'Generating...' : 'Generate Meme'}
      </button>

      {memeImage && (
        <div style={{ marginTop: '30px' }}>
          <h2>Your Meme:</h2>
          <img src={memeImage} alt="Generated Meme" style={{ maxWidth: '100%', height: 'auto', border: '2px solid #ccc', borderRadius: '8px' }} />
        </div>
      )}
    </div>
  );
};

export default MemeGenerator;