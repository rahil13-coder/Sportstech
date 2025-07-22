import React, { useState, useEffect, lazy, Suspense } from 'react'; // Add lazy and Suspense
import axios from 'axios';
import '../App.css';
// import SnickoMeter from './SnickoMeter'; // Remove direct import
// import SnickoMeter1 from './SnickoMeter1'; // Remove direct import
// import CricketTechnologies from './CricketTechnologies'; // Remove direct import
// import FootballTechnologies from './FootballTechnologies'; // Remove direct import
// import TennisTechnologies from './TennisTechnologies'; // Remove direct import

// Lazy load heavy components
const SnickoMeter = lazy(() => import('./SnickoMeter'));
const SnickoMeter1 = lazy(() => import('./SnickoMeter1'));
const CricketTechnologies = lazy(() => import('./CricketTechnologies'));
const FootballTechnologies = lazy(() => import('./FootballTechnologies'));
const TennisTechnologies = lazy(() => import('./TennisTechnologies'));


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
    const [ballTrackingActive, setBallTrackingActive] = useState(false); // ✅ new state


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
                <h2>Cricket Informatica</h2>
                <button className="btn btn-warning mb-3" onClick={() => setHawkEyeActive(!hawkEyeActive)}>
                    {hawkEyeActive ? "Close Cricket Analytics" : "Cricket Analytics"}
                </button>


                {hawkEyeActive && (
                    <div className="card p-4 bg-dark text-white">
                        <h4>Upload a video to run Cricket Informatic analysis</h4>
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
                <h2>Cricket Video Analytics</h2>


                <button
                    className="btn btn-primary mb-3 me-2"
                    onClick={() => setSnickoActive(!snickoActive)}
                >
                    {snickoActive ? "Close Cricket Video Analyzer" : "Cricket Video Analyzer"}
                </button>


                <button
                    className="btn btn-secondary mb-3"
                    onClick={() => setBallTrackingActive(!ballTrackingActive)}
                >
                    {ballTrackingActive ? "Close Ball Tracking" : "Ball Tracking"}
                </button>


                {ballTrackingActive && (
                    <Suspense fallback={<div>Loading Ball Tracking...</div>}>
                        <div
                            className="ball-tracking-wrapper"
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100vw',
                                height: '100vh',
                                backgroundColor: '#000000ee',
                                zIndex: 999,
                                overflowY: 'auto',
                                padding: '20px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <button
                                onClick={() => setBallTrackingActive(false)}
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


                            <div style={{ width: '80%', maxWidth: '800px' }}>
                                <SnickoMeter1 />
                            </div>
                        </div>
                    </Suspense>
                )}


                {snickoActive && (
                    <Suspense fallback={<div>Loading Cricket Video Analyzer...</div>}>
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
                    </Suspense>
                )}
                
            </section> 


            <Suspense fallback={<div>Loading Cricket Technologies...</div>}>
                <CricketTechnologies cricketTech={cricketTech} />
            </Suspense>
            <Suspense fallback={<div>Loading Football Technologies...</div>}>
                <FootballTechnologies footballTech={footballTech} />
            </Suspense>
            <Suspense fallback={<div>Loading Tennis Technologies...</div>}>
                <TennisTechnologies tennisTech={tennisTech} />
            </Suspense>


            {[
                //{ title: "Football Technologies", data: footballTech }, // These are already being lazy-loaded above
                //{ title: "Tennis Technologies", data: tennisTech },   // These are already being lazy-loaded above
                //{ title: "General Sports Technologies", data: generalTech }
            ].map(({ title, data }) => (
                // Existing card-rendering logic
                // This part doesn't seem to be used for the lazy-loaded components,
                // but if you have other dynamic sections, you can wrap them similarly.
                
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
