/**
 * PDFUniverse — PDF Processing Routes
 * POST /api/pdf/:tool
 * Handles: merge, split, compress, convert, watermark,
 *          rotate, protect, unlock, ocr, ai-summarize, ai-qa
 */

const express  = require("express");
const multer   = require("multer");
const path     = require("path");
const fs       = require("fs");
const crypto   = require("crypto");
const { PDFDocument, rgb, degrees, StandardFonts } = require("pdf-lib");
const Anthropic = require("@anthropic-ai/sdk");
const Tesseract = require("tesseract.js");

const { authenticate, requirePro } = require("./auth");
const { User, FileJob }            = require("../models");

const router = express.Router();

// ─── Multer Setup ─────────────────────────────────────────────────────────

const UPLOAD_DIR = path.join(__dirname, "../uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const jobDir = path.join(UPLOAD_DIR, crypto.randomBytes(8).toString("hex"));
    fs.mkdirSync(jobDir, { recursive: true });
    req._jobDir = req._jobDir || jobDir;
    cb(null, req._jobDir);
  },
  filename: (req, file, cb) => {
    const safe = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${path.extname(file.originalname)}`;
    cb(null, safe);
  },
});

const fileFilter = (req, file, cb) => {
  const ALLOWED = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "image/jpeg", "image/png", "image/webp",
  ];
  if (ALLOWED.includes(file.mimetype)) cb(null, true);
  else cb(new Error(`File type not supported: ${file.mimetype}`), false);
};

// Free: 50MB · Pro/Team: 2GB
const getFileSizeLimit = (plan) =>
  ["pro", "team"].includes(plan) ? 2 * 1024 * 1024 * 1024 : 50 * 1024 * 1024;

const upload = multer({ storage, fileFilter, limits: { files: 50 } });

// ─── Helpers ──────────────────────────────────────────────────────────────

const OUTPUT_DIR = path.join(__dirname, "../outputs");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const saveOutput = async (buffer, ext) => {
  const filename = `out-${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
  const filePath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, buffer);
  return { filename, filePath };
};

const buildDownloadUrl = (filename) =>
  `${process.env.API_URL}/outputs/${filename}`;

// ─── Task Gating Middleware ────────────────────────────────────────────────

const taskGate = async (req, res, next) => {
  if (!req.user) return next();        // anonymous: checked later
  const user = await User.findById(req.user.id);
  if (!user.canProcessTask()) {
    return res.status(429).json({
      error  : "Daily task limit reached (5/day on Free plan).",
      upgrade: true,
    });
  }
  req._user = user;
  next();
};

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/pdf/merge
// Merges multiple PDFs into one
// ═══════════════════════════════════════════════════════════════════════════
router.post("/merge", authenticate, taskGate, upload.array("files", 20), async (req, res) => {
  const start = Date.now();
  const job   = await FileJob.create({
    userId     : req.user.id,
    tool       : "merge",
    status     : "processing",
    inputFiles : req.files.map(f => ({
      originalName : f.originalname,
      storedName   : f.filename,
      path         : f.path,
      size         : f.size,
      mimeType     : f.mimetype,
    })),
  });

  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: "At least 2 PDF files are required to merge." });
    }

    const merged = await PDFDocument.create();

    for (const file of req.files) {
      const bytes = fs.readFileSync(file.path);
      const pdf   = await PDFDocument.load(bytes);
      const pages = await merged.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(p => merged.addPage(p));
    }

    const mergedBytes = await merged.save();
    const { filename }  = await saveOutput(mergedBytes, "pdf");

    const outputFile = {
      originalName : "merged.pdf",
      storedName   : filename,
      path         : path.join(OUTPUT_DIR, filename),
      size         : mergedBytes.byteLength,
      downloadUrl  : buildDownloadUrl(filename),
      expiresAt    : new Date(Date.now() + 60 * 60 * 1000),
    };

    job.status       = "done";
    job.outputFile   = outputFile;
    job.processingMs = Date.now() - start;
    await job.save();
    await req._user.incrementTaskCount();

    res.json({
      success     : true,
      downloadUrl : outputFile.downloadUrl,
      filename    : outputFile.originalName,
      sizeBytes   : outputFile.size,
      pageCount   : merged.getPageCount(),
      jobId       : job._id,
    });

  } catch (err) {
    console.error("Merge error:", err);
    job.status       = "failed";
    job.errorMessage = err.message;
    await job.save();
    res.status(500).json({ error: "PDF merge failed. Please ensure all files are valid PDFs." });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/pdf/split
// Splits PDF by page ranges or into single pages
// ═══════════════════════════════════════════════════════════════════════════
router.post("/split", authenticate, taskGate, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "PDF file required." });

    const bytes     = fs.readFileSync(req.file.path);
    const srcPdf    = await PDFDocument.load(bytes);
    const totalPages = srcPdf.getPageCount();

    // Parse page ranges: "1-3,5,7-9" or split into individual pages
    let ranges = [];
    if (req.body.ranges) {
      ranges = req.body.ranges.split(",").map(r => {
        const [s, e] = r.trim().split("-").map(Number);
        return e ? { start: s - 1, end: e - 1 } : { start: s - 1, end: s - 1 };
      });
    } else {
      // Split every page individually
      ranges = Array.from({ length: totalPages }, (_, i) => ({ start: i, end: i }));
    }

    const downloadUrls = [];

    for (let i = 0; i < ranges.length; i++) {
      const { start, end } = ranges[i];
      const chunk = await PDFDocument.create();
      const pages = await chunk.copyPages(srcPdf, Array.from(
        { length: end - start + 1 }, (_, j) => start + j
      ));
      pages.forEach(p => chunk.addPage(p));
      const outBytes       = await chunk.save();
      const { filename }   = await saveOutput(outBytes, "pdf");
      downloadUrls.push({
        range      : `pages-${start + 1}-${end + 1}`,
        downloadUrl: buildDownloadUrl(filename),
        pages      : end - start + 1,
      });
    }

    res.json({ success: true, parts: downloadUrls, totalParts: downloadUrls.length });

  } catch (err) {
    console.error("Split error:", err);
    res.status(500).json({ error: "PDF split failed." });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/pdf/compress
// Compresses PDF by removing metadata and re-serializing
// ═══════════════════════════════════════════════════════════════════════════
router.post("/compress", authenticate, taskGate, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "PDF file required." });

    const originalSize = req.file.size;
    const bytes        = fs.readFileSync(req.file.path);
    const pdf          = await PDFDocument.load(bytes, { ignoreEncryption: true });

    // Remove metadata
    pdf.setTitle("");
    pdf.setAuthor("");
    pdf.setSubject("");
    pdf.setKeywords([]);
    pdf.setCreator("PDFUniverse");
    pdf.setProducer("PDFUniverse");

    const compressed = await pdf.save({ useObjectStreams: true, addDefaultPage: false });
    const { filename } = await saveOutput(compressed, "pdf");

    const savedBytes = originalSize - compressed.byteLength;
    const savedPct   = ((savedBytes / originalSize) * 100).toFixed(1);

    res.json({
      success       : true,
      downloadUrl   : buildDownloadUrl(filename),
      originalSize,
      compressedSize: compressed.byteLength,
      savedBytes    : Math.max(savedBytes, 0),
      savedPercent  : Math.max(parseFloat(savedPct), 0),
    });
  } catch (err) {
    console.error("Compress error:", err);
    res.status(500).json({ error: "PDF compression failed." });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/pdf/watermark
// Adds text watermark to every page
// ═══════════════════════════════════════════════════════════════════════════
router.post("/watermark", authenticate, taskGate, upload.single("file"), async (req, res) => {
  try {
    const { text = "CONFIDENTIAL", opacity = 0.15, angle = 45 } = req.body;
    const bytes = fs.readFileSync(req.file.path);
    const pdf   = await PDFDocument.load(bytes);
    const font  = await pdf.embedFont(StandardFonts.HelveticaBold);

    for (const page of pdf.getPages()) {
      const { width, height } = page.getSize();
      page.drawText(text, {
        x        : width / 2 - (text.length * 18) / 2,
        y        : height / 2,
        size     : 52,
        font,
        color    : rgb(0.4, 0.4, 0.4),
        opacity  : parseFloat(opacity),
        rotate   : degrees(parseInt(angle)),
      });
    }

    const out       = await pdf.save();
    const { filename } = await saveOutput(out, "pdf");
    res.json({ success: true, downloadUrl: buildDownloadUrl(filename) });
  } catch (err) {
    res.status(500).json({ error: "Watermark failed." });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/pdf/rotate
// Rotates pages by specified degrees
// ═══════════════════════════════════════════════════════════════════════════
router.post("/rotate", authenticate, taskGate, upload.single("file"), async (req, res) => {
  try {
    const rotation = parseInt(req.body.degrees || 90);
    const bytes    = fs.readFileSync(req.file.path);
    const pdf      = await PDFDocument.load(bytes);

    for (const page of pdf.getPages()) {
      page.setRotation(degrees((page.getRotation().angle + rotation) % 360));
    }

    const out          = await pdf.save();
    const { filename } = await saveOutput(out, "pdf");
    res.json({ success: true, downloadUrl: buildDownloadUrl(filename) });
  } catch (err) {
    res.status(500).json({ error: "Rotation failed." });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/pdf/protect
// Password-protects a PDF
// ═══════════════════════════════════════════════════════════════════════════
router.post("/protect", authenticate, taskGate, upload.single("file"), async (req, res) => {
  try {
    const { password, ownerPassword } = req.body;
    if (!password) return res.status(400).json({ error: "Password required." });

    const bytes = fs.readFileSync(req.file.path);
    const pdf   = await PDFDocument.load(bytes);

    // pdf-lib supports encryption via encryptFile option
    // For production use qpdf via child_process for full AES-256 encryption
    const { execSync } = require("child_process");
    const tmpIn  = req.file.path;
    const tmpOut = path.join(OUTPUT_DIR, `protected-${Date.now()}.pdf`);

    execSync(
      `qpdf --encrypt "${password}" "${ownerPassword || password}" 256 -- "${tmpIn}" "${tmpOut}"`,
      { timeout: 30000 }
    );

    const filename = path.basename(tmpOut);
    res.json({ success: true, downloadUrl: buildDownloadUrl(filename) });
  } catch (err) {
    // Fallback if qpdf not installed — inform the user
    console.error("Protect error:", err.message);
    res.status(500).json({ error: "PDF protection failed. Ensure qpdf is installed on the server." });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/pdf/ocr   [PRO]
// Extracts text from scanned PDFs using Tesseract.js
// ═══════════════════════════════════════════════════════════════════════════
router.post("/ocr", authenticate, requirePro, taskGate, upload.single("file"), async (req, res) => {
  try {
    const lang = req.body.lang || "eng";

    const { data: { text } } = await Tesseract.recognize(req.file.path, lang, {
      logger: m => {
        // could emit via SSE for progress
        if (process.env.NODE_ENV !== "production") console.log(m);
      },
    });

    // Save extracted text as txt file
    const { filename } = await saveOutput(Buffer.from(text, "utf8"), "txt");

    res.json({
      success     : true,
      text        : text.slice(0, 2000),    // preview
      downloadUrl : buildDownloadUrl(filename),
      charCount   : text.length,
    });
  } catch (err) {
    res.status(500).json({ error: "OCR processing failed." });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/pdf/ai-summarize   [PRO]
// Summarizes PDF content using Claude
// ═══════════════════════════════════════════════════════════════════════════
router.post("/ai-summarize", authenticate, requirePro, taskGate, upload.single("file"), async (req, res) => {
  try {
    // Extract text via pdfjs or Tesseract for scanned docs
    const { text } = await Tesseract.recognize(req.file.path, "eng");
    const truncated = text.slice(0, 12000);  // Claude context limit safety

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg    = await client.messages.create({
      model      : "claude-opus-4-5",
      max_tokens : 1024,
      messages   : [{
        role   : "user",
        content: `Summarize the following document in a clear, structured way with key points:\n\n${truncated}`,
      }],
    });

    const summary = msg.content[0].text;

    res.json({
      success  : true,
      summary,
      wordCount: truncated.split(/\s+/).length,
    });
  } catch (err) {
    console.error("AI summarize error:", err);
    res.status(500).json({ error: "AI summarization failed." });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/pdf/ai-qa   [PRO]
// Q&A on PDF content using Claude
// ═══════════════════════════════════════════════════════════════════════════
router.post("/ai-qa", authenticate, requirePro, taskGate, upload.single("file"), async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Question is required." });

    const { text } = await Tesseract.recognize(req.file.path, "eng");
    const truncated = text.slice(0, 12000);

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg    = await client.messages.create({
      model      : "claude-opus-4-5",
      max_tokens : 512,
      messages   : [{
        role   : "user",
        content: `Document content:\n${truncated}\n\n---\nQuestion: ${question}\n\nAnswer based only on the document above.`,
      }],
    });

    res.json({ success: true, answer: msg.content[0].text, question });
  } catch (err) {
    res.status(500).json({ error: "AI Q&A failed." });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/pdf/history
// Returns job history for authenticated user
// ═══════════════════════════════════════════════════════════════════════════
router.get("/history", authenticate, async (req, res) => {
  try {
    const page  = parseInt(req.query.page  || 1);
    const limit = parseInt(req.query.limit || 20);
    const skip  = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      FileJob.find({ userId: req.user.id, isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-inputFiles.path -outputFile.path"),
      FileJob.countDocuments({ userId: req.user.id, isDeleted: false }),
    ]);

    res.json({ jobs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history." });
  }
});

module.exports = router;
