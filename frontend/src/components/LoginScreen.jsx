import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Key, User, Globe, AlertCircle, CheckCircle, Eye, EyeOff, 
  Activity, Zap, Layers, UserCheck, CloudRain, BarChart3, Calendar, 
  MessageSquare, LayoutGrid, Terminal, Cpu, Database, Network, Globe2, 
  HelpCircle, Compass, Check, ArrowRight, Play, Server, Mail, Phone
} from 'lucide-react';
import { translations } from '../translations';
import { getApiUrl } from '../api';

const GithubIcon = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

// Animated Count-Up Component
const AnimatedCounter = ({ value, duration = 1.5, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
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
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  return <span ref={elementRef}>{count}{suffix}</span>;
};

export default function LoginScreen({ activeLang, setActiveLang, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Form password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);

  // Preview tab
  const [activePreviewTab, setActivePreviewTab] = useState('monitor');

  // AI Copilot Demo State
  const [copilotStep, setCopilotStep] = useState(0);
  const copilotConversation = [
    { type: 'user', text: 'What incidents need attention?' },
    { type: 'ai', text: 'ALERT: Major congestion peak detected on Outer Ring Road northbound near Bellandur intersection. Backpressure delay estimated at +18 minutes. Suggest rerouting to bypass Corridor Alpha.' },
    { type: 'user', text: "Forecast tomorrow's hotspots." },
    { type: 'ai', text: 'HOTSPOT PREDICTION: Silk Board Flyover has an 87% probability of extreme delay tomorrow morning between 08:45 AM and 09:30 AM, aggravated by forecasted rain showers.' },
    { type: 'user', text: 'Generate mitigation plan.' },
    { type: 'ai', text: 'PLAN GENERATED: Adaptive signal cycle timing adjusted (+12s green phase on ORR), dispatched 2 emergency response units to junction staging points, and broadcasted route alternatives.' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCopilotStep((prev) => (prev + 1) % (copilotConversation.length + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Form state
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

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

  // Scroll spy active state
  const [activeSection, setActiveSection] = useState('hero');
  const containerRef = useRef(null);

  useEffect(() => {
    const sections = [
      'hero', 'why-gridpulse', 'how-it-works', 'capabilities', 
      'tech-stack', 'features', 'preview', 'impact', 'copilot', 'footer'
    ];

    const handleScroll = () => {
      const scrollPos = containerRef.current ? containerRef.current.scrollTop : window.scrollY;
      const offset = 200; // Trigger threshold offset

      for (let i = 0; i < sections.length; i++) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top - offset && scrollPos < top + height - offset) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    window.addEventListener('scroll', handleScroll);

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el && containerRef.current) {
      containerRef.current.scrollTo({
        top: el.offsetTop,
        behavior: 'smooth'
      });
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setActiveSection(id);
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setFeedbackSuccess(true);
    setTimeout(() => {
      setFeedbackName('');
      setFeedbackEmail('');
      setFeedbackMsg('');
      setFeedbackSuccess(false);
    }, 2500);
  };

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    setIssueSuccess(true);
    setTimeout(() => {
      setIssueDesc('');
      setIssueSuccess(false);
    }, 2500);
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
          }, 1100);
        }
      }
    } catch (err) {
      console.error(err);
      setError(t('auth-error-generic'));
    } finally {
      setLoading(false);
    }
  };

  // Nav Items definition
  const navItems = [
    { label: 'Hero', id: 'hero' },
    { label: 'Why GridPulse', id: 'why-gridpulse' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Capabilities', id: 'capabilities' },
    { label: 'Tech Stack', id: 'tech-stack' },
    { label: 'Features', id: 'features' },
    { label: 'Preview', id: 'preview' },
    { label: 'Impact', id: 'impact' },
    { label: 'AI Copilot', id: 'copilot' },
    { label: 'Contact', id: 'footer' }
  ];

  return (
    <div className="login-container split-screen" ref={containerRef}>
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

      {/* LEFT NAVIGATION SIDEBAR */}
      <aside className="landing-sidebar">
        <div className="landing-sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <Shield className="pulse-icon" size={24} style={{ color: 'var(--accent-blue)' }} />
          <span style={{ fontSize: '18px', fontWeight: '800', background: 'linear-gradient(to right, #38bdf8, #2563eb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>GridPulse</span>
        </div>

        <nav className="landing-nav-links">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`landing-nav-item ${activeSection === item.id ? 'active' : ''}`}
            >
              <div className="nav-bullet"></div>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="landing-sidebar-footer" style={{ marginTop: 'auto' }}>
          <div className="login-lang-select-container">
            <Globe className="login-lang-icon" size={14} />
            <select value={activeLang} onChange={handleLangChange} className="login-lang-picker">
              <option value="en">English</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>
        </div>
      </aside>

      {/* MAIN PORTAL WRAPPER */}
      <div className="landing-main-content">
        
        {/* SECTION 1: HERO */}
        <section id="hero" className="landing-hero">
          <video className="hero-video-bg" autoPlay loop muted playsInline preload="auto">
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
              <h2 className="login-form-title" style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px', textAlign: 'center' }}>
                {isRegister ? t('register-title') : t('login-title')}
              </h2>

              {error && (
                <div className="auth-error" style={{ marginBottom: '14px' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="auth-success" style={{ marginBottom: '14px' }}>
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

        {/* SECTION 2: WHY GRIDPULSE */}
        <section id="why-gridpulse" className="landing-section landing-section-darker">
          <div className="section-header">
            <h2>Traffic Monitoring is Reactive. GridPulse is Predictive.</h2>
            <p>Traditional operations tools highlight failures. GridPulse resolves them preemptively.</p>
          </div>

          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon"><Activity size={24} /></div>
              <h3>Predictive Congestion Forecasting</h3>
              <p>AI predicts traffic conditions before gridlock occurs.</p>
            </div>
            <div className="why-card">
              <div className="why-icon"><Zap size={24} /></div>
              <h3>Incident Impact Simulation</h3>
              <p>Simulate accidents, weather disruptions, rallies, and road closures.</p>
            </div>
            <div className="why-card">
              <div className="why-icon"><Layers size={24} /></div>
              <h3>Resource Optimization</h3>
              <p>Recommend manpower, barricades, and diversions.</p>
            </div>
            <div className="why-card">
              <div className="why-icon"><UserCheck size={24} /></div>
              <h3>Decision Intelligence</h3>
              <p>Provide actionable recommendations instead of raw data.</p>
            </div>
          </div>
        </section>

        {/* SECTION 3: HOW IT WORKS */}
        <section id="how-it-works" className="landing-section">
          <div className="section-header">
            <h2>Operational Pipeline</h2>
            <p>Astram intelligent congestion mitigation loop.</p>
          </div>

          <div className="how-timeline">
            {[
              { num: 1, title: 'Incident Detection', desc: 'Real-time alert feeds identify road incidents.' },
              { num: 2, title: 'AI Analysis', desc: 'Predictive engines analyze road conditions.' },
              { num: 3, title: 'Congestion Forecast', desc: 'Models project gridlock bottlenecks.' },
              { num: 4, title: 'Resource Allocation', desc: 'Automated allocation of police and barricades.' },
              { num: 5, title: 'Mitigation Execution', desc: 'Triggers diversion paths and signal overrides.' },
              { num: 6, title: 'Outcome Learning', desc: 'Updates models based on historical results.' }
            ].map((step, i) => (
              <div key={i} className="how-step">
                <div className="how-step-node">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: CAPABILITIES */}
        <section id="capabilities" className="landing-section landing-section-darker">
          <div className="section-header">
            <h2>Core Platform Capabilities</h2>
            <p>Equipped with advanced toolsets for modern traffic controllers.</p>
          </div>

          <div className="capabilities-grid">
            {[
              { icon: <Activity size={20} />, title: 'Live Monitoring', desc: 'Real-time city incident visibility.' },
              { icon: <Globe2 size={20} />, title: 'Hotspot Detection', desc: 'H3 geospatial clustering.' },
              { icon: <BarChart3 size={20} />, title: 'Predictive Analytics', desc: 'Future congestion forecasting.' },
              { icon: <CloudRain size={20} />, title: 'Weather Intelligence', desc: 'Weather-driven traffic risk prediction.' },
              { icon: <Layers size={20} />, title: 'Resource Planning', desc: 'Police and traffic resource allocation.' },
              { icon: <UserCheck size={20} />, title: 'Post Event Analytics', desc: 'Measure intervention success.' },
              { icon: <MessageSquare size={20} />, title: 'AI Copilot', desc: 'Natural language operational assistant.' },
              { icon: <Compass size={20} />, title: 'Emergency Planning', desc: 'Emergency corridor simulation.' }
            ].map((cap, i) => (
              <div key={i} className="capability-card">
                <div className="capability-icon" style={{ color: '#38bdf8', marginBottom: '16px' }}>{cap.icon}</div>
                <h3>{cap.title}</h3>
                <p>{cap.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: TECH STACK */}
        <section id="tech-stack" className="landing-section">
          <div className="section-header">
            <h2>ASTRAM Operations Technology Stack</h2>
            <p>Engineered using government-grade open source stack and geospatial engines.</p>
          </div>

          <div className="capabilities-grid">
            {[
              { icon: <Cpu size={20} />, title: 'Frontend', items: ['React', 'Vite', 'Framer Motion'] },
              { icon: <Server size={20} />, title: 'Backend', items: ['FastAPI', 'Python'] },
              { icon: <Database size={20} />, title: 'Data', items: ['SQLite', 'Pandas'] },
              { icon: <Network size={20} />, title: 'AI & ML', items: ['Gemini AI', 'Machine Learning', 'Predictive Analytics'] },
              { icon: <Globe2 size={20} />, title: 'Geospatial', items: ['H3 Geospatial', 'MapTiler', 'Geospatial Clustering'] },
              { icon: <Layers size={20} />, title: 'Infrastructure', items: ['Render Deployment', 'Vercel', 'GitHub CI/CD'] }
            ].map((tech, i) => (
              <div key={i} className="capability-card" style={{ border: '1px solid rgba(56, 189, 248, 0.15)' }}>
                <div className="capability-icon" style={{ color: '#2563eb', marginBottom: '16px' }}>{tech.icon}</div>
                <h3 style={{ marginBottom: '12px' }}>{tech.title}</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {tech.items.map((it, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={12} style={{ color: '#38bdf8' }} /> {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: FEATURES */}
        <section id="features" className="landing-section landing-section-darker">
          <div className="section-header">
            <h2>Detailed Operational Features</h2>
            <p>Every tool required to monitor and mitigate urban congestion.</p>
          </div>

          <div className="capabilities-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[
              'Live Incident Feed', 'Predictive Severity Scoring', 'Dynamic Diversion Planning', 'AI Copilot', 
              'Traffic Forecasting', 'Event Planning', 'Weather Risk Engine', 'Hotspot Detection', 
              'Operational Dashboard', 'Post Event Insights', 'Resource Optimization', 'Planned Event Management', 
              'Learning Analytics', 'Incident Outcome Tracking', 'Emergency Response Support', 'Government Decision Support'
            ].map((feat, i) => (
              <div key={i} className="capability-card" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '14px', fontWeight: 'bold' }}>
                  <Check size={16} />
                  <span>{feat}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 7: COMMAND CENTER PREVIEW */}
        <section id="preview" className="landing-section">
          <div className="section-header">
            <h2>Command Center Modules</h2>
            <p>Sleek design system preview of GridPulse control modules.</p>
          </div>

          <div className="preview-carousel-container">
            <div className="preview-tab-buttons">
              {['monitor', 'weather', 'analytics', 'planner', 'copilot', 'post-event'].map((tab) => (
                <button
                  key={tab}
                  className={`preview-tab-btn ${activePreviewTab === tab ? 'active' : ''}`}
                  onClick={() => setActivePreviewTab(tab)}
                >
                  {tab.replace('-', ' ').toUpperCase()}
                </button>
              ))}
            </div>

            <div className="preview-carousel-card">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePreviewTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="preview-mockup"
                >
                  {activePreviewTab === 'monitor' && (
                    <div>
                      <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={18} className="pulse-icon" /> Monitor Map Module
                      </h3>
                      <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
                        Interactive map display featuring live geospatial congestion density overlays, active detours, and priority accident clusters.
                      </p>
                      <div style={{ width: '100%', height: '180px', background: '#020617', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '25%', left: '35%', width: '10px', height: '10px', background: 'red', borderRadius: '50%', boxShadow: '0 0 8px red' }}></div>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>[ Map Module Mockup Ingested ]</span>
                      </div>
                    </div>
                  )}

                  {activePreviewTab === 'weather' && (
                    <div>
                      <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CloudRain size={18} /> Weather Desk
                      </h3>
                      <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
                        Correlates real-time weather codes and multiplier scales to recalculate regional delay coefficients automatically.
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        <div style={{ background: '#020617', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>TEMP</div>
                          <div style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff' }}>24°C</div>
                        </div>
                        <div style={{ background: '#020617', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>MULTIPLIER</div>
                          <div style={{ fontSize: '20px', fontWeight: '800', color: '#38bdf8' }}>1.25x</div>
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
                        Live graphs tracking peak congestion percentage, average incident containment time, and resource dispatch duration.
                      </p>
                      <div style={{ width: '100%', height: '140px', background: '#020617', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'flex-end', padding: '12px', gap: '8px' }}>
                        <div style={{ height: '30%', flex: 1, background: '#2563eb', borderRadius: '2px' }}></div>
                        <div style={{ height: '70%', flex: 1, background: '#38bdf8', borderRadius: '2px' }}></div>
                        <div style={{ height: '50%', flex: 1, background: '#2563eb', borderRadius: '2px' }}></div>
                      </div>
                    </div>
                  )}

                  {activePreviewTab === 'planner' && (
                    <div>
                      <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={18} /> Planner Desk
                      </h3>
                      <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
                        Pre-allocate signage, assign police units, and prepare detours for sports games, road work, or civic events.
                      </p>
                      <div style={{ background: '#020617', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ color: '#38bdf8', fontSize: '13px' }}>Stadium Marathon Event</div>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>Deploying 30 Traffic Officers</span>
                      </div>
                    </div>
                  )}

                  {activePreviewTab === 'copilot' && (
                    <div>
                      <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageSquare size={18} /> AI Copilot
                      </h3>
                      <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
                        Natural language interface querying real-time database vectors for immediate deployment logs.
                      </p>
                      <div style={{ background: '#020617', padding: '12px', borderRadius: '8px', color: '#10b981', fontStyle: 'italic', fontSize: '12px' }}>
                        "Astram model stands ready. Outer Ring Road bypass recommended."
                      </div>
                    </div>
                  )}

                  {activePreviewTab === 'post-event' && (
                    <div>
                      <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserCheck size={18} /> Post-Event Insights
                      </h3>
                      <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
                        Ingests telemetry logs post-incident to measure congestion reduction compliance and signal cycle efficiency.
                      </p>
                      <div style={{ background: '#020617', padding: '14px', borderRadius: '8px', fontSize: '12px', color: '#ffffff' }}>
                        <div>Compliance Rating: 94.2%</div>
                        <div style={{ color: '#64748b', fontSize: '10px' }}>Intervention efficiency improved by +6% vs baseline.</div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* SECTION 8: GOVERNMENT IMPACT */}
        <section id="impact" className="landing-section landing-section-darker">
          <div className="section-header">
            <h2>Government Impact Outcomes</h2>
            <p>Astram metropolitan operations report quantifiable, verifiable transport improvements.</p>
          </div>

          <div className="impact-grid">
            <div className="impact-card">
              <div className="impact-val"><AnimatedCounter value="26.4" suffix="%" /></div>
              <div className="impact-label">Travel Time Reduced</div>
            </div>
            <div className="impact-card">
              <div className="impact-val"><AnimatedCounter value="14.8" suffix="%" /></div>
              <div className="impact-label">Fuel Saved</div>
            </div>
            <div className="impact-card">
              <div className="impact-val"><AnimatedCounter value="19.2" suffix="%" /></div>
              <div className="impact-label">CO₂ Reduced</div>
            </div>
            <div className="impact-card">
              <div className="impact-val"><AnimatedCounter value="32.5" suffix="%" /></div>
              <div className="impact-label">Emergency Response Improved</div>
            </div>
            <div className="impact-card">
              <div className="impact-val"><AnimatedCounter value="21.1" suffix="%" /></div>
              <div className="impact-label">Congestion Reduced</div>
            </div>
          </div>
        </section>

        {/* SECTION 9: AI COPILOT INTERACTIVE DEMO */}
        <section id="copilot" className="landing-section">
          <div className="section-header">
            <h2>AI Copilot Command Interface</h2>
            <p>Simulated natural language operations assistant interface.</p>
          </div>

          <div className="copilot-demo-chat">
            {copilotConversation.map((msg, i) => {
              const isVisible = copilotStep > i;
              return (
                <AnimatePresence key={i}>
                  {isVisible && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
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

        {/* SECTION 10: FOOTER */}
        <footer id="footer" className="landing-footer">
          <div className="footer-grid">
            <div className="footer-about">
              <h3>GridPulse</h3>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Astram Congestion Mitigator</p>
              <p style={{ marginTop: '12px' }}>
                Integrated Command & Control (ICCC) dashboard system built for city municipal planners. Providing live detour overlays, emergency corridor signaling overrides, and post-event analytics ingestion.
              </p>
              <p style={{ marginTop: '20px', color: '#64748b', fontSize: '13px' }}>
                <Mail size={14} style={{ display: 'inline', marginRight: '6px' }} /> support@gridpulse.gov<br />
                <Phone size={14} style={{ display: 'inline', marginRight: '6px', marginTop: '6px' }} /> +91 (80) 2225 1111
              </p>
            </div>

            <div className="footer-links">
              <h4>Quick Links</h4>
              <ul>
                <li><button onClick={() => scrollToSection('hero')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', marginBottom: '8px' }}>Hero</button></li>
                <li><button onClick={() => scrollToSection('why-gridpulse')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', marginBottom: '8px' }}>Why GridPulse</button></li>
                <li><button onClick={() => scrollToSection('how-it-works')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', marginBottom: '8px' }}>How It Works</button></li>
                <li><button onClick={() => scrollToSection('capabilities')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', marginBottom: '8px' }}>Capabilities</button></li>
                <li><button onClick={() => scrollToSection('tech-stack')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', marginBottom: '8px' }}>Technology Stack</button></li>
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
                <h4>Issue Reporting Form</h4>
                <form onSubmit={handleIssueSubmit} className="footer-form-box">
                  <select value={issueType} onChange={(e) => setIssueType(e.target.value)}>
                    <option value="bug">System Bug</option>
                    <option value="data">Data Inaccuracy</option>
                    <option value="ui">UI/UX Defect</option>
                    <option value="other">General Inquiry</option>
                  </select>
                  <textarea 
                    placeholder="Description of the issue..." 
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
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Github size={14} /> GitHub
              </a>
              <a href="#team">Team</a>
              <a href="mailto:support@gridpulse.gov">Contact Support</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
