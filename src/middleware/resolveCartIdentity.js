const resolveCartIdentity = (req, res, next) => {
  const userId = req.user?.id || null;
  const sessionId = req.headers["x-cart-session-id"] || null;

  if (!userId && !sessionId) {
    return res.status(400).json({
      message: "Session ID diperlukan untuk guest",
    });
  }

  req.cartIdentity = { userId, sessionId };
  next();
};

module.exports = resolveCartIdentity;
