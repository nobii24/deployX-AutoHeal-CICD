module.exports = function adminAuth(req, res, next) {
  console.log("ADMIN_KEY from env:", process.env.ADMIN_KEY);
  console.log("ADMIN_KEY from header:", req.headers["x-admin-key"]);

  const adminKey = req.headers["x-admin-key"];

  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({
      error: "Admin access denied"
    });
  }

  next();
};
