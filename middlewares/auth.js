const jwt = require("jsonwebtoken");
const { AirTableIntegration } = require("../models");

const auth = async (req, res, next) => {
  const token = req.header("authorization");
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await AirTableIntegration.findById(decoded._id, {
      accessToken: 0,
      refreshToken: 0,
      __v: 0,
    }).lean();

    if (!user) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("[auth]", error);
    res.status(400).json({ message: "Token is not valid" });
  }
};

module.exports = auth;
