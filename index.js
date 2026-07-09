/**
 * PDFUniverse — MongoDB Schemas
 * User · FileJob · Subscription · Admin
 */

const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

// ─── User Schema ──────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name     : { type: String, required: true, trim: true, maxlength: 80 },
    email    : { type: String, required: true, unique: true, lowercase: true, trim: true },
    password : { type: String, minlength: 8 },   // null for OAuth users
    avatar   : { type: String, default: null },
    role     : { type: String, enum: ["user", "admin"], default: "user" },

    // OAuth
    provider     : { type: String, enum: ["local", "google", "github"], default: "local" },
    providerId   : { type: String, default: null },

    // Subscription
    plan              : { type: String, enum: ["free", "pro", "team"], default: "free" },
    subscriptionId    : { type: String, default: null },  // Stripe subscription ID
    subscriptionEnd   : { type: Date,   default: null },
    stripeCustomerId  : { type: String, default: null },

    // Usage tracking
    dailyTaskCount    : { type: Number, default: 0 },
    dailyTaskDate     : { type: Date,   default: Date.now },
    totalTaskCount    : { type: Number, default: 0 },
    storageSaved      : { type: Number, default: 0 },  // bytes

    // Account
    isEmailVerified   : { type: Boolean, default: false },
    emailVerifyToken  : { type: String,  default: null },
    passwordResetToken: { type: String,  default: null },
    passwordResetExp  : { type: Date,    default: null },
    lastLoginAt       : { type: Date,    default: null },
    isActive          : { type: Boolean, default: true },
    isBanned          : { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Check daily task limit
userSchema.methods.canProcessTask = function () {
  const today = new Date().toDateString();
  const taskDay = this.dailyTaskDate
    ? new Date(this.dailyTaskDate).toDateString()
    : null;

  // Reset count on new day
  if (taskDay !== today) {
    this.dailyTaskCount = 0;
    this.dailyTaskDate  = new Date();
  }

  const limit = this.plan === "free" ? 5 : Infinity;
  return this.dailyTaskCount < limit;
};

userSchema.methods.incrementTaskCount = async function () {
  const today   = new Date().toDateString();
  const taskDay = this.dailyTaskDate
    ? new Date(this.dailyTaskDate).toDateString()
    : null;

  if (taskDay !== today) {
    this.dailyTaskCount = 0;
    this.dailyTaskDate  = new Date();
  }

  this.dailyTaskCount += 1;
  this.totalTaskCount += 1;
  await this.save();
};

userSchema.index({ email: 1 });
userSchema.index({ stripeCustomerId: 1 });

const User = mongoose.model("User", userSchema);

// ─── File Job Schema ──────────────────────────────────────────────────────
const fileJobSchema = new mongoose.Schema(
  {
    userId     : { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tool       : { type: String, required: true },  // "merge", "compress", "ocr", etc.
    status     : { type: String, enum: ["queued", "processing", "done", "failed"], default: "queued" },

    // Input files
    inputFiles : [
      {
        originalName : String,
        storedName   : String,
        path         : String,
        size         : Number,   // bytes
        mimeType     : String,
      }
    ],

    // Output file
    outputFile : {
      originalName : String,
      storedName   : String,
      path         : String,
      size         : Number,
      downloadUrl  : String,
      expiresAt    : { type: Date, default: () => new Date(Date.now() + 60 * 60 * 1000) },  // +1hr
    },

    // Processing metadata
    options       : { type: mongoose.Schema.Types.Mixed, default: {} },
    errorMessage  : { type: String, default: null },
    processingMs  : { type: Number, default: null },  // processing time in ms

    // Auto-delete flag
    isDeleted     : { type: Boolean, default: false },
    deletedAt     : { type: Date,    default: null },
  },
  { timestamps: true }
);

fileJobSchema.index({ userId: 1, createdAt: -1 });
fileJobSchema.index({ "outputFile.expiresAt": 1 });   // TTL-style index for cleanup
fileJobSchema.index({ status: 1 });

const FileJob = mongoose.model("FileJob", fileJobSchema);

// ─── Subscription Schema (Stripe events log) ─────────────────────────────
const subscriptionEventSchema = new mongoose.Schema(
  {
    userId           : { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    stripeEventId    : { type: String, unique: true },
    type             : String,
    payload          : mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

const SubscriptionEvent = mongoose.model("SubscriptionEvent", subscriptionEventSchema);

// ─── Admin Activity Log Schema ────────────────────────────────────────────
const adminLogSchema = new mongoose.Schema(
  {
    adminId  : { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action   : String,
    target   : String,
    detail   : mongoose.Schema.Types.Mixed,
    ip       : String,
  },
  { timestamps: true }
);

const AdminLog = mongoose.model("AdminLog", adminLogSchema);

module.exports = { User, FileJob, SubscriptionEvent, AdminLog };
