const mongoose = require("mongoose");

const TICKET_CATEGORIES = ["network", "printer", "hardware", "security", "other"];
const TICKET_URGENCY = ["low", "medium", "high"];
const TICKET_STATUS = ["open", "in_progress", "resolved"];

const ticketSchema = new mongoose.Schema(
  {
    reporterName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    office: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    category: {
      type: String,
      enum: TICKET_CATEGORIES,
      required: true,
    },
    urgency: {
      type: String,
      enum: TICKET_URGENCY,
      default: "medium",
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: TICKET_STATUS,
      default: "open",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    resolutionNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

ticketSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Ticket", ticketSchema);
module.exports.TICKET_CATEGORIES = TICKET_CATEGORIES;
module.exports.TICKET_URGENCY = TICKET_URGENCY;
module.exports.TICKET_STATUS = TICKET_STATUS;
