const jwt = require('jsonwebtoken');
const User = require('../models/User');
async function protect(req, res, next) {
  try {
    const token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
    if (!token) return res.status(401).json({ message: 'Please log in to continue.' });
    let payload;
    try { payload = jwt.verify(token, process.env.JWT_SECRET); }
    catch { return res.status(401).json({ message: 'Your session is invalid or expired. Please log in again.' }); }
    const user = await User.findById(payload.sub).select('-password');
    if (!user || user.status !== 'active') return res.status(401).json({ message: 'This account is unavailable.' });
    req.user = user;
    next();
  } catch (err) { next(err); }
}
function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required.' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    next();
  };
}
module.exports = { protect, allowRoles };
