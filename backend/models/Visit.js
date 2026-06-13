const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
  {
    urlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Url',
      required: true,
      index: true,
    },
    visitedAt: {
      type: Date,
      default: Date.now,
    },
    browser: {
      type: String,
      default: 'Unknown',
    },
    device: {
      type: String,
      enum: ['Desktop', 'Mobile', 'Tablet', 'Unknown'],
      default: 'Unknown',
    },
    operatingSystem: {
      type: String,
      default: 'Unknown',
    },
    ipAddress: {
      type: String,
      default: null,
    },
    country: {
      type: String,
      default: 'Unknown',
    },
    referrer: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

visitSchema.index({ urlId: 1, visitedAt: -1 });

module.exports = mongoose.model('Visit', visitSchema);
