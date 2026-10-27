const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const cookieOptions = () => ({ httpOnly: true, secure: process.env.COOKIE_SECURE === 'true', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });
function issueToken(user, res) {
  const token = jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, cookieOptions());
}
const publicUser = user => ({ id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, preferredLanguage: user.preferredLanguage, isVerified: user.isVerified });
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone = '', role = 'farmer', preferredLanguage = 'en' } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required.' });
  if (String(password).length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  if (!['farmer', 'customer', 'provider'].includes(role)) return res.status(400).json({ message: 'Choose a valid public account role.' });
  const normalizedEmail = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return res.status(400).json({ message: 'Enter a valid email address.' });
  if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: 'An account with this email already exists.' });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name: String(name).trim(), email: normalizedEmail, password: passwordHash, phone: String(phone).trim(), role, preferredLanguage: preferredLanguage === 'hi' ? 'hi' : 'en' });
  issueToken(user, res);
  res.status(201).json({ message: 'Account created successfully.', user: publicUser(user) });
});
exports.login = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid email or password.' });
  if (user.status !== 'active') return res.status(403).json({ message: 'This account is unavailable. Contact support.' });
  issueToken(user, res);
  res.json({ message: 'Login successful.', user: publicUser(user) });
});
exports.me = asyncHandler(async (req, res) => res.json({ user: publicUser(req.user) }));
exports.logout = asyncHandler(async (req, res) => { res.clearCookie('token', { httpOnly: true, secure: process.env.COOKIE_SECURE === 'true', sameSite: 'lax', path: '/' }); res.json({ message: 'Logged out successfully.' }); });
