import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ChevronDown, 
  XCircle, 
  CheckCircle, 
  AlertTriangle, 
  Lock, 
  Globe, 
  HelpCircle,
  FileCheck2,
  RefreshCw
} from 'lucide-react';

interface SecurityAuditorProps {
  domain: string;
  onAddAlert?: (type: 'success' | 'warning' | 'error' | 'info', title: string, desc: string) => void;
}

interface AuditClause {
  id: string;
  title: string;
  status: 'pass' | 'warning' | 'fail';
  summary: string;
  details: string;
  recommendation: string;
}

export default function SecurityAuditor({ domain, onAddAlert }: SecurityAuditorProps) {
  const [expandedClause, setExpandedClause] = useState<string | null>(null);
  const [testingProgress, setTestingProgress] = useState(0);
  const [isAuditing, setIsAuditing] = useState(false);

  // List of security clauses
  const [clauses, setClauses] = useState<AuditClause[]>([
    {
      id: 'spf',
      title: 'Sender Policy Framework (SPF)',
      status: 'pass',
      summary: 'Verified active: v=spf1 include:_spf.google.com ~all',
      details: 'Evaluated SPF configuration safely prevents domain forgery. Restricts outbound mail authorized relays exclusively to Google Cloud Workspace servers.',
      recommendation: 'Periodically monitor third-party marketing services to avoid SPF chain lookup depth overreaching the maximum standard sequence size of 10.'
    },
    {
      id: 'dmarc',
      title: 'DMARC Policy Compliance',
      status: 'warning',
      summary: 'Policy level set to "none" rather than explicit "quarantine" or "reject"',
      details: 'Identified passive reporting configuration (p=none) is active. Legitimate mail hubs can deliver failed spoof queries to users inboxes while sending reporting telemetry details back.',
      recommendation: 'Safeguard domain identity by upgrading to "p=quarantine" with subtle percentage levels before locking down completely as "p=reject".'
    },
    {
      id: 'dnssec',
      title: 'Domain Name System Security Extensions (DNSSEC)',
      status: 'pass',
      summary: 'Valid cryptographically signed DS anchor mapped on root registry servers',
      details: 'RRSIG signature matches are successfully attached, providing defense-in-depth against DNS spoofing, hijacking, and cache poisoning attempts.',
      recommendation: 'Ensure your registry automatic rollover algorithms utilize SHA-256 digests rather than older SHA-1 algorithms.'
    },
    {
      id: 'ssl',
      title: 'TLS Protocol Constraints',
      status: 'pass',
      summary: 'Only authentic secure modern TLS v1.2 and v1.3 protocols permitted',
      details: 'Legacy insecure SSLv3, TLS v1.0, and TLS v1.1 algorithms have been successfully deprecated at the socket interface level, avoiding POODLE/BEAST attacks.',
      recommendation: 'Configure HSTS (HTTP Transport Security Headers) to lock browsers into HTTPS and strictly prevent protocol down-version attempts.'
    },
    {
      id: 'caa',
      title: 'Certification Authority Authorization (CAA)',
      status: 'fail',
      summary: 'No CAA records published in the zone directory',
      details: 'Missing restriction logs. Any authenticated Certificate Authority (including unauthorized or compromised providers) can legally issue leaf credentials for your domain target.',
      recommendation: 'Add standard CAA records (e.g. "issue letsencrypt.org; issue digicert.com") to specify exactly who can issue certificates.'
    }
  ]);

  const handleToggleClause = (id: string) => {
    setExpandedClause(expandedClause === id ? null : id);
  };

  const handleSimulateAudit = () => {
    if (isAuditing) return;
    setIsAuditing(true);
    setTestingProgress(0);

    const interval = setInterval(() => {
      setTestingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAuditing(false);
          if (onAddAlert) {
            onAddAlert(
              'warning',
              'Security Scan Completed',
              `Total score updated to 88/100. SPF passes but CAA records are still missing on ${domain}.`
            );
          }
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const scoreValue = 88; // Score out of 100

  return (
    <div id="security-auditor-wrapper" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left section: Score Meter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-display font-bold text-slate-400 uppercase tracking-widest">
              Audit Scopes
            </h4>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 font-mono font-bold px-2 py-0.5 rounded uppercase">
              Real-time
            </span>
          </div>

          <p className="text-slate-500 text-xs font-sans mb-6 font-medium leading-relaxed uppercase tracking-tight">
            Security audit scanning protocol SPF, DMARC compliance, HSTS headers, and DNSSEC signatures on {domain}.
          </p>
        </div>

        {/* Beautiful Animated SVG Gauge */}
        <div className="my-3 flex flex-col items-center justify-center relative">
          <svg className="w-36 h-36 transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r="60"
              className="stroke-slate-100"
              strokeWidth="10"
              fill="transparent"
            />
            <motion.circle
              cx="72"
              cy="72"
              r="60"
              className="stroke-indigo-600"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={376.8}
              initial={{ strokeDashoffset: 376.8 }}
              animate={{ 
                strokeDashoffset: isAuditing 
                  ? 376.8 - (376.8 * testingProgress) / 100 
                  : 376.8 - (376.8 * scoreValue) / 100 
              }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center">
            <span className="block text-3xl font-display font-extrabold text-slate-900 tracking-tighter">
              {isAuditing ? `${testingProgress}%` : scoreValue}
            </span>
            <span className="block text-[9px] font-mono font-extrabold text-slate-450 uppercase tracking-wider">
              {isAuditing ? 'Auditing...' : 'Security index'}
            </span>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100">
          <button
            type="button"
            disabled={isAuditing}
            onClick={handleSimulateAudit}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs py-3 rounded-xl transition-all uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow"
          >
            {isAuditing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning records...</span>
              </>
            ) : (
              <>
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Re-Audit Crypt Credentials</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Section: Interactive checkpoint clauses list */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <h4 className="text-xs font-display font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600" />
            Security posturings checklist
          </h4>
          <span className="text-[10px] font-mono text-slate-400 font-bold">
            {clauses.filter(c => c.status === 'pass').length} / {clauses.length} PASSED
          </span>
        </div>

        <div className="space-y-3.5 flex-1 min-w-0">
          {clauses.map((clause) => {
            const isExpanded = expandedClause === clause.id;
            
            return (
              <div 
                key={clause.id}
                className={`border rounded-xl transition-all ${
                  isExpanded ? 'border-slate-300 bg-slate-50/50' : 'border-slate-150 hover:bg-slate-50'
                }`}
              >
                {/* Header Row */}
                <button
                  type="button"
                  onClick={() => handleToggleClause(clause.id)}
                  className="w-full text-left p-4 flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {clause.status === 'pass' && (
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    )}
                    {clause.status === 'warning' && (
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                    )}
                    {clause.status === 'fail' && (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                    
                    <div className="min-w-0">
                      <h5 className="text-[12px] font-bold text-slate-800 uppercase tracking-tight">{clause.title}</h5>
                      <span className="text-[10px] text-slate-500 font-medium font-sans block truncate">{clause.summary}</span>
                    </div>
                  </div>

                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-slate-400 hover:text-slate-700 font-semibold"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                {/* Expanded content */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden border-t border-slate-200/80"
                    >
                      <div className="p-4 bg-white/60 space-y-3 font-sans text-xs text-slate-600">
                        <div>
                          <strong className="text-slate-400 font-semibold uppercase text-[9px] tracking-wide block mb-1">Detailed Crypt Verification</strong>
                          <p className="leading-relaxed font-normal">{clause.details}</p>
                        </div>
                        <div className="bg-amber-50/45 p-3 rounded-lg border border-amber-100/50">
                          <strong className="text-amber-700 font-bold uppercase text-[9px] tracking-wider block mb-1">SysAdmin Remediation Advice</strong>
                          <p className="text-[11px] leading-relaxed text-amber-900 font-medium">{clause.recommendation}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
