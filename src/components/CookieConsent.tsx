import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Info, X, ScrollText, Check, Ban } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already made a decision
    const consent = localStorage.getItem('netdiag_cookie_consent');
    if (!consent) {
      // Small timeout to animate banner after page loads
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('netdiag_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('netdiag_cookie_consent', 'rejected');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl p-5 z-[100] font-sans overflow-hidden"
          id="cookie-consent-modal"
        >
          {/* Subtle design accent matching our premium branding */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700" />
          
          <div className="flex items-start gap-3.5 mt-1.5">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-display font-extrabold text-[13px] tracking-tight uppercase text-slate-900 flex items-center gap-1.5">
                Privacy & Acceptable Usage Policy
              </h4>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-normal">
                NetDiag utilizes lightweight browser-side session caching strictly to optimize DNS diagnostics queries, retain latency history chart nodes, and enforce request safety thresholds.
              </p>
            </div>
          </div>

          {/* Details toggle section */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-4 pt-3.5 border-t border-slate-100 overflow-hidden font-mono text-[10px] text-slate-500 space-y-2 select-text"
              >
                <div className="font-sans font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <ScrollText className="w-3.5 h-3.5 text-indigo-600" /> Standard AUP Core Rules:
                </div>
                <ul className="list-disc list-inside space-y-1.5 leading-relaxed uppercase">
                  <li><strong className="text-slate-700">Strictly Non-Tracking:</strong> No third-party tracking, advertising, ad-profiling, or personal identification is conducted.</li>
                  <li><strong className="text-slate-700">Rate Limiting:</strong> Lookups are subject to transparent rate validation mechanisms (max 45 diagnostic runs per minute).</li>
                  <li><strong className="text-slate-705">Acceptable Input:</strong> Prohibits scanning domains or network pipelines engaged in malicious botnets, phishing spoof hosts, or explicit spoof injection vectors.</li>
                  <li><strong className="text-slate-700">Audit Cache:</strong> Locally persisted states reside purely within local storage variables and can be purged instantly by resetting the interface.</li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls Segment */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={() => setShowDetails(!showDetails)}
              type="button"
              className="text-[10px] font-bold uppercase tracking-wider text-slate-450 hover:text-indigo-600 font-mono transition-colors flex items-center gap-1 cursor-pointer py-1"
            >
              <Info className="w-3.5 h-3.5" />
              {showDetails ? 'Hide AUP Details' : 'Read Full AUP'}
            </button>

            <div className="flex gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleReject}
                id="reject-policy-btn"
                type="button"
                className="flex-1 sm:flex-initial bg-slate-50 hover:bg-rose-50 border border-slate-205/60 text-slate-500 hover:text-rose-600 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                Reject
              </button>
              
              <button
                onClick={handleAccept}
                id="accept-policy-btn"
                type="button"
                className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg shadow-sm font-display transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Accept
              </button>
            </div>
          </div>
          
        </motion.div>
      )}
    </AnimatePresence>
  );
}
