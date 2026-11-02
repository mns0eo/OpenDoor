"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Toast = { id: number; message: string; tone: "success" | "error" };
const ToastContext = createContext<(message: string, tone?: Toast["tone"]) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-20 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex animate-fade-up items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-lift",
              t.tone === "success" ? "bg-navy text-white" : "bg-red-600 text-white",
            )}
          >
            {t.tone === "success" ? <CheckCircle2 className="h-4 w-4 text-teal" /> : <AlertCircle className="h-4 w-4" />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
