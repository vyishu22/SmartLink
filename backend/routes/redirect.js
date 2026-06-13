const express = require('express');
const router = express.Router();
const { redirect } = require('../controllers/redirectController');
const { getPublicStats } = require('../controllers/urlController');

router.get('/stats/:shortCode', getPublicStats);
router.get('/:shortCode', redirect);

module.exports = router;
