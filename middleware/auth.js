const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId };  // Assign decoded user ID
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const checkRole = (roles) => (req, res, next) => {
  User.findById(req.user.id).then(user => {
    if (roles.includes(user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  });
};

module.exports = { auth, checkRole };
