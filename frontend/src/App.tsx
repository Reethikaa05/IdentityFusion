import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Mail,
  Phone,
  ArrowRight,
  Database,
  Terminal,
  CheckCircle,
  Cpu,
  RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContactResponse {
  contact: {
    primaryContatctId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
  };
}

const App: React.FC = () => {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContactResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>(['[SYSTEM] Initialized Identity.OS', '[SYSTEM] Awaiting input nodes...']);

  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !phoneNumber) {
      setError('Missing Identifier');
      addLog('ERR: Scan failed - No identifiers provided.');
      return;
    }

    setLoading(true);
    setError(null);
    addLog(`INIT: Identifying { email: "${email}", phone: "${phoneNumber}" } `);

    try {
      // PRO TIP: This automatically switches between your live Render backend and your local test backend
      const API_BASE = window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : 'https://identityfusion.onrender.com';

      const response = await axios.post(`${API_BASE}/identify`, {
        email: email || undefined,
        phoneNumber: phoneNumber || undefined,
      });

      addLog(`SUCCESS: Response received from backend.`);
      setResult(response.data);
      addLog(`DATA: Primary ID found -> ${response.data.contact.primaryContatctId}`);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Server Offline';
      setError(msg);
      addLog(`FATAL: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setEmail('');
    setPhoneNumber('');
    addLog('[SYSTEM] Console Cleared.');
  };

  return (
    <div className="min-h-screen">
      <div className="mesh-bg-light" />

      <main className="container">
        <div className="header-badge">
          <Database size={14} /> Identity Recon Engine
        </div>

        <h1 className="hero-title">Certified<br />Influence Platform.</h1>
        <p style={{ color: '#71717a', fontSize: '1.25rem', maxWidth: '600px', marginBottom: '4rem', fontWeight: 500 }}>
          Resolve fragmented customer touchpoints into a single, highly-deterministic source of truth.
        </p>

        <div className="bento-grid">
          {/* Left: Input Bento */}
          <div>
            <div className="bento-card">
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>Connect Nodes</h3>

              <form onSubmit={handleSubmit}>
                <div className="bento-input-group">
                  <input
                    type="email"
                    className="bento-input"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail className="input-icon" size={20} />
                </div>

                <div className="bento-input-group">
                  <input
                    type="text"
                    className="bento-input"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <Phone className="input-icon" size={20} />
                </div>

                <button
                  type="submit"
                  className="bento-btn"
                  disabled={loading}
                >
                  {loading ? <RefreshCcw className="animate-spin" size={24} /> : 'Reconcile Identity Graph'}
                  {!loading && <ArrowRight size={24} />}
                </button>
              </form>

              {result && (
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={reset}
                    style={{ background: 'none', border: 'none', color: '#a1a1aa', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Reset Connection
                  </button>
                </div>
              )}
            </div>

            {/* Seamless Console */}
            <div className="bento-console" ref={consoleRef}>
              <div style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#18181b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Terminal size={14} /> System Trace
              </div>
              {logs.map((log, i) => {
                let logClass = "log-entry text";
                if (log.includes("SUCCESS")) logClass = "log-entry log-success";
                else if (log.includes("INIT")) logClass = "log-entry log-init";
                else if (log.includes("ERR") || log.includes("FATAL")) logClass = "log-entry log-err";

                return (
                  <div key={i} className={logClass}>
                    <span className="log-time">{log.substring(0, 10)}</span>
                    {log.substring(10)}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right: Visualization Bento */}
          <div>
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bento-card"
                  style={{ background: '#fef2f2', borderColor: '#fca5a5' }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: '#ef4444' }}>
                    <AlertCircle size={32} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>Exception Raised</div>
                      <div style={{ fontWeight: 500 }}>{error}</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {!result && !loading && !error && (
                <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <Cpu size={40} color="#a1a1aa" />
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181b' }}>System Standby</div>
                  <div style={{ color: '#71717a', fontWeight: 500 }}>Waiting for node ingestion...</div>
                </div>
              )}

              {loading && (
                <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px' }}>
                  <div style={{ width: '60px', height: '60px', border: '4px solid #f4f4f5', borderTopColor: '#18181b', borderRadius: '50%', marginBottom: '1.5rem' }} className="animate-spin" />
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#18181b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Computing Graph</div>
                </div>
              )}

              {result && !loading && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bento-card"
                >
                  {/* Metric Box Header */}
                  <div className="metric-box">
                    <div className="metric-icon-wrap">
                      <CheckCircle size={32} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unified Primary ID</div>
                      <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#18181b', lineHeight: 1 }}>{result.contact.primaryContatctId}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#18181b', marginBottom: '0.5rem' }}>Validated Core Emails</h4>
                    <div className="pill-container">
                      {result.contact.emails.map((e, idx) => (
                        <div key={e} className={`data-pill ${idx === 0 ? 'primary' : ''}`}>
                          {e} {idx === 0 && <span className="pill-badge">Primary Node</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#18181b', marginBottom: '0.5rem' }}>Verified Contact Numbers</h4>
                    <div className="pill-container">
                      {result.contact.phoneNumbers.map((p, idx) => (
                        <div key={p} className={`data-pill ${idx === 0 ? 'primary' : ''}`}>
                          {p} {idx === 0 && <span className="pill-badge">Primary Node</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '1.5rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#18181b', marginBottom: '0.5rem' }}>Secondary References</h4>
                    {result.contact.secondaryContactIds.length > 0 ? (
                      <div className="pill-container">
                        {result.contact.secondaryContactIds.map(id => (
                          <div key={id} className="data-pill" style={{ fontFamily: 'monospace' }}>
                            REF:{id}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: '#a1a1aa', fontStyle: 'italic', fontWeight: 500 }}>No linked nodes detected.</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
