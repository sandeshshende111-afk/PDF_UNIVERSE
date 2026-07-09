/**
 * PDFUniverse — Authentication
 * Routes: /api/auth/*
 * JWT + Refresh Token pattern
 */

// ═══════════════════════════════════════════════════════════
// middleware/auth.js
// ═══════════════════════════════════════════════════════════
const jwt = require("jsonwebtoken");

/**
 * Verify access token and attach req.user
 */
const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;   // { id, email, role, plan }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};

/**
 * Require admin role
 */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

/**
 * Require Pro or Team plan
 */
const requirePro = (req, res, next) => {
  if (!["pro", "team"].includes(req.user?.plan)) {
    return res.status(403).json({
      error    : "Pro plan required for this feature",
      upgrade  : true,
    });
  }
  next();
};

// ═══════════════════════════════════════════════════════════
// routes/auth.js
// ═══════════════════════════════════════════════════════════
const express      = require("express");
const rateLimit    = require("express-rate-limit");
const crypto       = require("crypto");
const { User }     = require("../models");

const router = express.Router();

// Stricter rate limit on auth endpoints
const authLimiter = rateLimit({
  windowMs : 15 * 60 * 1000,
  max      : 10,
  message  : { error: "Too many auth attempts. Try again in 15 minutes." },
});

// ── Helper: sign tokens ──
const signTokens = (user) => {
  const payload = { id: user._id, email: user.email, role: user.role, plan: user.plan };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "30d" }
  );

  return { accessToken, refreshToken };
};

// ── POST /api/auth/register ──
router.post("/register", authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, and password are required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const verifyToken = crypto.randomBytes(32).toString("hex");
    const user = await User.create({
      name,
      email,
      password,
      emailVerifyToken: verifyToken,
    });

    // TODO: send verification email via nodemailer
    // await sendVerificationEmail(user.email, verifyToken);

    const { accessToken, refreshToken } = signTokens(user);

    res.status(201).json({
      message      : "Account created. Please verify your email.",
      accessToken,
      refreshToken,
      user         : { id: user._id, name: user.name, email: user.email, plan: user.plan },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// ── POST /api/auth/login ──
router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: "Account suspended. Contact support." });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const { accessToken, refreshToken } = signTokens(user);

    res.json({
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// ── POST /api/auth/refresh ──
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: "Refresh token required." });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user    = await User.findById(decoded.id);

    if (!user || user.isBanned) {
      return res.status(401).json({ error: "User not found or banned." });
    }

    const { accessToken, refreshToken: newRefresh } = signTokens(user);
    res.json({ accessToken, refreshToken: newRefresh });
  } catch (err) {
    return res.status(401).json({ error: "Invalid refresh token." });
  }
});

// ── POST /api/auth/forgot-password ──
router.post("/forgot-password", authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    // Always respond success to prevent email enumeration
    if (!user) return res.json({ message: "If that email exists, a reset link was sent." });

    const token   = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
    user.passwordResetExp   = expires;
    await user.save();

    // TODO: await sendPasswordResetEmail(user.email, token);

    res.json({ message: "If that email exists, a reset link was sent." });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// ── POST /api/auth/reset-password ──
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken : hashed,
      passwordResetExp   : { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ error: "Invalid or expired reset token." });
    if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });

    user.password           = password;
    user.passwordResetToken = null;
    user.passwordResetExp   = null;
    await user.save();

    res.json({ message: "Password reset successful. Please log in." });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// ── GET /api/auth/me ──
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -emailVerifyToken -passwordResetToken");
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// Export router AND middleware so other files can import authenticate
module.exports        = router;
module.exports.authenticate  = authenticate;
module.exports.requireAdmin  = requireAdmin;
module.exports.requirePro    = requirePro;
