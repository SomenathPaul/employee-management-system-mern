// server/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/users"); // optional, for deeper verification

module.exports = async function (req, res, next) {
  const authHeader = req.headers.authorization || req.header("x-auth-token");
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("TOKEN RECEIVED:", token);

    // Optionally verify user exists (recommended)
    // const user = await User.findById(decoded.id).select("-password");
    // if (!user) return res.status(404).json({ msg: "User not found" });

    req.user = decoded; // attach decoded payload to request
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};
