"use client";
/**
 * PDFUniverse — Navbar Component
 * src/components/Navbar.tsx
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun, Moon, Menu, X, ChevronDown,
  FileText, Zap, LogOut, LayoutDashboard, User,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

// ── Tool mega-menu preview items ──
const TOOL_PREVIEWS = [
  { label: "Merge PDF",    href: "/tools/merge",    color: "#6366f1" },
  { label: "Split PDF",    href: "/tools/split",    color: "#8b5cf6" },
  { label: "Compress PDF", href: "/tools/compress", color: "#06b6d4" },
  { label: "PDF to Word",  href: "/tools/pdf-word", color: "#3b82f6" },
  { label: "OCR PDF",      href: "/tools/ocr",      color: "#10b981", pro: true },
  { label: "AI Summarize", href: "/tools/ai-summarize", color: "#6366f1", pro: true },
];

const NAV_LINKS = [
  { label: "Tools",   href: "/tools",   hasMega: true },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen,   setMegaOpen]   = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [mounted,    setMounted]     = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setMegaOpen(false); }, [pathname]);

  const isDark = mounted && theme === "dark";

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/90 dark:bg-[#0b0f1a]/90 backdrop-blur-xl shadow-sm border-b border-slate-200/60 dark:border-white/[0.06]"
            : "bg-transparent"
        )}
      >
        <div className="max-w-[1120px] mx-auto px-6 h-16 flex items-center gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md group-hover:shadow-indigo-500/40 transition-shadow">
              <FileText size={16} color="white" strokeWidth={2.2} />
            </div>
            <span className="font-display font-800 text-[17px] tracking-tight text-slate-900 dark:text-slate-100">
              PDF<span className="text-indigo-500">Universe</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {NAV_LINKS.map(link => (
              link.hasMega ? (
                <div key={link.label} className="relative"
                  onMouseEnter={() => setMegaOpen(true)}
                  onMouseLeave={() => setMegaOpen(false)}
                >
                  <button className={cn(
                    "flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                    "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100",
                    "hover:bg-slate-100 dark:hover:bg-white/[0.07]",
                    pathname.startsWith("/tools") && "text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-white/[0.07]"
                  )}>
                    {link.label}
                    <ChevronDown size={13} className={cn("transition-transform", megaOpen && "rotate-180")} />
                  </button>

                  {/* Mega dropdown */}
                  <AnimatePresence>
                    {megaOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white dark:bg-[#161b2e] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/[0.08] p-3 grid grid-cols-2 gap-1.5"
                      >
                        {TOOL_PREVIEWS.map(t => (
                          <Link key={t.href} href={t.href}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors group"
                          >
                            <div
                              className="w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center"
                              style={{ background: t.color + "22", color: t.color }}
                            >
                              <Zap size={11} strokeWidth={2.5} />
                            </div>
                            <span className="text-[12.5px] font-semibold text-slate-700 dark:text-slate-300 truncate">{t.label}</span>
                            {t.pro && (
                              <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">PRO</span>
                            )}
                          </Link>
                        ))}
                        <Link href="/tools"
                          className="col-span-2 text-center text-xs font-semibold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 py-2 transition-colors"
                        >
                          View all 22 tools →
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link key={link.label} href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                    "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100",
                    "hover:bg-slate-100 dark:hover:bg-white/[0.07]",
                    pathname === link.href && "text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-white/[0.07]"
                  )}
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>

          {/* Right controls */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="w-9 h-9 rounded-lg border border-slate-200 dark:border-white/[0.12] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-200 dark:hover:border-amber-500/30 transition-all bg-white dark:bg-white/[0.04]"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.07] transition-all"
                >
                  <LayoutDashboard size={14} />
                  Dashboard
                </Link>
                <div className="relative group">
                  <button className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </button>
                  {/* User dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#161b2e] rounded-xl shadow-xl border border-slate-200 dark:border-white/[0.08] p-1.5 hidden group-hover:block">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-white/[0.06] mb-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>
                    <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.06] text-[13px] text-slate-700 dark:text-slate-300 font-medium transition-colors">
                      <LayoutDashboard size={13} /> Dashboard
                    </Link>
                    <Link href="/dashboard/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.06] text-[13px] text-slate-700 dark:text-slate-300 font-medium transition-colors">
                      <User size={13} /> Account Settings
                    </Link>
                    <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[13px] text-red-600 dark:text-red-400 font-medium transition-colors">
                      <LogOut size={13} /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-white/[0.12] rounded-lg hover:border-slate-300 dark:hover:border-white/20 transition-all bg-white dark:bg-white/[0.04]"
                >
                  Sign In
                </Link>
                <Link href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 rounded-lg shadow-md hover:shadow-indigo-500/30 transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden ml-auto w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/[0.12] text-slate-600 dark:text-slate-400"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#0b0f1a]"
            >
              <div className="px-5 py-4 flex flex-col gap-1">
                {NAV_LINKS.map(l => (
                  <Link key={l.label} href={l.href}
                    className="px-3 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.07] transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="h-px bg-slate-100 dark:bg-white/[0.06] my-1" />
                <div className="flex gap-2">
                  <Link href="/login"
                    className="flex-1 text-center py-3 text-sm font-semibold border border-slate-200 dark:border-white/[0.12] rounded-xl text-slate-700 dark:text-slate-300"
                  >
                    Sign In
                  </Link>
                  <Link href="/register"
                    className="flex-1 text-center py-3 text-sm font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
}
