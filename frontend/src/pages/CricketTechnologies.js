import React, { useState } from "react";

const CricketTechnologies = ({ cricketTech }) => {
  const [show, setShow] = useState(false);
  const [news, setNews] = useState([]);
  const [scores, setScores] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [selectedScore, setSelectedScore] = useState(null); // New state for selected scorecard

  const handleButtonClick = async (label) => {
    setActiveTab(label);
    setSelectedScore(null); // Reset selected score when switching tabs

    if (label === "Cricket News") {
      try {
        const response = await fetch(
          'https://newsdata.io/api/1/latest?apikey=pub_5026468b4e5147d69ed60033119e6062&q=cricket'
        );
        const data = await response.json();
        setNews(data.results || []);
      } catch (error) {
        console.error("Error fetching cricket news:", error);
        setNews([{
          title: "Unable to load news",
          description: "Please check your internet connection or try again later.",
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
      } catch (error) {
        console.error("Error fetching cricket scores RSS:", error);
        setScores([{
          title: "Unable to load scores",
          description: "Please check your internet connection or try again later.",
          link: "#",
          pubDate: ""
        }]);
      }
    }
  };

  // Helper to ensure https URL for scorecard links
  const getHttpsLink = (url) => {
    if (!url) return "#";
    return url.startsWith("http://") ? url.replace("http://", "https://") : url;
  };

  return (
    <section className="cricket">
      <h2>CRICKET TECHNOLOGIES</h2>
      <button className="c1" onClick={() => setShow(!show)}>
        {show ? "Close Cricket Technologies" : "View Cricket Technologies"}
      </button>

      {show && (
        <div>
          {cricketTech.length > 0 ? (
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
                <button key={index} onClick={() => handleButtonClick(label)} className="tech-button">
                  {label}
                </button>
              ))}

              {activeTab === "Cricket News" && (
                <div className="news-section">
                  <h3 className="LCN">Latest Cricket News</h3>
                  <button onClick={() => setActiveTab(null)} className="back-button">⬅️ Back</button>
                  {Array.isArray(news) && news.length > 0 ? (
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
              )}

              {activeTab === "Cricket Scores" && (
                <div className="scores-section">
                  {!selectedScore ? (
                    <>
                      <h3 className="LCN">Recent Cricket Scores (via RSS)</h3>
                      <button onClick={() => setActiveTab(null)} className="back-button1">⬅️ Back</button>
                      {Array.isArray(scores) && scores.length > 0 ? (
                        scores.map((match, index) => (
                          <div key={index} className="score-card">
                            <h4>{match.title}</h4>
                            <p>{match.description}</p>
                            <button
                              className="score-link-button"
                              onClick={() => setSelectedScore(match)}
                              style={{ cursor: "pointer", color: "blue", background: "none", border: "none", padding: 0, textDecoration: "underline" }}
                              title={getHttpsLink(match.link)}
                            >
                              View Full Scorecard
                            </button>
                            <p><em>{match.pubDate}</em></p>
                            <hr />
                          </div>
                        ))
                      ) : (
                        <p>Loading cricket scores...</p>
                      )}
                    </>
                  ) : (
                    <div className="score-detail">
                      <h3>Scorecard Detail</h3>
                      <button onClick={() => setSelectedScore(null)} className="back-button">⬅️ Back</button>
                      <h4>{selectedScore.title}</h4>
                      <p>{selectedScore.description}</p>
                      <a
                        href={getHttpsLink(selectedScore.link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="news-link"
                      >
                        Open Scorecard in New Tab
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default CricketTechnologies;
