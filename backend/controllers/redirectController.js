const UAParser = require('ua-parser-js');
const Url = require('../models/Url');
const Visit = require('../models/Visit');

const redirect = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode, isActive: true });
    if (!url) {
      return res.redirect(`${process.env.CLIENT_URL}/404`);
    }

    if (url.isExpired()) {
      return res.redirect(`${process.env.CLIENT_URL}/expired`);
    }

    // Parse user agent
    const ua = UAParser(req.headers['user-agent'] || '');
    const browser = ua.browser.name || 'Unknown';
    const os = ua.os.name || 'Unknown';

    let device = 'Unknown';
    if (ua.device.type === 'mobile') device = 'Mobile';
    else if (ua.device.type === 'tablet') device = 'Tablet';
    else if (ua.browser.name) device = 'Desktop';

    // Get IP
    const ipAddress =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      null;

    // Track visit and update URL concurrently
    await Promise.all([
      Visit.create({
        urlId: url._id,
        visitedAt: new Date(),
        browser,
        device,
        operatingSystem: os,
        ipAddress,
        referrer: req.headers.referer || null,
      }),
      Url.findByIdAndUpdate(url._id, {
        $inc: { totalClicks: 1 },
        lastVisitedAt: new Date(),
      }),
    ]);

    return res.redirect(302, url.originalUrl);
  } catch (error) {
    next(error);
  }
};

module.exports = { redirect };
