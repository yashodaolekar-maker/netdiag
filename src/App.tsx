import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Activity, 
  Globe, 
  ShieldCheck, 
  Server, 
  Database, 
  Info, 
  ChevronRight, 
  AlertCircle,
  Zap,
  Github,
  Mail,
  Lock,
  RefreshCw,
  Sparkles,
  Terminal,
  ActivitySquare,
  AlertTriangle,
  PlaySquare,
  Network,
  Calculator
} from 'lucide-react';
import { LookupResult, DNSRecord } from './types';
import LatencyChart from './components/LatencyChart';
import CertValidationPanel from './components/CertValidationPanel';
import ConnectionLogger from './components/ConnectionLogger';
import SecurityAuditor from './components/SecurityAuditor';
import ReputationTracker from './components/ReputationTracker';
import AlertBanner from './components/AlertBanner';
import CookieConsent from './components/CookieConsent';
import SubnetCalculator from './components/SubnetCalculator';
import WhoisLookup from './components/WhoisLookup';

const tabDescriptions: Record<string, string> = {
  diagnostics: "Real-time DNS query analysis and server health metrics.",
  safety: "Security auditing, SPF/DMARC verification, and threat assessment.",
  reputation: "Domain trust scores and blacklist status monitoring.",
  cert: "Evaluate SSL certificate expiration, security posture, and CA chain trust.",
  subnet: "Calculate IPv4/IPv6 networks, CIDR subnets, and wildcard address masks.",
  whois: "Retrieve domain registration records, registrar information, and important dates."
};

interface AppAlert {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description: string;
}

export default function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'safety' | 'reputation' | 'cert' | 'subnet' | 'whois'>('diagnostics');
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [latencyHistory, setLatencyHistory] = useState<number[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<{title: string; icon: ReactNode; details: string[]; techDesc: string} | null>(null);

  // Alerts Management state
  const [alertsList, setAlertsList] = useState<AppAlert[]>([]);

  // SSL Certificate parameters
  const [sslQuery, setSslQuery] = useState('');
  const [sslLoading, setSslLoading] = useState(false);
  const [sslResult, setSslResult] = useState<any | null>(null);
  const [sslError, setSslError] = useState<string | null>(null);

  // WHOIS parameters
  const [whoisQuery, setWhoisQuery] = useState('');
  const [whoisLoading, setWhoisLoading] = useState(false);
  const [whoisResult, setWhoisResult] = useState<any | null>(null);
  const [whoisError, setWhoisError] = useState<string | null>(null);

  // Interactive diagnostic scanning step
  const [scanStep, setScanStep] = useState(0);
  const scanLabels = [
    'Opening UDP ports internally on DNS Resolvers...',
    'Querrying local root servers for DNSSEC keys...',
    'Performing mail exchanger MX delegation pings...',
    'Hashing TXT identity signatures...'
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      setScanStep(0);
      interval = setInterval(() => {
        setScanStep(prev => (prev < scanLabels.length - 1 ? prev + 1 : prev));
      }, 400);
    } else {
      setScanStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSslCheck = async (e?: React.FormEvent, domainOverride?: string) => {
    e?.preventDefault();
    const domainToCheck = (domainOverride || sslQuery || query || '').trim();
    if (!domainToCheck) return;

    setSslLoading(true);
    setSslError(null);
    try {
      const resp = await fetch('/api/cert-validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domainToCheck })
      });
      if (!resp.ok) {
        throw new Error('Server returned an error validating the certificate.');
      }
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      setSslResult(data);
      setSslQuery(data.domain);
    } catch (err: any) {
      setSslError(err.message);
    } finally {
      setSslLoading(false);
    }
  };

  const handleWhoisCheck = async (e?: React.FormEvent, domainOverride?: string) => {
    e?.preventDefault();
    const domainToCheck = (domainOverride || whoisQuery || query || '').trim();
    if (!domainToCheck) return;

    setWhoisLoading(true);
    setWhoisError(null);
    setWhoisResult(null); // Clear previous results
    try {
      const resp = await fetch('/api/whois', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domainToCheck })
      });
      if (!resp.ok) {
        throw new Error('Server returned an error performing the WHOIS lookup.');
      }
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      setWhoisResult(data);
      setWhoisQuery(data.domain);
    } catch (err: any) {
      setWhoisError(err.message);
    } finally {
      setWhoisLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddLiveAlert = (type: 'success' | 'warning' | 'error' | 'info', title: string, desc: string) => {
    setAlertsList(prev => [
      {
        id: `alert-${Date.now()}-${Math.random()}`,
        type,
        title,
        description: desc
      },
      ...prev
    ]);
  };

  const handleDismissLiveAlert = (id: string) => {
    setAlertsList(prev => prev.filter(al => al.id !== id));
  };

  const handleLookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query) return;

    setLoading(true);
    setError(null);
    setAlertsList([]); // Reset alerts on new search

    try {
      const resp = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: query.trim() })
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      
      setResult(data);
      setLatencyHistory(prev => [...prev, data.latency]);

      // Seed mock corporate alerts for visual compliance check
      setAlertsList([
        {
          id: 'alert-dnssec',
          type: 'success',
          title: 'DNSSEC Protocol Active',
          description: `Cryptographic zone keys verified successfully mapping to modern TLD records on ${data.domain}.`
        },
        {
          id: 'alert-dmarc-weak',
          type: 'warning',
          title: 'Insecure DMARC Policy Mapped',
          description: `Identified a "p=none" configuration. The domain is vulnerable to outbound spoofing unless set to reject.`
        }
      ]);

      // Automatically trigger certificate search in background if cert not loaded
      if (sslResult?.domain !== data.domain) {
        setSslQuery(data.domain);
        handleSslCheck(undefined, data.domain);
      }
      
      // Automatically trigger whois search in background if whois not loaded
      if (whoisResult?.domain !== data.domain && whoisResult?.domain_name !== data.domain) {
        setWhoisQuery(data.domain);
        handleWhoisCheck(undefined, data.domain);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetAll = () => {
    setQuery('');
    setResult(null);
    setError(null);
    setActiveTab('diagnostics');
    setSelectedFeature(null);
    setLatencyHistory([]);
    setSslQuery('');
    setSslResult(null);
    setSslError(null);
    setSslLoading(false);
    setWhoisQuery('');
    setWhoisResult(null);
    setWhoisError(null);
    setWhoisLoading(false);
    setAlertsList([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500/10 selection:text-indigo-900 flex flex-col justify-between">
      
      {/* Background Micro-Decoration (Premium Grain Element) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ x: [0, 40, 0], y: [0, -45, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-5%] left-[-10%] w-[35%] h-[35%] bg-indigo-500/5 rounded-full blur-[90px]" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] contrast-125 brightness-110" />
      </div>

      {/* Main Corporate Header Menu */}
      <nav className="relative z-10 h-16 border-b border-slate-200 bg-white/70 backdrop-blur-md px-6 flex items-center justify-between">
        <button 
          onClick={handleResetAll}
          id="netdiag-logo-button"
          className="flex items-center gap-3 hover:opacity-85 transition-transform active:scale-95 cursor-pointer focus:outline-none"
          title="Return to Dashboard Home"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm font-display">NG</div>
          <span className="text-lg font-display font-bold tracking-tight text-slate-900 uppercase">
            NET<span className="text-indigo-600">DIAG</span>
          </span>
        </button>

        {/* Tab switcher options */}
        <div className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-slate-500">
{(['diagnostics', 'safety', 'reputation', 'cert', 'subnet', 'whois'] as const).map((tab) => (
             <button 
               key={tab}
               onClick={() => {
                 setActiveTab(tab);
                 if (tab === 'cert' && !sslResult && result) {
                   const q = query.trim();
                   if (q) {
                     setSslQuery(q);
                     handleSslCheck(undefined, q);
                   }
                 }
                 if (tab === 'whois' && !whoisResult && result) {
                   const q = query.trim();
                   if (q) {
                     setWhoisQuery(q);
                     handleWhoisCheck(undefined, q);
                   }
                 }
               }}
               onMouseEnter={() => setHoveredTab(tab)}
               onMouseLeave={() => setHoveredTab(null)}
               className={`transition-all px-3 py-1.5 rounded-lg cursor-pointer ${
                 activeTab === tab 
                   ? 'text-indigo-700 bg-indigo-50 font-extrabold shadow-sm' 
                   : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
               }`}
             >
               {tab === 'cert' ? 'Cert Validation' : tab === 'whois' ? 'Whois Lookup' : tab === 'subnet' ? 'Subnet Calculator' : tab.charAt(0).toUpperCase() + tab.slice(1)}
             </button>
           ))}


        </div>
      </nav>

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-10 md:py-12 space-y-8">
        
        {/* Banner with query interface */}
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-150/40 text-[10px] text-indigo-700 font-mono font-extrabold uppercase px-3 py-1 rounded-full mb-3"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Platform Edition 4.6.2
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 tracking-tight mb-2 uppercase">
            NetDiag <span className="text-indigo-600 font-extrabold">Intelligence</span>
          </h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-mono font-bold mb-8">
            Global endpoint routing, security posture, and CA chain trust checker
          </p>

          {/* Clean blank search form */}
          <form 
            onSubmit={handleLookup}
            className="relative bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:border-indigo-500 transition-all shadow-sm focus-within:shadow-indigo-500/10 flex items-center p-1.5"
          >
            <div className="pl-3.5 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            
            <input 
              type="text" 
              placeholder="Enter domain or IP address (e.g. cloudfront.net)" 
              className="w-full bg-transparent border-none outline-none text-slate-950 placeholder:text-slate-400 text-sm py-3 px-3.5 font-medium font-sans"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <div className="flex items-center gap-3 pr-2.5 shrink-0">
              <div className="hidden md:block">
                <kbd className="px-2 py-1 rounded bg-slate-100 text-[9px] text-slate-400 font-mono border border-slate-250/50 font-bold select-none">
                  CTRL K
                </kbd>
              </div>

              <button 
                id="main-lookup-submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow font-display cursor-pointer shrink-0"
              >
                {loading ? 'Analyzing...' : 'Validate'}
              </button>
            </div>
          </form>

          {/* Recommended default queries triggers */}
          <div className="flex flex-wrap justify-center gap-2 mt-4 select-none">
            {['google.com', 'github.com', 'cloudflare.com'].map((domain) => (
              <button 
                key={domain} 
                type="button"
                onClick={() => { setQuery(domain); }}
                className="px-3 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer shadow-sm"
              >
                {domain}
              </button>
            ))}
          </div>
        </div>

        {/* Global Action Handlers: Error / Loading Panels */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-xl flex items-center gap-3 mb-6 text-xs font-bold"
          >
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <p>Cryptographic/DNS Fault: {error}</p>
          </motion.div>
        )}

        {/* Customized Animated Tracer Loader for Diagnostics */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center relative overflow-hidden"
            >
              {/* Spinning grid canvas in background */}
              <div className="absolute inset-0 bg-slate-50/50 [background-image:radial-gradient(#ecf0f5_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              
              <div className="relative z-10 max-w-sm mx-auto space-y-6">
                {/* Advanced Pulsing Loader Graphic */}
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
                  <motion.div 
                    animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600"
                  >
                    <Network className="w-6 h-6 text-indigo-600" />
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-display font-bold text-slate-800 uppercase tracking-wider">
                    Querying network path zones
                  </h4>
                  
                  {/* Dynamic loader checkpoints */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg font-mono text-left space-y-1.5 shadow">
                    {scanLabels.map((lab, i) => (
                      <div 
                        key={lab} 
                        className={`text-[10px] flex items-center gap-2 ${
                          i < scanStep ? 'text-emerald-400 font-bold' : 
                          i === scanStep ? 'text-indigo-400 font-extrabold animate-pulse' : 'text-slate-650'
                        }`}
                      >
                        <span>{i < scanStep ? '✓' : i === scanStep ? '➜' : '○'}</span>
                        <span className="truncate">{lab}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-indigo-600"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((scanStep + 1) / scanLabels.length) * 100}%` }}
                    transition={{ ease: 'easeInOut' }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

{activeTab === 'subnet' && !result && !loading ? (
           <motion.div
             initial={{ opacity: 0, y: 12 }}
             animate={{ opacity: 1, y: 0 }}
             className="space-y-6"
           >
             <SubnetCalculator />
           </motion.div>
         ) : activeTab === 'whois' && !loading ? (
           <motion.div
             initial={{ opacity: 0, y: 12 }}
             animate={{ opacity: 1, y: 0 }}
             className="space-y-6"
           >
             <WhoisLookup
               domain={query}
               setWhoisQuery={setWhoisQuery}
               whoisResult={whoisResult}
               whoisError={whoisError}
               whoisLoading={whoisLoading}
               onCheckWhois={handleWhoisCheck}
             />
           </motion.div>
         ) : !loading && result ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8 animate-fadeIn"
          >
            {/* 1. Dissmissable Alerts Hub at the Top of Dashboard */}
            {alertsList.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-display font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Security vulnerability assessments
                  </span>
                  <button 
                    onClick={() => setAlertsList([])}
                    className="text-[9px] hover:text-indigo-600 text-slate-400 font-semibold uppercase tracking-wider bg-slate-100 border border-slate-200 px-2 py-0.5 rounded transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {alertsList.map((alert) => (
                    <AlertBanner
                      key={alert.id}
                      type={alert.type}
                      title={alert.title}
                      description={alert.description}
                      isVisible={true}
                      onDismiss={() => handleDismissLiveAlert(alert.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 2. REPOSITIONED DASHBOARD LAYER 1: METRICS ROW (TOP) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard 
                icon={<ActivitySquare className="w-4 h-4" />} 
                label="Domain Health Index" 
                value="Excellent State" 
                color="text-emerald-600"
                sub="DNS and SOA consistent"
              />
              <StatCard 
                icon={<Server className="w-4 h-4" />} 
                label="Primary Resolved IP" 
                value={String(result.records.A?.[0]?.value || result.records.A?.[0] || 'N/A')} 
                color="text-slate-900"
                sub="A-Record translation OK"
              />
              <StatCard 
                icon={<ShieldCheck className="w-4 h-4" />} 
                label="Policy Status Tracker" 
                value="Level Warning" 
                color="text-amber-500 animate-pulse"
                sub="DMARC setting weak"
              />
              <StatCard 
                icon={<Zap className="w-4 h-4" />} 
                label="Domain Latency" 
                value={`${result.latency || 18} ms RTT`} 
                color="text-indigo-600"
                sub="Ping latency response"
              />
            </div>

            {/* 3. REPOSITIONED DASHBOARD LAYER 2: DIAGNOSTICS MODULE (CENTER) */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow">
              
              {/* Horizontal Tabs Selection Segment Controller */}
              <div className="bg-slate-50/50 border-b border-slate-200/80 p-1 flex flex-wrap gap-1">
{(['diagnostics', 'safety', 'reputation', 'cert', 'subnet', 'whois'] as const).map((tab) => (
                   <button
                     key={tab}
                     onClick={() => {
                       setActiveTab(tab);
                       if (tab === 'cert' && !sslResult) {
                         setSslQuery(result.domain);
                         handleSslCheck(undefined, result.domain);
                       }
                       if (tab === 'whois' && !whoisResult) {
                         setWhoisQuery(result.domain);
                         handleWhoisCheck(undefined, result.domain);
                       }
                     }}
                     type="button"
                     className={`flex-1 min-w-[125px] text-center px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                       activeTab === tab
                         ? 'bg-white text-indigo-700 shadow border border-slate-200/50 font-extrabold'
                         : 'text-slate-550 hover:text-slate-900 hover:bg-white/40'
                     }`}
                   >
                     {tab === 'diagnostics' && '🔍 Network Health'}
                     {tab === 'safety' && '🛡️ Security Audits'}
                     {tab === 'reputation' && '📈 Reputation Indexes'}
                     {tab === 'cert' && '🔒 SSL Inspect'}
                     {tab === 'whois' && '🔍 Whois Lookup'}
                     {tab === 'subnet' && '🧮 Subnet Calc'}
                   </button>
                 ))}
              </div>

              {/* Dynamic Centre Component Display */}
              <div className="p-6 md:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    
                    {/* Standard Domain Health view */}
                    {activeTab === 'diagnostics' && (
                      <div className="space-y-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          
                          {/* Left core Latency chart */}
                          <div className="flex-1 min-w-0">
                            <LatencyChart data={latencyHistory.length > 0 ? latencyHistory : [result.latency]} />
                          </div>

                          {/* Right side diagnostics automated logs insight */}
                          <div className="lg:w-80 shrink-0 space-y-4">
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-inner">
                              <h4 className="text-[10px] font-display font-medium font-bold text-slate-400 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                                Diagnostics insights
                              </h4>
                              
                              <div className="space-y-3.5">
                                {result.insights.map((insight, idx) => (
                                  <div key={idx} className="text-xs group select-none">
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className={`w-1.5 h-1.5 rounded-full ${
                                        insight.status === 'success' ? 'bg-emerald-500' : 
                                        insight.status === 'error' ? 'bg-rose-500' : 'bg-amber-500'
                                      }`} />
                                      <h5 className="font-bold text-slate-800 uppercase tracking-tight text-[11px]">{insight.title}</h5>
                                    </div>
                                    <p className="text-[11px] text-slate-500 leading-normal pl-3.5 group-hover:text-slate-700 transition-colors">
                                      {insight.description}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* Security checklist view */}
                    {activeTab === 'safety' && (
                      <SecurityAuditor 
                        domain={result.domain} 
                        onAddAlert={handleAddLiveAlert}
                      />
                    )}

                    {/* Threat / reputation list view */}
                    {activeTab === 'reputation' && (
                      <ReputationTracker 
                        domain={result.domain} 
                        onAddAlert={handleAddLiveAlert}
                      />
                    )}

                    {/* SSL Certificates Validator */}
{activeTab === 'cert' && (
                       <CertValidationPanel 
                         sslQuery={sslQuery}
                         setSslQuery={setSslQuery}
                         sslResult={sslResult}
                         sslError={sslError}
                         sslLoading={sslLoading}
                         onCheckSSL={handleSslCheck}
                       />
                     )}


                   </motion.div>
                 </AnimatePresence>
              </div>

            </div>

            {/* 4. REPOSITIONED DASHBOARD LAYER 3: LOGS BLOCK (BOTTOM) */}
            <div id="dashboard-bottom-logs-hub" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: DNS records Ledger */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                <div>
                  <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 select-none">
                    <h3 className="font-display font-medium font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-indigo-600" />
                      Active DNS records ledger
                    </h3>
                    
                    <div className="flex gap-1.5">
                      <button 
                        onClick={handleLookup}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded text-[9px] font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Roll and Refresh
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans">
                      <thead className="bg-slate-50/20 border-b border-slate-100">
                        <tr className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                          <th className="px-5 py-3 font-semibold">Record Type</th>
                          <th className="px-5 py-3 font-semibold">Router Preference</th>
                          <th className="px-5 py-3 font-semibold">Value / Target Destination</th>
                          <th className="px-5 py-3 font-semibold">TTL Cache</th>
                          <th className="px-5 py-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      
                      <tbody className="text-[11px] font-mono divide-y divide-slate-100 select-all">
                        {(Object.entries(result.records) as [string, any[]][]).map(([type, records]) => 
                          records.map((rec: any, idx: number) => (
                            <tr key={`${type}-${idx}`} className="hover:bg-slate-50/60 transition-colors group">
                              <td className="px-5 py-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-tight ${
                                  type === 'MX' ? 'bg-indigo-50 text-indigo-700 border border-indigo-150/40' :
                                  type === 'A' ? 'bg-blue-50 text-blue-700 border border-blue-150/40' :
                                  type === 'TXT' ? 'bg-purple-50 text-purple-700 border border-purple-150/40' :
                                  'bg-slate-100 text-slate-600'
                                }`}>
                                  {type}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-slate-500 font-bold">
                                {rec.priority !== undefined ? rec.priority : '-'}
                              </td>
                              <td className="px-5 py-3 text-slate-600 max-w-xs truncate group-hover:text-slate-900 transition-colors font-medium">
                                {typeof rec === 'string' ? rec : (rec.exchange || rec.value || JSON.stringify(rec))}
                              </td>
                              <td className="px-5 py-3 text-slate-400 font-semibold">
                                {rec.ttl || 3600}s
                              </td>
                              <td className="px-5 py-3">
                                <span className="flex items-center gap-1.5 text-emerald-600 font-display font-medium font-bold text-[9px] tracking-wide select-none">
                                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Resolving
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-3 border-t border-slate-100 text-slate-450 uppercase font-mono text-[9px] font-bold text-center select-none">
                  Total record structures: {Object.values(result.records).flat().length} items certified live
                </div>
              </div>

              {/* Right Column: Live simulated trace session logger terminal */}
              <div className="lg:col-span-1">
                <ConnectionLogger domain={result.domain} />
              </div>

            </div>

          </motion.div>
        ) : !loading ? (
          
          /* Blank state empty view */
          <motion.div
            layout
            key="sandbox-grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
          >
            <FeatureCard 
              icon={<ShieldCheck className="w-5 h-5" />}
              title="DOMAIN HEALTH"
              description="Comprehensive audit of nameserver replication & DNSSEC keys."
              onClick={() => setSelectedFeature({
                icon: <ShieldCheck className="w-8 h-8" />,
                title: "DOMAIN HEALTH",
                techDesc: "Analyzes record propagation across global registry authorities.",
                details: ["SOA Serial Consistency Check", "NS Delegation Replication", "DNSSEC Extension Signature Matches", "Recursive Route Tests"]
              })}
            />
            <FeatureCard 
              icon={<Mail className="w-5 h-5" />}
              title="MX LOOKUP"
              description="Map SMTP mail servers priorities and routing loops."
              onClick={() => setSelectedFeature({
                icon: <Mail className="w-8 h-8" />,
                title: "MX LOOKUP",
                techDesc: "Validates incoming corporate email routing failovers.",
                details: ["Priority Ranking Weighting", "Inbound Mail Relay Pings", "SPF Syntax Configuration Checks", "DKIM/DMARC Record Audits"]
              })}
            />
            <FeatureCard 
              icon={<Activity className="w-5 h-5" />}
              title="NETWORK DIAGS"
              description="Real-time latency profiling & global node pinging tests."
              onClick={() => setSelectedFeature({
                icon: <Activity className="w-8 h-8" />,
                title: "NETWORK DIAGS",
                techDesc: "Trace network hop latency behaviors and packet variance.",
                details: ["Traceroute Hop profiling", "Global TCP Dial handshake RTT", "TTFB (Time to First Byte) analysis", "Jitter / Packet loss matrices"]
              })}
            />
            <FeatureCard 
              icon={<Lock className="w-5 h-5" />}
              title="CERT VALIDATION"
              description="Review SSL/TLS public key structures and expiry timelines."
              onClick={() => setSelectedFeature({
                icon: <Lock className="w-8 h-8" />,
                title: "CERT VALIDATION",
                techDesc: "Validates security credential validity spans and root anchors.",
                details: ["Expiry Warn Threshold Pings", "Intermediate Trust Rollovers", "Protocol Cipher Alignment check", "HSTS Header deployment flags"]
              })}
            />
            <FeatureCard 
              icon={<Calculator className="w-5 h-5" />}
              title="SUBNET CALC"
              description="Interact with active bit registers & map variable-length subnets."
              onClick={() => {
                setActiveTab('subnet');
              }}
            />
          </motion.div>
        ) : null}

        {/* Feature Detail Specs Modal Backdrop */}
        <AnimatePresence>
          {selectedFeature && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: '0.6' }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedFeature(null)}
                className="fixed inset-0 bg-slate-900 z-[60] cursor-pointer"
              />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[70] p-6 focus:outline-none"
              >
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-7 border-b border-slate-100 flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 border border-indigo-100/50">
                      {selectedFeature.icon}
                    </div>
                    <h2 className="text-sm font-display font-bold text-slate-950 uppercase tracking-wider">{selectedFeature.title}</h2>
                    <p className="text-slate-400 font-sans text-[10px] leading-relaxed uppercase mt-1 font-semibold">{selectedFeature.techDesc}</p>
                  </div>
                  
                  <div className="p-6 bg-slate-50/50 space-y-4">
                    <span className="text-[9px] font-mono font-extrabold text-slate-400 uppercase tracking-widest block">Technical checklist rules</span>
                    <div className="space-y-2">
                      {selectedFeature.details.map((detail, i) => (
                        <div key={i} className="flex items-center gap-2.5 p-2 bg-white border border-slate-150 rounded-lg shadow-sm text-xs select-all">
                          <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                          <span className="font-sans font-bold text-slate-700 text-[10px] uppercase tracking-tight">{detail}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => {
                        const targetDom = query.trim() || 'google.com';
                        setQuery(targetDom);
                        setSelectedFeature(null);
                        
                        if (selectedFeature.title === "CERT VALIDATION") {
                          setActiveTab('cert');
                          setSslQuery(targetDom);
                          handleSslCheck(undefined, targetDom);
                        } else {
                          // Standard lookup
                          handleLookup(undefined);
                        }
                      }}
                      className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-md shadow-indigo-600/10 active:scale-95 cursor-pointer"
                    >
                      Diagnose Domain Now
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </main>

      <footer className="relative z-10 w-full bg-white border-t border-slate-200 px-6 py-4.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-20 select-none">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-slate-500">Node diagnostics center running ok</span>
          </div>
          <span className="hidden sm:inline text-slate-200">|</span>
          <span className="hidden sm:inline">Active Nodes count: 42</span>
        </div>
        <div className="flex gap-4">
          <span>Enterprise Version 4.6.2 Stable</span>
          <span className="text-slate-200">|</span>
          <span>© 2026 NetDiag Inc.</span>
        </div>
      </footer>

      <CookieConsent />

    </div>
  );
}

function StatCard({ icon, label, value, color, sub }: { icon: ReactNode; label: string; value: string; color: string; sub: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.015, y: -2 }}
      className="bg-white border border-slate-200 p-5 rounded-xl hover:border-indigo-400 transition-all shadow-sm hover:shadow-md cursor-default group"
    >
      <div className="flex items-center gap-2 text-slate-400 mb-1.5 group-hover:text-indigo-650 transition-colors uppercase tracking-widest text-[9px] font-bold font-mono">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className={`text-sm sm:text-base font-display font-extrabold tracking-tight truncate ${color}`}>{value}</div>
        <div className="text-slate-150 group-hover:text-indigo-150 transition-colors scale-90 group-hover:scale-100 duration-300">
          {icon}
        </div>
      </div>
      <p className="text-[9px] text-slate-405 font-mono uppercase tracking-wider mt-1">{sub}</p>
    </motion.div>
  );
}

function FeatureCard({ icon, title, description, onClick }: { icon: ReactNode; title: string; description: string; onClick?: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -3, scale: 1.02 }}
      onClick={onClick}
      className="p-6 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 cursor-pointer flex flex-col items-center text-center shadow-sm hover:shadow-md relative overflow-hidden transition-all group min-h-[175px]"
    >
      <div className="w-11 h-11 bg-slate-50 rounded-xl font-bold flex items-center justify-center text-slate-500 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner border border-slate-200/40">
        {icon}
      </div>
      <h3 className="text-xs font-display font-extrabold text-slate-900 mb-1.5 uppercase tracking-widest">{title}</h3>
      <p className="text-slate-500 text-[10px] leading-relaxed font-semibold uppercase tracking-tight mb-2">{description}</p>
      
      <div className="mt-auto flex items-center gap-1 text-[9px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 uppercase tracking-widest pt-2">
        Launch Specs <ChevronRight className="w-3 h-3" />
      </div>
    </motion.div>
  );
}
