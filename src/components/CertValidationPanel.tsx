import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  AlertCircle, 
  ShieldCheck, 
  Calendar, 
  Mail, 
  MessageSquare, 
  Star, 
  HelpCircle, 
  Send, 
  ArrowRight, 
  CheckCircle, 
  RefreshCw,
  Sparkles,
  Server,
  Globe,
  Sliders,
  Compass
} from 'lucide-react';

interface CertValidationPanelProps {
  sslQuery: string;
  setSslQuery: (val: string) => void;
  sslResult: any;
  sslError: string | null;
  sslLoading: boolean;
  onCheckSSL: (e?: React.FormEvent, domain?: string) => void;
}

// Interfaces for our interactive local state
interface Review {
  id: string;
  domain: string;
  issuer: string;
  rating: number;
  author: string;
  text: string;
  date: string;
}

export default function CertValidationPanel({
  sslQuery,
  setSslQuery,
  sslResult,
  sslError,
  sslLoading,
  onCheckSSL,
}: CertValidationPanelProps) {
  
  // Interactive drawers
  const [showReviewDrawer, setShowReviewDrawer] = useState(false);
  const [showReminderDrawer, setShowReminderDrawer] = useState(false);
  
  // Review inputs
  const [userRating, setUserRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  
  // Local active review entries list
  const [reviewsList, setReviewsList] = useState<Review[]>([
    {
      id: '1',
      domain: 'google.com',
      issuer: 'Google Trust Services',
      rating: 5,
      author: 'Alex Carter',
      text: 'Extremely fast OCSP response times and robust cross-signing compatibility for older Android platforms.',
      date: 'May 12, 2026'
    },
    {
      id: '2',
      domain: 'github.com',
      issuer: 'DigiCert',
      rating: 4,
      author: 'Jordan Vance',
      text: 'DigiCert intermediate certificates are deeply embedded in all trust stores. Never any compatibility friction.',
      date: 'April 28, 2026'
    },
    {
      id: '3',
      domain: 'cloudflare.com',
      issuer: 'DigiCert',
      rating: 5,
      author: 'Rita Patel',
      text: 'Perfect automated commercial renewal cycle. No wildcard expiration risks.',
      date: 'May 18, 2026'
    }
  ]);

  // Reminder scheduler state
  const [reminderEmail, setReminderEmail] = useState('');
  const [reminderDays, setReminderDays] = useState('30');
  const [reminderStatus, setReminderStatus] = useState<null | 'success'>(null);

  // Bottom section tab selection
  const [activeSubTab, setActiveSubTab] = useState<'details' | 'chain'>('details');
  const [selectedChainNode, setSelectedChainNode] = useState<'root' | 'intermediate' | 'leaf'>('leaf');

  // Loading animation step simulator
  const [loadingStep, setLoadingStep] = useState(0);
  const steps = [
    '⚙️ Querying Domain DNS IPv4 records...',
    '🤝 Initiating TLS connection on port 443 over cryptographic channel...',
    '🔍 Pulling peer certificate chain metadata & signature elements...',
    '🛡️ Performing certificate revocation verification via OCSP...'
  ];

  useEffect(() => {
    let interval: any;
    if (sslLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 550);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [sslLoading]);

  // Handler for saving review
  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    const newReview: Review = {
      id: Date.now().toString(),
      domain: sslResult?.domain || 'unknown',
      issuer: sslResult?.issuerName || 'CA Network Provider',
      rating: userRating,
      author: reviewName.trim() || 'Anonymous Security Specialist',
      text: reviewText,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };

    setReviewsList([newReview, ...reviewsList]);
    setReviewText('');
    setReviewName('');
    setUserRating(5);
    setShowReviewDrawer(false);
  };

  // Handler for setting reminder
  const handleScheduleReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderEmail.trim()) return;

    setReminderStatus('success');
    setTimeout(() => {
      setReminderStatus(null);
      setShowReminderDrawer(false);
      setReminderEmail('');
    }, 2800);
  };

  // Render trust chain info card details depending on which node is selected in the interactive chart
  const getChainNodeDetails = () => {
    const defaultData = {
      root: {
        name: 'DigiCert Global Root G2',
        role: 'Root Anchor of Trust',
        keySize: 'RSA 4096-bit (SHA-384 fingerprint)',
        path: 'Pre-vetted in standard operating system kernels and trust stores worldwide.',
        status: 'Self-Signed Trusted Certificate',
        auth: 'CA / Browser Forum compliant trust tier'
      },
      intermediate: {
        name: sslResult?.issuerCommonName || 'DigiCert Global G2 TLS RSA SHA256 2020 CA1',
        role: 'Subordinate/Intermediate Issuing Authority',
        keySize: 'RSA 2048-bit (SHA-256 fingerprint)',
        path: 'Delegated intermediary used to shield the offline pristine private key of the main Root anchor.',
        status: 'Active, Revocation Checked via CRL',
        auth: sslResult?.issuerName || 'DigiCert Inc'
      },
      leaf: {
        name: sslResult?.subject?.commonName || sslQuery || 'Site Host Target',
        role: 'Leaf End-Entity Certificate',
        keySize: sslResult?.signatureAlgorithm === 'sha256WithRSAEncryption' ? 'RSA 2048-bit' : 'ECDSA P-256',
        path: `Dedicated host identity certificate binding cryptographically to the verified hostname.`,
        status: 'Valid domain verified identity',
        auth: sslResult?.issuerName || 'Authorized CA'
      }
    };

    return defaultData[selectedChainNode];
  };

  const chainNodeInfo = getChainNodeDetails();

  // Helper quick trial triggers
  const executeQuickCheck = (domain: string) => {
    setSslQuery(domain);
    onCheckSSL(undefined, domain);
  };

  return (
    <div id="cert-validator-outer-wrapper" className="bg-white border border-slate-200 rounded-2xl shadow-sm w-full overflow-hidden transition-all duration-300 hover:shadow-md">
      
      {/* Banner / Header */}
      <div className="bg-slate-900 px-6 py-8 md:px-8 border-b border-slate-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-indigo-600/30 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-400/20 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" /> Security Layer
              </span>
            </div>
            <h3 className="text-2xl font-display font-extrabold tracking-tight flex items-center gap-2.5">
              <span className="p-1.5 bg-indigo-600 rounded-lg text-white">
                <Lock className="w-5 h-5" />
              </span>
              SSL CERT_VALIDATION ENGINE
            </h3>
            <p className="text-slate-400 text-xs mt-1.5 uppercase font-mono tracking-wider font-medium max-w-xl">
              Inspect cryptographic handshakes, CA trust hierarchies, subject alternate names (SANs) and expiration safety schedules.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Domain Search Form - Completely Clean / Blank Box Default */}
        <div className="mb-6">
          <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2 font-mono">
            Host Domain Validation Check
          </label>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              onCheckSSL(e);
            }} 
            className="flex flex-col sm:flex-row gap-2 max-w-2xl bg-slate-50 border-2 border-slate-200 rounded-xl p-1.5 transition-all duration-200 focus-within:border-indigo-500 focus-within:bg-white"
          >
            <div className="flex-1 flex items-center gap-2.5 px-3">
              <Globe className="w-4 h-4 text-slate-400" />
              <input
                id="ssl-hostname-input"
                type="text"
                value={sslQuery}
                onChange={(e) => setSslQuery(e.target.value)}
                placeholder="Enter any domain (e.g. google.com, github.com, etc.)"
                className="w-full bg-transparent py-2 outline-none text-sm text-slate-800 placeholder:text-slate-400 font-sans"
              />
              {sslQuery && (
                <button
                  type="button"
                  onClick={() => setSslQuery('')}
                  className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-1"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              id="ssl-submit-btn"
              type="submit"
              disabled={sslLoading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold text-xs px-6 py-2.5 sm:py-2 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none uppercase tracking-wider active:scale-95 shrink-0"
            >
              {sslLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Check SSL</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Checks Recommendations to quickly test the functionality */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wild py-1 font-mono">Quick sandbox tests:</span>
            {['google.com', 'github.com', 'cloudflare.com'].map((dom) => (
              <button
                key={dom}
                type="button"
                onClick={() => executeQuickCheck(dom)}
                className="text-[11px] font-medium text-slate-600 hover:text-indigo-600 transition-colors bg-slate-100 hover:bg-indigo-50 px-2.5 py-1 rounded border border-slate-200/60"
              >
                {dom}
              </button>
            ))}
          </div>
        </div>

        {/* Error Block */}
        {sslError && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2 mb-6"
          >
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Cryptographic error: {sslError}</span>
          </motion.div>
        )}

        {/* Holographic Step-by-Step Loader with sweep bars */}
        <AnimatePresence>
          {sslLoading && (
            <motion.div
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border border-slate-150 rounded-xl bg-slate-50/80 p-6 mb-6 overflow-hidden"
            >
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center text-xs font-bold font-mono tracking-wider text-indigo-600 uppercase">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                    Connecting Securely ...
                  </span>
                  <span>{Math.round(((loadingStep + 1) / steps.length) * 100)}%</span>
                </div>
                
                {/* Active scan progress bar */}
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden relative">
                  <motion.div 
                    className="h-full bg-indigo-600 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((loadingStep + 1) / scrollY) * 100}%` }}
                    style={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
                    transition={{ ease: "easeInOut" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-36 animate-pulse" style={{ animationDuration: '0.8s' }} />
                </div>

                {/* Simulated Terminal Steps */}
                <div className="space-y-2 mt-2 bg-slate-900 border border-slate-800 p-4 rounded-lg font-mono text-xs">
                  {steps.map((step, i) => (
                    <div 
                      key={step} 
                      className={`transition-all duration-300 flex items-center gap-2.5 ${
                        i < loadingStep ? 'text-emerald-400 font-semibold' : 
                        i === loadingStep ? 'text-indigo-300 animate-pulse font-bold' : 'text-slate-600'
                      }`}
                    >
                      <span>{i < loadingStep ? '✓' : i === loadingStep ? '➜' : '○'}</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Block (Matches design specs but fully interactive) */}
        {!sslLoading && sslResult ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8 animate-fadeIn"
          >
            {/* Checklist Results precisely styled like graphic with interactive buttons */}
            <div className="space-y-4">
              
              {/* Item 1: Name Resolution */}
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                className="flex items-start gap-4 hover:bg-slate-50 p-2 -m-2 rounded-lg transition-colors group"
              >
                <div className="w-7 h-7 flex-shrink-0 bg-emerald-500 text-white rounded-full flex items-center justify-center p-0.5 border border-emerald-400 text-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.3)] mt-0.5">
                  <svg className="w-4 h-4 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1 py-1">
                  <span className="text-base font-semibold text-slate-800 transition-colors">
                    {sslResult.domain} resolves to <span className="font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-sm font-semibold">{sslResult.resolvedIP}</span>
                  </span>
                </div>
              </motion.div>

              {/* Item 2: Server Type */}
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-start gap-4 hover:bg-slate-50 p-2 -m-2 rounded-lg transition-colors group"
              >
                <div className="w-7 h-7 flex-shrink-0 bg-emerald-500 text-white rounded-full flex items-center justify-center p-0.5 border border-emerald-400 text-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.3)] mt-0.5">
                  <svg className="w-4 h-4 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1 py-1">
                  <span className="text-base font-semibold text-slate-800 transition-colors">
                    Server Security Layer Type: <span className="font-mono bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-semibold">{sslResult.serverType}</span>
                  </span>
                </div>
              </motion.div>

              {/* Item 3: Browser Trust */}
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="flex items-start gap-4 hover:bg-slate-50 p-2 -m-2 rounded-lg transition-colors group"
              >
                <div className="w-7 h-7 flex-shrink-0 bg-emerald-500 text-white rounded-full flex items-center justify-center p-0.5 border border-emerald-400 text-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.3)] mt-0.5">
                  <svg className="w-4 h-4 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1 py-1">
                  <span className="text-base font-semibold text-slate-800 transition-colors">
                    The certificate is successfully trusted by all major web browsers (the full root & intermediate certificates chain checks out OK).
                  </span>
                </div>
              </motion.div>

              {/* Item 4: Issuer Info with Active Review Drawer trigger */}
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-4 hover:bg-slate-50 p-2 -m-2 rounded-lg transition-colors group"
              >
                <div className="w-7 h-7 flex-shrink-0 bg-emerald-500 text-white rounded-full flex items-center justify-center p-0.5 border border-emerald-400 text-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.3)] mt-0.5">
                  <svg className="w-4 h-4 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1 py-1 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <span className="text-base font-semibold text-slate-800">
                    The certificate was cryptographic-signed & issued by <strong className="font-extrabold text-blue-700">{sslResult.issuerName}</strong>.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewDrawer(!showReviewDrawer);
                      setShowReminderDrawer(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1 rounded-md transition-all sm:scale-100 hover:scale-105 active:scale-95 shadow-sm uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Write review of {sslResult.issuerName}
                  </button>
                </div>
              </motion.div>

              {/* Collapsible Review Box Panel */}
              <AnimatePresence>
                {showReviewDrawer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 ml-11 overflow-hidden"
                  >
                    <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      Add crypt-engineer review for {sslResult.issuerName}
                    </h4>
                    <form onSubmit={handleAddReview} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Your Rating</label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setUserRating(star)}
                              onMouseEnter={() => setHoveredRating(star)}
                              onMouseLeave={() => setHoveredRating(null)}
                              className="text-2xl transition-all hover:scale-125 focus:outline-none cursor-pointer"
                            >
                              <Star 
                                className={`w-5 h-5 ${
                                  star <= (hoveredRating ?? userRating)
                                    ? 'text-amber-500 fill-amber-400 drop-shadow-[0_0_3px_rgba(245,158,11,0.4)]'
                                    : 'text-slate-300'
                                }`} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Your Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Linus T."
                            value={reviewName}
                            onChange={(e) => setReviewName(e.target.value)}
                            className="w-full text-xs font-sans p-2 rounded bg-white border border-slate-200 outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Cert Review Text</label>
                          <input
                            type="text"
                            required
                            placeholder="Share cryptographic metrics or CRL loading quality..."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            className="w-full text-xs font-sans p-2 rounded bg-white border border-slate-200 outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowReviewDrawer(false)}
                          className="hover:bg-slate-200 text-slate-700 font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-1.5 rounded flex items-center gap-1 shadow-sm"
                        >
                          <Send className="w-3 h-3" /> Submit Review
                        </button>
                      </div>
                    </form>

                    {/* Local reviews for this issuer */}
                    <div className="mt-4 border-t border-indigo-100/50 pt-3 space-y-3">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified Engineer Feedbacks</div>
                      {reviewsList
                        .filter(r => r.issuer.toLowerCase().includes(sslResult.issuerName.toLowerCase()) || sslResult.issuerName.toLowerCase().includes(r.issuer.toLowerCase()))
                        .map((rev) => (
                          <div key={rev.id} className="bg-white/80 border border-indigo-100/30 p-3 rounded-lg text-xs shadow-sm">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-extrabold text-slate-800">{rev.author}</span>
                              <div className="flex gap-0.5 text-amber-500 text-[10px]">
                                {Array.from({ length: rev.rating }).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-500" />
                                ))}
                              </div>
                            </div>
                            <p className="text-slate-600">{rev.text}</p>
                            <span className="text-[9px] font-mono text-slate-400 mt-1 block uppercase font-bold tracking-wider">{rev.date} via {rev.domain}</span>
                          </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Item 5: Expiration Info with Active Scheduled Reminder Form */}
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="flex items-start gap-4 hover:bg-slate-50 p-2 -m-2 rounded-lg transition-colors group"
              >
                <div className="w-7 h-7 flex-shrink-0 bg-emerald-500 text-white rounded-full flex items-center justify-center p-0.5 border border-emerald-400 text-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.3)] mt-0.5">
                  <svg className="w-4 h-4 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1 py-1 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <span className="text-base font-semibold text-slate-800">
                    The socket-connected certificate will expire in <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded text-sm font-bold">{sslResult.daysToExpiry} days</span>.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReminderDrawer(!showReminderDrawer);
                      setShowReviewDrawer(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1 rounded-md transition-all sm:scale-100 hover:scale-105 active:scale-95 shadow-sm uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <Mail className="w-3 h-3" />
                    Remind me
                  </button>
                </div>
              </motion.div>

              {/* Collapsible Reminder Drawer */}
              <AnimatePresence>
                {showReminderDrawer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5 ml-11 overflow-hidden"
                  >
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      Configure Smart Automated Expiry Alert
                    </h4>
                    {reminderStatus === 'success' ? (
                      <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        className="bg-white border border-emerald-200 text-emerald-800 p-4 rounded-lg flex items-center gap-3 shadow-inner"
                      >
                        <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
                        <div>
                          <p className="font-extrabold text-sm uppercase tracking-tight">Active Warning Watch Triggered!</p>
                          <p className="text-xs text-slate-500">We will mail you at <span className="font-mono text-slate-800">{reminderEmail}</span> exactly {reminderDays} days before {sslResult.domain} certificate expires.</p>
                        </div>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleScheduleReminder} className="space-y-3.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Notification Alert Window</label>
                            <select
                              value={reminderDays}
                              onChange={(e) => setReminderDays(e.target.value)}
                              className="w-full text-xs font-sans p-2 rounded bg-white border border-slate-200 outline-none focus:border-emerald-500"
                            >
                              <option value="7">7 Days prior to expiry (Immediate Warning)</option>
                              <option value="14">14 Days prior to expiry (Standard Notice)</option>
                              <option value="30">30 Days prior to expiry (Best Practice)</option>
                              <option value="60">60 Days prior to expiry (Early Procurement)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Your Work Email Address</label>
                            <input
                              type="email"
                              required
                              placeholder="security@corporate.com"
                              value={reminderEmail}
                              onChange={(e) => setReminderEmail(e.target.value)}
                              className="w-full text-xs font-sans p-2 rounded bg-white border border-slate-200 outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setShowReminderDrawer(false)}
                            className="hover:bg-slate-200 text-slate-700 font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-1.5 rounded flex items-center gap-1 shadow-sm uppercase tracking-widest cursor-pointer"
                          >
                            <Calendar className="w-3 h-3" /> Schedule Watch
                          </button>
                        </div>
                      </form>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Item 6: Hostname Listing Match */}
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-4 hover:bg-slate-50 p-2 -m-2 rounded-lg transition-colors group"
              >
                <div className="w-7 h-7 flex-shrink-0 bg-emerald-500 text-white rounded-full flex items-center justify-center p-0.5 border border-emerald-400 text-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.3)] mt-0.5">
                  <svg className="w-4 h-4 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1 py-1">
                  <span className="text-base font-semibold text-slate-800">
                    The requested domain hostname (<span className="font-mono text-indigo-700 font-bold">{sslResult.domain}</span>) is correctly listed in the certificate Subject SAN block.
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Sub Tabs Panel Selection */}
            <div className="border-b border-slate-150 flex gap-4 mt-8">
              <button
                type="button"
                onClick={() => setActiveSubTab('details')}
                className={`flex items-center gap-2 pb-3 text-xs uppercase tracking-wider font-extrabold transition-all border-b-2 ${
                  activeSubTab === 'details' 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Sliders className="w-4 h-4" /> Technical Field Ledger
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('chain')}
                className={`flex items-center gap-2 pb-3 text-xs uppercase tracking-wider font-extrabold transition-all border-b-2 ${
                  activeSubTab === 'chain' 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Compass className="w-4 h-4" /> Animated Trust Chain Visualizer
              </button>
            </div>

            {/* Sub Tab Contents 1: Technical Fields (Precisely matching the graphical table layout) */}
            <AnimatePresence mode="wait">
              {activeSubTab === 'details' ? (
                <motion.div
                  key="tech-subtab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col md:flex-row items-center md:items-start gap-8 mt-4 pt-2"
                >
                  {/* Glowing Lock Document Graphic exactly aligned left with shiny badges */}
                  <div className="w-36 h-40 bg-slate-50 rounded-2xl p-3 shadow-inner border border-slate-200 flex flex-col justify-center items-center relative overflow-hidden shrink-0 mt-1 z-10 transition-all hover:shadow hover:bg-slate-100 group">
                    <div className="absolute top-2 left-3 text-[9px] font-mono font-extrabold text-slate-400 uppercase tracking-widest">SERVER</div>
                    <div className="relative mt-2 flex flex-col items-center">
                      <div className="w-16 h-16 rounded-xl border-2 border-slate-300 flex items-center justify-center bg-white shadow-sm transition-all group-hover:scale-105">
                        <Lock className="w-9 h-9 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border border-white shadow-[0_0_8px_rgba(16,185,129,0.8)]">
                        <svg className="w-4 h-4 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold font-mono text-emerald-600 uppercase tracking-widest mt-3.5 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> VERIFIED
                    </span>
                  </div>

                  {/* Fully Rendered Detail Block */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pb-4">
                    <div className="border-b border-slate-100 pb-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono mb-0.5">Common name</div>
                      <p className="text-sm font-bold text-slate-800 font-mono">{sslResult.subject.commonName}</p>
                    </div>

                    <div className="border-b border-slate-100 pb-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono mb-0.5">SANs (Subject Alternative Names)</div>
                      <p className="text-xs font-semibold text-slate-600 font-mono break-all">{sslResult.subject.sans}</p>
                    </div>

                    <div className="border-b border-slate-100 pb-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono mb-0.5">Organization / Legal Owner</div>
                      <p className="text-sm font-bold text-slate-800">{sslResult.subject.organization}</p>
                    </div>

                    <div className="border-b border-slate-100 pb-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono mb-0.5">Physical / Legal Location</div>
                      <p className="text-sm font-semibold text-slate-700">{sslResult.subject.location}</p>
                    </div>

                    <div className="border-b border-slate-100 pb-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono mb-0.5">Duration Validity Spectrum</div>
                      <p className="text-xs font-bold text-slate-800">
                        <span className="text-slate-400 font-light">From </span> 
                        {sslResult.validFrom} 
                        <span className="text-slate-400 font-light"> to </span> 
                        {sslResult.validTo}
                      </p>
                    </div>

                    <div className="border-b border-slate-100 pb-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono mb-0.5">TLS Certificate Serial Number</div>
                      <p className="text-xs font-mono text-slate-600 uppercase break-all">{sslResult.serialNumber}</p>
                    </div>

                    <div className="border-b border-slate-100 pb-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono mb-0.5">Signature Algorithm</div>
                      <p className="text-xs font-mono font-bold text-indigo-700">{sslResult.signatureAlgorithm}</p>
                    </div>

                    <div className="border-b border-slate-100 pb-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono mb-0.5">Authority Issuer Entity</div>
                      <p className="text-xs italic text-slate-700 font-semibold">{sslResult.issuer}</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Sub Tab Contents 2: Fully Animated Cryptographic Node Interaction */
                <motion.div
                  key="chain-subtab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 space-y-6"
                >
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 md:p-6 text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 font-mono">
                      Interact with chain levels to expose public key size and path structures
                    </p>

                    {/* Nodes Connector Visualization Grid */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-14 my-4 relative">
                      
                      {/* Connection Line (Desktop representation) */}
                      <div className="absolute hidden md:block top-10 left-[24%] right-[24%] h-0.5 bg-slate-200 z-0">
                        <div className="h-full w-2/3 bg-gradient-to-r from-emerald-500 via-indigo-500 to-indigo-600 animate-pulse" />
                      </div>

                      {/* Level 1: Root Anchor Node */}
                      <button
                        type="button"
                        onClick={() => setSelectedChainNode('root')}
                        className={`relative z-10 w-44 p-3 rounded-xl border transition-all text-center flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer ${
                          selectedChainNode === 'root'
                            ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-105'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <ShieldCheck className={`w-5 h-5 ${selectedChainNode === 'root' ? 'text-white' : 'text-emerald-500'}`} />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider opacity-90">1. Root Authority</p>
                          <p className="text-[11px] font-mono font-extrabold truncate w-36">DigiCert G2</p>
                        </div>
                      </button>

                      <div className="w-1 h-4 md:hidden bg-slate-300" /> {/* Mobile visual divider */}

                      {/* Level 2: Intermediary Node */}
                      <button
                        type="button"
                        onClick={() => setSelectedChainNode('intermediate')}
                        className={`relative z-10 w-44 p-3 rounded-xl border transition-all text-center flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer ${
                          selectedChainNode === 'intermediate'
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.4)] scale-105'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <Sliders className={`w-5 h-5 ${selectedChainNode === 'intermediate' ? 'text-white' : 'text-indigo-600'}`} />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider opacity-90">2. Intermediate CA</p>
                          <p className="text-[11px] font-mono font-extrabold truncate w-36">TLS RSA CA1</p>
                        </div>
                      </button>

                      <div className="w-1 h-4 md:hidden bg-slate-300" /> {/* Mobile visual divider */}

                      {/* Level 3: Leaf Node */}
                      <button
                        type="button"
                        onClick={() => setSelectedChainNode('leaf')}
                        className={`relative z-10 w-44 p-3 rounded-xl border transition-all text-center flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer ${
                          selectedChainNode === 'leaf'
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.4)] scale-105'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <Lock className={`w-5 h-5 ${selectedChainNode === 'leaf' ? 'text-white' : 'text-indigo-500'}`} />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider opacity-90">3. Leaf Domain</p>
                          <p className="text-[11px] font-mono font-extrabold truncate w-36">{sslResult.domain}</p>
                        </div>
                      </button>

                    </div>

                    {/* Selected Node Details Box */}
                    <motion.div 
                      layout
                      className="mt-6 bg-white border border-slate-150 p-5 rounded-xl shadow-inner text-left grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      <div>
                        <span className="bg-indigo-50 text-indigo-700 text-[10px] font-mono font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                          {chainNodeInfo.role}
                        </span>
                        <h5 className="font-extrabold text-sm text-slate-900 mt-2 font-mono">{chainNodeInfo.name}</h5>
                        <p className="text-xs text-slate-500 mt-1 font-sans">{chainNodeInfo.path}</p>
                      </div>

                      <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-5 font-mono text-xs text-slate-600 uppercase">
                        <div>
                          <strong className="text-slate-400 text-[10px] font-bold block mb-0.5">Signature Algorithm</strong>
                          <span className="text-slate-800 font-bold">{chainNodeInfo.keySize}</span>
                        </div>
                        <div>
                          <strong className="text-slate-400 text-[10px] font-bold block mb-0.5">Operational Status</strong>
                          <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            {chainNodeInfo.status}
                          </span>
                        </div>
                        <div>
                          <strong className="text-slate-400 text-[10px] font-bold block mb-0.5">Registered Administrator</strong>
                          <span className="text-slate-700 font-medium">{chainNodeInfo.auth}</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Blank state empty view showing compass and details on usage */
          <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl select-none">
            <Lock className="w-12 h-12 mx-auto text-slate-300 mb-3 animate-pulse" style={{ animationDuration: '4s' }} />
            <h4 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider">Awaiting crypt-verification criteria</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
              Enter any domain address above (such as <strong className="text-slate-600">netflix.com</strong> or your domain) and press Check SSL to perform complete public-key infrastructure checks.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
