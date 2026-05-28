import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  AlertCircle, 
  RefreshCw,
  Loader,
  FileText,
  Building,
  Calendar,
  User,
  ShieldCheck
} from 'lucide-react';

interface WhoisLookupProps {
  domain: string;
  setWhoisQuery: (val: string) => void;
  whoisResult: any;
  whoisError: string | null;
  whoisLoading: boolean;
  onCheckWhois: (e?: React.FormEvent, domain?: string) => void;
}

export default function WhoisLookup({
  domain,
  setWhoisQuery,
  whoisResult,
  whoisError,
  whoisLoading,
  onCheckWhois,
}: WhoisLookupProps) {
  const [loadingStep, setLoadingStep] = useState(0);
  const steps = [
    '🔍 Querying WHOIS database for domain registration...',
    '📡 Connecting to regional WHOIS server...',
    '📥 Parsing registration records and contact information...',
    '✅ Validating domain status and expiration dates...'
  ];

  useEffect(() => {
    let interval: any;
    if (whoisLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 600);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [whoisLoading]);

  const executeQuickCheck = (domainToCheck: string) => {
    setWhoisQuery(domainToCheck);
    onCheckWhois(undefined, domainToCheck);
  };

  return (
    <div id="whois-lookup-outer-wrapper" className="bg-white border border-slate-200 rounded-2xl shadow-sm w-full overflow-hidden transition-all duration-300 hover:shadow-md">
      
      <div className="bg-slate-900 px-6 py-8 md:px-8 border-b border-slate-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-indigo-600/30 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-400/20 uppercase tracking-widest flex items-center gap-1">
                <Globe className="w-3 h-3 text-indigo-400" /> Domain Registry
              </span>
            </div>
            <h3 className="text-2xl font-display font-extrabold tracking-tight flex items-center gap-2.5">
              <span className="p-1.5 bg-indigo-600 rounded-lg text-white">
                <FileText className="w-5 h-5" />
              </span>
              WHOIS LOOKUP ENGINE
            </h3>
            <p className="text-slate-400 text-xs mt-1.5 uppercase font-mono tracking-wider font-medium max-w-xl">
              Retrieve domain registration records, registrar information, and important dates.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="mb-6">
          <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2 font-mono">
            Domain Registration Check
          </label>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              onCheckWhois(e);
            }} 
            className="flex flex-col sm:flex-row gap-2 max-w-2xl bg-slate-50 border-2 border-slate-200 rounded-xl p-1.5 transition-all duration-200 focus-within:border-indigo-500 focus-within:bg-white"
          >
            <div className="flex-1 flex items-center gap-2.5 px-3">
              <Globe className="w-4 h-4 text-slate-400" />
              <input
                id="whois-hostname-input"
                type="text"
                value={domain}
                onChange={(e) => setWhoisQuery(e.target.value)}
                placeholder="Enter any domain (e.g. google.com, github.com, etc.)"
                className="w-full bg-transparent py-2 outline-none text-sm text-slate-800 placeholder:text-slate-400 font-sans"
              />
              {domain && (
                <button
                  type="button"
                  onClick={() => setWhoisQuery('')}
                  className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-1"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              id="whois-submit-btn"
              type="submit"
              disabled={whoisLoading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold text-xs px-6 py-2.5 sm:py-2 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none uppercase tracking-wider active:scale-95 shrink-0"
            >
              {whoisLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  <span>Lookup WHOIS</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wild py-1 font-mono">Quick tests:</span>
            {['google.com', 'github.com', 'cloudflare.com', 'amazon.com'].map((dom) => (
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

        {whoisError && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2 mb-6"
          >
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>WHOIS lookup error: {whoisError}</span>
          </motion.div>
        )}

        <AnimatePresence>
          {whoisLoading && (
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
                    <Loader className="w-4 h-4 animate-spin text-indigo-600" />
                    Accessing WHOIS Database ...
                  </span>
                  <span>{Math.round(((loadingStep + 1) / steps.length) * 100)}%</span>
                </div>
                
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden relative">
                  <motion.div 
                    className="h-full bg-indigo-600 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
                    transition={{ ease: "easeInOut" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-36 animate-pulse" style={{ animationDuration: '0.8s' }} />
                </div>

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

        {!whoisLoading && whoisResult && whoisResult.whois ? (
          <motion.div 
            key={whoisResult.whois?.domainName || Date.now()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                className="flex items-start gap-4 hover:bg-slate-50 p-2 -m-2 rounded-lg transition-colors group"
              >
                <div className="w-7 h-7 flex-shrink-0 bg-emerald-500 text-white rounded-full flex items-center justify-center p-0.5 border border-emerald-400 text-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.3)] mt-0.5">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="flex-1 py-1">
                  <span className="text-base font-semibold text-slate-800 transition-colors">
                    Domain Name: <span className="font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-sm font-semibold">{whoisResult.whois?.domainName || 'N/A'}</span>
                  </span>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-start gap-4 hover:bg-slate-50 p-2 -m-2 rounded-lg transition-colors group"
              >
                <div className="w-7 h-7 flex-shrink-0 bg-emerald-500 text-white rounded-full flex items-center justify-center p-0.5 border border-emerald-400 text-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.3)] mt-0.5">
                  <Building className="w-4 h-4" />
                </div>
                <div className="flex-1 py-1">
                  <span className="text-base font-semibold text-slate-800 transition-colors">
                    Registrar: <span className="font-mono bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-semibold">{whoisResult.whois?.registrar || 'N/A'}</span>
                  </span>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="flex items-start gap-4 hover:bg-slate-50 p-2 -m-2 rounded-lg transition-colors group"
              >
                <div className="w-7 h-7 flex-shrink-0 bg-emerald-500 text-white rounded-full flex items-center justify-center p-0.5 border border-emerald-400 text-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.3)] mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex-1 py-1">
                  <div className="space-y-2">
                    <span className="text-base font-semibold text-slate-800 transition-colors">
                      Registration Date: <span className="font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-sm font-semibold">{whoisResult.whois?.creationDate || 'N/A'}</span>
                    </span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-base font-semibold text-slate-800 transition-colors">
                      Expiration Date: <span className="font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-sm font-semibold">{whoisResult.whois?.registrarRegistrationExpirationDate || 'N/A'}</span>
                    </span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-base font-semibold text-slate-800 transition-colors">
                      Last Updated: <span className="font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-sm font-semibold">{whoisResult.whois?.updatedDate || 'N/A'}</span>
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-4 hover:bg-slate-50 p-2 -m-2 rounded-lg transition-colors group"
              >
                <div className="w-7 h-7 flex-shrink-0 bg-emerald-500 text-white rounded-full flex items-center justify-center p-0.5 border border-emerald-400 text-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.3)] mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex-1 py-1">
                  <span className="text-base font-semibold text-slate-800 transition-colors">
                    Domain Status: 
                  </span>
                  <div className="mt-2 space-y-1">
                    {whoisResult.whois?.domainStatus ? (
                      whoisResult.whois.domainStatus.split(' ').map((status: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            ●
                          </div>
                          <span className="text-xs font-mono break-all">{status.split('(')[0]}</span>
                        </div>
                      ))
                    ) : []}
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="flex items-start gap-4 hover:bg-slate-50 p-2 -m-2 rounded-lg transition-colors group"
              >
                <div className="w-7 h-7 flex-shrink-0 bg-emerald-500 text-white rounded-full flex items-center justify-center p-0.5 border border-emerald-400 text-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.3)] mt-0.5">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 py-1">
                  <div className="space-y-2">
                    <span className="text-base font-semibold text-slate-800 transition-colors">
                      Registrar Abuse Contact: <span className="font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-sm font-semibold">{whoisResult.whois?.registrarAbuseContact || 'N/A'}</span>
                    </span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-base font-semibold text-slate-800 transition-colors">
                      Abuse Phone: <span className="font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-sm font-semibold">{whoisResult.whois?.registrarAbuseContactPhone || 'N/A'}</span>
                    </span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-base font-semibold text-slate-800 transition-colors">
                      Name Servers: 
                    </span>
                    <div className="mt-1 space-y-1">
                      {whoisResult.whois?.nameServer ? whoisResult.whois.nameServer.split(' ').map((ns: string, index: number) => (
                        <span key={index} className="inline-block bg-indigo-50 text-indigo-800 px-2 py-1 rounded text-xs font-mono mr-1 mb-1">{ns}</span>
                      )) : []}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-display font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Raw WHOIS Data
                </span>
              </div>
              <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs whitespace-pre-wrap max-h-96 overflow-y-auto">
                {JSON.stringify(whoisResult.whois, null, 2)}
              </div>
            </div>
          </motion.div>
        ) : !whoisLoading && (
          <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl select-none">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3 animate-pulse" style={{ animationDuration: '4s' }} />
            <h4 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider">Awaiting WHOIS query</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
              Enter a domain name above and press Lookup WHOIS to retrieve registration records, registrar information, and important dates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}