
import { useState, useEffect, useRef } from "react";

// ─── Icons (inline SVG components) ───────────────────────────────────────────
const Icon = ({ path, size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d={path} />
  </svg>
);

const ICONS = {
  merge: "M8 6H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4m8-12h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4M12 3v18",
  split: "M21 6H3m18 12H3M12 3v18",
  compress: "M4 14h6m0 0v6m0-6-7 7M20 10h-6m0 0V4m0 6 7-7",
  word: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  excel: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h2v6H8z M14 13h2v6h-2z M11 13h2v6h-2z",
  ppt: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M9 14l3-5 3 5",
  image: "M21 15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z M8.5 10.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4M21 15l-5-5L5 21",
  rotate: "M3.6 9a9 9 0 0 1 14.8-3.3M3 5v4h4 M20.4 15a9 9 0 0 1-14.8 3.3M21 19v-4h-4",
  watermark: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  lock: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4",
  unlock: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 1 1 9.9-1",
  ai: "M12 2a10 10 0 1 0 10 10M22 2 12 12M15 2h7v7",
  ocr: "M3 3h5v5H3z M16 3h5v5h-5z M3 16h5v5H3z M14 14l7 7M16 14h5v5h-5z",
  sign: "M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z",
  sun: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 1 0 0 14A7 7 0 0 0 12 5z",
  moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  menu: "M3 12h18M3 6h18M3 18h18",
  close: "M18 6 6 18M6 6l12 12",
  arrow: "M5 12h14M12 5l7 7-7 7",
  check: "M20 6 9 17l-5-5",
  upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  zap: "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  globe: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  drive: "M12 2L2 19h20L12 2zM12 8v4M12 16h.01",
  dropbox: "M12 2 7 5l5 3 5-3-5-3zM7 9l-5 3 5 3 5-3-5-3zM17 9l-5 3 5 3 5-3-5-3zM7 18l5 3 5-3",
  dashboard: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  pdf: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M9 13h6 M9 17h6 M9 9h2",
};

// ─── Color/Theme Data ─────────────────────────────────────────────────────────
const TOOLS = [
  { id: "merge", label: "Merge PDF", icon: "merge", color: "#6366f1", desc: "Combine multiple PDFs into one seamless document", cat: "organize" },
  { id: "split", label: "Split PDF", icon: "split", color: "#8b5cf6", desc: "Extract pages or split into multiple files", cat: "organize" },
  { id: "compress", label: "Compress PDF", icon: "compress", color: "#06b6d4", desc: "Reduce file size without quality loss", cat: "optimize" },
  { id: "pdf-word", label: "PDF to Word", icon: "word", color: "#3b82f6", desc: "Convert PDF to editable Word document", cat: "convert" },
  { id: "pdf-excel", label: "PDF to Excel", icon: "excel", color: "#10b981", desc: "Extract tables into spreadsheet format", cat: "convert" },
  { id: "pdf-ppt", label: "PDF to PPT", icon: "ppt", color: "#f59e0b", desc: "Transform PDF slides to PowerPoint", cat: "convert" },
  { id: "word-pdf", label: "Word to PDF", icon: "word", color: "#3b82f6", desc: "Convert Word documents to PDF instantly", cat: "convert" },
  { id: "excel-pdf", label: "Excel to PDF", icon: "excel", color: "#10b981", desc: "Turn spreadsheets into polished PDFs", cat: "convert" },
  { id: "ppt-pdf", label: "PPT to PDF", icon: "ppt", color: "#f59e0b", desc: "Convert presentations to PDF format", cat: "convert" },
  { id: "jpg-pdf", label: "JPG to PDF", icon: "image", color: "#ec4899", desc: "Turn images into professional PDFs", cat: "convert" },
  { id: "pdf-jpg", label: "PDF to JPG", icon: "image", color: "#ec4899", desc: "Extract high-quality images from PDFs", cat: "convert" },
  { id: "rotate", label: "Rotate PDF", icon: "rotate", color: "#14b8a6", desc: "Fix page orientation in one click", cat: "edit" },
  { id: "watermark", label: "Watermark", icon: "watermark", color: "#f97316", desc: "Brand your documents with custom watermarks", cat: "edit" },
  { id: "page-num", label: "Page Numbers", icon: "edit", color: "#6366f1", desc: "Add sequential page numbers automatically", cat: "edit" },
  { id: "unlock", label: "Unlock PDF", icon: "unlock", color: "#ef4444", desc: "Remove password protection from PDFs", cat: "security" },
  { id: "protect", label: "Protect PDF", icon: "lock", color: "#8b5cf6", desc: "Add password security to your documents", cat: "security" },
  { id: "organize", label: "Organize Pages", icon: "dashboard", color: "#06b6d4", desc: "Reorder, remove, or rotate individual pages", cat: "organize" },
  { id: "ocr", label: "OCR PDF", icon: "ocr", color: "#10b981", desc: "Make scanned PDFs searchable with AI OCR", cat: "ai", pro: true },
  { id: "ai-summarize", label: "AI Summarizer", icon: "ai", color: "#6366f1", desc: "Get intelligent summaries powered by AI", cat: "ai", pro: true },
  { id: "ai-qa", label: "AI Q&A", icon: "ai", color: "#8b5cf6", desc: "Ask questions about your PDF with AI", cat: "ai", pro: true },
  { id: "sign", label: "E-Signature", icon: "sign", color: "#f59e0b", desc: "Sign documents electronically", cat: "edit", pro: true },
  { id: "edit-pdf", label: "Edit PDF", icon: "edit", color: "#ec4899", desc: "Add text, images, and annotations", cat: "edit", pro: true },
];

const CATEGORIES = ["all", "organize", "convert", "edit", "security", "ai"];

const PLANS = [
  {
    name: "Free", price: 0, period: "forever", color: "#6366f1",
    features: ["5 tasks per day", "Up to 50MB per file", "Basic PDF tools", "Standard compression", "24hr file deletion"],
    cta: "Get Started Free", popular: false
  },
  {
    name: "Pro", price: 12, period: "month", color: "#f59e0b",
    features: ["Unlimited tasks", "Up to 2GB per file", "All PDF tools", "AI Summarizer & Q&A", "OCR technology", "E-signature", "Batch processing", "Priority support", "API access", "No watermarks"],
    cta: "Start Pro Trial", popular: true
  },
  {
    name: "Team", price: 29, period: "month", color: "#8b5cf6",
    features: ["Everything in Pro", "Up to 10 users", "Team dashboard", "Admin panel", "Custom branding", "SAML SSO", "SLA guarantee", "Dedicated support"],
    cta: "Start Team Trial", popular: false
  }
];

const STATS = [
  { val: "12M+", label: "PDFs Processed" },
  { val: "98.9%", label: "Uptime SLA" },
  { val: "180+", label: "Countries Served" },
  { val: "4.9★", label: "User Rating" },
];

// ─── Components ───────────────────────────────────────────────────────────────

function Badge({ children, color = "#6366f1" }) {
  return (
    <span style={{
      background: color + "22", color, border: `1px solid ${color}44`,
      borderRadius: 6, padding: "2px 10px", fontSize: 11, fontWeight: 700,
      letterSpacing: "0.08em", textTransform: "uppercase"
    }}>{children}</span>
  );
}

function ToolCard({ tool, dark, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => onClick(tool)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: dark ? (hovered ? "#1e2435" : "#161b2e") : (hovered ? "#f8f9ff" : "#ffffff"),
        border: `1px solid ${hovered ? tool.color + "66" : (dark ? "#ffffff11" : "#e2e8f0")}`,
        borderRadius: 16, padding: "22px 20px", cursor: "pointer",
        transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
        transform: hovered ? "translateY(-3px)" : "none",
        boxShadow: hovered ? `0 12px 32px ${tool.color}22` : (dark ? "none" : "0 1px 4px #0000000a"),
        position: "relative", overflow: "hidden"
      }}
    >
      {tool.pro && (
        <div style={{ position: "absolute", top: 10, right: 10 }}>
          <Badge color="#f59e0b">PRO</Badge>
        </div>
      )}
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: tool.color + "18", display: "flex", alignItems: "center",
        justifyContent: "center", marginBottom: 14, color: tool.color,
        transition: "all 0.22s"
      }}>
        <Icon path={ICONS[tool.icon]} size={22} />
      </div>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: dark ? "#f1f5f9" : "#1e293b" }}>
        {tool.label}
      </div>
      <div style={{ fontSize: 12.5, color: dark ? "#94a3b8" : "#64748b", lineHeight: 1.5 }}>
        {tool.desc}
      </div>
    </div>
  );
}

function UploadZone({ dark, tool }) {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles(dropped); setDone(false); setProgress(0); setError(""); setDownloadUrl("");
  };

  const handleProcess = async () => {
    if (!files.length) return;
    setProcessing(true); setProgress(10); setDone(false); setError(""); setDownloadUrl("");
    try {
      const supported = ["merge", "split", "compress", "rotate", "watermark"];
      const endpoint = supported.includes(tool.id) ? tool.id : "compress";
      const form = new FormData();
      if (endpoint === "merge") files.forEach(file => form.append("files", file));
      else form.append("file", files[0]);
      const tick = setInterval(() => setProgress(p => Math.min(p + 8, 88)), 220);
      const response = await fetch(`/api/pdf/${endpoint}`, { method: "POST", body: form });
      clearInterval(tick);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "PDF processing failed.");
      setDownloadUrl(data.downloadUrl || data.parts?.[0]?.downloadUrl || "");
      setProgress(100);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const bg = dark ? "#161b2e" : "#f8faff";
  const border = dragging ? "#6366f1" : (dark ? "#ffffff22" : "#c7d2fe");

  return (
    <div>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${border}`, borderRadius: 18,
          background: dragging ? "#6366f111" : bg,
          padding: "48px 24px", textAlign: "center", cursor: "pointer",
          transition: "all 0.2s", minHeight: 200,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 12
        }}
      >
        <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple={tool.id === "merge"} style={{ display: "none" }}
          onChange={e => { setFiles(Array.from(e.target.files)); setDone(false); setProgress(0); setError(""); setDownloadUrl(""); }} />
        <div style={{
          width: 60, height: 60, borderRadius: 16, background: "#6366f122",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1"
        }}>
          <Icon path={ICONS.upload} size={28} />
        </div>
        {files.length > 0 ? (
          <div>
            <div style={{ fontWeight: 700, color: dark ? "#f1f5f9" : "#1e293b", fontSize: 15 }}>
              {files.length} file{files.length > 1 ? "s" : ""} selected
            </div>
            <div style={{ color: dark ? "#94a3b8" : "#64748b", fontSize: 13, marginTop: 4 }}>
              {files.map(f => f.name).join(", ").slice(0, 60)}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontWeight: 700, color: dark ? "#f1f5f9" : "#1e293b", fontSize: 15 }}>
              Drop files here or click to browse
            </div>
            <div style={{ color: dark ? "#94a3b8" : "#64748b", fontSize: 13, marginTop: 4 }}>
              Supports PDF files up to 50MB
            </div>
          </div>
        )}
      </div>

      {/* Cloud integrations */}
      <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "center" }}>
        {["Google Drive", "Dropbox"].map(s => (
          <button key={s} style={{
            background: dark ? "#ffffff09" : "#f1f5f9",
            border: `1px solid ${dark ? "#ffffff15" : "#e2e8f0"}`,
            borderRadius: 8, padding: "7px 14px", fontSize: 12,
            color: dark ? "#94a3b8" : "#64748b", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6
          }}>
            <Icon path={s === "Google Drive" ? ICONS.drive : ICONS.dropbox} size={13} />
            {s}
          </button>
        ))}
      </div>

      {/* Progress */}
      {processing && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: dark ? "#94a3b8" : "#64748b" }}>Processing...</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#6366f1" }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: dark ? "#ffffff11" : "#e2e8f0", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 99, width: `${progress}%`,
              background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
              transition: "width 0.15s"
            }} />
          </div>
        </div>
      )}

      {done && (
        <div style={{
          marginTop: 16, padding: "14px 20px", borderRadius: 12,
          background: "#10b98122", border: "1px solid #10b98144",
          display: "flex", alignItems: "center", gap: 10
        }}>
          <Icon path={ICONS.check} size={18} className="" style={{ color: "#10b981" }} />
          <span style={{ color: "#10b981", fontWeight: 600, fontSize: 14 }}>
            ✓ Processing complete! Your file is ready to download.
          </span>
          <a href={downloadUrl} download style={{
            marginLeft: "auto", background: "#10b981", color: "#fff",
            border: "none", borderRadius: 8, padding: "7px 16px",
            fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "none"
          }}>Download</a>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: 16, padding: "12px 16px", borderRadius: 10,
          background: "#ef444422", border: "1px solid #ef444455",
          color: "#ef4444", fontSize: 13, fontWeight: 600
        }}>{error}</div>
      )}

      {files.length > 0 && !processing && !done && (
        <button onClick={handleProcess} style={{
          width: "100%", marginTop: 16, padding: "14px",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          border: "none", borderRadius: 12, color: "#fff",
          fontWeight: 700, fontSize: 15, cursor: "pointer",
          letterSpacing: "0.01em", boxShadow: "0 4px 20px #6366f144"
        }}>
          {tool.label} →
        </button>
      )}
    </div>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────

function HomePage({ dark, setPage, setActiveTool }) {
  const [animIn, setAnimIn] = useState(false);
  useEffect(() => { setTimeout(() => setAnimIn(true), 80); }, []);

  return (
    <div>
      {/* Hero */}
      <section style={{
        minHeight: "88vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", textAlign: "center",
        padding: "80px 24px 60px", position: "relative", overflow: "hidden"
      }}>
        {/* Background orbs */}
        <div style={{
          position: "absolute", top: "10%", left: "20%", width: 500, height: 500,
          borderRadius: "50%", background: "radial-gradient(circle,#6366f122 0%,transparent 70%)",
          filter: "blur(40px)", pointerEvents: "none", zIndex: 0
        }} />
        <div style={{
          position: "absolute", bottom: "5%", right: "15%", width: 400, height: 400,
          borderRadius: "50%", background: "radial-gradient(circle,#8b5cf622 0%,transparent 70%)",
          filter: "blur(40px)", pointerEvents: "none", zIndex: 0
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: dark ? "#ffffff0d" : "#6366f111",
            border: `1px solid ${dark ? "#ffffff1a" : "#6366f133"}`,
            borderRadius: 99, padding: "6px 16px", marginBottom: 28,
            opacity: animIn ? 1 : 0, transform: animIn ? "none" : "translateY(10px)",
            transition: "all 0.6s cubic-bezier(.4,0,.2,1)"
          }}>
            <Icon path={ICONS.zap} size={14} style={{ color: "#f59e0b" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: dark ? "#c4b5fd" : "#6366f1" }}>
              ✦ Powered by AI · Trusted by 12M+ users
            </span>
          </div>

          <h1 style={{
            fontSize: "clamp(38px,7vw,76px)", fontWeight: 900, lineHeight: 1.08,
            letterSpacing: "-0.03em", marginBottom: 24,
            color: dark ? "#f1f5f9" : "#0f172a",
            opacity: animIn ? 1 : 0, transform: animIn ? "none" : "translateY(20px)",
            transition: "all 0.7s cubic-bezier(.4,0,.2,1) 0.1s",
            fontFamily: "'Sora', 'DM Sans', system-ui, sans-serif"
          }}>
            Every PDF tool<br />
            <span style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              you'll ever need
            </span>
          </h1>

          <p style={{
            fontSize: 18, lineHeight: 1.7, color: dark ? "#94a3b8" : "#64748b",
            maxWidth: 560, margin: "0 auto 40px",
            opacity: animIn ? 1 : 0, transform: animIn ? "none" : "translateY(15px)",
            transition: "all 0.7s cubic-bezier(.4,0,.2,1) 0.2s"
          }}>
            Merge, split, compress, convert, and edit PDFs with blazing speed.
            AI-powered features. Bank-grade security. Free forever.
          </p>

          <div style={{
            display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap",
            opacity: animIn ? 1 : 0, transform: animIn ? "none" : "translateY(15px)",
            transition: "all 0.7s cubic-bezier(.4,0,.2,1) 0.3s"
          }}>
            <button onClick={() => setPage("tools")} style={{
              padding: "14px 32px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              border: "none", borderRadius: 12, color: "#fff", fontWeight: 700,
              fontSize: 15, cursor: "pointer", letterSpacing: "0.01em",
              boxShadow: "0 8px 32px #6366f144", display: "flex", alignItems: "center", gap: 8
            }}>
              <Icon path={ICONS.zap} size={16} /> Explore All Tools
            </button>
            <button onClick={() => setPage("pricing")} style={{
              padding: "14px 28px", background: dark ? "#ffffff0d" : "#f1f5f9",
              border: `1px solid ${dark ? "#ffffff1a" : "#e2e8f0"}`,
              borderRadius: 12, color: dark ? "#f1f5f9" : "#1e293b",
              fontWeight: 600, fontSize: 15, cursor: "pointer"
            }}>
              View Pricing →
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "0 24px 60px" }}>
        <div style={{
          maxWidth: 900, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 20
        }}>
          {STATS.map(s => (
            <div key={s.val} style={{
              textAlign: "center", padding: "24px 16px",
              background: dark ? "#161b2e" : "#fff",
              border: `1px solid ${dark ? "#ffffff11" : "#e2e8f0"}`,
              borderRadius: 16, boxShadow: dark ? "none" : "0 1px 4px #0000000a"
            }}>
              <div style={{
                fontSize: 32, fontWeight: 900, letterSpacing: "-0.02em",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>{s.val}</div>
              <div style={{ fontSize: 13, color: dark ? "#94a3b8" : "#64748b", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Tools grid */}
      <section style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <Badge color="#6366f1">Tools</Badge>
            <h2 style={{
              fontSize: "clamp(24px,4vw,40px)", fontWeight: 800, marginTop: 12, marginBottom: 12,
              color: dark ? "#f1f5f9" : "#0f172a", letterSpacing: "-0.02em"
            }}>
              Popular PDF Tools
            </h2>
            <p style={{ color: dark ? "#94a3b8" : "#64748b", fontSize: 15 }}>
              Start with any tool — no account required
            </p>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
            gap: 16
          }}>
            {TOOLS.slice(0, 12).map(t => (
              <ToolCard key={t.id} tool={t} dark={dark} onClick={(tool) => {
                setActiveTool(tool); setPage("tool");
              }} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button onClick={() => setPage("tools")} style={{
              padding: "12px 28px", background: "transparent",
              border: `1px solid ${dark ? "#ffffff22" : "#e2e8f0"}`,
              borderRadius: 10, color: dark ? "#94a3b8" : "#64748b",
              fontWeight: 600, fontSize: 14, cursor: "pointer"
            }}>
              View all {TOOLS.length} tools →
            </button>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section style={{
        padding: "80px 24px",
        background: dark ? "#0f1322" : "#f8faff",
        borderTop: `1px solid ${dark ? "#ffffff09" : "#e2e8f0"}`,
        borderBottom: `1px solid ${dark ? "#ffffff09" : "#e2e8f0"}`
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Badge color="#8b5cf6">Why PDFUniverse</Badge>
            <h2 style={{
              fontSize: "clamp(24px,4vw,40px)", fontWeight: 800, marginTop: 12,
              color: dark ? "#f1f5f9" : "#0f172a", letterSpacing: "-0.02em"
            }}>
              Built different. Works better.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 28 }}>
            {[
              { icon: "ai", color: "#6366f1", title: "AI-Powered Intelligence", desc: "OCR, summarization, and Q&A powered by cutting-edge AI models built right into your workflow." },
              { icon: "shield", color: "#10b981", title: "Bank-Grade Security", desc: "AES-256 encryption in transit and at rest. Files auto-deleted after 1 hour. SOC 2 compliant." },
              { icon: "zap", color: "#f59e0b", title: "Blazing Fast Processing", desc: "Multi-threaded processing handles 2GB files in seconds. No waiting, no timeouts." },
              { icon: "globe", color: "#06b6d4", title: "Cloud Integration", desc: "Connect Google Drive and Dropbox directly. Work with files without downloading them." },
              { icon: "users", color: "#8b5cf6", title: "Team Collaboration", desc: "Share workspaces, track history, and collaborate on documents as a team." },
              { icon: "star", color: "#ec4899", title: "Batch Processing", desc: "Process hundreds of files simultaneously. Save time with powerful automation tools." },
            ].map(f => (
              <div key={f.title} style={{
                padding: 28, background: dark ? "#161b2e" : "#fff",
                border: `1px solid ${dark ? "#ffffff11" : "#e2e8f0"}`,
                borderRadius: 20, boxShadow: dark ? "none" : "0 2px 8px #0000000a"
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, background: f.color + "18",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: f.color, marginBottom: 18
                }}>
                  <Icon path={ICONS[f.icon]} size={24} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: dark ? "#f1f5f9" : "#1e293b" }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, color: dark ? "#94a3b8" : "#64748b", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "90px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <h2 style={{
            fontSize: "clamp(28px,5vw,48px)", fontWeight: 900, letterSpacing: "-0.03em",
            color: dark ? "#f1f5f9" : "#0f172a", marginBottom: 20
          }}>
            Start for free.<br />
            <span style={{
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              Upgrade anytime.
            </span>
          </h2>
          <p style={{ fontSize: 16, color: dark ? "#94a3b8" : "#64748b", marginBottom: 36, lineHeight: 1.6 }}>
            No credit card required. 5 free tasks per day, forever.
            Go Pro for unlimited access and AI features.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setPage("register")} style={{
              padding: "14px 34px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              border: "none", borderRadius: 12, color: "#fff", fontWeight: 700,
              fontSize: 15, cursor: "pointer", boxShadow: "0 8px 28px #6366f144"
            }}>
              Create Free Account
            </button>
            <button onClick={() => setPage("pricing")} style={{
              padding: "14px 28px", background: dark ? "#ffffff0d" : "#f1f5f9",
              border: `1px solid ${dark ? "#ffffff1a" : "#e2e8f0"}`,
              borderRadius: 12, color: dark ? "#f1f5f9" : "#1e293b",
              fontWeight: 600, fontSize: 15, cursor: "pointer"
            }}>
              Compare Plans
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ToolsPage({ dark, setPage, setActiveTool }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = TOOLS.filter(t => {
    const matchCat = filter === "all" || t.cat === filter;
    const matchSearch = t.label.toLowerCase().includes(search.toLowerCase()) ||
      t.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <Badge color="#6366f1">All Tools</Badge>
        <h1 style={{
          fontSize: "clamp(28px,5vw,48px)", fontWeight: 900, letterSpacing: "-0.025em",
          color: dark ? "#f1f5f9" : "#0f172a", marginTop: 12, marginBottom: 12
        }}>
          {TOOLS.length} PDF Tools. One Platform.
        </h1>
        <p style={{ color: dark ? "#94a3b8" : "#64748b", fontSize: 15 }}>
          Everything you need to work with PDFs professionally
        </p>
      </div>

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 440, margin: "0 auto 32px" }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search tools..."
          style={{
            width: "100%", padding: "12px 16px 12px 44px", boxSizing: "border-box",
            background: dark ? "#161b2e" : "#fff",
            border: `1px solid ${dark ? "#ffffff22" : "#e2e8f0"}`,
            borderRadius: 12, fontSize: 14, color: dark ? "#f1f5f9" : "#1e293b",
            outline: "none"
          }}
        />
        <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
          <Icon path="M21 21l-4.35-4.35M11 19A8 8 0 1 0 11 3a8 8 0 0 0 0 16z" size={17} />
        </div>
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 40, flexWrap: "wrap" }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            padding: "8px 18px", borderRadius: 99, fontSize: 13, fontWeight: 600,
            cursor: "pointer", transition: "all 0.18s", textTransform: "capitalize",
            background: filter === c ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : (dark ? "#ffffff0d" : "#f1f5f9"),
            color: filter === c ? "#fff" : (dark ? "#94a3b8" : "#64748b"),
            border: filter === c ? "none" : `1px solid ${dark ? "#ffffff15" : "#e2e8f0"}`
          }}>{c}</button>
        ))}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
        gap: 16
      }}>
        {filtered.map(t => (
          <ToolCard key={t.id} tool={t} dark={dark} onClick={tool => {
            setActiveTool(tool); setPage("tool");
          }} />
        ))}
      </div>
    </div>
  );
}

function ToolPage({ dark, tool, setPage }) {
  if (!tool) return null;
  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "60px 24px" }}>
      <button onClick={() => setPage("tools")} style={{
        background: "none", border: "none", color: dark ? "#94a3b8" : "#64748b",
        cursor: "pointer", fontSize: 14, marginBottom: 32, display: "flex", alignItems: "center", gap: 6
      }}>
        ← Back to Tools
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 12 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, background: tool.color + "18",
          display: "flex", alignItems: "center", justifyContent: "center", color: tool.color
        }}>
          <Icon path={ICONS[tool.icon]} size={28} />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: dark ? "#f1f5f9" : "#0f172a", margin: 0 }}>
              {tool.label}
            </h1>
            {tool.pro && <Badge color="#f59e0b">PRO</Badge>}
          </div>
          <p style={{ color: dark ? "#94a3b8" : "#64748b", margin: 0, fontSize: 14, marginTop: 4 }}>
            {tool.desc}
          </p>
        </div>
      </div>

      <div style={{ height: 1, background: dark ? "#ffffff0f" : "#e2e8f0", margin: "28px 0" }} />

      {tool.pro ? (
        <div style={{
          padding: 32, background: dark ? "#161b2e" : "#fafbff",
          border: `1px solid ${dark ? "#ffffff11" : "#e2e8f0"}`,
          borderRadius: 20, textAlign: "center"
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20, background: "#f59e0b18",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#f59e0b", margin: "0 auto 20px"
          }}>
            <Icon path={ICONS.star} size={30} />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: dark ? "#f1f5f9" : "#1e293b", marginBottom: 10 }}>
            Pro Feature
          </h3>
          <p style={{ color: dark ? "#94a3b8" : "#64748b", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            {tool.label} is available on the Pro and Team plans. Upgrade now for unlimited access
            to all AI-powered features.
          </p>
          <button onClick={() => setPage("pricing")} style={{
            padding: "12px 28px", background: "linear-gradient(135deg,#f59e0b,#f97316)",
            border: "none", borderRadius: 10, color: "#fff", fontWeight: 700,
            fontSize: 14, cursor: "pointer"
          }}>
            Upgrade to Pro →
          </button>
        </div>
      ) : (
        <UploadZone dark={dark} tool={tool} />
      )}

      {/* How it works */}
      <div style={{ marginTop: 48 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: dark ? "#f1f5f9" : "#1e293b", marginBottom: 20 }}>
          How it works
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {[
            { n: "1", t: "Upload", d: "Select or drag & drop your files" },
            { n: "2", t: "Process", d: "We handle it securely in seconds" },
            { n: "3", t: "Download", d: "Get your result immediately" }
          ].map(step => (
            <div key={step.n} style={{
              padding: "20px 16px", textAlign: "center",
              background: dark ? "#161b2e" : "#f8faff",
              border: `1px solid ${dark ? "#ffffff0f" : "#e2e8f0"}`,
              borderRadius: 14
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 99, background: "#6366f122",
                color: "#6366f1", fontWeight: 800, fontSize: 15,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px"
              }}>{step.n}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: dark ? "#f1f5f9" : "#1e293b", marginBottom: 4 }}>{step.t}</div>
              <div style={{ fontSize: 12.5, color: dark ? "#94a3b8" : "#64748b" }}>{step.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PricingPage({ dark, setPage }) {
  const [annual, setAnnual] = useState(false);

  return (
    <div style={{ maxWidth: 1060, margin: "0 auto", padding: "70px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <Badge color="#8b5cf6">Pricing</Badge>
        <h1 style={{
          fontSize: "clamp(28px,5vw,48px)", fontWeight: 900, letterSpacing: "-0.025em",
          color: dark ? "#f1f5f9" : "#0f172a", marginTop: 12, marginBottom: 12
        }}>
          Simple, transparent pricing
        </h1>
        <p style={{ color: dark ? "#94a3b8" : "#64748b", fontSize: 15, marginBottom: 28 }}>
          Start free, upgrade when you need more power
        </p>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 12,
          background: dark ? "#161b2e" : "#f1f5f9",
          border: `1px solid ${dark ? "#ffffff11" : "#e2e8f0"}`,
          borderRadius: 99, padding: "6px 8px"
        }}>
          <button onClick={() => setAnnual(false)} style={{
            padding: "6px 16px", borderRadius: 99, fontSize: 13, fontWeight: 600,
            border: "none", cursor: "pointer",
            background: !annual ? (dark ? "#ffffff" : "#fff") : "transparent",
            color: !annual ? "#1e293b" : (dark ? "#94a3b8" : "#64748b"),
            boxShadow: !annual ? "0 1px 4px #00000011" : "none"
          }}>Monthly</button>
          <button onClick={() => setAnnual(true)} style={{
            padding: "6px 16px", borderRadius: 99, fontSize: 13, fontWeight: 600,
            border: "none", cursor: "pointer",
            background: annual ? (dark ? "#ffffff" : "#fff") : "transparent",
            color: annual ? "#1e293b" : (dark ? "#94a3b8" : "#64748b"),
            boxShadow: annual ? "0 1px 4px #00000011" : "none"
          }}>Annual <span style={{ color: "#10b981", fontSize: 11 }}>-20%</span></button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
        {PLANS.map(p => (
          <div key={p.name} style={{
            padding: 30, borderRadius: 24,
            background: p.popular ? "linear-gradient(160deg,#6366f1,#8b5cf6)" : (dark ? "#161b2e" : "#fff"),
            border: `1px solid ${p.popular ? "transparent" : (dark ? "#ffffff11" : "#e2e8f0")}`,
            position: "relative", overflow: "hidden",
            boxShadow: p.popular ? "0 24px 64px #6366f133" : (dark ? "none" : "0 2px 12px #0000000a"),
            transform: p.popular ? "scale(1.03)" : "none"
          }}>
            {p.popular && (
              <div style={{
                position: "absolute", top: 18, right: 18,
                background: "#fff3", borderRadius: 99, padding: "3px 12px",
                fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: "0.08em"
              }}>MOST POPULAR</div>
            )}
            <div style={{ marginBottom: 24 }}>
              <div style={{
                fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                color: p.popular ? "#c4b5fd" : (dark ? "#94a3b8" : "#64748b"), marginBottom: 10
              }}>{p.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{
                  fontSize: 44, fontWeight: 900, letterSpacing: "-0.03em",
                  color: p.popular ? "#fff" : (dark ? "#f1f5f9" : "#0f172a")
                }}>
                  ${p.price === 0 ? 0 : (annual ? Math.round(p.price * 0.8) : p.price)}
                </span>
                {p.price > 0 && (
                  <span style={{ color: p.popular ? "#c4b5fd" : "#94a3b8", fontSize: 14 }}>
                    / {annual ? "mo, billed annually" : "month"}
                  </span>
                )}
              </div>
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
              {p.features.map(f => (
                <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 99,
                    background: p.popular ? "#fff3" : "#6366f122",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    color: p.popular ? "#fff" : "#6366f1"
                  }}>
                    <Icon path={ICONS.check} size={11} />
                  </div>
                  <span style={{ color: p.popular ? "#e0e7ff" : (dark ? "#cbd5e1" : "#475569") }}>{f}</span>
                </li>
              ))}
            </ul>

            <button onClick={() => setPage("register")} style={{
              width: "100%", padding: "13px",
              background: p.popular ? "#fff" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
              border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 14,
              color: p.popular ? "#6366f1" : "#fff"
            }}>
              {p.cta}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 700, margin: "72px auto 0" }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, textAlign: "center", marginBottom: 36, color: dark ? "#f1f5f9" : "#0f172a" }}>
          Frequently Asked Questions
        </h2>
        {[
          ["Is the free plan really free?", "Yes — 5 tasks per day, forever. No credit card required to start."],
          ["How is my data protected?", "Files are encrypted with AES-256 and auto-deleted after 1 hour. We never share your data."],
          ["Can I cancel anytime?", "Absolutely. No long-term contracts. Cancel with one click from your dashboard."],
          ["Do you offer refunds?", "Yes — 30-day money-back guarantee on all paid plans, no questions asked."],
        ].map(([q, a]) => (
          <div key={q} style={{
            borderBottom: `1px solid ${dark ? "#ffffff0f" : "#e2e8f0"}`,
            padding: "20px 0"
          }}>
            <div style={{ fontWeight: 700, color: dark ? "#f1f5f9" : "#1e293b", marginBottom: 8, fontSize: 15 }}>{q}</div>
            <div style={{ color: dark ? "#94a3b8" : "#64748b", fontSize: 14, lineHeight: 1.6 }}>{a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuthPage({ dark, mode, setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); setTimeout(() => setPage("dashboard"), 1200); }, 1400);
  };

  const inputStyle = {
    width: "100%", padding: "12px 14px", boxSizing: "border-box",
    background: dark ? "#161b2e" : "#f8faff",
    border: `1px solid ${dark ? "#ffffff22" : "#e2e8f0"}`,
    borderRadius: 10, fontSize: 14, color: dark ? "#f1f5f9" : "#1e293b", outline: "none"
  };

  return (
    <div style={{
      minHeight: "80vh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "40px 24px"
    }}>
      <div style={{
        width: "100%", maxWidth: 420, padding: 36,
        background: dark ? "#161b2e" : "#fff",
        border: `1px solid ${dark ? "#ffffff11" : "#e2e8f0"}`,
        borderRadius: 24, boxShadow: dark ? "none" : "0 8px 40px #0000001a"
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", margin: "0 auto 16px"
          }}>
            <Icon path={ICONS.pdf} size={26} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: dark ? "#f1f5f9" : "#0f172a", marginBottom: 6 }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p style={{ fontSize: 13.5, color: dark ? "#94a3b8" : "#64748b" }}>
            {mode === "login" ? "Sign in to your PDFUniverse account" : "Start for free — no credit card needed"}
          </p>
        </div>

        {done ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontWeight: 700, color: dark ? "#f1f5f9" : "#1e293b" }}>
              {mode === "login" ? "Signed in!" : "Account created!"}
            </div>
            <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 6 }}>Redirecting to dashboard…</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "register" && (
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Full name" style={inputStyle} />
            )}
            <input value={email} onChange={e => setEmail(e.target.value)}
              type="email" placeholder="Email address" style={inputStyle} />
            <input value={password} onChange={e => setPassword(e.target.value)}
              type="password" placeholder="Password" style={inputStyle} />
            {mode === "login" && (
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 13, color: "#6366f1", cursor: "pointer", fontWeight: 600 }}>
                  Forgot password?
                </span>
              </div>
            )}
            <button onClick={handleSubmit} disabled={loading} style={{
              padding: "13px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              border: "none", borderRadius: 10, color: "#fff",
              fontWeight: 700, fontSize: 14, cursor: "pointer",
              opacity: loading ? 0.75 : 1
            }}>
              {loading ? "Processing…" : (mode === "login" ? "Sign In" : "Create Account")}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
              <div style={{ flex: 1, height: 1, background: dark ? "#ffffff11" : "#e2e8f0" }} />
              <span style={{ fontSize: 12, color: "#94a3b8" }}>or continue with</span>
              <div style={{ flex: 1, height: 1, background: dark ? "#ffffff11" : "#e2e8f0" }} />
            </div>

            {["Google", "GitHub"].map(s => (
              <button key={s} style={{
                width: "100%", padding: "11px",
                background: dark ? "#ffffff09" : "#f8faff",
                border: `1px solid ${dark ? "#ffffff15" : "#e2e8f0"}`,
                borderRadius: 10, fontSize: 13.5, fontWeight: 600,
                color: dark ? "#f1f5f9" : "#1e293b", cursor: "pointer"
              }}>
                Continue with {s}
              </button>
            ))}

            <p style={{ textAlign: "center", fontSize: 13, color: dark ? "#94a3b8" : "#64748b", marginTop: 4 }}>
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <span
                onClick={() => setPage(mode === "login" ? "register" : "login")}
                style={{ color: "#6366f1", fontWeight: 600, cursor: "pointer" }}
              >
                {mode === "login" ? "Sign up free" : "Sign in"}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardPage({ dark, setPage }) {
  const recentFiles = [
    { name: "Contract_2024.pdf", action: "Compressed", size: "2.4 MB → 0.8 MB", time: "2 min ago", status: "done" },
    { name: "Report_Q4.pdf", action: "Merged", size: "5 files", time: "1 hr ago", status: "done" },
    { name: "Invoice_Jan.pdf", action: "PDF to Word", size: "1.1 MB", time: "3 hr ago", status: "done" },
    { name: "Slides_2024.pptx", action: "PPT to PDF", size: "4.8 MB", time: "Yesterday", status: "done" },
  ];

  const statCards = [
    { label: "Files Processed", val: "127", icon: "pdf", color: "#6366f1" },
    { label: "Space Saved", val: "4.2 GB", icon: "compress", color: "#10b981" },
    { label: "Tasks Today", val: "3/5", icon: "zap", color: "#f59e0b" },
    { label: "Plan", val: "Free", icon: "star", color: "#8b5cf6" },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "50px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: dark ? "#f1f5f9" : "#0f172a", marginBottom: 4 }}>
            Dashboard
          </h1>
          <p style={{ color: dark ? "#94a3b8" : "#64748b", fontSize: 14 }}>
            Welcome back, Alex 👋
          </p>
        </div>
        <button onClick={() => setPage("pricing")} style={{
          padding: "10px 22px", background: "linear-gradient(135deg,#f59e0b,#f97316)",
          border: "none", borderRadius: 10, color: "#fff", fontWeight: 700,
          fontSize: 13, cursor: "pointer"
        }}>
          ⚡ Upgrade to Pro
        </button>
      </div>

      {/* Stats */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
        gap: 18, marginBottom: 40
      }}>
        {statCards.map(s => (
          <div key={s.label} style={{
            padding: "22px 20px", borderRadius: 18,
            background: dark ? "#161b2e" : "#fff",
            border: `1px solid ${dark ? "#ffffff11" : "#e2e8f0"}`,
            boxShadow: dark ? "none" : "0 1px 6px #0000000a"
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, background: s.color + "18",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: s.color, marginBottom: 14
            }}>
              <Icon path={ICONS[s.icon]} size={20} />
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: dark ? "#f1f5f9" : "#0f172a", letterSpacing: "-0.02em" }}>
              {s.val}
            </div>
            <div style={{ fontSize: 12.5, color: dark ? "#94a3b8" : "#64748b", marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
        {/* Recent activity */}
        <div style={{
          padding: 24, borderRadius: 20,
          background: dark ? "#161b2e" : "#fff",
          border: `1px solid ${dark ? "#ffffff11" : "#e2e8f0"}`
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: dark ? "#f1f5f9" : "#1e293b", marginBottom: 20 }}>
            Recent Activity
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {recentFiles.map((f, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "12px 0",
                borderBottom: i < recentFiles.length - 1 ? `1px solid ${dark ? "#ffffff08" : "#f1f5f9"}` : "none"
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, background: "#6366f115",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", flexShrink: 0
                }}>
                  <Icon path={ICONS.pdf} size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 600, fontSize: 13.5, color: dark ? "#f1f5f9" : "#1e293b",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                  }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: dark ? "#94a3b8" : "#64748b", marginTop: 2 }}>
                    {f.action} · {f.size}
                  </div>
                </div>
                <div style={{ fontSize: 11.5, color: dark ? "#94a3b8" : "#94a3b8", flexShrink: 0 }}>{f.time}</div>
                <div style={{
                  width: 8, height: 8, borderRadius: 99, background: "#10b981", flexShrink: 0
                }} />
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{
          padding: 24, borderRadius: 20,
          background: dark ? "#161b2e" : "#fff",
          border: `1px solid ${dark ? "#ffffff11" : "#e2e8f0"}`
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: dark ? "#f1f5f9" : "#1e293b", marginBottom: 20 }}>
            Quick Tools
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {TOOLS.slice(0, 7).map(t => (
              <button key={t.id} onClick={() => setPage("tools")} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                background: dark ? "#ffffff07" : "#f8faff",
                border: `1px solid ${dark ? "#ffffff0f" : "#e2e8f0"}`,
                borderRadius: 10, cursor: "pointer", textAlign: "left"
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8, background: t.color + "18",
                  display: "flex", alignItems: "center", justifyContent: "center", color: t.color, flexShrink: 0
                }}>
                  <Icon path={ICONS[t.icon]} size={15} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: dark ? "#e2e8f0" : "#1e293b" }}>{t.label}</span>
                <Icon path={ICONS.arrow} size={13} style={{ marginLeft: "auto", color: "#94a3b8" }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactPage({ dark }) {
  const inputStyle = {
    width: "100%", padding: "12px 14px", boxSizing: "border-box",
    background: dark ? "#161b2e" : "#f8faff",
    border: `1px solid ${dark ? "#ffffff22" : "#e2e8f0"}`,
    borderRadius: 10, fontSize: 14, color: dark ? "#f1f5f9" : "#1e293b", outline: "none"
  };
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "70px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <Badge color="#06b6d4">Contact</Badge>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginTop: 12, color: dark ? "#f1f5f9" : "#0f172a" }}>
          Get in Touch
        </h1>
        <p style={{ color: dark ? "#94a3b8" : "#64748b", fontSize: 15, marginTop: 10 }}>
          Have a question or need help? We typically respond within 2 hours.
        </p>
      </div>
      <div style={{
        padding: 36, background: dark ? "#161b2e" : "#fff",
        border: `1px solid ${dark ? "#ffffff11" : "#e2e8f0"}`,
        borderRadius: 24, display: "flex", flexDirection: "column", gap: 16
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <input placeholder="First name" style={inputStyle} />
          <input placeholder="Last name" style={inputStyle} />
        </div>
        <input type="email" placeholder="Email address" style={inputStyle} />
        <input placeholder="Subject" style={inputStyle} />
        <textarea placeholder="Your message..." rows={5} style={{
          ...inputStyle, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6
        }} />
        <button style={{
          padding: "13px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          border: "none", borderRadius: 10, color: "#fff", fontWeight: 700,
          fontSize: 14, cursor: "pointer"
        }}>
          Send Message →
        </button>
      </div>
    </div>
  );
}

function LegalPage({ dark, type }) {
  const isPrivacy = type === "privacy";
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "70px 24px" }}>
      <h1 style={{ fontSize: 34, fontWeight: 800, color: dark ? "#f1f5f9" : "#0f172a", marginBottom: 8 }}>
        {isPrivacy ? "Privacy Policy" : "Terms of Service"}
      </h1>
      <p style={{ color: dark ? "#94a3b8" : "#64748b", fontSize: 14, marginBottom: 40 }}>
        Last updated: January 1, 2025
      </p>
      {(isPrivacy ? [
        ["Data We Collect", "We collect information you provide directly to us, such as your name, email address, and payment information. We also collect usage data and files you upload to our service."],
        ["How We Use Your Data", "Files are processed for the sole purpose of providing our PDF services. We do not read, share, or sell your documents. Files are automatically deleted after 1 hour."],
        ["Data Security", "We use AES-256 encryption for all files in transit and at rest. Our infrastructure is hosted on SOC 2 compliant cloud providers."],
        ["Your Rights", "You can delete your account and all associated data at any time from your dashboard settings. GDPR and CCPA rights are fully respected."],
      ] : [
        ["Acceptance of Terms", "By using PDFUniverse, you agree to these Terms of Service. If you do not agree, please do not use our services."],
        ["Permitted Use", "PDFUniverse is for personal and business document processing. You may not use the service to process illegal content or infringe on intellectual property."],
        ["Service Limitations", "Free accounts are limited to 5 tasks per day and 50MB file size. These limits may change with notice."],
        ["Disclaimer", "PDFUniverse is provided 'as is'. While we aim for 99.9% uptime, we are not liable for temporary service interruptions."],
      ]).map(([title, text]) => (
        <div key={title} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: dark ? "#f1f5f9" : "#1e293b", marginBottom: 10 }}>{title}</h2>
          <p style={{ color: dark ? "#94a3b8" : "#64748b", fontSize: 14.5, lineHeight: 1.8 }}>{text}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [dark, setDark] = useState(true);
  const [page, setPage] = useState("home");
  const [activeTool, setActiveTool] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id: "tools", label: "Tools" },
    { id: "pricing", label: "Pricing" },
    { id: "contact", label: "Contact" },
  ];

  const bg = dark ? "#0b0f1a" : "#f8faff";
  const navBg = dark ? "#0b0f1aee" : "#ffffffee";

  return (
    <div style={{
      minHeight: "100vh", background: bg,
      fontFamily: "'DM Sans', 'Sora', system-ui, -apple-system, sans-serif",
      color: dark ? "#f1f5f9" : "#1e293b",
      transition: "background 0.3s, color 0.3s"
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } 
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #6366f144; border-radius: 99px; }
        button { font-family: inherit; }
        input, textarea { font-family: inherit; }
      `}</style>

      {/* Navbar */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: navBg, backdropFilter: "blur(18px)",
        borderBottom: `1px solid ${dark ? "#ffffff0d" : "#e2e8f0"}`,
        padding: "0 24px"
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", alignItems: "center", height: 64, gap: 16
        }}>
          {/* Logo */}
          <div
            onClick={() => setPage("home")}
            style={{
              display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flexShrink: 0
            }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Icon path={ICONS.pdf} size={18} style={{ color: "#fff" }} />
            </div>
            <span style={{
              fontWeight: 800, fontSize: 17, letterSpacing: "-0.02em",
              fontFamily: "'Sora', sans-serif",
              color: dark ? "#f1f5f9" : "#0f172a"
            }}>
              PDF<span style={{ color: "#6366f1" }}>Universe</span>
            </span>
          </div>

          {/* Desktop nav */}
          <div style={{ display: "flex", gap: 4, flex: 1, justifyContent: "center" }}>
            {navItems.map(n => (
              <button key={n.id} onClick={() => setPage(n.id)} style={{
                padding: "7px 16px", background: "none",
                border: page === n.id ? `1px solid ${dark ? "#ffffff22" : "#e2e8f0"}` : "1px solid transparent",
                borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600,
                color: page === n.id ? (dark ? "#f1f5f9" : "#1e293b") : (dark ? "#94a3b8" : "#64748b"),
                background: page === n.id ? (dark ? "#ffffff0d" : "#f1f5f9") : "transparent"
              }}>{n.label}</button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Dark mode */}
            <button onClick={() => setDark(d => !d)} style={{
              width: 36, height: 36, borderRadius: 8, border: `1px solid ${dark ? "#ffffff1a" : "#e2e8f0"}`,
              background: dark ? "#ffffff0d" : "#f1f5f9", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
              color: dark ? "#f59e0b" : "#64748b"
            }}>
              <Icon path={dark ? ICONS.sun : ICONS.moon} size={16} />
            </button>

            <button onClick={() => setPage("login")} style={{
              padding: "8px 16px", background: "none",
              border: `1px solid ${dark ? "#ffffff1a" : "#e2e8f0"}`,
              borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
              color: dark ? "#94a3b8" : "#64748b"
            }}>Sign In</button>

            <button onClick={() => setPage("register")} style={{
              padding: "8px 16px",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              border: "none", borderRadius: 8, cursor: "pointer",
              fontSize: 13, fontWeight: 700, color: "#fff"
            }}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Pages */}
      {page === "home" && <HomePage dark={dark} setPage={setPage} setActiveTool={setActiveTool} />}
      {page === "tools" && <ToolsPage dark={dark} setPage={setPage} setActiveTool={setActiveTool} />}
      {page === "tool" && <ToolPage dark={dark} tool={activeTool} setPage={setPage} />}
      {page === "pricing" && <PricingPage dark={dark} setPage={setPage} />}
      {page === "login" && <AuthPage dark={dark} mode="login" setPage={setPage} />}
      {page === "register" && <AuthPage dark={dark} mode="register" setPage={setPage} />}
      {page === "dashboard" && <DashboardPage dark={dark} setPage={setPage} />}
      {page === "contact" && <ContactPage dark={dark} />}
      {page === "privacy" && <LegalPage dark={dark} type="privacy" />}
      {page === "terms" && <LegalPage dark={dark} type="terms" />}

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${dark ? "#ffffff0d" : "#e2e8f0"}`,
        padding: "48px 24px 32px",
        background: dark ? "#07090f" : "#fff"
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: dark ? "#f1f5f9" : "#0f172a", marginBottom: 6, fontFamily: "'Sora', sans-serif" }}>
                PDF<span style={{ color: "#6366f1" }}>Universe</span>
              </div>
              <p style={{ fontSize: 13, color: dark ? "#94a3b8" : "#64748b", lineHeight: 1.7, maxWidth: 200 }}>
                The most powerful PDF platform on the web. Free forever.
              </p>
            </div>
            {[
              { title: "Product", links: ["tools", "pricing", "dashboard"] },
              { title: "Company", links: ["contact", "privacy", "terms"] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontWeight: 700, fontSize: 13, color: dark ? "#f1f5f9" : "#0f172a", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {col.title}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {col.links.map(l => (
                    <span key={l} onClick={() => setPage(l)} style={{
                      fontSize: 13.5, color: dark ? "#94a3b8" : "#64748b",
                      cursor: "pointer", textTransform: "capitalize"
                    }}>{l}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            borderTop: `1px solid ${dark ? "#ffffff08" : "#e2e8f0"}`,
            paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: 12
          }}>
            <span style={{ fontSize: 13, color: dark ? "#94a3b8" : "#94a3b8" }}>
              © 2025 PDFUniverse. Built with ❤️ for everyone.
            </span>
            <div style={{ display: "flex", gap: 16 }}>
              {["privacy", "terms", "contact"].map(l => (
                <span key={l} onClick={() => setPage(l)} style={{
                  fontSize: 13, color: dark ? "#94a3b8" : "#94a3b8",
                  cursor: "pointer", textTransform: "capitalize"
                }}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
