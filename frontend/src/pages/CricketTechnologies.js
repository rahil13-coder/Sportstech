import React, { useState, useEffect } from "react"; // Added useEffect
import { useNavigate } from "react-router-dom";
import { trackClick } from '../utils/trackClick'; // Import trackClick

const CricketTechnologies = ({ cricketTech }) => {
  const [show, setShow] = useState(false);
  const [news, setNews] = useState([]);
  const [scores, setScores] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [selectedScore, setSelectedScore] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    trackClick('page-load-cricket-technologies-page', 'page-load', window.location.pathname); // Track page load
  }, []);

  const handleButtonClick = async (label) => {
    setActiveTab(label);
    setSelectedScore(null);
    trackClick(`button-cricket-tech-${label.toLowerCase().replace(/\s/g, '-')}`, 'button', window.location.pathname); // Track click

    if (label === "Cricket News") {
      try {
        const response = await fetch(
          'https://newsdata.io/api/1/latest?apikey=pub_5026468b4e5147d69ed60033119e6062&q=cricket'
        );
        const data = await response.json();
        setNews(data.results || []);
      } catch {
        setNews([{
          title: "News load nahi ho paayi",
          description: "Internet connection check karein ya baad mein try karein.",
          image_url: null,
          link: "#"
        }]);
      }
    }

    if (label === "Cricket Scores") {
      try {
        const response = await fetch(
          "https://api.allorigins.win/get?url=" + encodeURIComponent("https://static.espncricinfo.com/rss/livescores.xml")
        );
        const result = await response.json();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(result.contents, "text/xml");
        const items = xmlDoc.querySelectorAll("item");

        const parsedScores = Array.from(items).map((item) => ({
          title: item.querySelector("title")?.textContent || "No title",
          description: item.querySelector("description")?.textContent || "No description",
          link: item.querySelector("link")?.textContent || "#",
          pubDate: item.querySelector("pubDate")?.textContent || "",
        }));

        setScores(parsedScores);
      } catch {
        setScores([{
          title: "Scores load nahi ho paaye",
          description: "Internet connection check karein ya baad mein try karein.",
          link: "#",
          pubDate: ""
        }]);
      }
    }

    if (label === "Fantasy") {
      navigate("/fantasy");
    }
  };

  const getHttpsLink = (url) => {
    if (!url) return "#";
    return url.startsWith("http://") ? url.replace("http://", "https://") : url;
  };

  // === FULL SCREEN RENDERING ===
  if (activeTab === "Live Stream") {
    return (
      <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1001,
          backgroundImage: `url('/background.jpg')`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          overflowY: 'auto',
          padding: '20px',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
      }}>
        <button
          onClick={() => setActiveTab(null)}
          style={{
              position: 'absolute',
              top: '8px',
              left: '80px',
              padding: '4px 8px',
              fontSize: '20px',
              backgroundColor: 'rgba(255, 255, 255, 1)',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer',
              zIndex: 1002,
          }}
        >
          ← Back
        </button>
        <h2 style={{ textAlign: 'center' }}>Live Stream</h2>
        <p style={{ textAlign: 'center', fontSize: '18px' }}>This feature is coming soon!</p>
      </div>
    );
  }

  if (activeTab === "Cricket News") {
    return (
      <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1001, // Higher zIndex to appear above the 4-button menu
          backgroundImage: `url('/background.jpg')`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          overflowY: 'auto',
          padding: '20px',
          color: 'white'
      }}>
        <button
          onClick={() => setActiveTab(null)}
          style={{
              position: 'absolute',
              top: '8px',
              left: '80px',
              padding: '4px 8px',
              fontSize: '20px',
              backgroundColor: 'rgba(255, 255, 255, 1)',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer',
              zIndex: 1002,
          }}
        >
          ← Back
        </button>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Latest Cricket News</h2>
        {news.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {news.map((article, index) => (
              <div key={index} style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderRadius: '10px',
                padding: '20px',
                margin: '10px 0',
                width: '90%',
                maxWidth: '800px',
              }}>
                <h4 style={{ marginTop: 0 }}>{article.title}</h4>
                {article.image_url && (
                  <img src={article.image_url} alt={article.title} style={{ maxWidth: '100%', height: 'auto', borderRadius: '5px' }} />
                )}
                <p>{article.description || "No description available."}</p>
                <a href={article.link} target="_blank" rel="noopener noreferrer" style={{ color: '#17a2b8', fontWeight: 'bold' }}>
                  Read more
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', fontSize: '18px' }}>Loading cricket news...</p>
        )}
      </div>
    );
  }

  if (activeTab === "Cricket Scores") {
    return (
      <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1001,
          backgroundImage: `url('/background.jpg')`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          overflowY: 'auto',
          padding: '20px',
          color: 'white'
      }}>
        <button
          onClick={() => selectedScore ? setSelectedScore(null) : setActiveTab(null)}
          style={{
              position: 'absolute',
              top: '8px',
              left: '80px',
              padding: '4px 8px',
              fontSize: '20px',
              backgroundColor: 'rgba(255, 255, 255, 1)',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer',
              zIndex: 1002,
          }}
        >
          ← Back
        </button>
        
        {!selectedScore ? (
          // List View
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '20px' }}>🏏 Recent Cricket Scores</h2>
            {scores.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {scores.map((match, index) => (
                  <div key={index} style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    borderRadius: '10px',
                    padding: '20px',
                    margin: '10px 0',
                    width: '90%',
                    maxWidth: '800px',
                  }}>
                    <h3 style={{ marginTop: 0 }}>{match.title}</h3>
                    <p>{match.description}</p>
                    <button
                      onClick={() => setSelectedScore(match)}
                      style={{
                        cursor: 'pointer',
                        color: '#17a2b8',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        textDecoration: 'underline',
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}
                    >
                      View Full Scorecard
                    </button>
                    <p style={{ marginTop: '10px', fontStyle: 'italic' }}>
                      {match.pubDate}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '18px' }}>Loading cricket scores...</p>
            )}
          </div>
        ) : (
          // Detail View
          <div style={{ textAlign: 'center' }}>
              <h2 style={{ marginBottom: '20px' }}>📋 Scorecard Detail</h2>
              <div style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  borderRadius: '10px',
                  padding: '20px',
                  margin: '10px auto',
                  width: '90%',
                  maxWidth: '800px',
                }}>
                <h3 style={{ marginTop: 0 }}>{selectedScore.title}</h3>
                <p>{selectedScore.description}</p>
                <a
                  href={getHttpsLink(selectedScore.link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#17a2b8', fontWeight: 'bold', fontSize: '18px' }}
                >
                  Open Scorecard in New Tab
                </a>
                <p style={{ marginTop: '10px', fontStyle: 'italic' }}>
                  {selectedScore.pubDate}
                </p>
              </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <section className="cricket" style={{ textAlign: 'center' }}>
        <h2>CRICKET TECHNOLOGIES</h2>
        <button
          className="btn btn-primary"
          onClick={(e) => { setShow(!show); trackClick('button-view-cricket-technologies', 'button', window.location.pathname); }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'orange'}
          onMouseLeave={(e) => e.target.style.backgroundColor = ''}
        >
          {show ? "Close" : "View Cricket Technologies"}
        </button>
      </section>

      {show && !activeTab && (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 1000,
            backgroundImage: `url('/background.jpg')`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            overflowY: 'auto',
            padding: '20px',
            textAlign: 'center'
        }}>
          <button
            onClick={() => setShow(false)}
            style={{
                position: 'absolute',
                top: '8px',
                left: '80px',
                padding: '4px 8px',
                fontSize: '20px',
                backgroundColor: 'rgba(255, 255, 255, 1)',
                border: '20px',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: 'pointer',
                zIndex: 1001,
            }}
          >
            ← Back
          </button>

          <div className="tech-buttons" style={{ marginTop: '100px' }}>
            <h3 style={{color: 'white'}}>Cricket Services</h3>
            {["Cricket News", "Cricket Scores", "Fantasy", "Live Stream"].map((label, index) => (
              <button
                key={index}
                onClick={() => handleButtonClick(label)}
                className={`tech-button ${activeTab === label ? "active" : ""}`}
                style={{ margin: '10px', padding: '15px 30px', fontSize: '18px' }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default CricketTechnologies;