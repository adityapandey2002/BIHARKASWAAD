const { User } = require('../models/index');
const jwt = require('jsonwebtoken');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('jwt', token, cookieOptions);

  // Don't send password in response
  const userObj = user.toJSON();
  delete userObj.password;

  res.status(statusCode).json({ status: 'success', token, user: userObj });
};

// ── Sign Up ───────────────────────────────────────────────────────────────────
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ status: 'error', message: 'User already exists with this email' });
    }

    const newUser = await User.create({ name, email, password, role: role || 'customer' });
    createSendToken(newUser, 201, res);
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Please provide email and password' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ status: 'error', message: 'Incorrect email or password' });
    }

    createSendToken(user, 200, res);
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// ── Logout ────────────────────────────────────────────────────────────────────
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.status(200).json({ status: 'success' });
};

// ── Protect Middleware ────────────────────────────────────────────────────────
exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({ status: 'error', message: 'You are not logged in' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    const currentUser = await User.findByPk(decoded.id);

    if (!currentUser) {
      return res.status(401).json({ status: 'error', message: 'User no longer exists' });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({ status: 'error', message: 'Invalid token' });
  }
};

// ── Role Restriction ──────────────────────────────────────────────────────────
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ status: 'error', message: 'You do not have permission' });
    }
    next();
  };
};
