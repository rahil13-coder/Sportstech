// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');

  // Check if no token
  if (!authHeader) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Check if token is in the correct format 'Bearer <token>'
  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ msg: 'Token is not in the correct format' });
  }

  const token = tokenParts[1];

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Assuming JWT_SECRET is in .env
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;