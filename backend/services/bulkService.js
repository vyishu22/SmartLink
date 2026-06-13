const { nanoid } = require('nanoid');
const Url = require('../models/Url');

const generateLinkTitle = (originalUrl) => {
  try {
    const hostname = new URL(originalUrl).hostname.replace(/^www\./i, '');
    const label = hostname.split('.').filter(Boolean)[0] || 'Link';
    return `${label.charAt(0).toUpperCase()}${label.slice(1)} Link`;
  } catch {
    return 'Link';
  }
};

/**
 * Process bulk CSV URL creation
 * @param {Array} rows - Array of {originalUrl, customAlias, title} objects
 * @param {string} userId
 * @param {string} baseUrl
 * @returns {Array} results with success/error per row
 */
const processBulkUrls = async (rows, userId, baseUrl) => {
  const results = [];

  for (const row of rows) {
    try {
      const { originalUrl, customAlias, title } = row;

      if (!originalUrl || !/^https?:\/\/.+/.test(originalUrl)) {
        results.push({ originalUrl, success: false, error: 'Invalid URL' });
        continue;
      }

      let shortCode = customAlias?.trim() || nanoid(7);

      if (customAlias) {
        const exists = await Url.findOne({ shortCode: customAlias });
        if (exists) {
          results.push({ originalUrl, success: false, error: 'Alias already taken' });
          continue;
        }
      }

      const resolvedTitle = title?.trim() || generateLinkTitle(originalUrl);

      const url = await Url.create({
        userId,
        originalUrl: originalUrl.trim(),
        shortCode,
        customAlias: customAlias?.trim() || null,
        title: resolvedTitle,
        source: 'bulk',
        bulkBatchId: `bulk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        bulkItemsCount: 1,
      });

      results.push({
        originalUrl,
        shortCode,
        shortUrl: `${baseUrl}/${shortCode}`,
        success: true,
      });
    } catch (err) {
      results.push({ originalUrl: row.originalUrl, success: false, error: err.message });
    }
  }

  return results;
};

module.exports = { processBulkUrls };
