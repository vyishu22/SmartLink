const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      trim: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    source: {
      type: String,
      enum: ['single', 'bulk'],
      default: 'single',
      index: true,
    },
    bulkBatchId: {
      type: String,
      default: null,
      index: true,
    },
    bulkItemsCount: {
      type: Number,
      default: 1,
    },
    customAlias: {
      type: String,
      trim: true,
      default: null,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    totalClicks: {
      type: Number,
      default: 0,
    },
    lastVisitedAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

urlSchema.index({ userId: 1, createdAt: -1 });

urlSchema.methods.isExpired = function () {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
};

module.exports = mongoose.model('Url', urlSchema);
