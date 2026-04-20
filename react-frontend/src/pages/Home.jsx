import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <>
      {/* Hero Section with Video */}
      <section className="hero">
          <div className="video-container">
              <video autoPlay muted loop>
                  <source src="/assets/images/Cinematic_College_Placement_Video_Generation.mp4" type="video/mp4" />
              </video>
          </div>
          <div className="hero-content">
              <h1>Connect. Apply. Succeed.</h1>
              <p>Your path to a successful career starts here. Access top placement opportunities from leading companies.</p>
              <div className="hero-buttons">
                  <Link to="/login" className="btn btn-hero primary">Student Login</Link>
                  <a href="#about" className="btn btn-hero secondary">Learn More</a>
              </div>
          </div>
      </section>

      {/* College Information Section */}
      <section id="about" className="section about-section">
          <div className="container">
              <div className="about-content">
                  <h2>About Our Placement Cell</h2>
                  <p style={{ marginBottom: 'var(--spacing-md)' }}>Our placement cell is dedicated to bridging the gap between talented students and leading organizations. With a strong network of recruiters and a commitment to student success, we have built a proven track record of facilitating meaningful career opportunities.</p>
                  <p style={{ marginBottom: 'var(--spacing-lg)' }}>We focus on holistic development, preparing students not just academically but also for professional challenges ahead. Our mission is to empower every student with the skills and confidence needed to excel in their careers.</p>
                  
                  <div className="grid grid-2" style={{ marginTop: 'var(--spacing-xl)' }}>
                      <div>
                          <h4 style={{ color: 'var(--primary)' }}>Our Mission</h4>
                          <p>To provide equal opportunities for all students and facilitate placements that align with their skills, interests, and aspirations.</p>
                      </div>
                      <div>
                          <h4 style={{ color: 'var(--primary)' }}>Our Vision</h4>
                          <p>To be a leading placement hub that creates synergy between talented graduates and forward-thinking organizations for mutual growth.</p>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Glassmorphism Placement Highlights */}
      <section className="placement-highlights">
          <div className="placement-highlights-container">
              <div className="highlights-title">
                  <h2>Placement Excellence</h2>
                  <p>Real outcomes from our placement initiatives, powered by session data</p>
              </div>
              <div className="glass-cards-grid">
                  <div className="glass-card">
                      <span className="card-icon">👥</span>
                      <div className="card-value" id="students-placed">2,450+</div>
                      <div className="card-label">Students Placed</div>
                      <div className="card-subtitle">This Semester</div>
                  </div>

                  <div className="glass-card">
                      <span className="card-icon">💼</span>
                      <div className="card-value" id="active-jobs">42+</div>
                      <div className="card-label">Active Job Openings</div>
                      <div className="card-subtitle">Verified Companies</div>
                  </div>

                  <div className="glass-card">
                      <span className="card-icon">🏆</span>
                      <div className="card-value" id="avg-package">18.5 LPA</div>
                      <div className="card-label">Average Package</div>
                      <div className="card-subtitle">Per Annum</div>
                  </div>

                  <div className="glass-card">
                      <span className="card-icon">⭐</span>
                      <div className="card-value" id="highest-package">50+ LPA</div>
                      <div className="card-label">Highest Package</div>
                      <div className="card-subtitle">Achieved</div>
                  </div>
              </div>
          </div>
      </section>

      {/* Features Overview */}
      <section className="section">
          <div className="container">
              <div className="section-title">
                  <h2>Why Choose Us?</h2>
                  <p>Comprehensive tools to boost your placement journey</p>
              </div>
              <div className="features-grid">
                  <div className="feature-item">
                      <div className="feature-icon">📋</div>
                      <div className="feature-content">
                          <h4>Complete Profile</h4>
                          <p>Create a comprehensive profile showcasing your skills, education, and experience to impress recruiters.</p>
                      </div>
                  </div>
                  <div className="feature-item">
                      <div className="feature-icon">💼</div>
                      <div className="feature-content">
                          <h4>Job Applications</h4>
                          <p>Apply to exclusive job openings from leading companies with just a few clicks.</p>
                      </div>
                  </div>
                  <div className="feature-item">
                      <div className="feature-icon">📄</div>
                      <div className="feature-content">
                          <h4>Resume Management</h4>
                          <p>Upload and manage your resume, cover letter, and other important documents in one place.</p>
                      </div>
                  </div>
                  <div className="feature-item">
                      <div className="feature-icon">🎓</div>
                      <div className="feature-content">
                          <h4>Certificates</h4>
                          <p>Showcase your achievements with verified certificates and credentials.</p>
                      </div>
                  </div>
                  <div className="feature-item">
                      <div className="feature-icon">📊</div>
                      <div className="feature-content">
                          <h4>Application Tracking</h4>
                          <p>Track your applications in real-time and monitor interview schedules.</p>
                      </div>
                  </div>
                  <div className="feature-item">
                      <div className="feature-icon">📥</div>
                      <div className="feature-content">
                          <h4>Download Reports</h4>
                          <p>Generate and download your application reports as PDF for record keeping.</p>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Top Recruiters Section */}
      <section className="section" style={{ background: 'var(--bg-gray)' }}>
          <div className="container">
              <div className="section-title">
                  <h2>Our Top Recruiters</h2>
                  <p>Companies that trust our graduates</p>
              </div>
              <div className="grid grid-4">
                  {[
                      { icon: '🏢', name: 'TCS', desc: 'Tata Consultancy Services' },
                      { icon: '🏢', name: 'Infosys', desc: 'Leading IT Services' },
                      { icon: '🏢', name: 'Wipro', desc: 'Global IT Solutions' },
                      { icon: '🏢', name: 'Accenture', desc: 'Professional Services' },
                      { icon: '🏢', name: 'Amazon', desc: 'Global E-commerce' },
                      { icon: '🏢', name: 'Google', desc: 'Technology Giant' },
                      { icon: '🏢', name: 'Microsoft', desc: 'Software Solutions' },
                      { icon: '🏢', name: 'IBM', desc: 'Enterprise IT' }
                  ].map((company, i) => (
                    <div key={i} className="info-card" style={{ boxShadow: 'none', background: 'transparent', border: '2px solid var(--border-color)' }}>
                        <div style={{ fontSize: '36px', marginBottom: 'var(--spacing-md)' }}>{company.icon}</div>
                        <h4>{company.name}</h4>
                        <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>{company.desc}</p>
                    </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Call to Action */}
      <section className="section" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', color: 'white', textAlign: 'center' }}>
          <div className="container">
              <h2 style={{ color: 'white' }}>Ready to Launch Your Career?</h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.95)', marginBottom: 'var(--spacing-lg)' }}>Join thousands of successful graduates who found their dream jobs through our platform.</p>
              <Link to="/login" className="btn btn-primary" style={{ background: 'white', color: 'var(--primary)', fontWeight: 600 }}>Get Started Now</Link>
          </div>
      </section>
    </>
  );
};

export default Home;
