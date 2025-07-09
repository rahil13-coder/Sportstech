import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
import SnickoMeter from './SnickoMeter';
import HawkEyeUploader from '../components/HawkEyeUploader';
 



function HomePage() {
    const [technologies, setTechnologies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hawkEyeActive, setHawkEyeActive] = useState(false);
    const [processedVideoUrl, setProcessedVideoUrl] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [hawkEyeError, setHawkEyeError] = useState('');
    const [decisionData, setDecisionData] = useState(null);
    const [snickoActive, setSnickoActive] = useState(false);


    const baseURL = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        const fetchTechnologies = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/technologies`);
                setTechnologies(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTechnologies();
    }, [baseURL]);

    const cricketTech = technologies.filter(tech => tech.category === 'Cricket');
    const footballTech = technologies.filter(tech => tech.category === 'Football');
    const tennisTech = technologies.filter(tech => tech.category === 'Tennis');
    const generalTech = technologies.filter(tech => tech.category === 'General');

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setProcessing(true);
        setProcessedVideoUrl(null);
        setHawkEyeError('');
        setDecisionData(null);

        const formData = new FormData();
        formData.append('video', file);

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/hawkeye/upload`, formData, {
    headers: {
        'Content-Type': 'multipart/form-data',
    }
});

            const data = response.data;

            setProcessedVideoUrl(data.videoUrl);
            setDecisionData({
                decision: data.decision,
                ballSpeed: data.ballSpeed,
                impactPoint: data.impactPoint,
                predictedPath: data.predictedPath,
                durationInSeconds: data.durationInSeconds,
                averageFrameRate: data.averageFrameRate,
                ballLine: data.ballLine,
                ballLength: data.ballLength,
                batterShotForce: data.batterShotForce,
                batterHitSpeed: data.batterHitSpeed,
            });

        } catch (error) {
            console.error("Error processing video:", error);
            setHawkEyeError("Failed to process the video. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    const handleDownloadJSON = () => {
        if (!decisionData) return;
        const blob = new Blob([JSON.stringify(decisionData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'hawk_eye_analysis.json';
        link.click();
    };

    return (
        <div className="container mt-5 homepage-background">
            <h1 className="hero-title">Sports Technology Explorer</h1>

            <section className="hero-title1">
                <h2>HAWK EYE</h2>
                <button className="btn btn-warning mb-3" onClick={() => setHawkEyeActive(!hawkEyeActive)}>
                    {hawkEyeActive ? "Close Hawk Eye" : "Activate Hawk Eye"}
                </button>

                {hawkEyeActive && (
                    <div className="card p-4 bg-dark text-white">
                        <h4>Upload a video to run Hawk Eye analysis</h4>
                        <input type="file" accept="video/*" className="form-control my-3" onChange={handleFileUpload} />

                        {processing && (
                            <div className="alert alert-info mt-3">Processing video using AI... Please wait.</div>
                        )}

                        {hawkEyeError && (
                            <div className="alert alert-danger mt-3">{hawkEyeError}</div>
                        )}

                        {processedVideoUrl && decisionData && (
                            <div className="mt-4">
                                <h5>Hawk Eye Result:</h5>
                                <video width="100%" controls src={processedVideoUrl}></video>
                                <div className="mt-3 text-start">
                                    <p><strong>Decision:</strong> {decisionData.decision}</p>
                                    <p><strong>Ball Speed:</strong> {decisionData.ballSpeed}</p>
                                    <p><strong>Impact Point:</strong> X: {decisionData.impactPoint?.x}, Y: {decisionData.impactPoint?.y}</p>
                                    <p><strong>Duration:</strong> {decisionData.durationInSeconds} seconds</p>
                                    <p><strong>Frame Rate:</strong> {decisionData.averageFrameRate} FPS</p>
                                    <p><strong>Ball Line:</strong> {decisionData.ballLine}</p>
                                    <p><strong>Ball Length:</strong> {decisionData.ballLength}</p>
                                    <p><strong>Batter Shot Force:</strong> {decisionData.batterShotForce}</p>
                                    <p><strong>Batter Hit Speed:</strong> {decisionData.batterHitSpeed}</p>

                                    <button onClick={handleDownloadJSON} className="btn btn-success mt-3">
                                        📥 Download JSON Report
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>
            
            {/* Technology Sections */}
            <section className="mb-5">
    <h2>SNICKO METER</h2>
    <button className="btn btn-primary mb-3" onClick={() => setSnickoActive(!snickoActive)}>
        {snickoActive ? "Close Snicko Meter" : "Activate Snicko Meter"}
    </button>

    {snickoActive && (
  <div
    className="snicko-background-wrapper"
    style={{
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
      padding: '20px',
      overflowY: 'auto',
    }}
  >
    {/* Back Button */}
    <button
      onClick={() => setSnickoActive(false)}
      style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        padding: '10px 20px',
        backgroundColor: '#ffffffcc',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer',
        zIndex: 1001,
      }}
    >
      ← Back
    </button>
    {/* SnickoMeter Content */}
    <SnickoMeter />
  </div>
)}
   </section> 

            {[{ title: "Cricket Technologies", data: cricketTech },
              { title: "Football Technologies", data: footballTech },
              { title: "Tennis Technologies", data: tennisTech },
              { title: "General Sports Technologies", data: generalTech }]
              .map(({ title, data }) => (
                <section className="mb-5" key={title}>
                    <h2>{title}</h2>
                    <div className="row">
                        {data.length > 0 ? (
                            data.map(tech => (
                                <div key={tech._id} className="col-md-6 mb-4">
                                    <div className="card">
                                        <div className="card-body">
                                            <h5 className="card-title">{tech.name}</h5>
                                            <p className="card-text"><strong>Description:</strong> {tech.description}</p>
                                            <p className="card-text"><strong>Working Principle:</strong> {tech.workingPrinciple}</p>
                                            <pre className="bg-light p-2 rounded"><code>{tech.codeSnippet}</code></pre>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="col-12">No technologies found in this category.</p>
                        )}
                    </div>
                </section>
            ))}
            <footer className="custom-footer">
    <p className="footer-text">© Rahil Technologies Pvt. Ltd.</p>
    <div className="social-icons">
        <a
            href="https://youtube.com/@info1_system3?si=LVWSva_yuNARLLBu"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
        >
            <img
                src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png"
                alt="YouTube Channel"
                className="social-icon"
            />
        </a>
        <a
            href="https://www.facebook.com/rahil.patial.9?mibextid=ZbWKwL"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
        >
            <img
                src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
                alt="Facebook Profile"
                className="social-icon"
            />
        </a>
    </div>
</footer>


        </div>
    );
}
export default HomePage;
