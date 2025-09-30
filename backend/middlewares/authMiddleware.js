import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  try {
    // 1) Check cookie first
    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    // 2) Or Authorization header
    else if (req.headers && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }

    // Fetch fresh user and populate role
    const user = await User.findById(decoded.id)
      .select("-password")
      .populate("roleId")
      .populate("departmentId");

    if (!user || !user.roleId) {
      return res.status(401).json({ message: "User or role not found" });
    }
     req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err.message || err);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
