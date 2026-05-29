import React from 'react';
import { motion } from 'motion/react';
import { Network, Search, Shield, Globe, Activity } from 'lucide-react';

export default function NetworkScannerSplash() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900 overflow-hidden">
      {/* Background Animation Elements */}
      <div className="absolute inset-0">
        <motion.div 
          animate={{ 
            x: [0, 40, 0], 
            y: [0, -45, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, -30, 0], 
            y: [0, 35, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-5%] right-[-10%] w-[35%] h-[35%] bg-emerald-500/10 rounded-full blur-[80px]" 
        />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlIiB0aWxlPSJub25lIiBzdHJva2U9IiMyZDNzNCIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjA1Ij48cGF0aCBkPSJNMCAwTDAgMTAwIiBmaWxsPSJub25lIi8+PHBhdGggZD0iMCAwTDAgMTAwIiBmaWxsPSJub25lIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoIzJkM2RzNCkiLz48L3N2Zz4=')] opacity-10"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        
        {/* Animated Logo/Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-24 h-24 mx-auto mb-8"
        >
          <div className="absolute inset-0 rounded-2xl bg-indigo-600/20 flex items-center justify-center">
            <Network className="w-12 h-12 text-indigo-400" />
          </div>
          
          {/* Orbiting elements */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute -top-2 -left-2 w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-2 -right-2 w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"
          />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight mb-2">
            AI <span className="text-indigo-400">Network</span> Scanner
          </h1>
          <p className="text-slate-400 text-sm uppercase tracking-widest font-mono">
            Intelligent Network Diagnostics & Security Analysis
          </p>
        </motion.div>

        {/* Scanning Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10 space-y-4"
        >
          <div className="flex items-center justify-center gap-3 text-xs font-mono text-slate-500 uppercase tracking-wider">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Search className="w-4 h-4 text-indigo-400" />
            </motion.div>
            <span>Initializing network protocols...</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full max-w-xs mx-auto h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500"
            />
          </div>
          
          {/* Status Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-xs text-slate-500 font-mono mt-2"
          >
            Loading diagnostic modules...
          </motion.p>
        </motion.div>

        {/* Feature Icons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
          className="mt-12 flex items-center justify-center gap-6 text-slate-500"
        >
          <div className="text-center">
            <Shield className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
            <span className="text-[10px] uppercase font-mono">Security</span>
          </div>
          <div className="text-center">
            <Globe className="w-5 h-5 mx-auto mb-1 text-blue-400" />
            <span className="text-[10px] uppercase font-mono">Network</span>
          </div>
          <div className="text-center">
            <Activity className="w-5 h-5 mx-auto mb-1 text-amber-400" />
            <span className="text-[10px] uppercase font-mono">Analysis</span>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="absolute bottom-6 text-center text-slate-500 text-[10px] font-mono uppercase tracking-widest"
      >
        <p>NetDiag Platform v4.6.2</p>
        <p className="mt-1">Initializing...</p>
      </motion.div>
    </div>
  );
}