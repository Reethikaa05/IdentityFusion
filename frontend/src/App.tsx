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
      <div className="space-bg" />

      <main className="container">
        <div className="sub-heading">Identity Reconciliation</div>
        <h1 className="heading">Unified<br />Customer Graph.</h1>
        <p className="text-dim max-w-lg mb-12">
          A high-performance engine to resolve fragmented customer data into a single, deterministic source of truth.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left: Control Panel */}
          <div className="space-y-8">
            <div className="card p-8 bg-zinc-950/50">
              <div className="flex items-center gap-2 mb-8 font-bold">
                <Database size={18} />
                Input Node
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    <Mail size={12} /> Email
                  </div>
                  <input
                    type="email"
                    className="input-box"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    <Phone size={12} /> Phone
                  </div>
                  <input
                    type="text"
                    className="input-box"
                    placeholder="1234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-black flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? <RefreshCcw className="animate-spin" size={20} /> : 'Process Identity'}
                  {!loading && <ArrowRight size={20} />}
                </button>

                {result && (
                  <button
                    type="button"
                    onClick={reset}
                    className="text-xs text-zinc-500 hover:text-white w-full text-center mt-4 transition-colors font-bold uppercase tracking-widest"
                  >
                    Clear Results
                  </button>
                )}
              </form>
            </div>

            {/* Console Log Tool (Helps verify backend) */}
            <div className="card">
              <div className="p-4 flex items-center gap-2 border-b border-white/10 bg-black/40 text-xs font-bold uppercase tracking-widest">
                <Terminal size={14} /> Console Output
              </div>
              <div ref={consoleRef} className="console flex flex-col gap-1">
                {logs.map((log, i) => (
                  <div key={i}>
                    <span className="text-zinc-600">{log.substring(0, 10)}</span>
                    <span className={log.includes('SUCCESS') ? 'console-green' : log.includes('INIT') ? 'console-blue' : ''}>
                      {log.substring(10)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Visualization */}
          <div>
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 border border-red-900/50 bg-red-950/20 text-red-400 rounded-xl"
                >
                  <div className="font-bold mb-1">Execution Failed</div>
                  <div className="text-sm opacity-80">{error}</div>
                </motion.div>
              )}

              {!result && !loading && !error && (
                <div className="h-full rounded-2xl border border-dashed border-white/5 flex flex-col items-center justify-center p-12 text-center opacity-30">
                  <Cpu size={48} className="mb-6" />
                  <div className="font-bold">Awaiting Scan</div>
                  <div className="text-sm">Connect a node to visualize the identity graph.</div>
                </div>
              )}

              {loading && (
                <div className="h-full rounded-2xl bg-zinc-950/30 border border-white/5 flex flex-col items-center justify-center p-12">
                  <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mb-6" />
                  <div className="font-bold tracking-widest uppercase text-xs">Mapping_Relational_Nodes</div>
                </div>
              )}

              {result && !loading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card p-8 bg-white/5"
                >
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Primary Identifier</div>
                      <div className="text-3xl font-black">ROOT_{result.contact.primaryContatctId}</div>
                    </div>
                    <CheckCircle className="text-emerald-500" size={32} />
                  </div>

                  <div className="result-group">
                    <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                      Resolved Emails
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.contact.emails.map((e, idx) => (
                        <div key={e} className={`tag ${idx === 0 ? 'tag-primary' : ''} `}>
                          {e} {idx === 0 && ' (PR)'}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="result-group">
                    <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                      Linked Phones
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.contact.phoneNumbers.map((p, idx) => (
                        <div key={p} className={`tag ${idx === 0 ? 'tag-primary' : ''} `}>
                          {p} {idx === 0 && ' (PR)'}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="result-group">
                    <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                      Linked Nodes
                    </div>
                    {result.contact.secondaryContactIds.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {result.contact.secondaryContactIds.map(id => (
                          <div key={id} className="tag mono">REF_{id}</div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-zinc-600 italic">No secondary links found.</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="container py-12 border-t border-white/5 flex justify-between items-center opacity-40">
        <div className="text-xs font-bold uppercase tracking-widest">Flux.Graph Protocol</div>
        <div className="flex gap-6 text-xs font-bold uppercase tracking-widest">
          <span>Status: 1.21GW</span>
          <span>Latency: {result ? '42ms' : '--'}</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
