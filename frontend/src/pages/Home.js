import React, { useEffect } from 'react'; // Added useEffect
import './Home.css';
import { trackClick } from '../utils/trackClick'; // Import trackClick
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Home = ({ onBackClick }) => { // Accept onBackClick prop
  const navigate = useNavigate(); // Initialize navigate
  useEffect(() => {
    trackClick('page-load-home-component', 'page-load', window.location.pathname);
  }, []);
  // Removed hasPaid state and handlePayment function

  return (
    <div className="home-container" style={{ backgroundImage: 'url("/background.jpg")', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}>
      <button onClick={onBackClick} style={{ position: 'absolute', top: '10px', left: '80px', zIndex: 1, backgroundColor: 'skyblue' }}>Back</button>

      {/* Directly render the content that was previously conditional */}
      <>
        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1, textAlign: 'center', color: 'white' }}>
          <img src="/GP.png" alt="GP" style={{ width: '200px', height: '200px' }} />
          <p style={{ margin: '5px 0 0 0', fontSize: '0.9em' }}>PAY For Charity</p>
        </div>

        <header className="home-header">
          <h1>Sports Explorer</h1>
          <p className="home-summary" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', padding: '20px', borderRadius: '8px', border: '1px solid #ccc' }}>
            Our platform explores the cutting-edge technology that is transforming the world of sports. We delve into how innovations in data analysis, biomechanics, and broadcasting are enhancing the experience for fans, players, and coaches in sports like Cricket, Football, Tennis, and Basketball.
          </p>
        </header>

        {/* Removed the "Click after Payment" button */}

        <main className="home-main">
          <section className="headline-section">
            <h2>1. The Data-Driven Athlete</h2>
            <p>Discover how teams are leveraging big data to optimize player performance, prevent injuries, and gain a competitive edge. From wearable sensors to advanced video analysis, data is the new MVP.</p>
            <button onClick={() => trackClick('button-data-driven-athlete', 'button', window.location.pathname)} style={{ backgroundColor: 'blue', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'block', margin: '15px auto 0 auto' }}>
               The Data-Driven Athlete
            </button>
          </section>

          <section className="headline-section">
            <h2>2. Biomechanics and Performance</h2>
            <p>Explore the science of movement and how biomechanical analysis is helping athletes in sports like cricket and tennis to perfect their technique, improve efficiency, and reduce the risk of strain.</p>
            <button onClick={() => trackClick('button-biomechanics-performance', 'button', window.location.pathname)} style={{ backgroundColor: 'blue', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'block', margin: '15px auto 0 auto' }}>
               Biomechanics and Performance
            </button>
          </section>

          <section className="headline-section">
            <h2>3. The Smart Stadium Experience</h2>
            <p>Learn how modern stadiums are becoming more connected, offering fans an immersive experience with features like instant replays on their phones, in-seat ordering, and augmented reality overlays.</p>
            <button onClick={() => trackClick('button-smart-stadium-experience', 'button', window.location.pathname)} style={{ backgroundColor: 'blue', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'block', margin: '15px auto 0 auto' }}>
               The Smart Stadium Experience
            </button>
          </section>

          <section className="headline-section">
            <h2>4. VAR and Officiating Technology</h2>
            <p>From VAR in football to Hawk-Eye in tennis and cricket, technology is playing an increasingly important role in ensuring fair play and accurate decision-making by officials.</p>
            <button onClick={() => trackClick('button-var-officiating-technology', 'button', window.location.pathname)} style={{ backgroundColor: 'blue', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'block', margin: '15px auto 0 auto' }}>
               VAR and Officiating Technology
            </button>
          </section>

          <section className="headline-section">
            <h2>5. Broadcasting and Fan Engagement</h2>
            <p>See how innovations in broadcasting, such as 4K streaming, virtual reality, and interactive stats, are bringing fans closer to the action than ever before, whether they're watching football or basketball.</p>
            <button onClick={() => trackClick('button-broadcasting-fan-engagement', 'button', window.location.pathname)} style={{ backgroundColor: 'blue', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'block', margin: '15px auto 0 auto' }}>
               Broadcasting and Fan Engagement
            </button>
          </section>

          <section className="headline-section">
            <h2>6. The Future of Sports Equipment</h2>
            <p>From smart basketballs that track your shot arc to cricket bats with embedded sensors, we look at the next generation of sports equipment and how it will change the game.</p>
            <button onClick={() => trackClick('button-future-sports-equipment', 'button', window.location.pathname)} style={{ backgroundColor: 'blue', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'block', margin: '15px auto 0 auto' }}>
               The Future of Sports Equipment
            </button>
          </section>

          <section className="headline-section">
            <h2>7. E-Sports and Virtual Training</h2>
            <p>The line between virtual and reality is blurring. We explore the rise of e-sports and how professional athletes are using virtual reality to supplement their training and recovery.</p>
            <button onClick={() => trackClick('button-esports-virtual-training', 'button', window.location.pathname)} style={{ backgroundColor: 'blue', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'block', margin: '15px auto 0 auto' }}>
               E-Sports and Virtual Training
            </button>
          </section>

          <section className="headline-section">
            <h2>8. The Globalization of Sports Fandom</h2>
            <p>Technology has broken down geographical barriers, allowing fans to follow their favorite teams and players from anywhere in the world. We look at the impact of social media and streaming on global sports culture.</p>
            <button onClick={() => trackClick('button-globalization-sports-fandom', 'button', window.location.pathname)} style={{ backgroundColor: 'blue', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'block', margin: '15px auto 0 auto' }}>
               The Globalization of Sports Fandom
            </button>
          </section>
        </main>
        <footer className="custom-footer">
          <div className="footer-box">
            <p className="footer-text">© ZAKRU Technologies Pvt. Ltd.</p>
            <div className="social-icons">
              <a
                href="https://youtube.com/@the_ocassion?si=IcrQIpXZMjpZrem_"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick('link-youtube-home', 'other', window.location.pathname)}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png"
                  alt="YouTube"
                  className="social-icon"
                />
              </a>
              <a
                href="https://www.facebook.com/rahil.patial.9?mibextid=ZbWKwL"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick('link-facebook-home', 'other', window.location.pathname)}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
                  alt="Facebook"
                  className="social-icon"
                />
              </a>
            </div>
          </div>
        </footer>
      </>
    </div>
  );
};

export default Home;