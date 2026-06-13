const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 409, 'An account with this email already exists.');
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    return sendSuccess(res, 201, 'Account created successfully.', {
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    const token = generateToken(user._id);

    return sendSuccess(res, 200, 'Logged in successfully.', {
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return sendSuccess(res, 200, 'User fetched.', {
      user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
