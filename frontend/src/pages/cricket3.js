import React, { useEffect, useState } from "react";

const Cricket3 = () => {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (document.getElementById("cricket3-widget-script")) {
      setLoading(false);
      return;
    }

    const script = document.createElement("script");
    script.id = "cricket3-widget-script";
    script.async = true;

    script.onload = () => {
      setLoading(false);
    };

    script.onerror = () => {
      setError("Fantasy widget script load nahi ho paaya.");
      setLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      const widgetDiv = document.getElementById("widget-container");
      if (widgetDiv) widgetDiv.innerHTML = "";
    };
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(
          "https://api.cricapi.com/v1/currentMatches?apikey=6a9b0faf-e72f-4a5b-a8c0-051bca170525&offset=0"
        );
        const data = await response.json();
        if (data.status === "success") {
          setMatches(data.data || []);
        } else {
          setError("Matches fetch karne mein problem aayi.");
        }
      } catch {
        setError("Network error.");
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className="cricket3-container">
      <h2 className="cricket3-title">🏏 Live Cricket Dashboard</h2>
      <div id="widget-container" className="cricket3-widget" />

      {loading && <p className="cricket3-loading">Loading live matches...</p>}
      {error && <p className="cricket3-error">{error}</p>}
      {!loading && !error && matches.length === 0 && (
        <p className="cricket3-no-matches">No live matches right now.</p>
      )}

      <div className="cricket3-matches">
        {matches.map((match, index) => (
          <div key={index} className="cricket3-card">
            <h3 className="cricket3-match-name">{match.name}</h3>
            <p className="cricket3-status">{match.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cricket3;
