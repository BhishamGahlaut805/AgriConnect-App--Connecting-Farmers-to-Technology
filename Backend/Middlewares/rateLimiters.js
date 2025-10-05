const rateLimit = require("express-rate-limit");

const createLimiter = (opts) =>
  rateLimit({
    windowMs: opts.windowMs || 15 * 60 * 1000,
    max: opts.max || 300,
    standardHeaders: true,
    legacyHeaders: false,
  });

module.exports = {
  publicLimiter: createLimiter({ max: 600 }),
  authLimiter: createLimiter({ max: 100 }),
  orderLimiter: createLimiter({ windowMs: 60 * 1000, max: 20 }),
};
