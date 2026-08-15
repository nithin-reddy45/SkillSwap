import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home">
      
      <section className="hero">
        <div className="hero-content">
          <p className="hero-tag">LEARN • TEACH • CONNECT</p>

          <h1>
            Exchange Skills.
            <br />
            <span>Grow Together.</span>
          </h1>

          <p className="hero-description">
            SkillSwap AI connects people who want to learn with people
            who have the skills to teach. Find your perfect learning
            partner and grow together.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="primary-btn">
              Get Started
            </Link>

            <Link to="/matches" className="secondary-btn">
              Find Matches
            </Link>
          </div>
        </div>

        <div className="hero-card">
          <div className="match-card">
            <p className="match-label">AI MATCH</p>
            <h3>Perfect Learning Partner</h3>

            <div className="skills">
              <div>
                <span>You teach</span>
                <strong>Java & DSA</strong>
              </div>

              <div>
                <span>You learn</span>
                <strong>React & Node.js</strong>
              </div>
            </div>

            <div className="match-score">
              <span>Compatibility</span>
              <strong>92%</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <p className="section-tag">HOW IT WORKS</p>

        <h2>Learn by exchanging knowledge</h2>

        <div className="steps">
          <div className="step-card">
            <div className="step-number">01</div>
            <h3>Share Your Skills</h3>
            <p>
              Add the skills you can teach and the skills you want to learn.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <h3>Find Your Match</h3>
            <p>
              Our intelligent matching system finds compatible learning partners.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <h3>Grow Together</h3>
            <p>
              Connect, exchange knowledge, schedule sessions, and build skills.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;