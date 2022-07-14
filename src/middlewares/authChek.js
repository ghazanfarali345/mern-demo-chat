const jwt = require("jsonwebtoken");
const User = require("../users/users.model");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      //decodes token id
      console.log({ token, secret: process.env.JWT_SECRET }, "abc");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log({ decoded });

      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      return res.status(401).send("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    return res.status(403).send("Not authorized, no token");
  }
};

module.exports = { protect };
