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
      console.log("Widget Loaded");
      setLoading(false);
    };

    script.onerror = () => {
      console.error("Widget Load Error");
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
    <div className="cricket3-widget">
      <h3>Live Cricket Scores</h3>
      <div id="widget-container" style={{ marginTop: "20px" }} />

      <hr />

      {loading && <p>Loading live matches...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && matches.length === 0 && <p>No live matches right now.</p>}

      {!loading && matches.length > 0 && (
        <ul>
          {matches.map((match, index) => (
            <li key={index}>
              <strong>{match.name}</strong> - {match.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Cricket3;
