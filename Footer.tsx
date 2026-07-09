/**
 * PDFUniverse — Footer Component
 * src/components/Footer.tsx
 */

import Link from "next/link";
import { FileText, Github, Twitter, Linkedin } from "lucide-react";

const FOOTER_LINKS = {
  Product : [
    { label: "All Tools",   href: "/tools"       },
    { label: "Pricing",     href: "/pricing"      },
    { label: "API Docs",    href: "/docs"         },
    { label: "Changelog",   href: "/changelog"    },
  ],
  Company : [
    { label: "About",       href: "/about"        },
    { label: "Blog",        href: "/blog"         },
    { label: "Careers",     href: "/careers"      },
    { label: "Contact",     href: "/contact"      },
  ],
  Legal   : [
    { label: "Privacy",     href: "/privacy"      },
    { label: "Terms",       href: "/terms"        },
    { label: "Security",    href: "/security"     },
    { label: "GDPR",        href: "/gdpr"         },
  ],
  Tools   : [
    { label: "Merge PDF",   href: "/tools/merge"     },
    { label: "Compress PDF",href: "/tools/compress"  },
    { label: "PDF to Word", href: "/tools/pdf-word"  },
    { label: "AI Summarize",href: "/tools/ai-summarize" },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#07090f]">
      <div className="max-w-[1120px] mx-auto px-6 py-14">

        {/* Top: brand + links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 w-fit">
              <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow">
                <FileText size={16} color="white" strokeWidth={2.2} />
              </div>
              <span className="font-display font-black text-base tracking-tight text-slate-900 dark:text-slate-100">
                PDF<span className="text-indigo-500">Universe</span>
              </span>
            </Link>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-[200px]">
              The most powerful PDF platform — free forever, pro when you need it.
            </p>
            {/* Social */}
            <div className="flex gap-3 mt-5">
              {[
                { icon: Twitter,  href: "https://twitter.com/pdfuniverse" },
                { icon: Github,   href: "https://github.com/pdfuniverse"  },
                { icon: Linkedin, href: "https://linkedin.com/company/pdfuniverse" },
              ].map(s => (
                <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/[0.10] flex items-center justify-center text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all bg-white dark:bg-white/[0.03]"
                >
                  <s.icon size={13} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <p className="text-[11px] font-bold text-slate-900 dark:text-slate-300 uppercase tracking-widest mb-4">
                {title}
              </p>
              <ul className="space-y-2.5">
                {links.map(l => (
                  <li key={l.href}>
                    <Link href={l.href}
                      className="text-[13.5px] text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom: copyright + badges */}
        <div className="border-t border-slate-100 dark:border-white/[0.05] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © {year} PDFUniverse, Inc. All rights reserved. Built with ❤️
          </p>
          <div className="flex items-center gap-3">
            {/* Trust badges */}
            {["SOC 2", "GDPR", "ISO 27001"].map(b => (
              <span key={b}
                className="text-[10px] font-bold text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/[0.08] rounded-md px-2 py-0.5"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}


/* ═══════════════════════════════════════════════════════════
   src/app/globals.css
   ═══════════════════════════════════════════════════════════ */
/*

@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --radius: 0.75rem;
  }

  * {
    @apply border-border;
  }

  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    @apply bg-slate-50 dark:bg-[#0b0f1a] text-slate-900 dark:text-slate-100;
    font-family: 'DM Sans', system-ui, sans-serif;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Sora', system-ui, sans-serif;
  }

  ::selection {
    @apply bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-100;
  }

  ::-webkit-scrollbar         { @apply w-1.5; }
  ::-webkit-scrollbar-track   { @apply bg-transparent; }
  ::-webkit-scrollbar-thumb   { @apply bg-slate-300 dark:bg-white/20 rounded-full; }
}

@layer components {
  .btn-primary {
    @apply inline-flex items-center justify-center gap-2 px-5 py-2.5
           text-sm font-bold text-white rounded-xl
           bg-gradient-to-r from-indigo-500 to-violet-600
           shadow-md hover:shadow-indigo-500/30
           active:scale-[0.98] transition-all duration-150;
  }

  .btn-secondary {
    @apply inline-flex items-center justify-center gap-2 px-5 py-2.5
           text-sm font-semibold text-slate-700 dark:text-slate-300 rounded-xl
           border border-slate-200 dark:border-white/[0.12]
           bg-white dark:bg-white/[0.04]
           hover:bg-slate-50 dark:hover:bg-white/[0.07]
           active:scale-[0.98] transition-all duration-150;
  }

  .card {
    @apply rounded-2xl border border-slate-200 dark:border-white/[0.08]
           bg-white dark:bg-[#161b2e];
  }

  .input {
    @apply w-full px-3.5 py-2.5 rounded-xl text-sm
           border border-slate-200 dark:border-white/[0.12]
           bg-slate-50 dark:bg-white/[0.04]
           text-slate-900 dark:text-slate-100
           placeholder-slate-400 dark:placeholder-slate-500
           outline-none focus:border-indigo-400 dark:focus:border-indigo-500
           focus:ring-2 focus:ring-indigo-500/20
           transition-colors;
  }

  .gradient-text {
    @apply bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent;
  }

  .section {
    @apply max-w-[1120px] mx-auto px-6;
  }
}

@layer utilities {
  .font-display { font-family: 'Sora', system-ui, sans-serif; }
  .font-body    { font-family: 'DM Sans', system-ui, sans-serif; }
  .font-800     { font-weight: 800; }
  .font-900     { font-weight: 900; }

  .bg-gradient-radial {
    background-image: radial-gradient(var(--tw-gradient-stops));
  }
}

*/
