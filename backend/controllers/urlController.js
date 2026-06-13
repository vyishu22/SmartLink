const { nanoid } = require('nanoid');
const Url = require('../models/Url');
const Visit = require('../models/Visit');
const { sendSuccess, sendError } = require('../utils/response');

const generateLinkTitle = (originalUrl) => {
  try {
    const hostname = new URL(originalUrl).hostname.replace(/^www\./i, '');
    const label = hostname.split('.').filter(Boolean)[0] || 'Link';
    return `${label.charAt(0).toUpperCase()}${label.slice(1)} Link`;
  } catch {
    return 'Link';
  }
};

const getClickCountMap = async (urlIds = []) => {
  if (!urlIds.length) return new Map();

  const counts = await Visit.aggregate([
    { $match: { urlId: { $in: urlIds } } },
    { $group: { _id: '$urlId', totalClicks: { $sum: 1 } } },
  ]);

  return new Map(counts.map((item) => [String(item._id), item.totalClicks]));
};

const createUrl = async (req, res, next) => {
  try {
    const { originalUrl, customAlias, title, expiryDate } = req.body;

    let shortCode = customAlias || nanoid(7);

    if (customAlias) {
      const existing = await Url.findOne({ shortCode: customAlias });
      if (existing) {
        return sendError(res, 409, 'This alias is already taken. Please choose another.');
      }
    } else {
      // Ensure uniqueness for random codes
      let attempts = 0;
      while (await Url.findOne({ shortCode }) && attempts < 5) {
        shortCode = nanoid(7);
        attempts++;
      }
    }

    const resolvedTitle = (title || '').trim() || generateLinkTitle(originalUrl);

    const url = await Url.create({
      userId: req.user._id,
      originalUrl,
      shortCode,
      customAlias: customAlias || null,
      title: resolvedTitle,
      expiryDate: expiryDate || null,
      source: 'single',
    });

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    return sendSuccess(res, 201, 'Short URL created.', {
      url: { ...url.toObject(), shortUrl: `${baseUrl}/${shortCode}` },
    });
  } catch (error) {
    next(error);
  }
};

const getUrls = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = { userId: req.user._id };
    if (req.query.source) {
      query.source = req.query.source;
    }
    if (search) {
      query.$or = [
        { originalUrl: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    const [urls, total] = await Promise.all([
      Url.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Url.countDocuments(query),
    ]);

    const clickMap = await getClickCountMap(urls.map((u) => u._id));
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const enriched = urls.map((u) => ({
      ...u.toObject(),
      totalClicks: clickMap.get(String(u._id)) ?? u.totalClicks ?? 0,
      shortUrl: `${baseUrl}/${u.shortCode}`,
    }));

    return sendSuccess(res, 200, 'URLs fetched.', {
      urls: enriched,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const getUrlById = async (req, res, next) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });
    if (!url) return sendError(res, 404, 'URL not found.');

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    return sendSuccess(res, 200, 'URL fetched.', {
      url: { ...url.toObject(), shortUrl: `${baseUrl}/${url.shortCode}` },
    });
  } catch (error) {
    next(error);
  }
};

const updateUrl = async (req, res, next) => {
  try {
    const { originalUrl, title, expiryDate } = req.body;

    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });
    if (!url) return sendError(res, 404, 'URL not found.');

    if (originalUrl) url.originalUrl = originalUrl;
    if (title !== undefined) url.title = title;
    if (expiryDate !== undefined) url.expiryDate = expiryDate || null;

    await url.save();

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    return sendSuccess(res, 200, 'URL updated.', {
      url: { ...url.toObject(), shortUrl: `${baseUrl}/${url.shortCode}` },
    });
  } catch (error) {
    next(error);
  }
};

const deleteUrl = async (req, res, next) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });
    if (!url) return sendError(res, 404, 'URL not found.');

    await Promise.all([
      Url.deleteOne({ _id: url._id }),
      Visit.deleteMany({ urlId: url._id }),
    ]);

    return sendSuccess(res, 200, 'URL deleted successfully.');
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });
    if (!url) return sendError(res, 404, 'URL not found.');

    const [visits, totalClicks] = await Promise.all([
      Visit.find({ urlId: url._id }).sort({ visitedAt: -1 }).limit(100),
      Visit.countDocuments({ urlId: url._id }),
    ]);

    // Browser breakdown
    const browserMap = {};
    const deviceMap = {};
    const osMap = {};

    visits.forEach((v) => {
      browserMap[v.browser] = (browserMap[v.browser] || 0) + 1;
      deviceMap[v.device] = (deviceMap[v.device] || 0) + 1;
      osMap[v.operatingSystem] = (osMap[v.operatingSystem] || 0) + 1;
    });

    const toArray = (map) =>
      Object.entries(map)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    return sendSuccess(res, 200, 'Analytics fetched.', {
      url: { ...url.toObject(), shortUrl: `${baseUrl}/${url.shortCode}` },
      totalClicks,
      recentVisits: visits.slice(0, 10),
      browsers: toArray(browserMap),
      devices: toArray(deviceMap),
      operatingSystems: toArray(osMap),
    });
  } catch (error) {
    next(error);
  }
};

const getDailyClicks = async (req, res, next) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });
    if (!url) return sendError(res, 404, 'URL not found.');

    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const visits = await Visit.aggregate([
      {
        $match: {
          urlId: url._id,
          visitedAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$visitedAt' },
          },
          clicks: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing days with 0
    const dateMap = {};
    visits.forEach((v) => (dateMap[v._id] = v.clicks));

    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      result.push({ date: key, clicks: dateMap[key] || 0 });
    }

    return sendSuccess(res, 200, 'Daily clicks fetched.', { dailyClicks: result });
  } catch (error) {
    next(error);
  }
};

const getPublicStats = async (req, res, next) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.shortCode });
    if (!url) return sendError(res, 404, 'URL not found.');

    const [visits, totalClicks] = await Promise.all([
      Visit.find({ urlId: url._id }).sort({ visitedAt: -1 }).limit(20),
      Visit.countDocuments({ urlId: url._id }),
    ]);

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    return sendSuccess(res, 200, 'Public stats fetched.', {
      shortUrl: `${baseUrl}/${url.shortCode}`,
      totalClicks,
      createdAt: url.createdAt,
      lastVisitedAt: url.lastVisitedAt,
      recentVisits: visits.map((v) => ({ visitedAt: v.visitedAt, browser: v.browser, device: v.device })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createUrl, getUrls, getUrlById, updateUrl, deleteUrl, getAnalytics, getDailyClicks, getPublicStats };
