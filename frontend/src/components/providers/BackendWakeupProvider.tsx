"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Shield, Cpu, CheckCircle, Wifi, AlertTriangle } from "lucide-react";

import { usePathname } from "next/navigation";

interface BackendWakeupContextType {
  isAwake: boolean;
}

const BackendWakeupContext = createContext<BackendWakeupContextType>({ isAwake: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface LogEntry {
  text: string;
  type: "info" | "success" | "warn" | "error";
  timestamp: string;
}

export function BackendWakeupProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isAwake, setIsAwake] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [dotCount, setDotCount] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [pingFailedCount, setPingFailedCount] = useState(0);

  const formatTime = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}.${d
      .getMilliseconds()
      .toString()
      .padStart(3, "0")}`;
  };

  const addLog = (text: string, type: "info" | "success" | "warn" | "error" = "info") => {
    setLogs((prev) => [...prev, { text, type, timestamp: formatTime() }]);
  };

  // DOTS animation while connecting
  useEffect(() => {
    if (!isConnecting || isAwake) return;
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, [isConnecting, isAwake]);

  // Main wakeup loop on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Skip visual loader if entering on a subpage directly
    if (pathname !== "/") {
      setIsAwake(true);
      setShowOverlay(false);
      // Silent background wake-up ping
      fetch(`${API_URL}/api/v1/health`).catch(() => {});
      return;
    }

    // Check if backend was already marked as awake in this browser session
    const wasAwoken = sessionStorage.getItem("backend_was_woken") === "true";
    if (wasAwoken) {
      setIsAwake(true);
      setShowOverlay(false);
      return;
    }

    let isSubscribed = true;
    let timeoutId: NodeJS.Timeout;

    const startWakeupProcess = async () => {
      addLog("Initializing secure handshake protocols...", "info");
      await new Promise((r) => setTimeout(r, 600));

      addLog("Verifying integrity signatures... [OK]", "success");
      await new Promise((r) => setTimeout(r, 650));

      addLog("Initializing local sandbox modules... [OK]", "success");
      await new Promise((r) => setTimeout(r, 500));

      addLog("Establishing secure uplink connection...", "info");
      setIsConnecting(true);

      const checkHealth = async () => {
        if (!isSubscribed) return;

        try {
          const res = await fetch(`${API_URL}/api/v1/health`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });

          if (res.ok) {
            setIsConnecting(false);
            addLog("Secure handshake verified. Connection established.", "success");
            await new Promise((r) => setTimeout(r, 500));
            addLog("Node active. Decrypting main dashboard...", "success");
            await new Promise((r) => setTimeout(r, 800));

            if (isSubscribed) {
              sessionStorage.setItem("backend_was_woken", "true");
              setIsAwake(true);
              // Wait for fadeout animation before destroying overlay
              setTimeout(() => {
                if (isSubscribed) setShowOverlay(false);
              }, 600);
            }
          } else {
            handleRetry();
          }
        } catch (err) {
          handleRetry();
        }
      };

      const handleRetry = () => {
        if (!isSubscribed) return;
        setPingFailedCount((prev) => {
          const next = prev + 1;
          if (next === 4) {
            addLog("Core node is currently inactive. Launching remote boot trigger...", "warn");
          } else if (next > 4 && next % 6 === 0) {
            addLog("Waking up central node... This may take up to 45 seconds to initialize.", "warn");
          }
          return next;
        });

        timeoutId = setTimeout(checkHealth, 2000);
      };

      checkHealth();
    };

    startWakeupProcess();

    return () => {
      isSubscribed = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <BackendWakeupContext.Provider value={{ isAwake }}>
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex flex-col bg-[#0B0B0F] text-emerald-400 font-mono p-6 sm:p-12 overflow-hidden select-none"
          >
            {/* CRT monitor scanlines overlay */}
            <div
              className="absolute inset-0 pointer-events-none z-10 opacity-[0.18]"
              style={{
                backgroundImage: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.3) 50%)",
                backgroundSize: "100% 4px",
              }}
            />
            
            {/* Ambient retro green/purple glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] bg-emerald-500/10 pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] bg-purple-500/5 pointer-events-none" />

            {/* Header console strip */}
            <div className="flex items-center justify-between border-b border-emerald-950/60 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <Terminal className="w-5 h-5 animate-pulse text-emerald-400" />
                <span className="text-sm font-semibold tracking-wider uppercase text-emerald-300">
                  CS-CLUB DEPLOYMENT CONSOLE
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-500/80">
                <Cpu className="w-4 h-4 animate-spin" />
                <span>SYS_INIT: OK</span>
              </div>
            </div>

            {/* Main scrollable logs list */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 custom-scrollbar text-sm select-text">
              {logs.map((log, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-3"
                >
                  <span className="text-emerald-600/85 shrink-0 select-none">[{log.timestamp}]</span>
                  <div className="flex-1 leading-relaxed">
                    {log.type === "success" && (
                      <span className="inline-flex items-center gap-1 text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        {log.text}
                      </span>
                    )}
                    {log.type === "warn" && (
                      <span className="inline-flex items-center gap-1 text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        {log.text}
                      </span>
                    )}
                    {log.type === "error" && (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        {log.text}
                      </span>
                    )}
                    {log.type === "info" && <span>{log.text}</span>}
                  </div>
                </motion.div>
              ))}

              {/* Loader prompt line */}
              {isConnecting && (
                <div className="flex items-center gap-3 text-emerald-500/85">
                  <span className="text-emerald-600/85 shrink-0 select-none">[{formatTime()}]</span>
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 animate-pulse text-emerald-400" />
                    <span>
                      Connecting to central node database{".".repeat(dotCount)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom console footer */}
            <div className="mt-6 border-t border-emerald-950/60 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-emerald-600">
              <div>
                STATUS: {isAwake ? "ESTABLISHED (SECURE)" : "INITIALIZING STAGE"}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>LISTENING ON PORT 443 / HTTPS</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main website body */}
      <div className={showOverlay ? "hidden" : "block"}>{children}</div>
    </BackendWakeupContext.Provider>
  );
}

export function useBackendWakeup() {
  return useContext(BackendWakeupContext);
}
