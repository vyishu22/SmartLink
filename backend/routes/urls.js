const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createUrlValidator, updateUrlValidator } = require('../validators/urlValidators');
const {
  createUrl,
  getUrls,
  getUrlById,
  updateUrl,
  deleteUrl,
  getAnalytics,
  getDailyClicks,
  getPublicStats,
} = require('../controllers/urlController');

router.use(protect);

router.post('/', createUrlValidator, validate, createUrl);
router.get('/', getUrls);
router.get('/:id', getUrlById);
router.put('/:id', updateUrlValidator, validate, updateUrl);
router.delete('/:id', deleteUrl);
router.get('/:id/analytics', getAnalytics);
router.get('/:id/daily-clicks', getDailyClicks);

module.exports = router;
