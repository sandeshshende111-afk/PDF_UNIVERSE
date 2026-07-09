"use client";
/**
 * PDFUniverse — User Dashboard
 * src/app/dashboard/page.tsx
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Zap, FileText, HardDrive, Clock, ArrowUpRight,
  Download, Layers, Scissors, Minimize2, FileType,
  Star, Shield, CheckCircle2, AlertTriangle, Loader2,
} from "lucide-react";
import { useAuth }    from "@/hooks/useAuth";
import { pdfApi }     from "@/lib/api";
import { PlanBadge }  from "@/components/ui";
import { cn }         from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────
interface Job {
  _id         : string;
  tool        : string;
  status      : "done" | "failed" | "processing";
  createdAt   : string;
  processingMs: number;
  outputFile  : { size: number; downloadUrl: string };
  inputFiles  : { originalName: string; size: number }[];
}

// ── Quick-action tools shown on the sidebar ───────────────
const QUICK_TOOLS = [
  { id: "merge",    label: "Merge PDF",    icon: Layers,    color: "#6366f1" },
  { id: "split",    label: "Split PDF",    icon: Scissors,  color: "#8b5cf6" },
  { id: "compress", label: "Compress",     icon: Minimize2, color: "#06b6d4" },
  { id: "pdf-word", label: "PDF to Word",  icon: FileType,  color: "#3b82f6" },
  { id: "ocr",      label: "OCR PDF",      icon: FileText,  color: "#10b981", pro: true },
  { id: "ai-summarize", label: "AI Summary", icon: Zap,    color: "#f59e0b", pro: true },
];

// ── Status badge ──────────────────────────────────────────
function StatusBadge({ status }: { status: Job["status"] }) {
  const map = {
    done       : { label: "Done",       icon: CheckCircle2, cls: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50" },
    failed     : { label: "Failed",     icon: AlertTriangle,cls: "text-red-500 bg-red-50 dark:bg-red-950/40" },
    processing : { label: "Processing", icon: Loader2,      cls: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 animate-pulse" },
  };
  const cfg = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold", cfg.cls)}>
      <cfg.icon size={10} strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}

// ── Format helpers ────────────────────────────────────────
const fmtBytes = (b: number) => {
  if (!b) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
};

const fmtDate = (iso: string) => {
  const d   = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const TOOL_LABEL: Record<string, string> = {
  merge: "Merge", split: "Split", compress: "Compress",
  "pdf-word": "PDF→Word", "pdf-excel": "PDF→Excel",
  watermark: "Watermark", rotate: "Rotate", ocr: "OCR",
  "ai-summarize": "AI Summary", "ai-qa": "AI Q&A",
  protect: "Protect", unlock: "Unlock",
};

// ═══════════════════════════════════════════════════════════
// Dashboard Page
// ═══════════════════════════════════════════════════════════

export default function DashboardPage() {
  const { user } = useAuth();
  const [jobs,    setJobs]    = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);

  useEffect(() => {
    pdfApi.history(page).then(res => {
      setJobs(res.data.jobs);
      setTotal(res.data.total);
    }).finally(() => setLoading(false));
  }, [page]);

  const totalSaved   = jobs.reduce((acc, j) => acc + (j.inputFiles[0]?.size || 0) - (j.outputFile?.size || 0), 0);
  const doneCount    = jobs.filter(j => j.status === "done").length;
  const avgTimeMs    = jobs.filter(j => j.processingMs).reduce((a, j) => a + j.processingMs, 0) / (doneCount || 1);

  const statCards = [
    {
      label : "Total Jobs",
      value : total,
      icon  : FileText,
      color : "#6366f1",
      sub   : "all time",
    },
    {
      label : "Space Saved",
      value : fmtBytes(Math.max(totalSaved, 0)),
      icon  : HardDrive,
      color : "#10b981",
      sub   : "this session",
    },
    {
      label : "Avg Speed",
      value : `${(avgTimeMs / 1000).toFixed(1)}s`,
      icon  : Zap,
      color : "#f59e0b",
      sub   : "per operation",
    },
    {
      label : "Tasks Today",
      value : user?.plan === "free" ? `${user?.dailyTaskCount ?? 0} / 5` : "∞",
      icon  : Clock,
      color : "#8b5cf6",
      sub   : user?.plan === "free" ? "free plan" : "unlimited",
    },
  ];

  return (
    <div className="max-w-[1120px] mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Welcome back, <strong className="text-slate-700 dark:text-slate-200">{user?.name}</strong> 👋
          </p>
        </div>

        <div className="flex items-center gap-3">
          <PlanBadge plan={user?.plan || "free"} />
          {user?.plan === "free" && (
            <Link href="/pricing"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-amber-500/30 transition-all"
            >
              <Zap size={14} />
              Upgrade to Pro
            </Link>
          )}
        </div>
      </div>

      {/* Free plan usage warning */}
      {user?.plan === "free" && (user?.dailyTaskCount ?? 0) >= 4 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 px-4 py-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center gap-3"
        >
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            You've used <strong>{user.dailyTaskCount}/5</strong> free tasks today.{" "}
            <Link href="/pricing" className="underline font-semibold hover:text-amber-800 dark:hover:text-amber-300">
              Upgrade for unlimited access →
            </Link>
          </p>
        </motion.div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="p-5 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#161b2e]"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
              style={{ background: s.color + "18", color: s.color }}
            >
              <s.icon size={18} strokeWidth={2} />
            </div>
            <p className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">{s.value}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">

        {/* History table */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#161b2e] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-[15px]">Processing History</h2>
            <span className="text-xs text-slate-400">{total} total jobs</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-indigo-500" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16 text-slate-400 dark:text-slate-500">
              <FileText size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No jobs yet</p>
              <p className="text-sm mt-1">
                <Link href="/tools" className="text-indigo-500 hover:underline">Start processing a PDF →</Link>
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                {jobs.map(job => (
                  <motion.div
                    key={job._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/70 dark:hover:bg-white/[0.025] transition-colors"
                  >
                    {/* Icon */}
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 flex-shrink-0">
                      <FileText size={16} strokeWidth={2} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {job.inputFiles[0]?.originalName || "Untitled"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-medium text-slate-400">
                          {TOOL_LABEL[job.tool] || job.tool}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">·</span>
                        <span className="text-xs text-slate-400">{fmtDate(job.createdAt)}</span>
                        {job.processingMs && (
                          <>
                            <span className="text-slate-300 dark:text-slate-600">·</span>
                            <span className="text-xs text-slate-400">{(job.processingMs / 1000).toFixed(1)}s</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Output size */}
                    <span className="text-xs text-slate-400 hidden sm:block flex-shrink-0">
                      {fmtBytes(job.outputFile?.size)}
                    </span>

                    <StatusBadge status={job.status} />

                    {/* Download */}
                    {job.status === "done" && job.outputFile?.downloadUrl && (
                      <a
                        href={job.outputFile.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all flex-shrink-0"
                        title="Download"
                      >
                        <Download size={14} />
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {total > 20 && (
                <div className="px-6 py-4 border-t border-slate-100 dark:border-white/[0.06] flex justify-between items-center">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1.5 text-xs font-semibold border border-slate-200 dark:border-white/[0.12] rounded-lg disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-all"
                  >
                    ← Previous
                  </button>
                  <span className="text-xs text-slate-400">
                    Page {page} of {Math.ceil(total / 20)}
                  </span>
                  <button
                    disabled={page >= Math.ceil(total / 20)}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1.5 text-xs font-semibold border border-slate-200 dark:border-white/[0.12] rounded-lg disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-all"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">

          {/* Pro upgrade card */}
          {user?.plan === "free" && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-6 -translate-x-4" />
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                  <Star size={18} fill="white" color="white" />
                </div>
                <p className="font-bold text-base mb-1">Unlock Pro Features</p>
                <p className="text-indigo-200 text-sm mb-4 leading-relaxed">
                  AI tools, OCR, batch processing, and unlimited tasks starting at $12/mo.
                </p>
                <Link href="/pricing"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-indigo-600 font-bold text-sm rounded-xl hover:bg-indigo-50 transition-colors"
                >
                  Upgrade Now <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          )}

          {/* Quick Tools */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#161b2e]">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-[14px] mb-4">Quick Start</h3>
            <div className="space-y-1.5">
              {QUICK_TOOLS.map(t => (
                <Link key={t.id} href={`/tools/${t.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors group"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: t.color + "18", color: t.color }}
                  >
                    <t.icon size={14} strokeWidth={2} />
                  </div>
                  <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 flex-1">{t.label}</span>
                  {t.pro && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">PRO</span>
                  )}
                  <ArrowUpRight size={12} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Security notice */}
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
            <Shield size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
              All files are encrypted with AES-256 and automatically deleted after <strong>1 hour</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
