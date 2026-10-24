import rateLimit from "express-rate-limit";

const handler = (req, res) => {
  res.status(429).json({
    success: false,
    message: "Too many requests. Please try again later.",
  });
};

const baseOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  ipv6Subnet: 56,
  handler,
};

export const globalLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  limit: 300,
});

export const authLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  limit: 20,
});
