import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Send, RefreshCw, Layers, Check, Copy, AlertTriangle } from 'lucide-react';

interface LogEntry {
  id: string;
  time: string;
  scope: 'DNS' | 'TLS' | 'TCP' | 'HTTP' | 'SYSTEM';
  level: 'info' | 'warn' | 'success' | 'debug';
  message: string;
}

interface ConnectionLoggerProps {
  domain: string;
}

export default function ConnectionLogger({ domain }: ConnectionLoggerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunningSim, setIsRunningSim] = useState(false);
  const [logOption, setLogOption] = useState<'all' | 'dns' | 'tls' | 'tcp'>('all');
  const [copied, setCopied] = useState(false);
  const consoleEndRef = useRef<HTMLDivElement | null>(null);

  // Generate initial mock trace logs for the analyzed domain
  useEffect(() => {
    if (!domain) return;
    setLogs([]);
    setIsRunningSim(true);

    let active = true;
    let timerId: any = null;

    const initialSteps = [
      { scope: 'SYSTEM', level: 'info', message: `Initializing Network Intelligence Trace Engine for target: ${domain}` },
      { scope: 'DNS', level: 'info', message: 'Querying root zone nameservers (a.root-servers.net...) for delegation signature' },
      { scope: 'DNS', level: 'success', message: `Authority referral successfully mapped. Local TLD resolved target ${domain}` },
      { scope: 'TCP', level: 'debug', message: `Opening standard TCP raw stream socket to ${domain}:443` },
      { scope: 'TCP', level: 'success', message: 'TCP Syn-Ack received. Round-Trip-Time (RTT): 18.2ms' },
      { scope: 'TLS', level: 'info', message: 'Initiating cryptographic ClientHello over SSL/TLS v1.3 handshake pipeline' },
      { scope: 'TLS', level: 'success', message: 'ALPN negotiation completed. Cipher Suite selected: TLS_AES_256_GCM_SHA384' },
      { scope: 'HTTP', level: 'info', message: `Requesting secure HTTP/2 headers GET / HTTP/2 ...` },
      { scope: 'SYSTEM', level: 'success', message: 'Diagnostic collection completed. Target network channel is certified healthy.' }
    ] as const;

    let index = 0;
    const addNextLog = () => {
      if (!active) return;
      if (index < initialSteps.length) {
        const step = initialSteps[index];
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
        
        setLogs(prev => [
          ...prev,
          {
            id: `${index}-${Date.now()}-${Math.random()}`,
            time: timeStr,
            scope: step.scope,
            level: step.level,
            message: step.message
          }
        ]);
        index++;
        timerId = setTimeout(addNextLog, 180 + Math.random() * 250);
      } else {
        setIsRunningSim(false);
      }
    };

    addNextLog();

    return () => {
      active = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [domain]);

  useEffect(() => {
    // Auto-scroll to bottom of console
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Run a manual Ping / Traceroute simulation
  const runManualTest = (type: 'traceroute' | 'dnssec' | 'ports') => {
    if (isRunningSim) return;
    setIsRunningSim(true);
    
    let steps: { scope: any; level: any; message: string }[] = [];
    
    if (type === 'traceroute') {
      steps = [
        { scope: 'TCP', level: 'info', message: `Starting ICMP ttl-incremented path audit with max 30 hops to ${domain}` },
        { scope: 'TCP', level: 'debug', message: 'Hop 1 [192.168.1.1] Gateway route verified - 0.45ms' },
        { scope: 'TCP', level: 'debug', message: 'Hop 2 [10.0.0.1] Local fiber optical node cluster - 1.10ms' },
        { scope: 'TCP', level: 'debug', message: 'Hop 4 [72.14.231.10] Edge gateway peering trans-pacific - 8.35ms' },
        { scope: 'TCP', level: 'warn', message: 'Hop 8 [216.58.211.23] Congestion alert. Queue buffer filling' },
        { scope: 'TCP', level: 'success', message: `Hop 12 Target host responsive. Connection trace audit completed in 19.1ms` }
      ];
    } else if (type === 'dnssec') {
      steps = [
        { scope: 'DNS', level: 'info', message: `Requesting DNSSEC authentic data validation (AD flag) on ${domain}` },
        { scope: 'DNS', level: 'debug', message: 'Retrieving DNSKEY records from zone root anchor' },
        { scope: 'DNS', level: 'info', message: 'Cryptographically validating RRSIG signatures matching A and MX records' },
        { scope: 'DNS', level: 'success', message: 'Signature validated matching DS record hash digest. Trust anchor validated!' }
      ];
    } else {
      steps = [
        { scope: 'SYSTEM', level: 'info', message: `Scanning standard secure enterprise service sockets for ${domain}...` },
        { scope: 'TCP', level: 'success', message: 'Port 80 (HTTP) -> OPEN (Redirects to TLS)' },
        { scope: 'TCP', level: 'success', message: 'Port 443 (HTTPS) -> OPEN (TLS v1.3 verified)' },
        { scope: 'TCP', level: 'warn', message: 'Port 8080 (ALT-HTTP) -> FILTERED (Firewall block)' },
        { scope: 'TLS', level: 'success', message: 'Port 853 (DNS-over-TLS) -> ACTIVE query path verified' }
      ];
    }

    let i = 0;
    const streamFunc = () => {
      if (i < steps.length) {
        const item = steps[i];
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
        
        setLogs(prev => [
          ...prev,
          {
            id: `manual-${i}-${Date.now()}-${Math.random()}`,
            time: timeStr,
            scope: item.scope,
            level: item.level,
            message: item.message
          }
        ]);
        i++;
        setTimeout(streamFunc, 200 + Math.random() * 200);
      } else {
        setIsRunningSim(false);
      }
    };

    streamFunc();
  };

  const handleCopyLogs = () => {
    const text = logs.map(l => `[${l.time}] [${l.scope}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFilteredLogs = () => {
    return logs.filter(log => {
      if (logOption === 'all') return true;
      if (logOption === 'dns') return log.scope === 'DNS';
      if (logOption === 'tls') return log.scope === 'TLS';
      if (logOption === 'tcp') return log.scope === 'TCP' || log.scope === 'HTTP';
      return true;
    });
  };

  const filteredLogs = getFilteredLogs();

  return (
    <div id="conn-logger-bottom-wrapper" className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-white font-mono flex flex-col h-[400px]">
      
      {/* Console Top Info Bar */}
      <div className="bg-slate-950 px-5 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-indigo-400 font-display font-medium font-semibold tracking-tight">
          <Terminal className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span className="uppercase text-slate-300">Live Tracing Logs</span>
          <span className="text-[10px] text-slate-500 font-mono tracking-normal">target: {domain || 'local'}</span>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
          {(['all', 'dns', 'tls', 'tcp'] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setLogOption(opt)}
              className={`px-2.5 py-1 rounded-md uppercase tracking-wider transition-colors cursor-pointer ${
                logOption === opt 
                  ? 'bg-slate-800 text-indigo-400 font-extrabold' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLogs}
            type="button"
            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer title-tooltip"
            title="Copy entire raw system output"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setLogs([])}
            type="button"
            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Clear logs terminal"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Simulator Quick Action Rails */}
      <div className="bg-slate-950/40 px-5 py-2.5 border-b border-slate-800/60 flex flex-wrap items-center gap-3 text-[10px] font-bold">
        <span className="text-slate-500 uppercase tracking-widest font-sans">Debug simulator tool suite:</span>
        <div className="flex flex-wrap gap-2">
          <button
            disabled={isRunningSim || !domain}
            onClick={() => runManualTest('traceroute')}
            className="bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Run Traceroute Hop Check
          </button>
          <button
            disabled={isRunningSim || !domain}
            onClick={() => runManualTest('dnssec')}
            className="bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-400 px-3 py-1 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Verify DNSSEC DS Hash Link
          </button>
          <button
            disabled={isRunningSim || !domain}
            onClick={() => runManualTest('ports')}
            className="bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Fast-Scan Listening Port Matrix
          </button>
        </div>
        {isRunningSim && (
          <div className="ml-auto flex items-center gap-1 text-indigo-400 animate-pulse font-mono font-bold text-[9px] uppercase tracking-wider">
            <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Gathering...
          </div>
        )}
      </div>

      {/* Main Terminal Window Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-2 select-text custom-scrollbar bg-slate-950/80">
        <AnimatePresence initial={false}>
          {filteredLogs.map((log) => {
            const scopeStyles = log.scope === 'DNS' ? 'text-indigo-400 bg-indigo-950/50 hover:bg-indigo-950' :
                                log.scope === 'TLS' ? 'text-purple-400 bg-purple-950/50 hover:bg-purple-950' :
                                log.scope === 'TCP' ? 'text-blue-400 bg-blue-950/50 hover:bg-blue-950' :
                                log.scope === 'HTTP' ? 'text-sky-400 bg-sky-950/50 hover:bg-sky-950' :
                                                     'text-slate-400 bg-slate-900/55 hover:bg-slate-900';

            const levelStyles = log.level === 'success' ? 'text-emerald-400' :
                                log.level === 'warn' ? 'text-amber-400 font-bold' :
                                log.level === 'error' ? 'text-rose-400 font-bold' :
                                                      'text-slate-200';

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-start gap-3.5 py-0.5 text-xs hover:bg-slate-900/40 -mx-2 px-2 rounded transition-colors group"
              >
                {/* Milliseconds timestamp */}
                <span className="text-slate-600 text-[10px] shrink-0 font-mono select-none pt-0.5">{log.time}</span>

                {/* Tagged Scope Badge */}
                <span className={`px-1.5 py-0.5 rounded text-[9px] shrink-0 font-bold ${scopeStyles} transition-colors uppercase tracking-tight select-none`}>
                  {log.scope}
                </span>

                {/* Printout Message */}
                <span className={`leading-relaxed break-all flex-1 ${levelStyles}`}>
                  {log.level === 'warn' && <AlertTriangle className="w-3 h-3 inline-block mr-1 text-amber-400" />}
                  {log.message}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {filteredLogs.length === 0 && (
          <div className="h-full flex flex-col justify-center items-center text-slate-600 py-12 select-none">
            <Terminal className="w-8 h-8 text-slate-800 mb-2" />
            <p className="text-[11px] font-sans">No stream traces match the filter configuration criteria.</p>
          </div>
        )}
        <div ref={consoleEndRef} />
      </div>

    </div>
  );
}
