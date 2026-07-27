const express = require("express");
const { body, param, query } = require("express-validator");
const rateLimit = require("express-rate-limit");
const Ticket = require("../models/Ticket");
const handleValidation = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Public submission is rate-limited to reduce spam / abuse of an open endpoint.
const submitLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many submissions from this network. Try again later." },
});

const CATEGORIES = ["network", "printer", "hardware", "security", "other"];
const URGENCY = ["low", "medium", "high"];
const STATUS = ["open", "in_progress", "resolved"];

// POST /api/tickets - public: staff logs a new issue, no auth required.
router.post(
  "/",
  submitLimiter,
  [
    body("reporterName").trim().isLength({ min: 2, max: 100 }).escape(),
    body("office").trim().isLength({ min: 2, max: 100 }).escape(),
    body("category").isIn(CATEGORIES),
    body("urgency").optional().isIn(URGENCY),
    body("description").trim().isLength({ min: 5, max: 1000 }).escape(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { reporterName, office, category, urgency, description } = req.body;
      const ticket = await Ticket.create({
        reporterName,
        office,
        category,
        urgency: urgency || "medium",
        description,
      });
      return res.status(201).json(ticket);
    } catch (err) {
      console.error("Ticket creation error:", err.message);
      return res.status(500).json({ error: "Could not create ticket." });
    }
  }
);

// GET /api/tickets - admin only: list tickets, optional status filter.
router.get(
  "/",
  requireAuth,
  [query("status").optional().isIn(STATUS)],
  handleValidation,
  async (req, res) => {
    try {
      const filter = {};
      if (req.query.status) {
        filter.status = req.query.status;
      }
      const tickets = await Ticket.find(filter)
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 });
      return res.json(tickets);
    } catch (err) {
      console.error("Ticket list error:", err.message);
      return res.status(500).json({ error: "Could not fetch tickets." });
    }
  }
);

// GET /api/tickets/stats - admin only: quick counts for the dashboard and report.
router.get("/stats", requireAuth, async (req, res) => {
  try {
    const [byStatus, byCategory, total] = await Promise.all([
      Ticket.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Ticket.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
      Ticket.countDocuments(),
    ]);
    return res.json({ total, byStatus, byCategory });
  } catch (err) {
    console.error("Stats error:", err.message);
    return res.status(500).json({ error: "Could not fetch stats." });
  }
});

// PATCH /api/tickets/:id - admin only: update status/assignment/notes.
router.patch(
  "/:id",
  requireAuth,
  [
    param("id").isMongoId(),
    body("status").optional().isIn(STATUS),
    body("assignedTo").optional().isMongoId(),
    body("resolutionNotes").optional().trim().isLength({ max: 1000 }).escape(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const update = {};
      if (req.body.status) {
        update.status = req.body.status;
        if (req.body.status === "resolved") {
          update.resolvedAt = new Date();
        }
      }
      if (req.body.assignedTo) update.assignedTo = req.body.assignedTo;
      if (req.body.resolutionNotes !== undefined) update.resolutionNotes = req.body.resolutionNotes;

      const ticket = await Ticket.findByIdAndUpdate(req.params.id, update, { new: true }).populate(
        "assignedTo",
        "name email"
      );

      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found." });
      }
      return res.json(ticket);
    } catch (err) {
      console.error("Ticket update error:", err.message);
      return res.status(500).json({ error: "Could not update ticket." });
    }
  }
);

module.exports = router;
