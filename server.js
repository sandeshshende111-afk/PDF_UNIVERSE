require("dotenv").config();

const cors = require("cors");
const express = require("express");
const fs = require("fs");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const path = require("path");
const { PDFDocument, StandardFonts, degrees, rgb } = require("pdf-lib");

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const UPLOAD_DIR = path.join(__dirname, "uploads");
const OUTPUT_DIR = path.join(__dirname, "outputs");

for (const dir of [UPLOAD_DIR, OUTPUT_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

const upload = multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: 50 * 1024 * 1024, files: 20 },
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype === "application/pdf" || /\.pdf$/i.test(file.originalname));
  },
});

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: [FRONTEND_URL, "http://127.0.0.1:3000"], credentials: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use("/outputs", express.static(OUTPUT_DIR));
app.use(express.static(path.join(__dirname, "dist")));

function outputName(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}.pdf`;
}

async function savePdf(pdfDoc, prefix) {
  const bytes = await pdfDoc.save({ useObjectStreams: true });
  const filename = outputName(prefix);
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), bytes);
  return {
    filename,
    sizeBytes: bytes.byteLength,
  };
}

function downloadUrl(req, filename) {
  const origin = process.env.API_URL || `${req.protocol}://${req.get("host")}`;
  return `${origin}/outputs/${filename}`;
}

function cleanup(files = []) {
  for (const file of files) {
    fs.promises.unlink(file.path).catch(() => {});
  }
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", app: "PDFUniverse", time: new Date().toISOString() });
});

app.post("/api/pdf/merge", upload.array("files", 20), async (req, res, next) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: "Upload at least two PDF files to merge." });
    }

    const merged = await PDFDocument.create();
    for (const file of req.files) {
      const pdf = await PDFDocument.load(fs.readFileSync(file.path));
      const pages = await merged.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => merged.addPage(page));
    }

    const output = await savePdf(merged, "merged");
    res.json({ success: true, filename: "merged.pdf", pageCount: merged.getPageCount(), ...output, downloadUrl: downloadUrl(req, output.filename) });
  } catch (error) {
    next(error);
  } finally {
    cleanup(req.files);
  }
});

app.post("/api/pdf/split", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Upload one PDF file to split." });

    const source = await PDFDocument.load(fs.readFileSync(req.file.path));
    const first = await PDFDocument.create();
    const [page] = await first.copyPages(source, [0]);
    first.addPage(page);
    const output = await savePdf(first, "split-page-1");

    const url = downloadUrl(req, output.filename);
    res.json({ success: true, filename: "page-1.pdf", totalParts: 1, parts: [{ pages: 1, ...output, downloadUrl: url }], ...output, downloadUrl: url });
  } catch (error) {
    next(error);
  } finally {
    cleanup(req.file ? [req.file] : []);
  }
});

app.post("/api/pdf/compress", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Upload one PDF file to compress." });

    const originalSize = req.file.size;
    const pdf = await PDFDocument.load(fs.readFileSync(req.file.path), { ignoreEncryption: true });
    pdf.setTitle("");
    pdf.setAuthor("");
    pdf.setSubject("");
    pdf.setKeywords([]);
    const output = await savePdf(pdf, "compressed");
    const savedBytes = Math.max(originalSize - output.sizeBytes, 0);

    res.json({
      success: true,
      filename: "compressed.pdf",
      originalSize,
      compressedSize: output.sizeBytes,
      savedBytes,
      savedPercent: originalSize ? Math.round((savedBytes / originalSize) * 1000) / 10 : 0,
      ...output,
      downloadUrl: downloadUrl(req, output.filename),
    });
  } catch (error) {
    next(error);
  } finally {
    cleanup(req.file ? [req.file] : []);
  }
});

app.post("/api/pdf/rotate", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Upload one PDF file to rotate." });
    const pdf = await PDFDocument.load(fs.readFileSync(req.file.path));
    for (const page of pdf.getPages()) {
      page.setRotation(degrees((page.getRotation().angle + 90) % 360));
    }
    const output = await savePdf(pdf, "rotated");
    res.json({ success: true, filename: "rotated.pdf", ...output, downloadUrl: downloadUrl(req, output.filename) });
  } catch (error) {
    next(error);
  } finally {
    cleanup(req.file ? [req.file] : []);
  }
});

app.post("/api/pdf/watermark", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Upload one PDF file to watermark." });
    const pdf = await PDFDocument.load(fs.readFileSync(req.file.path));
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);
    for (const page of pdf.getPages()) {
      const { width, height } = page.getSize();
      page.drawText(req.body.text || "PDFUniverse", {
        x: width * 0.18,
        y: height * 0.48,
        size: 42,
        font,
        color: rgb(0.35, 0.35, 0.35),
        opacity: 0.18,
        rotate: degrees(35),
      });
    }
    const output = await savePdf(pdf, "watermarked");
    res.json({ success: true, filename: "watermarked.pdf", ...output, downloadUrl: downloadUrl(req, output.filename) });
  } catch (error) {
    next(error);
  } finally {
    cleanup(req.file ? [req.file] : []);
  }
});

app.post("/api/pdf/:tool", upload.any(), (req, res) => {
  cleanup(req.files);
  res.status(501).json({
    error: `${req.params.tool} is not available in the free live build yet. Core PDF tools are merge, split, compress, rotate, and watermark.`,
  });
});

app.get("*", (_req, res) => {
  const indexPath = path.join(__dirname, "dist", "index.html");
  if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
  res.status(404).send("Run npm run build before serving the production app.");
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: error.message || "PDF processing failed." });
});

app.listen(PORT, () => {
  console.log(`PDFUniverse API running on port ${PORT}`);
});
