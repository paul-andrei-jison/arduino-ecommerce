'use strict';

const { getUserByEmail, createUser } = require('../services/userService');
const { hashPassword, comparePasswords, generateSessionToken } = require('../services/authService');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

async function register(req, res) {
  try {
    const { name, password } = req.body;
    const email = typeof req.body.email === 'string' ? req.body.email.toLowerCase().trim() : '';
    const trimmedName = typeof name === 'string' ? name.trim() : '';

    if (!trimmedName || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await hashPassword(password);
    await createUser({ name: trimmedName, email, passwordHash });

    return res.status(201).json({ message: 'Account created successfully' });
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    console.error('register error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
}

async function login(req, res) {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.toLowerCase().trim() : '';
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await getUserByEmail(email);

    // Use a single generic message for both "user not found" and "wrong password"
    // to avoid leaking which emails are registered.
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await comparePasswords(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateSessionToken({
      email: user.email,
      isVerified: user.isVerified,
    });

    return res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
}

module.exports = { register, login };
