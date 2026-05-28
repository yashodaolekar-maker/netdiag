import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, Globe, HelpCircle, Info, RefreshCw, Layers, Shield, FileSpreadsheet, Server, Search } from 'lucide-react';

interface CalculationResult {
  ipAddress: string;
  cidr: number;
  subnetMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsable: string;
  lastUsable: string;
  totalHosts: number;
  ipBinary: string;
  maskBinary: string;
  classType: string;
}

export default function SubnetCalculator() {
  const [ip, setIp] = useState('192.168.1.1');
  const [cidr, setCidr] = useState(24);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Parse IP logic and compute subnet details securely
  const calculateSubnet = (targetIp: string, targetCidr: number) => {
    try {
      setError(null);
      const ipParts = targetIp.split('.').map(Number);
      if (ipParts.length !== 4 || ipParts.some(p => isNaN(p) || p < 0 || p > 255)) {
        throw new Error('Please input a valid IPv4 address (e.g. 192.168.1.1)');
      }

      const cidrNum = Number(targetCidr);
      if (isNaN(cidrNum) || cidrNum < 0 || cidrNum > 32) {
        throw new Error('CIDR suffix must be a integer between 0 and 32');
      }

      // Convert IP to a 32-bit unsigned integer
      const ipUint32 = (ipParts[0] << 24) >>> 0 |
                       (ipParts[1] << 16) >>> 0 |
                       (ipParts[2] << 8)  >>> 0 |
                       (ipParts[3])       >>> 0;

      // Create netmask from CIDR
      const maskUint32 = targetCidr === 0 ? 0 : (~0 << (32 - targetCidr)) >>> 0;

      // Compute Network and Broadcast addresses
      const networkUint32 = (ipUint32 & maskUint32) >>> 0;
      const broadcastUint32 = (networkUint32 | ~maskUint32) >>> 0;

      // Helper function to convert integer back to dotted IP string
      const uint32ToIp = (val: number) => [
        (val >>> 24) & 255,
        (val >>> 16) & 255,
        (val >>> 8) & 255,
        val & 255
      ].join('.');

      // Helpers to convert integer to binary string
      const uint32ToBinary = (val: number) => {
        const bin = val.toString(2).padStart(32, '0');
        return [
          bin.slice(0, 8),
          bin.slice(8, 16),
          bin.slice(16, 24),
          bin.slice(24, 32)
        ].join('.');
      };

      // Class calculation
      let classType = 'Experimental / Multicast (Class D/E)';
      const firstOctet = ipParts[0];
      if (firstOctet >= 1 && firstOctet <= 126) {
        classType = 'Class A (Unicast)';
      } else if (firstOctet === 127) {
        classType = 'Loopback Network (Localhost)';
      } else if (firstOctet >= 128 && firstOctet <= 191) {
        classType = 'Class B (Unicast)';
      } else if (firstOctet >= 192 && firstOctet <= 223) {
        classType = 'Class C (Unicast)';
      }

      // Determine Usable range
      let firstUsable = 'N/A';
      let lastUsable = 'N/A';
      let totalHosts = 0;

      if (targetCidr === 31) {
        firstUsable = uint32ToIp(networkUint32);
        lastUsable = uint32ToIp(broadcastUint32);
        totalHosts = 2; // RFC 3021 Point-to-Point
      } else if (targetCidr === 32) {
        firstUsable = uint32ToIp(networkUint32);
        lastUsable = uint32ToIp(networkUint32);
        totalHosts = 1; // Host route
      } else {
        firstUsable = uint32ToIp(networkUint32 + 1);
        lastUsable = uint32ToIp(broadcastUint32 - 1);
        totalHosts = (broadcastUint32 - networkUint32) - 1;
      }

      setResult({
        ipAddress: targetIp,
        cidr: targetCidr,
        subnetMask: uint32ToIp(maskUint32),
        networkAddress: uint32ToIp(networkUint32),
        broadcastAddress: uint32ToIp(broadcastUint32),
        firstUsable,
        lastUsable,
        totalHosts,
        ipBinary: uint32ToBinary(ipUint32),
        maskBinary: uint32ToBinary(maskUint32),
        classType
      });

    } catch (err: any) {
      setError(err.message);
      setResult(null);
    }
  };

  useEffect(() => {
    calculateSubnet(ip, cidr);
  }, [ip, cidr]);

  const handleQuickPreset = (presetIp: string, presetCidr: number) => {
    setIp(presetIp);
    setCidr(presetCidr);
  };

  return (
    <div id="subnet-calculator-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column: Form & Inputs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 pb-1 border-b border-slate-100">
            <h4 className="text-xs font-display font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-indigo-600 animate-pulse" />
              IPv4 Address Input
            </h4>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded font-mono uppercase">
              CIDR Subnetting
            </span>
          </div>

          <p className="text-slate-500 text-xs font-sans mb-6 font-medium leading-relaxed uppercase tracking-tight">
            Calculate subnets, ip pools, aggregate networks, host margins, or wildcards for router access rule configs.
          </p>

          <div className="space-y-4">
            {/* IP Input */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">
                IPv4 IP Address
              </label>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="e.g. 192.168.1.1"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
              />
            </div>

            {/* Slider / Suffix Mask Selection */}
            <div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider mb-1.5 font-mono">
                <span className="text-slate-400">CIDR suffix mask</span>
                <span className="text-indigo-600">/{cidr}</span>
              </div>
              <input
                type="range"
                min="0"
                max="32"
                value={cidr}
                onChange={(e) => setCidr(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1 font-bold">
                <span>/0</span>
                <span>/8 (Class A)</span>
                <span>/16 (Class B)</span>
                <span>/24 (Class C)</span>
                <span>/32</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preset quick test templates */}
        <div className="mt-8 pt-5 border-t border-slate-100 space-y-3">
          <span className="text-[9px] font-mono font-extrabold text-slate-400 uppercase tracking-widest block">Standard sandbox templates</span>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => handleQuickPreset('10.0.0.1', 8)}
              className="px-3 py-2 border border-slate-150 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer text-left font-mono truncate"
            >
              10.0.0.1 /8
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('172.16.20.100', 16)}
              className="px-3 py-2 border border-slate-150 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer text-left font-mono truncate"
            >
              172.16.20.100 /16
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('192.168.1.1', 24)}
              className="px-3 py-2 border border-slate-150 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer text-left font-mono truncate"
            >
              192.168.1.1 /24
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('192.168.50.33', 29)}
              className="px-3 py-2 border border-slate-150 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer text-left font-mono truncate"
            >
              192.168.50.33 /29
            </button>
          </div>
        </div>
      </div>

      {/* Main calculation display area: Right Columns (span 2) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Error notification banner if input malformed */}
        {error && (
          <div className="bg-rose-50 border border-rose-150/70 text-rose-800 p-4 rounded-xl flex items-center gap-3.5 text-xs font-semibold">
            <Info className="w-5 h-5 text-rose-500 shrink-0" />
            <p className="truncate font-sans">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            
            {/* Primary Grid Specifications Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 text-indigo-400 p-4.5 rounded-2xl shadow-sm flex flex-col justify-between h-[115px]">
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-mono">Subnet mask quad</div>
                <div className="text-xl font-display font-extrabold text-white tracking-tight">{result.subnetMask}</div>
                <div className="text-[10px] font-mono text-indigo-300 font-semibold">Active Bits: {result.cidr} of 32</div>
              </div>

              <div className="bg-white border border-slate-200 p-4.5 rounded-2xl shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all h-[115px]">
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-mono">Calculated Usable IP Pool</div>
                <div className="text-xl font-display font-extrabold text-slate-800 tracking-tight">{result.totalHosts.toLocaleString()}</div>
                <div className="text-[10px] font-mono text-slate-450 font-bold">Total host allocations</div>
              </div>
            </div>

            {/* Subnet details table ledger */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-[10px] uppercase font-display font-bold text-slate-900 tracking-wider flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-indigo-500" />
                  Address configuration summary
                </span>
                <span className="text-[9px] font-mono text-indigo-600 font-extrabold bg-indigo-50 border border-indigo-100/40 px-2 py-0.5 rounded uppercase">
                  {result.classType}
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-slate-400 font-semibold uppercase font-mono text-[10px] tracking-wider shrink-0 w-44">Network Prefix IP:</span>
                  <span className="font-mono text-slate-800 font-extrabold tracking-tight select-all text-right">{result.networkAddress}</span>
                </div>
                
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-slate-400 font-semibold uppercase font-mono text-[10px] tracking-wider shrink-0 w-44">BroadCast Border IP:</span>
                  <span className="font-mono text-slate-800 font-extrabold tracking-tight select-all text-right">{result.broadcastAddress}</span>
                </div>

                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-indigo-50/20">
                  <span className="text-indigo-600 font-semibold uppercase font-mono text-[10px] tracking-wider shrink-0 w-41">Usable address margins:</span>
                  <span className="font-mono text-indigo-850 font-extrabold tracking-tight select-all text-right">
                    {result.firstUsable} <span className="text-slate-400 font-normal">thru</span> {result.lastUsable}
                  </span>
                </div>
              </div>
            </div>

            {/* Binary conversion diagnostics visually pleasing blocks */}
            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 shadow-xl text-white font-mono text-[11px] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Bit-Level Register Mapping</span>
                <span className="text-[9.5px] text-indigo-400 uppercase font-bold">32-Bit Unsigned integer</span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-450 font-semibold">
                    <span>Host IPv4 Bits</span>
                    <span>{result.ipAddress}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-850 text-indigo-400 font-extrabold flex justify-center tracking-wider hover:bg-slate-900/60 transition-colors text-center">
                    {result.ipBinary}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-450 font-semibold">
                    <span>Subnet Mask Bits</span>
                    <span>/{result.cidr} Mask</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-850 text-emerald-400 font-extrabold flex justify-center tracking-wider hover:bg-slate-900/60 transition-colors text-center">
                    {result.maskBinary}
                  </div>
                </div>
              </div>

              <div className="text-[9px] text-slate-500 font-sans leading-normal uppercase">
                * Zero bits represent private host address assignments; One-filled high-bits identify prefix route paths.
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
