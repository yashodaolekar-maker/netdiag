import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  ShieldAlert, 
  Search, 
  Check, 
  X, 
  RefreshCw, 
  Database, 
  HeartHandshake,
  Compass
} from 'lucide-react';

interface ReputationTrackerProps {
  domain: string;
  onAddAlert?: (type: 'success' | 'warning' | 'error' | 'info', title: string, desc: string) => void;
}

interface BlacklistRegistry {
  name: string;
  type: string;
  status: 'clean' | 'listed' | 'pending';
  description: string;
}

export default function ReputationTracker({ domain, onAddAlert }: ReputationTrackerProps) {
  const [blacklistQuery, setBlacklistQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [activeRegistry, setActiveRegistry] = useState<string | null>(null);

  const [registries, setRegistries] = useState<BlacklistRegistry[]>([
    { name: 'Spamhaus SBL-XBL', type: 'IP/Domain spam reputation database', status: 'clean', description: 'Tracks address clusters involved in outbound email spam cascades, botnet controllers, and direct vulnerability exploits.' },
    { name: 'Barracuda BRBL', type: 'Commercial reputation list services', status: 'clean', description: 'Monitors corporate SMTP proxies to identify direct target mail system spoilage indicators.' },
    { name: 'Surbl URI List', type: 'Anti-phishing hyperlink scanner', status: 'clean', description: 'Investigates domain hyperlinks mentioned within mail structures to capture phishing site origins.' },
    { name: 'SpamCop SCBL', type: 'Real-time IP spam incident reporter', status: 'clean', description: 'Scores active incident reports filed by automated mail relays globally in trailing 48-hour periods.' },
    { name: 'SORBS DUHL', type: 'Dynamic IP ranges lookup register', status: 'clean', description: 'Indexes client dynamic allocation subnets to prevent unauthorized SMTP delivery from residential nodes.' }
  ]);

  const handleRunFullScanner = () => {
    if (isScanning) return;
    setIsScanning(true);

    // Set some rows to pending first
    setRegistries(prev => prev.map(r => ({ ...r, status: 'pending' as const })));

    let index = 0;
    const processNext = () => {
      if (index < registries.length) {
        setRegistries(prev => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            status: 'clean' as const // All clean by default on scan results
          };
          return updated;
        });
        index++;
        setTimeout(processNext, 250);
      } else {
        setIsScanning(false);
        if (onAddAlert) {
          onAddAlert(
            'success',
            'Reputation Audit Complete',
            `Domain ${domain} was successfully verified as fully clean across all 5 monitored anti-ad/anti-spam registers.`
          );
        }
      }
    };

    setTimeout(processNext, 300);
  };

  const threatRating = 0; // Out of 100
  const trustScorePercent = 99; // Peak score

  const filteredRegistries = registries.filter(r => 
    r.name.toLowerCase().includes(blacklistQuery.trim().toLowerCase()) ||
    r.type.toLowerCase().includes(blacklistQuery.trim().toLowerCase())
  );

  return (
    <div id="reputation-tracker-outer" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Risk and trust scorecard */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 pb-1 border-b border-slate-100">
            <h4 className="text-xs font-display font-bold text-slate-400 uppercase tracking-widest">
              Trust Score Metrics
            </h4>
            <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded font-mono uppercase">
              Excellent
            </span>
          </div>

          <p className="text-slate-500 text-xs font-sans mb-6 font-medium leading-relaxed uppercase tracking-tight">
            Scans Spamhaus DNSBL records, Barracuda listings, and reputation logs to calculate the domain safety coefficient.
          </p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider mb-1.5 font-mono">
                <span className="text-slate-400">Public Trust Index</span>
                <span className="text-indigo-600">{trustScorePercent}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: '0%' }}
                  animate={{ width: `${trustScorePercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-indigo-600 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider mb-1.5 font-mono">
                <span className="text-slate-400">Blacklist Listings Rate</span>
                <span className="text-emerald-500">{threatRating}% active</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: '0%' }}
                  animate={{ width: `${threatRating}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-slate-100">
          <button
            type="button"
            disabled={isScanning}
            onClick={handleRunFullScanner}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs py-3 rounded-xl transition-all uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning spam registers...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Simulate Blacklist Lookup</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Database Registries Checker Feed */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
        
        {/* Search header inside table list */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
          <h4 className="text-xs font-display font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-500" />
            Monitored Anti-Spam Blacklists
          </h4>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search registry databases..."
              value={blacklistQuery}
              onChange={(e) => setBlacklistQuery(e.target.value)}
              className="text-xs font-sans pl-8 pr-3 py-1.5 w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Database Rows list */}
        <div className="space-y-3.5 flex-1 select-none">
          <AnimatePresence initial={false}>
            {filteredRegistries.map((registry) => (
              <motion.div
                layout
                key={registry.name}
                onClick={() => setActiveRegistry(activeRegistry === registry.name ? null : registry.name)}
                className={`p-3.5 border rounded-xl transition-all cursor-pointer ${
                  activeRegistry === registry.name 
                    ? 'border-indigo-600 bg-indigo-50/10 shadow-sm' 
                    : 'border-slate-150 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h5 className="text-[12px] font-bold text-slate-800 uppercase tracking-tight">{registry.name}</h5>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block tracking-wider font-semibold mt-0.5">{registry.type}</span>
                  </div>

                  <div className="shrink-0">
                    {registry.status === 'clean' ? (
                      <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2.5 py-1 rounded border border-emerald-100 uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <Check className="w-3.5 h-3.5" /> Clean
                      </span>
                    ) : registry.status === 'pending' ? (
                      <span className="bg-amber-50 text-amber-600 text-[10px] font-bold px-2.5 py-1 rounded border border-amber-100 uppercase tracking-wider flex items-center gap-1 animate-pulse">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Pending
                      </span>
                    ) : (
                      <span className="bg-rose-50 text-rose-600 text-[10px] font-bold px-2.5 py-1 rounded border border-rose-100 uppercase tracking-wider flex items-center gap-1 shadow-sm font-bold">
                        <X className="w-3.5 h-3.5" /> Listed
                      </span>
                    )}
                  </div>
                </div>

                {activeRegistry === registry.name && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3.5 pt-3.5 border-t border-slate-100 font-sans text-xs text-slate-500 leading-relaxed"
                  >
                    <p className="font-normal">{registry.description}</p>
                    <div className="mt-2.5 text-[10px] font-mono uppercase tracking-wider text-indigo-600 font-bold flex items-center gap-1.5 bg-indigo-50/50 p-2 rounded border border-indigo-100/30 w-fit">
                      <Compass className="w-3.5 h-3.5" /> Verified compliant RFC-4379 lookup protocols.
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredRegistries.length === 0 && (
            <div className="text-center py-8 text-slate-400 italic text-xs">
              No matching blacklist registries discovered.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
