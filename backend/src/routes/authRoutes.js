const express = require("express");
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const Admin = require("../models/Admin");
const handleValidation = require("../middleware/validate");

const router = express.Router();

// Slow down brute-force login attempts.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again later." },
});

router.post(
  "/login",
  loginLimiter,
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required."),
    body("password").isLength({ min: 1 }).withMessage("Password is required."),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(401).json({ error: "Invalid credentials." });
      }

      const isMatch = await admin.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials." });
      }

      const token = jwt.sign(
        { sub: admin._id.toString(), role: admin.role, name: admin.name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
      );

      return res.json({
        token,
        admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
      });
    } catch (err) {
      console.error("Login error:", err.message);
      return res.status(500).json({ error: "Internal server error." });
    }
  }
);

module.exports = router;
