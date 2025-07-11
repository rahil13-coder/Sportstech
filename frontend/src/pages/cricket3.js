import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const RAPIDAPI_HOST = "cricbuzz-cricket.p.rapidapi.com";
const RAPIDAPI_KEY = "3a72ff4efemshc2a0fc5f1961b30p16a72bjsn21b71540577c";

const Cricket3 = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [liveMatches, setLiveMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [scorecard, setScorecard] = useState(null);
  const [cricapiMatches, setCricapiMatches] = useState([]); // CricAPI state

  const navigate = useNavigate();

  const extractMatches = (data) => {
    if (!data?.typeMatches) return [];
    return data.typeMatches.flatMap((typeMatch) =>
      typeMatch.seriesMatches?.flatMap((seriesMatch) =>
        seriesMatch.seriesAdWrapper?.matches || []
      )
    );
  };

  const fetchCricapiData = async () => {
    try {
      const cricapiRes = await fetch(
        "https://api.cricapi.com/v1/currentMatches?apikey=6a9b0faf-e72f-4a5b-a8c0-051bca170525&offset=0"
      );
      const cricapiJson = await cricapiRes.json();

      if (cricapiJson.status === "success" && cricapiJson.data) {
        setCricapiMatches(cricapiJson.data);
        return true;
      } else {
        console.warn("CricAPI response not successful:", cricapiJson);
        return false;
      }
    } catch (err) {
      console.error("CricAPI failed:", err);
      return false;
    }
  };

  const fetchCrickbuzzData = async () => {
    try {
      const headers = {
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": RAPIDAPI_KEY,
      };

      const liveRes = await fetch(
        "https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live",
        { headers }
      );
      const liveJson = await liveRes.json();
      setLiveMatches(extractMatches(liveJson));

      const upcomingRes = await fetch(
        "https://cricbuzz-cricket.p.rapidapi.com/matches/v1/upcoming",
        { headers }
      );
      const upcomingJson = await upcomingRes.json();
      setUpcomingMatches(extractMatches(upcomingJson));

      const recentRes = await fetch(
        "https://cricbuzz-cricket.p.rapidapi.com/matches/v1/recent",
        { headers }
      );
      const recentJson = await recentRes.json();
      const extractedRecent = extractMatches(recentJson);
      setRecentMatches(extractedRecent);

      const sampleMatchId = extractedRecent?.[0]?.matchInfo?.matchId;
      if (sampleMatchId) {
        const scorecardRes = await fetch(
          `https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/${sampleMatchId}/scard`,
          { headers }
        );
        const scorecardJson = await scorecardRes.json();
        setScorecard(scorecardJson);
      }
    } catch (err) {
      console.error("Error fetching match data from RapidAPI:", err);
      setError("Unable to fetch match data.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const cricapiWorked = await fetchCricapiData();
      if (!cricapiWorked) {
        await fetchCrickbuzzData(); // fallback to RapidAPI
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const renderMatchCard = (match, idx) => (
    <div key={idx} className="match-card-container">
      <div className="match-card-title">
        {match.matchInfo?.seriesName || "Match Series"}
      </div>
      <div className="match-card-teams">
        <span>{match.matchInfo?.team1?.teamName}</span> vs{" "}
        <span>{match.matchInfo?.team2?.teamName}</span>
      </div>
      <div className="match-card-status">{match.matchInfo?.status}</div>
    </div>
  );

  return (
    <div className="cricket3-container">
      <button className="cricket3-back-button" onClick={() => navigate("/")}>
        ⬅ Back
      </button>

      <h2 className="cricket3-title">🏏 Live Cricket Dashboard</h2>

      {loading && <p className="loading-text">Loading matches...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && (
        <>
          {/* CricAPI Section */}
          {cricapiMatches.length > 0 && (
            <section className="match-section">
              <h3 className="section-title">🌐 CricAPI Matches</h3>
              <div className="match-list">
                {cricapiMatches.map((match, idx) => (
                  <div key={idx} className="match-card-container">
                    <div className="match-card-title">{match.name || "Match"}</div>
                    <div className="match-card-teams">
                      {match.teams?.[0]} vs {match.teams?.[1]}
                    </div>
                    <div className="match-card-status">{match.status}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Cricbuzz Sections */}
          {liveMatches.length > 0 && (
            <section className="match-section">
              <h3 className="section-title">🟢 Cricbuzz Live Matches</h3>
              <div className="match-list">
                {liveMatches.map(renderMatchCard)}
              </div>
            </section>
          )}

          {upcomingMatches.length > 0 && (
            <section className="match-section">
              <h3 className="section-title">🟠 Upcoming Matches</h3>
              <div className="match-list">
                {upcomingMatches.map(renderMatchCard)}
              </div>
            </section>
          )}

          {recentMatches.length > 0 && (
            <section className="match-section">
              <h3 className="section-title">🟡 Recent Matches</h3>
              <div className="match-list">
                {recentMatches.map(renderMatchCard)}a
              </div>
            </section>
          )}

          <section className="match-section">
            <h3 className="section-title">📊 Scorecard (Recent Match)</h3>
            {!scorecard ? (
              <p>No scorecard available.</p>
            ) : (
              <div className="scorecard-container">
                <h4 className="scorecard-title">
                  {scorecard.matchHeader?.matchDescription}
                </h4>

                <div className="scorecard-batting">
                  <h5>Batting</h5>
                  {scorecard.batsman?.map((batsman, idx) => (
                    <div key={idx} className="batsman-entry">
                      <span className="batsman-name">{batsman.batName}</span>{" "}
                      - {batsman.runs} ({batsman.balls}){" "}
                      <span className="out-desc">[{batsman.outDesc}]</span>
                    </div>
                  ))}
                </div>

                <div className="scorecard-bowling">
                  <h5>Bowling</h5>
                  {scorecard.bowling?.map((inning, idx) => (
                    <div key={idx}>
                      <h6 className="bowling-team">{inning?.bowlingTeam}</h6>
                      {inning.bowlers?.map((bowler, i) => (
                        <div key={i} className="bowler-entry">
                          {bowler.bowlName} - {bowler.wickets} W, {bowler.overs} O
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Cricket3;
