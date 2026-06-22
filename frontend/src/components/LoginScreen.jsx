import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Key, User, Globe, AlertCircle, CheckCircle, Eye, EyeOff, 
  Activity, Zap, HelpCircle, Layers, ArrowRight, Check, Send, 
  MessageSquare, BarChart3, CloudRain, AlertTriangle, Play, Calendar, UserCheck
} from 'lucide-react';
import { translations } from '../translations';
import { getApiUrl } from '../api';

// Animated Count-Up Component
const AnimatedCounter = ({ value, duration = 1.5, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(value);
    if (isNaN(end)) {
      setCount(value);
      return;
    }
    const totalFrames = 50;
    const increment = end / totalFrames;
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      start += increment;
      if (frame >= totalFrames) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(end % 1 === 0 ? Math.floor(start) : parseFloat(start.toFixed(1)));
      }
    }, (duration * 1000) / totalFrames);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}{suffix}</span>;
};

export default function LoginScreen({ activeLang, setActiveLang, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Form toggles and transition state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);

  // Command Center Preview active tab
  const [activePreviewTab, setActivePreviewTab] = useState('monitor');

  // Interactive AI Copilot Demo State
  const [copilotStep, setCopilotStep] = useState(0);
  const copilotConversation = [
    { type: 'user', text: 'What incidents need attention?' },
    { type: 'ai', text: 'URGENT: Heavy congestion detected on Outer Ring Road (Southbound) near Bellandur due to a vehicle breakdown. Recommend triggering Corridor Plan Delta-4.' },
    { type: 'user', text: "Predict tomorrow's hotspots." },
    { type: 'ai', text: 'PREDICTION: Hebbal Flyover northbound intersection has an 82% probability of severe congestion tomorrow between 08:30 AM and 09:45 AM, exacerbated by forecasted drizzle.' },
    { type: 'user', text: 'Generate mitigation plan.' },
    { type: 'ai', text: 'Mitigation plan generated: Adjusting adaptive signal cycle timings at Silk Board by +15s, deploying 2 towing units to standby zones, and notifying emergency services.' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCopilotStep((prev) => (prev + 1) % (copilotConversation.length + 1));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Feedback Form State
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Issue Reporting Form State
  const [issueType, setIssueType] = useState('bug');
  const [issueDesc, setIssueDesc] = useState('');
  const [issueSuccess, setIssueSuccess] = useState(false);

  const dict = translations[activeLang] || translations['en'];
  const t = (key) => dict[key] || key;

  const handleLangChange = (e) => {
    const newLang = e.target.value;
    setActiveLang(newLang);
    localStorage.setItem('gridpulse_lang', newLang);
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setFeedbackSuccess(true);
    setTimeout(() => {
      setFeedbackName('');
      setFeedbackEmail('');
      setFeedbackMsg('');
      setFeedbackSuccess(false);
    }, 3000);
  };

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    setIssueSuccess(true);
    setTimeout(() => {
      setIssueDesc('');
      setIssueSuccess(false);
    }, 3000);
  };

  // Helper for password strength
  const calculateStrength = (pwd) => {
    let strength = 0;
    if (pwd.length > 5) strength += 1;
    if (pwd.length > 8) strength += 1;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    return Math.min(strength, 3);
  };

  const pwdStrength = calculateStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError(activeLang === 'kn' ? 'ಬಳಕೆದಾರಹೆಸರು ಅಗತ್ಯವಿದೆ' : (activeLang === 'hi' ? 'उपयोगकर्ता नाम आवश्यक है' : 'Username is required'));
      return;
    }
    if (!password) {
      setError(activeLang === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ ಅಗತ್ಯವಿದೆ' : (activeLang === 'hi' ? 'पासवर्ड आवश्यक है' : 'Password is required'));
      return;
    }

    if (isRegister) {
      if (cleanUsername.length < 3) {
        setError(activeLang === 'kn' ? 'ಬಳಕೆದಾರಹೆಸರು ಕನಿಷ್ಠ ೩ ಅಕ್ಷರಗಳಾಗಿರಬೇಕು' : (activeLang === 'hi' ? 'उपयोगकर्ता नाम कम से कम 3 वर्णों का होना चाहिए' : 'Username must be at least 3 characters long'));
        return;
      }
      if (password.length < 6) {
        setError(activeLang === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ ೬ ಅಕ್ಷರಗಳಾಗಿರಬೇಕು' : (activeLang === 'hi' ? 'पासवर्ड कम से कम 6 वर्णों का होना चाहिए' : 'Password must be at least 6 characters long'));
        return;
      }
      if (password !== confirmPassword) {
        setError(activeLang === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ' : (activeLang === 'hi' ? 'पासवर्ड मेल नहीं खाते' : 'Passwords do not match'));
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegister) {
        const res = await fetch(getApiUrl('/api/auth/register'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cleanUsername, password })
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.detail || t('auth-error-generic'));
        } else {
          setSuccess(t('auth-success-register'));
          setIsRegister(false);
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        const res = await fetch(getApiUrl('/api/auth/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cleanUsername, password })
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.detail || t('auth-invalid-credentials'));
        } else {
          localStorage.setItem('gridpulse_token', data.token);
          setAccessGranted(true);
          setTimeout(() => {
            onLoginSuccess(data);
          }, 1100); // Allow 1.1s for blast door transition
        }
      }
    } catch (err) {
      console.error(err);
      setError(t('auth-error-generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container split-screen">
      <AnimatePresence>
        {accessGranted && (
          <motion.div 
            className="access-granted-overlay"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ zIndex: 999999 }}
          >
            <div className="access-flash"></div>
            <div className="access-scanline"></div>
            <div className="access-content">
              <h1 className="glitch-text" data-text="ACCESS GRANTED">ACCESS GRANTED</h1>
              <div className="access-subtitles">
                <p className="sub-1">[ SYSTEM INITIALIZED: v4.2.9 ]</p>
                <p className="sub-2">[ ESTABLISHING SECURE CONNECTION ]</p>
                <p className="sub-3">[ DECRYPTING ASTRAM DASHBOARD... OK ]</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 1 — HERO */}
      <section className="landing-hero">
        <video 
          className="hero-video-bg"
          autoPlay 
          loop 
          muted 
          playsInline
          preload="auto"
        >
          <source src="/traffic_hero.mp4" type="video/mp4" />
        </video>
        <div className="hero-video-overlay"></div>

        <div className="hero-left">
          <div className="landing-brand">
            <Shield className="pulse-icon" size={32} style={{ color: 'var(--accent-blue)' }} />
            <h1>GridPulse</h1>
          </div>
          <h2 className="landing-tagline">
            AI-Powered Urban Congestion Intelligence Platform
          </h2>
          <p className="landing-subtitle">
            Predict. Simulate. Mitigate. Optimize.
          </p>

          <div className="hero-stats-grid">
            <div className="hero-stat-item">
              <div className="hero-stat-num">
                <AnimatedCounter value="142" />
              </div>
              <div className="hero-stat-label">Active Incidents Managed</div>
            </div>
            <div className="hero-stat-item">
              <div className="hero-stat-num">
                <AnimatedCounter value="84.6" suffix="%" />
              </div>
              <div className="hero-stat-label">Predicted Delays Prevented</div>
            </div>
            <div className="hero-stat-item">
              <div className="hero-stat-num">
                <AnimatedCounter value="450" suffix="K L" />
              </div>
              <div className="hero-stat-label">Fuel Saved</div>
            </div>
            <div className="hero-stat-item">
              <div className="hero-stat-num">
                <AnimatedCounter value="1.2" suffix="M kg" />
              </div>
              <div className="hero-stat-label">CO₂ Reduced</div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="glass-auth-card">
            <div className="login-lang-select-container" style={{ marginBottom: '20px' }}>
              <Globe className="login-lang-icon" />
              <select value={activeLang} onChange={handleLangChange} className="login-lang-picker">
                <option value="en">English</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>

            <h2 className="login-form-title" style={{ fontSize: '22px', fontWeight: '800', marginBottom: '24px', textAlign: 'center' }}>
              {isRegister ? t('register-title') : t('login-title')}
            </h2>

            {error && (
              <div className="auth-error" style={{ marginBottom: '16px' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="auth-success" style={{ marginBottom: '16px' }}>
                <CheckCircle size={16} />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <label>{t('username-lbl')}</label>
                <div className="input-with-icon">
                  <User className="input-icon" size={16} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t('username-lbl')}
                    disabled={loading}
                    style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>{t('password-lbl')}</label>
                <div className="input-with-icon">
                  <Key className="input-icon" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('password-lbl')}
                    disabled={loading}
                    style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn" 
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                
                {password && (
                  <div className="password-strength-meter">
                    <div className={`strength-segment ${pwdStrength >= 1 ? 'weak' : ''}`}></div>
                    <div className={`strength-segment ${pwdStrength >= 2 ? 'fair' : ''}`}></div>
                    <div className={`strength-segment ${pwdStrength >= 3 ? 'strong' : ''}`}></div>
                  </div>
                )}
              </div>

              {isRegister && (
                <div className="input-group">
                  <label>{activeLang === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ' : (activeLang === 'hi' ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password')}</label>
                  <div className="input-with-icon">
                    <Key className="input-icon" size={16} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={activeLang === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ' : (activeLang === 'hi' ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password')}
                      disabled={loading}
                      style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
                    />
                    <button 
                      type="button" 
                      className="password-toggle-btn" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex="-1"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              <button type="submit" className="btn-auth-submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #0284c7, #2563eb)' }}>
                {loading ? (
                  <span className="spinner"></span>
                ) : (
                  isRegister ? t('register-btn') : t('login-btn')
                )}
              </button>
            </form>

            <div className="auth-toggle" style={{ marginTop: '20px', textAlign: 'center' }}>
              <button 
                type="button" 
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                  setSuccess('');
                }}
                className="btn-auth-toggle"
                disabled={loading}
                style={{ color: '#38bdf8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}
              >
                {isRegister ? t('have-account') : t('need-account')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — WHY GRIDPULSE */}
      <section className="landing-section landing-section-darker">
        <div className="section-header">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Traffic Monitoring is Reactive.<br />GridPulse is Predictive.
          </motion.h2>
          <p>
            Traditional traffic operations center dashboards display congestion after it builds. GridPulse maps congestion spread before it starts.
          </p>
        </div>

        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon">
              <Activity size={24} />
            </div>
            <h3>Predictive Congestion Forecasting</h3>
            <p>Leverage ML severity forecasting models that update hourly based on geospatial density and live sensor feeds.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">
              <Zap size={24} />
            </div>
            <h3>Incident Impact Simulation</h3>
            <p>Perform live what-if simulation to estimate backpressure, delay spreads, and mitigation corridor outcomes.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">
              <Layers size={24} />
            </div>
            <h3>AI Resource Allocation</h3>
            <p>Dynamically calculate barricades and manpower requirements based on historical incident severity responses.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">
              <UserCheck size={24} />
            </div>
            <h3>Post-Event Learning Analytics</h3>
            <p>Close the loop on historical incident outcomes, feeding data back to optimize models and corridor plans.</p>
          </div>
        </div>
      </section>

      {/* SECTION 3 — HOW IT WORKS */}
      <section className="landing-section">
        <div className="section-header">
          <h2>Operational Cycle</h2>
          <p>End-to-end command-center automation keeping Astram moving.</p>
        </div>

        <div className="how-timeline">
          <div className="how-step">
            <div className="how-step-node">1</div>
            <h3>Incident Detected</h3>
            <p>Sensors and municipal feeds identify an incident point in real-time.</p>
          </div>
          <div className="how-step">
            <div className="how-step-node">2</div>
            <h3>AI Forecasts Spread</h3>
            <p>Astram ML engines forecast congestion propagation and delay scores.</p>
          </div>
          <div className="how-step">
            <div className="how-step-node">3</div>
            <h3>Resources Allocated</h3>
            <p>Optimal manpower and barricades are assigned to contain the issue.</p>
          </div>
          <div className="how-step">
            <div className="how-step-node">4</div>
            <h3>Mitigation Executed</h3>
            <p>Corridor planning adjusts adaptive signal cycles and reroutes traffic flow.</p>
          </div>
          <div className="how-step">
            <div className="how-step-node">5</div>
            <h3>System Learns</h3>
            <p>Post-event analytics ingestion improves forecasting accuracy for next time.</p>
          </div>
        </div>
      </section>

      {/* SECTION 4 — KEY CAPABILITIES */}
      <section className="landing-section landing-section-darker">
        <div className="section-header">
          <h2>Key Capabilities</h2>
          <p>Explore the full suite of Astram Congestion Mitigation tools.</p>
        </div>

        <div className="capabilities-grid">
          {[
            { title: 'Live Incident Monitoring', desc: 'Real-time alert feeds with priority classification and interactive map widgets.' },
            { title: 'Predictive Analytics', desc: 'Hourly ML severity mapping based on historical spatial density.' },
            { title: 'H3 Hotspot Detection', desc: 'Uber H3 hexagonal mapping to identify high-density incident locations.' },
            { title: 'Weather Impact Intelligence', desc: 'Real-time weather severity multipliers integrating Open-Meteo forecasts.' },
            { title: 'Emergency Corridor Planning', desc: 'Interactive route alternatives routing emergency vehicles dynamically.' },
            { title: 'Resource Optimization', desc: 'Resource calculators for barricades, signaling, and operational standby.' },
            { title: 'AI Chat Copilot', desc: 'Interactive chat drawer powered by Gemini API for immediate query assistance.' },
            { title: 'Event Outcome Analytics', desc: 'Comprehensive post-event insights showing mitigation compliance scores.' }
          ].map((cap, i) => (
            <motion.div 
              key={i}
              className="capability-card"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="capability-icon" style={{ marginBottom: '16px' }}>
                <Zap size={20} />
              </div>
              <h3>{cap.title}</h3>
              <p>{cap.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 5 — COMMAND CENTER PREVIEW */}
      <section className="landing-section">
        <div className="section-header">
          <h2>Command Center Preview</h2>
          <p>Take a glance at our active control modules.</p>
        </div>

        <div className="preview-carousel-container">
          <div className="preview-tab-buttons">
            {['monitor', 'weather', 'analytics', 'planner', 'copilot'].map((tab) => (
              <button
                key={tab}
                className={`preview-tab-btn ${activePreviewTab === tab ? 'active' : ''}`}
                onClick={() => setActivePreviewTab(tab)}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="preview-carousel-card">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePreviewTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="preview-mockup"
              >
                {activePreviewTab === 'monitor' && (
                  <div>
                    <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={18} className="pulse-icon" /> Live Monitor Map
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
                      Full interactive Leaflet Map displaying live geospatial feeds, incident severity overlays, and active diversions.
                    </p>
                    <div style={{ width: '100%', height: '180px', background: '#020617', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifycontent: 'center', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: '30%', left: '40%', width: '12px', height: '12px', background: 'rgba(239, 68, 68, 0.7)', borderRadius: '50%', boxShadow: '0 0 10px rgba(239, 68, 68, 0.9)' }}></div>
                      <div style={{ position: 'absolute', top: '60%', left: '70%', width: '10px', height: '10px', background: 'rgba(245, 158, 11, 0.7)', borderRadius: '50%', boxShadow: '0 0 10px rgba(245, 158, 11, 0.9)' }}></div>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>[ Interactive Map Ingestion Rendered ]</span>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'weather' && (
                  <div>
                    <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CloudRain size={18} /> Weather Desk
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
                      Tracks WMO codes and calculates real-time rain multipliers to adjust predictive severity scoring instantly.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                      <div style={{ background: '#020617', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>TEMPERATURE</div>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff' }}>24°C</div>
                      </div>
                      <div style={{ background: '#020617', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>RAIN MULTIPLIER</div>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#38bdf8' }}>1.25x</div>
                      </div>
                      <div style={{ background: '#020617', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>HUMIDITY</div>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff' }}>70%</div>
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'analytics' && (
                  <div>
                    <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BarChart3 size={18} /> Operational Analytics
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
                      Visualizes historical incidents, peak speed indicators, and bottleneck durations via responsive charts.
                    </p>
                    <div style={{ width: '100%', height: '150px', background: '#020617', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'flex-end', padding: '16px', gap: '12px' }}>
                      <div style={{ height: '30%', flex: 1, background: '#2563eb', borderRadius: '2px' }}></div>
                      <div style={{ height: '55%', flex: 1, background: '#2563eb', borderRadius: '2px' }}></div>
                      <div style={{ height: '80%', flex: 1, background: '#38bdf8', borderRadius: '2px' }}></div>
                      <div style={{ height: '40%', flex: 1, background: '#2563eb', borderRadius: '2px' }}></div>
                      <div style={{ height: '95%', flex: 1, background: '#38bdf8', borderRadius: '2px' }}></div>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'planner' && (
                  <div>
                    <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={18} /> Pre-Event Planner
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
                      Configure upcoming public events, pre-allocate standby materials, and generate detour pathways.
                    </p>
                    <div style={{ background: '#020617', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '12px', color: '#94a3b8' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span>Stadium Concert Alert</span>
                        <span style={{ color: '#10b981' }}>Configured</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Recommended Barricades</span>
                        <span style={{ color: '#ffffff', fontWeight: 'bold' }}>40 Units</span>
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'copilot' && (
                  <div>
                    <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MessageSquare size={18} /> AI Copilot
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
                      Interactive assistant querying real-time databases and triggering incident response blueprints automatically.
                    </p>
                    <div style={{ background: '#020617', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ color: '#38bdf8' }}>Copilot Online</div>
                      <div style={{ color: '#ffffff', fontStyle: 'italic' }}>"Analyzing mitigation pathways for Outer Ring Road..."</div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* SECTION 6 — GOVERNMENT IMPACT */}
      <section className="landing-section landing-section-darker">
        <div className="section-header">
          <h2>Government Impact Indicators</h2>
          <p>Verifiable metrics showing operational efficiency across Astram Metropolitan sectors.</p>
        </div>

        <div className="impact-grid">
          <div className="impact-card">
            <div className="impact-val">
              <AnimatedCounter value="26.4" suffix="%" />
            </div>
            <div className="impact-label">Travel Time Reduction</div>
          </div>
          <div className="impact-card">
            <div className="impact-val">
              <AnimatedCounter value="14.8" suffix="%" />
            </div>
            <div className="impact-label">Fuel Savings</div>
          </div>
          <div className="impact-card">
            <div className="impact-val">
              <AnimatedCounter value="19.2" suffix="%" />
            </div>
            <div className="impact-label">Carbon Reduction</div>
          </div>
          <div className="impact-card">
            <div className="impact-val">
              <AnimatedCounter value="32.5" suffix="%" />
            </div>
            <div className="impact-label">Emergency Response Imp.</div>
          </div>
          <div className="impact-card">
            <div className="impact-val">
              <AnimatedCounter value="21.1" suffix="%" />
            </div>
            <div className="impact-label">Congestion Reduction</div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — AI COPILOT DEMO */}
      <section className="landing-section">
        <div className="section-header">
          <h2>AI Copilot Live Interaction</h2>
          <p>Simulating active supervisor queries on the command floor.</p>
        </div>

        <div className="copilot-demo-chat">
          {copilotConversation.map((msg, i) => {
            const isVisible = copilotStep > i;
            return (
              <AnimatePresence key={i}>
                {isVisible && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`chat-bubble ${msg.type}`}
                  >
                    {msg.text}
                  </motion.div>
                )}
              </AnimatePresence>
            );
          })}
        </div>
      </section>

      {/* SECTION 9 — FOOTER */}
      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="footer-about">
            <h3>GridPulse</h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Astram Congestion Mitigator</p>
            <p>
              Integrated Urban Transport Control Center (IUTCC) enterprise platform. Designed for predictive dispatch, emergency corridor overrides, and adaptive signal timing configurations.
            </p>
          </div>

          <div className="footer-links">
            <h4>Sections</h4>
            <ul>
              <li><a href="#hero">Hero</a></li>
              <li><a href="#why">Why GridPulse</a></li>
              <li><a href="#how">How It Works</a></li>
              <li><a href="#capabilities">Capabilities</a></li>
              <li><a href="#preview">Preview</a></li>
            </ul>
          </div>

          <div className="footer-forms">
            <div>
              <h4>Feedback Form</h4>
              <form onSubmit={handleFeedbackSubmit} className="footer-form-box">
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  value={feedbackName} 
                  onChange={(e) => setFeedbackName(e.target.value)} 
                  required
                />
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  value={feedbackEmail} 
                  onChange={(e) => setFeedbackEmail(e.target.value)} 
                  required
                />
                <textarea 
                  placeholder="Your Feedback" 
                  rows="2" 
                  value={feedbackMsg} 
                  onChange={(e) => setFeedbackMsg(e.target.value)}
                  required
                ></textarea>
                <button type="submit" className="btn-footer-submit">
                  {feedbackSuccess ? 'Submitted!' : 'Submit Feedback'}
                </button>
              </form>
            </div>

            <div>
              <h4>Issue Reporting</h4>
              <form onSubmit={handleIssueSubmit} className="footer-form-box">
                <select value={issueType} onChange={(e) => setIssueType(e.target.value)}>
                  <option value="bug">System Bug</option>
                  <option value="data">Data Inaccuracy</option>
                  <option value="ui">UI/UX Defect</option>
                  <option value="other">Other Inquiry</option>
                </select>
                <textarea 
                  placeholder="Description of issue..." 
                  rows="2" 
                  value={issueDesc} 
                  onChange={(e) => setIssueDesc(e.target.value)}
                  required
                ></textarea>
                <button type="submit" className="btn-footer-submit">
                  {issueSuccess ? 'Reported!' : 'Report Issue'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© {new Date().getFullYear()} GridPulse Inc. All government operations restricted.</div>
          <div className="footer-bottom-links">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="#team">Team</a>
            <a href="mailto:support@gridpulse.gov">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
