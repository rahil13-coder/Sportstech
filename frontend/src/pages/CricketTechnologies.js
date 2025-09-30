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
  if (activeTab === "Cricket News") {
    return (
      <div className="fullscreen-section">
        <h3 className="LCN">Latest Cricket News</h3>
        <button onClick={(e) => { setActiveTab(null); trackClick('button-cricket-news-back', 'button', window.location.pathname); }} className="back-button">⬅️ Back</button>
        {news.length > 0 ? (
          news.map((article, index) => (
            <div key={index} className="news-article">
              <h4 className="news-title">{article.title}</h4>
              {article.image_url && (
                <img src={article.image_url} alt={article.title} className="news-image" width="300" />
              )}
              <p className="news-description">{article.description || "No description available."}</p>
              <a href={article.link} target="_blank" rel="noopener noreferrer" className="news-link">
                Read more
              </a>
              <hr />
            </div>
          ))
        ) : (
          <p>Loading cricket news...</p>
        )}
      </div>
    );
  }

  if (activeTab === "Cricket Scores") {
    return (
      <div className="fullscreen-section">
        {!selectedScore ? (
          <>
            <button className="cricket3-back-button" onClick={(e) => { navigate("/"); trackClick('button-cricket-technologies-back-to-home', 'button', window.location.pathname); }}>
        ⬅ Back
      </button>
            <h2 className="cricket3-title">🏏 Recent Cricket Scores</h2>
            {scores.length > 0 ? (
              <div className="cricket3-matches">
                {scores.map((match, index) => (
                  <div key={index} className="cricket3-card">
                    <h3 className="cricket3-match-name">{match.title}</h3>
                    <p className="cricket3-teams">{match.description}</p>
                    <button
                      className="score-link-button"
                      onClick={(e) => { setSelectedScore(match); trackClick(`button-view-scorecard-${match.title}`, 'button', window.location.pathname); }}
                      style={{
                        cursor: "pointer",
                        color: "#0288d1",
                        background: "none",
                        border: "none",
                        padding: 0,
                        textDecoration: "underline",
                        marginTop: "0.5rem",
                      }}
                    >
                      View Full Scorecard
                    </button>
                    <p className="cricket3-status">
                      <em>{match.pubDate}</em>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="cricket3-loading">Loading cricket scores...</p>
            )}
          </>
        ) : (
          <>
            <button onClick={(e) => { setSelectedScore(null); trackClick('button-scorecard-detail-back', 'button', window.location.pathname); }} className="cricket3-back-button">
              ⬅ Back
            </button>
            <h2 className="cricket3-title">📋 Scorecard Detail</h2>
            <div className="cricket3-card">
              <h3 className="cricket3-match-name">{selectedScore.title}</h3>
              <p className="cricket3-teams">{selectedScore.description}</p>
              <a
                href={getHttpsLink(selectedScore.link)}
                target="_blank"
                rel="noopener noreferrer"
                className="news-link"
                style={{ color: "#0288d1", textDecoration: "underline" }}
              >
                Open Scorecard in New Tab
              </a>
              <p className="cricket3-status">
                <em>{selectedScore.pubDate}</em>
              </p>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <section className="cricket">
      <h2>CRICKET TECHNOLOGIES</h2>
      <button className="c1" onClick={(e) => { setShow(!show); trackClick('button-view-cricket-technologies', 'button', window.location.pathname); }}>
        {show ? "Close" : "View Cricket Technologies"}
      </button>

      {show && (
        <div>
          {cricketTech && cricketTech.length > 0 ? (
            cricketTech.map((tech) => (
              <div key={tech._id}>
                <h5>{tech.name}</h5>
                <p><strong>Description:</strong> {tech.description}</p>
                <p><strong>Working Principle:</strong> {tech.workingPrinciple}</p>
                <pre><code>{tech.codeSnippet}</code></pre>
              </div>
            ))
          ) : (
            <div className="tech-buttons">
              {["Cricket News", "Cricket Scores", "Fantasy", "Live Stream"].map((label, index) => (
                <button
                  key={index}
                  onClick={() => handleButtonClick(label)}
                  className={`tech-button ${activeTab === label ? "active" : ""}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default CricketTechnologies;
