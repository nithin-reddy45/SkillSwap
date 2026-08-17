import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  const token = localStorage.getItem("token");

  return (
    <div className="home">
      
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge-pill">
            <span>⚡ The #1 Peer-to-Peer Developer Skill Exchange</span>
          </div>

          <h1>
            Teach What You Know.
            <br />
            <span className="gradient-text">Learn What You Don't.</span>
          </h1>

          <p className="hero-description">
            SkillSwap AI pairs developers in reciprocal 1-on-1 mentorship exchanges.
            Trade your expertise, schedule live pair-programming video sessions, earn verified badges, and accelerate your career.
          </p>

          <div className="hero-buttons">
            <Link to={token ? "/dashboard" : "/register"} className="primary-btn">
              {token ? "Go to Dashboard →" : "Start Swapping Free 🚀"}
            </Link>

            <Link to="/matches" className="secondary-btn">
              🔍 Find Matches
            </Link>

            <Link to="/skill-assessment" className="assessment-hero-btn">
              🏆 Earn Verified Badges
            </Link>
          </div>

          <div className="hero-trust-metrics">
            <div className="trust-item">
              <strong>100% Free</strong>
              <span>No Subscriptions</span>
            </div>
            <div className="trust-divider">•</div>
            <div className="trust-item">
              <strong>1-on-1 Video</strong>
              <span>Live Pair Coding</span>
            </div>
            <div className="trust-divider">•</div>
            <div className="trust-item">
              <strong>AI Verified</strong>
              <span>Proven Skills</span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE HERO MATCH CARD */}
        <div className="hero-card">
          <div className="match-card">
            <div className="match-card-top">
              <span className="match-label">⚡ 2-WAY RECIPROCAL MATCH</span>
              <span className="compatibility-badge">96% Match</span>
            </div>

            <div className="match-partner-preview">
              <div className="partner-avatar">👩‍💻</div>
              <div>
                <h4>Alex Rivera</h4>
                <p>Senior Frontend & React Specialist</p>
              </div>
            </div>

            <div className="skills-exchange-box">
              <div className="skill-direction-row">
                <span className="direction-tag give">You Teach:</span>
                <span className="skill-bubble">Python & FastAPI</span>
              </div>

              <div className="exchange-arrow">⇅ Mutual Swap</div>

              <div className="skill-direction-row">
                <span className="direction-tag receive">You Learn:</span>
                <span className="skill-bubble">React & TypeScript</span>
              </div>
            </div>

            <div className="match-card-action">
              <Link to="/matches" className="quick-connect-demo-btn">
                🤝 Connect & Schedule Swap
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <div className="section-header-center">
          <p className="section-tag">HOW SKILLSWAP WORKS</p>
          <h2>Peer-to-Peer Learning in 4 Simple Steps</h2>
          <p className="section-subtitle">
            No expensive bootcamps or one-sided courses. Just two developers helping each other level up.
          </p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon">🎯</div>
            <h3>List Teach & Learn Skills</h3>
            <p>
              Specify the technologies you're confident teaching and the skills you're eager to learn.
            </p>
          </div>

          <div className="step-card highlight-step">
            <div className="step-number">02</div>
            <div className="step-icon">🤖</div>
            <h3>AI Reciprocal Matching</h3>
            <p>
              Our algorithm matches you with peers who teach what you want to learn, and want to learn what you teach.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon">💻</div>
            <h3>1-on-1 Video & Code Pad</h3>
            <p>
              Meet via live video, share code snippets in real time, and practice hands-on problem solving.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">04</div>
            <div className="step-icon">🏆</div>
            <h3>Earn Credits & Badges</h3>
            <p>
              Complete swap sessions to build time-bank credits and pass AI assessments to showcase verified badges.
            </p>
          </div>
        </div>
      </section>

      {/* WHY PEER LEARNING WINS */}
      <section className="why-skillswap-section">
        <div className="section-header-center">
          <p className="section-tag">THE ADVANTAGE</p>
          <h2>Why Skill Swapping Beats Video Tutorials</h2>
        </div>

        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">💡</div>
            <h3>Direct Q&A in Real Time</h3>
            <p>
              Get answers to your exact edge cases and debugging roadblocks instead of watching someone else type.
            </p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">🔥</div>
            <h3>Accountability & Streak</h3>
            <p>
              Scheduled 1-on-1 peer sessions keep you motivated to code and learn consistently every week.
            </p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">🪙</div>
            <h3>Time-Bank Skill Credits</h3>
            <p>
              Teach 1 hour to earn credits, then spend those credits learning from seasoned experts across any domain.
            </p>
          </div>
        </div>
      </section>

      {/* BOTTOM CALL TO ACTION */}
      <section className="home-cta-section">
        <div className="cta-content">
          <h2>Ready to trade skills with top developers?</h2>
          <p>Join developers worldwide exchanging skills, leveling up their code, and building together.</p>
          <Link to={token ? "/matches" : "/register"} className="cta-large-btn">
            {token ? "Explore Your Matches →" : "Get Started Now — It's 100% Free"}
          </Link>
        </div>
      </section>

    </div>
  );
}

export default Home;