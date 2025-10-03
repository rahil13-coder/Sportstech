import React, { useState, useEffect, lazy, Suspense } from 'react';
import axios from 'axios';
import '../App.css';
import Menu from './Menu';
import Home from './Home';
import Admin from './Admin';
import { trackClick } from '../utils/trackClick';
import Contact from './contact';
import JobPortal from './JobPortal'; // Import the JobPortal component
// import Books from './Books'; // Removed direct import, now lazy loaded

// Lazy load heavy components
const SnickoMeter = lazy(() => import('./SnickoMeter'));
const SnickoMeter1 = lazy(() => import('./SnickoMeter1'));
const CricketTechnologies = lazy(() => import('./CricketTechnologies'));
const FootballTechnologies = lazy(() => import('./FootballTechnologies'));
const TennisTechnologies = lazy(() => import('./TennisTechnologies'));
const Blogs = lazy(() => import('./Blogs'));
const Books = lazy(() => import('./Books')); // Lazy load the Books component
const Games = lazy(() => import('./Games')); // Lazy load the Games component


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
    const [ballTrackingActive, setBallTrackingActive] = useState(false);
    const [showHome, setShowHome] = useState(false);
    const [showAdmin, setShowAdmin] = useState(false);
    const [showBlogs, setShowBlogs] = useState(false);
    const [showBooks, setShowBooks] = useState(false); // New state for Books
    const [showGames, setShowGames] = useState(false); // New state for Games
    const [showSmartStadiumExperience, setShowSmartStadiumExperience] = useState(false); // New state for Smart Stadium Experience
    const [showContact, setShowContact] = useState(false); // New state for Contact page
    const [showJobs, setShowJobs] = useState(false); // New state for Job Portal page


    const baseURL = process.env.REACT_APP_API_BASE_URL;


    useEffect(() => {
        trackClick('page-load-homepage', 'page-load', window.location.pathname);
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


    const handleDownloadJSON = (e) => {
        if (!decisionData) return;
        const blob = new Blob([JSON.stringify(decisionData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'hawk_eye_analysis.json';
        link.click();
        trackClick('button-download-json', 'button', window.location.pathname);
    };

    const toggleHome = (e) => {
        setShowHome(!showHome);
        setShowAdmin(false);
        setShowBlogs(false);
        setShowBooks(false); // Close Books when Home is opened
        trackClick('button-toggle-home', 'button', window.location.pathname);
    };

    const toggleAdmin = (e) => {
        setShowAdmin(!showAdmin);
        setShowHome(false);
        setShowBlogs(false);
        setShowBooks(false); // Close Books when Admin is opened
        setShowGames(false);
        setShowContact(false);
        setShowJobs(false);
        trackClick('button-toggle-admin', 'button', window.location.pathname);
    };

    const toggleBlogs = (e) => {
        setShowBlogs(!showBlogs);
        setShowHome(false);
        setShowAdmin(false);
        setShowBooks(false); // Close Books when Blogs is opened
        setShowGames(false);
        setShowContact(false);
        setShowJobs(false);
        trackClick('button-toggle-blogs', 'button', window.location.pathname);
    };

    const toggleBooks = (e) => { // New: Function to toggle Books
        setShowBooks(!showBooks);
        setShowHome(false);
        setShowAdmin(false);
        setShowBlogs(false);
        setShowGames(false);
        setShowContact(false);
        setShowJobs(false);
        trackClick('button-toggle-books', 'button', window.location.pathname);
    };

    const toggleGames = (e) => { // New: Function to toggle Games
        setShowGames(!showGames);
        setShowHome(false);
        setShowAdmin(false);
        setShowBlogs(false);
        setShowBooks(false); // Close Books when Games is opened
        setShowContact(false);
        setShowJobs(false);
        trackClick('button-toggle-games', 'button', window.location.pathname);
    };

    const toggleContact = (e) => {
        setShowContact(!showContact);
        setShowHome(false);
        setShowAdmin(false);
        setShowBlogs(false);
        setShowBooks(false);
        setShowGames(false);
        setShowJobs(false);
        trackClick('button-toggle-contact', 'button', window.location.pathname);
    };

    const toggleJobs = (e) => {
        setShowJobs(!showJobs);
        setShowHome(false);
        setShowAdmin(false);
        setShowBlogs(false);
        setShowBooks(false);
        setShowGames(false);
        setShowContact(false);
        trackClick('button-toggle-jobs', 'button', window.location.pathname);
    };


    return (
        <div className="container mt-5 homepage-background">
            <Menu toggleHome={toggleHome} toggleAdmin={toggleAdmin} toggleBlogs={toggleBlogs} toggleBooks={toggleBooks} toggleGames={toggleGames} toggleContact={toggleContact} toggleJobs={toggleJobs} /> {/* Pass toggleJobs */}
            {showHome && (
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
                    scrollBehavior: 'smooth'
                }}>
                  <Home onBackClick={(e) => { toggleHome(e); trackClick('button-home-back', 'button', window.location.pathname); }} />
                </div>
            )}
            {showAdmin && (
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
                    scrollBehavior: 'smooth'
                }}>
                  <Admin onBackClick={(e) => { toggleAdmin(e); trackClick('button-admin-back', 'button', window.location.pathname); }} />
                </div>
            )}
            {showBlogs && (
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
                    scrollBehavior: 'smooth'
                }}>
                  <Blogs onBackClick={(e) => { toggleBlogs(e); trackClick('button-blogs-back', 'button', window.location.pathname); }} />
                </div>
            )}
            {showBooks && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 1000,
                    backgroundImage: `url(${process.env.PUBLIC_URL}/background.jpg)`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    overflowY: 'auto',
                    scrollBehavior: 'smooth'
                }}>
                  <Suspense fallback={<div>Loading Books...</div>}> {/* Add Suspense for lazy loaded Books */}
                    <Books onBackClick={(e) => { toggleBooks(e); trackClick('button-books-back', 'button', window.location.pathname); }} />
                  </Suspense>
                </div>
            )}
            {showGames && (
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
                    scrollBehavior: 'smooth'
                }}>
                  <Suspense fallback={<div>Loading Games...</div>}>
                    <Games onBackClick={(e) => { toggleGames(e); trackClick('button-games-back', 'button', window.location.pathname); }} />
                  </Suspense>
                </div>
            )}

            {showContact && (
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
                    scrollBehavior: 'smooth'
                }}>
                  <Contact isAdminMode={false} onBackClick={(e) => { toggleContact(e); trackClick('button-contact-back', 'button', window.location.pathname); }} />
                </div>
            )}
            
            {showJobs && (
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
                    scrollBehavior: 'smooth'
                }}>
                  <JobPortal onBackClick={(e) => { toggleJobs(e); trackClick('button-jobs-back', 'button', window.location.pathname); }} />
                </div>
            )}
            
            {/* Responsive Hero Section */}
            <div className="responsive-hero-section">
                
                <div className="hero-content-center">
                    <div className="hero-main-content">
                        <h1 className="hero-title">Sports Technology Explorer</h1>
                        <h6 className="hero-tagline">USE THE TECHNOLOGY TO IMPROVE SPORTS SKILLS</h6>
                        <h6 className="hero-tagline">Works Excellent on Desktop WEBCAM</h6>
                    </div>
                    <div className="qr-code-container">
                        
                        <div className="qr-code-item">
                            <img src="/GP.png" alt="QR Code Right" className="hero-qr-code" style={{ width: '150px', height: 'auto' }} />
                            <h2 className="hero-subtitle right-qr-text">PAY for Charity</h2>
                        </div>
                    </div>
                </div>
                
            </div>

            <section className="hero-title">
                <h2>Cricket Informatica</h2>
                <button className="btn btn-warning mb-1" onClick={(e) => { setHawkEyeActive(!hawkEyeActive); trackClick('button-cricket-analytics', 'button', window.location.pathname); }}>
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
            <section className="mb-3">
                <h1 style={{ color: 'white' }}>Cricket Video Analytics</h1>


                <button
                    className="btn btn-primary mb-3 me-2"
                    onClick={(e) => { setSnickoActive(!snickoActive); trackClick('button-cricket-video-analyzer', 'button', window.location.pathname); }}
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
                                    top: '8px',
                                    left: '8px',
                                    padding: '4px 12px',
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
                                    top: '8px',
                                    left: '8px',
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
                <p className="footer-text">© ZAKRU Technologies Pvt. Ltd.</p>
                <div className="social-icons">
                    <a
                        href="https://youtube.com/@public_0cassion?si=nswULJf9ZyvFmk-m"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link"
                        onClick={(e) => trackClick('link-youtube', 'other', window.location.pathname)}
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
                        onClick={(e) => trackClick('link-facebook', 'other', window.location.pathname)}
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