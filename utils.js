/**
 * PDFUniverse — Utils & Config
 * • fileCleanup.js
 * • database.js
 * • admin routes
 */

// ═══════════════════════════════════════════════════════════
// utils/fileCleanup.js
// ═══════════════════════════════════════════════════════════
const fs      = require("fs");
const path    = require("path");

/**
 * Deletes output files whose expiresAt has passed.
 * Called by the cron job in server.js every 10 minutes.
 */
const deleteExpiredFiles = async () => {
  // Import here to avoid circular dep
  const { FileJob } = require("../models");

  const expiredJobs = await FileJob.find({
    isDeleted               : false,
    "outputFile.expiresAt"  : { $lt: new Date() },
    status                  : "done",
  });

  let deletedCount = 0;

  for (const job of expiredJobs) {
    try {
      // Delete output file
      if (job.outputFile?.path && fs.existsSync(job.outputFile.path)) {
        fs.unlinkSync(job.outputFile.path);
      }

      // Delete input files
      for (const f of job.inputFiles) {
        if (f.path && fs.existsSync(f.path)) {
          fs.unlinkSync(f.path);
          // Remove parent dir if empty
          const dir = path.dirname(f.path);
          try {
            const entries = fs.readdirSync(dir);
            if (entries.length === 0) fs.rmdirSync(dir);
          } catch {}
        }
      }

      job.isDeleted = true;
      job.deletedAt = new Date();
      await job.save();
      deletedCount++;
    } catch (err) {
      console.error(`Cleanup error for job ${job._id}:`, err.message);
    }
  }

  return deletedCount;
};

// ═══════════════════════════════════════════════════════════
// config/database.js
// ═══════════════════════════════════════════════════════════
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // mongoose 7+ no longer needs these options
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

// ═══════════════════════════════════════════════════════════
// routes/admin.js
// ═══════════════════════════════════════════════════════════
const express  = require("express");
const { User, FileJob, AdminLog } = require("../models");
const { authenticate, requireAdmin } = require("./auth");

const adminRouter = express.Router();
adminRouter.use(authenticate, requireAdmin);

// GET /api/admin/stats — Dashboard overview
adminRouter.get("/stats", async (req, res) => {
  try {
    const [
      totalUsers, proUsers, freeUsers,
      totalJobs, todayJobs,
      failedJobs,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ plan: "pro" }),
      User.countDocuments({ plan: "free" }),
      FileJob.countDocuments(),
      FileJob.countDocuments({ createdAt: { $gte: new Date(Date.now() - 86400000) } }),
      FileJob.countDocuments({ status: "failed" }),
    ]);

    res.json({
      users: { total: totalUsers, pro: proUsers, free: freeUsers },
      jobs:  { total: totalJobs, today: todayJobs, failed: failedJobs },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats." });
  }
});

// GET /api/admin/users — Paginated user list
adminRouter.get("/users", async (req, res) => {
  try {
    const page  = parseInt(req.query.page  || 1);
    const limit = parseInt(req.query.limit || 20);
    const q     = req.query.q || "";

    const query = q
      ? { $or: [{ name: new RegExp(q, "i") }, { email: new RegExp(q, "i") }] }
      : {};

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
          .select("-password -emailVerifyToken -passwordResetToken"),
      User.countDocuments(query),
    ]);

    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

// PATCH /api/admin/users/:id/ban — Toggle user ban
adminRouter.patch("/users/:id/ban", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    user.isBanned = !user.isBanned;
    await user.save();

    await AdminLog.create({
      adminId : req.user.id,
      action  : user.isBanned ? "ban_user" : "unban_user",
      target  : user._id.toString(),
      ip      : req.ip,
    });

    res.json({ success: true, isBanned: user.isBanned });
  } catch (err) {
    res.status(500).json({ error: "Operation failed." });
  }
});

// GET /api/admin/jobs — Recent processing jobs
adminRouter.get("/jobs", async (req, res) => {
  try {
    const page  = parseInt(req.query.page || 1);
    const limit = 30;

    const jobs = await FileJob.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("userId", "name email plan")
      .select("-inputFiles.path -outputFile.path");

    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch jobs." });
  }
});

// ═══════════════════════════════════════════════════════════
// routes/webhook.js — Stripe webhooks
// ═══════════════════════════════════════════════════════════
const express2 = require("express");
const stripe   = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { SubscriptionEvent } = require("../models");

const webhookRouter = express2.Router();

// Raw body required for Stripe signature verification
webhookRouter.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Stripe webhook signature failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      await SubscriptionEvent.create({
        stripeEventId: event.id,
        type         : event.type,
        payload      : event.data.object,
      });
    } catch {} // ignore duplicate events

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub    = event.data.object;
        const userId = sub.metadata?.userId;
        if (userId) {
          const plan = sub.items.data[0]?.price?.lookup_key || "pro";
          await User.findByIdAndUpdate(userId, {
            plan,
            subscriptionId  : sub.id,
            subscriptionEnd : new Date(sub.current_period_end * 1000),
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub    = event.data.object;
        const userId = sub.metadata?.userId;
        if (userId) {
          await User.findByIdAndUpdate(userId, {
            plan           : "free",
            subscriptionId : null,
            subscriptionEnd: null,
          });
        }
        break;
      }
    }

    res.json({ received: true });
  }
);

// ═══════════════════════════════════════════════════════════
// routes/user.js — User profile & subscription
// ═══════════════════════════════════════════════════════════
const userRouter = express.Router();
const { authenticate: auth } = require("./auth");
userRouter.use(auth);

// PATCH /api/user/profile
userRouter.patch("/profile", async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true, runValidators: true }
    ).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Update failed." });
  }
});

// POST /api/user/create-checkout — Create Stripe checkout session
userRouter.post("/create-checkout", async (req, res) => {
  try {
    const { priceId } = req.body;
    const user = await User.findById(req.user.id);

    // Create Stripe customer if needed
    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email   : user.email,
        name    : user.name,
        metadata: { userId: user._id.toString() },
      });
      user.stripeCustomerId = customer.id;
      await user.save();
    }

    const session = await stripe.checkout.sessions.create({
      customer    : user.stripeCustomerId,
      mode        : "subscription",
      line_items  : [{ price: priceId, quantity: 1 }],
      success_url : `${process.env.FRONTEND_URL}/dashboard?upgraded=1`,
      cancel_url  : `${process.env.FRONTEND_URL}/pricing`,
      subscription_data: { metadata: { userId: user._id.toString() } },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ error: "Failed to create checkout session." });
  }
});

// DELETE /api/user/account
userRouter.delete("/account", async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { isActive: false });
    res.json({ success: true, message: "Account deactivated." });
  } catch (err) {
    res.status(500).json({ error: "Failed to deactivate account." });
  }
});

// ── Exports ──────────────────────────────────────────────
module.exports = {
  deleteExpiredFiles,
  connectDB,
  adminRouter,
  webhookRouter,
  userRouter,
};

// Re-export as default router for server.js compatibility
// NOTE: In production, split each module into its own file.
