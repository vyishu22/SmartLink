const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { processBulkUrls } = require('../services/bulkService');
const { sendSuccess, sendError } = require('../utils/response');

router.post('/', protect, async (req, res, next) => {
  try {
    const { rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return sendError(res, 400, 'Provide a non-empty array of URL rows.');
    }
    if (rows.length > 100) {
      return sendError(res, 400, 'Maximum 100 URLs per bulk request.');
    }

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const results = await processBulkUrls(rows, req.user._id, baseUrl);

    const succeeded = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return sendSuccess(res, 200, `Processed ${rows.length} URLs: ${succeeded} created, ${failed} failed.`, {
      results,
      summary: { total: rows.length, succeeded, failed },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
