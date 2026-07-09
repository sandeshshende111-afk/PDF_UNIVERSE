"use client";
/**
 * PDFUniverse — Shared UI Components
 * src/components/ui/
 *
 * Exports:
 *  • UploadZone
 *  • ProgressBar
 *  • DownloadButton
 *  • PlanBadge
 *  • ToolCard
 *  • StatsBar
 */

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Upload, CheckCircle, Download, RefreshCw,
  CloudLightning, HardDrive, AlertCircle, Star,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// UploadZone — drag-drop file upload with cloud integrations
// ═══════════════════════════════════════════════════════════

interface UploadZoneProps {
  onFilesSelected  : (files: File[]) => void;
  multiple?        : boolean;
  accept?          : Record<string, string[]>;
  maxSizeMB?       : number;
  label?           : string;
  className?       : string;
}

export function UploadZone({
  onFilesSelected,
  multiple   = false,
  accept     = { "application/pdf": [".pdf"] },
  maxSizeMB  = 50,
  label      = "Drop PDF files here or click to browse",
  className,
}: UploadZoneProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[], rejected: any[]) => {
    setError(null);
    if (rejected.length > 0) {
      const reason = rejected[0].errors[0]?.message || "File rejected";
      setError(reason);
      return;
    }
    onFilesSelected(accepted);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    accept,
    maxSize: maxSizeMB * 1024 * 1024,
  });

  return (
    <div className={cn("space-y-3", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 group",
          isDragActive
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 scale-[1.01]"
            : "border-slate-200 dark:border-white/[0.12] bg-slate-50/50 dark:bg-white/[0.02] hover:border-indigo-400 dark:hover:border-indigo-500/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20"
        )}
      >
        <input {...getInputProps()} />

        {/* Animated background blob */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className={cn(
            "absolute -inset-4 bg-gradient-radial from-indigo-500/10 to-transparent blur-2xl transition-opacity duration-500",
            isDragActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"
          )} />
        </div>

        <div className="relative flex flex-col items-center gap-4">
          <motion.div
            animate={isDragActive ? { scale: 1.15, rotate: -8 } : { scale: 1, rotate: 0 }}
            className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-500"
          >
            <Upload size={26} strokeWidth={1.8} />
          </motion.div>

          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200 text-base">
              {isDragActive ? "Release to upload" : label}
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
              Supports PDF, Word, Excel, PPT, images · Max {maxSizeMB}MB {multiple ? "· Multiple files" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 text-sm"
          >
            <AlertCircle size={15} className="flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cloud source buttons */}
      <div className="flex gap-2.5 justify-center">
        {[
          { label: "Google Drive", icon: "🗂️" },
          { label: "Dropbox",      icon: "📦" },
          { label: "OneDrive",     icon: "☁️" },
        ].map(s => (
          <button
            key={s.label}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/[0.10] bg-white dark:bg-white/[0.04] hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
          >
            <span>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ProgressBar — animated processing progress
// ═══════════════════════════════════════════════════════════

interface ProgressBarProps {
  progress  : number;   // 0–100
  label?    : string;
  sublabel? : string;
}

export function ProgressBar({ progress, label = "Processing…", sublabel }: ProgressBarProps) {
  const p = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="space-y-3">
      <div className="p-8 rounded-2xl border border-slate-200 dark:border-white/[0.10] bg-white dark:bg-white/[0.02] text-center space-y-5">
        {/* Animated icon */}
        <div className="flex justify-center">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900/40" />
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-indigo-500 border-r-transparent border-b-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <CloudLightning
              size={20}
              className="absolute inset-0 m-auto text-indigo-500"
            />
          </div>
        </div>

        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-200">{label}</p>
          {sublabel && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{sublabel}</p>}
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-500">
            <span>Progress</span>
            <span className="text-indigo-500">{Math.round(p)}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-white/[0.08] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
              initial={{ width: 0 }}
              animate={{ width: `${p}%` }}
              transition={{ ease: "easeOut", duration: 0.3 }}
            />
          </div>
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500">
          🔒 Your file is encrypted. Auto-deleted in 1 hour.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DownloadButton — result card with download + reset
// ═══════════════════════════════════════════════════════════

interface DownloadButtonProps {
  url       : string;
  filename  : string;
  meta?     : { label: string; value: string }[];
  onReset   : () => void;
}

export function DownloadButton({ url, filename, meta = [], onReset }: DownloadButtonProps) {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href     = url;
    a.download = filename;
    a.click();
    setDownloaded(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-8 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30 text-center space-y-5"
    >
      {/* Success icon */}
      <div className="flex justify-center">
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-500"
        >
          <CheckCircle size={28} strokeWidth={2} />
        </motion.div>
      </div>

      <div>
        <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">Done! Your file is ready.</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Available for 1 hour · Secured with AES-256
        </p>
      </div>

      {/* Metadata row */}
      {meta.length > 0 && (
        <div className="flex justify-center gap-6 py-3 border-y border-emerald-100 dark:border-emerald-900/40">
          {meta.map(m => (
            <div key={m.label} className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">{m.label}</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm mt-0.5">{m.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95"
        >
          <Download size={16} />
          {downloaded ? "Download Again" : "Download File"}
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-3 border border-slate-200 dark:border-white/[0.12] text-slate-600 dark:text-slate-300 font-semibold text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-all"
        >
          <RefreshCw size={14} />
          Process Another
        </button>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// PlanBadge — inline Pro/Free badge
// ═══════════════════════════════════════════════════════════

export function PlanBadge({ plan }: { plan: "free" | "pro" | "team" }) {
  const configs = {
    free : { label: "Free",  className: "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400" },
    pro  : { label: "Pro",   className: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" },
    team : { label: "Team",  className: "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400" },
  };
  const cfg = configs[plan];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-700 tracking-wide uppercase", cfg.className)}>
      {plan === "pro" && <Star size={9} fill="currentColor" />}
      {cfg.label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════
// ToolCard — grid card for the tools listing
// ═══════════════════════════════════════════════════════════

interface Tool {
  id    : string;
  label : string;
  desc  : string;
  color : string;
  icon  : React.ComponentType<{ size?: number; strokeWidth?: number }>;
  pro?  : boolean;
  cat   : string;
}

interface ToolCardProps {
  tool    : Tool;
  href    : string;
}

export function ToolCard({ tool, href }: ToolCardProps) {
  return (
    <motion.a
      href={href}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className="group relative flex flex-col gap-4 p-5 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#161b2e] hover:border-opacity-60 hover:shadow-lg transition-all duration-200 cursor-pointer"
      style={{
        // Dynamic border color on hover via CSS variable
        ["--hover-color" as any]: tool.color,
      }}
    >
      {/* Pro badge */}
      {tool.pro && (
        <span className="absolute top-3.5 right-3.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 uppercase tracking-wide">
          PRO
        </span>
      )}

      {/* Icon */}
      <div
        className="w-11 h-11 rounded-[12px] flex items-center justify-center transition-transform group-hover:scale-110 duration-200"
        style={{ background: tool.color + "1a", color: tool.color }}
      >
        <tool.icon size={22} strokeWidth={1.8} />
      </div>

      {/* Content */}
      <div>
        <p className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1.5">{tool.label}</p>
        <p className="text-[12.5px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{tool.desc}</p>
      </div>

      {/* Hover indicator */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ boxShadow: `inset 0 0 0 1.5px ${tool.color}55` }}
      />
    </motion.a>
  );
}

// ═══════════════════════════════════════════════════════════
// StatsBar — homepage stat counter row
// ═══════════════════════════════════════════════════════════

const STATS = [
  { val: "12M+",  label: "PDFs Processed" },
  { val: "98.9%", label: "Uptime SLA"     },
  { val: "180+",  label: "Countries"      },
  { val: "4.9★",  label: "User Rating"    },
];

export function StatsBar() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
      {STATS.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.08, duration: 0.5, ease: "easeOut" }}
          className="text-center py-5 px-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#161b2e] shadow-sm"
        >
          <p className="text-3xl font-black tracking-tight bg-gradient-to-br from-indigo-500 to-violet-500 bg-clip-text text-transparent">
            {s.val}
          </p>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5">{s.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// src/lib/utils.ts — cn() helper
// ═══════════════════════════════════════════════════════════
/*
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 B";
  const k    = 1024;
  const dm   = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i    = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const savedPercent = (original: number, compressed: number): string =>
  `${(((original - compressed) / original) * 100).toFixed(1)}%`;
*/
