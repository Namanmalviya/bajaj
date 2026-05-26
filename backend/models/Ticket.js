const mongoose = require('mongoose');

// Response time targets in minutes based on priority
const SLA_TARGETS = {
  urgent: 60,       // 1 hour
  high: 240,        // 4 hours
  medium: 1440,     // 24 hours
  low: 4320         // 72 hours
};

const ticketSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  priority: {
    type: String,
    required: [true, 'Priority is required'],
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: 'Priority must be either low, medium, high, or urgent'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['open', 'in_progress', 'resolved', 'closed'],
      message: 'Status must be either open, in_progress, resolved, or closed'
    },
    default: 'open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date,
    default: null
  }
}, {
  // Automatically include virtuals when converting documents to JSON or Objects
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compute derived field: ageMinutes (computed at read time)
ticketSchema.virtual('ageMinutes').get(function() {
  const end = this.resolvedAt ? new Date(this.resolvedAt) : new Date();
  const start = new Date(this.createdAt);
  const diffMs = end - start;
  // Make sure age is never negative
  return Math.max(0, Math.floor(diffMs / (1000 * 60)));
});

// Compute derived field: slaBreached (computed at read time)
ticketSchema.virtual('slaBreached').get(function() {
  const target = SLA_TARGETS[this.priority];
  if (target === undefined) return false;
  return this.ageMinutes > target;
});

module.exports = mongoose.model('Ticket', ticketSchema);
