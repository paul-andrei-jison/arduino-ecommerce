'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePasswords(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

function generateSessionToken(userPayload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign(
    {
      email: userPayload.email,
      isVerified: userPayload.isVerified,
    },
    secret,
    { expiresIn: '24h' }
  );
}

module.exports = { hashPassword, comparePasswords, generateSessionToken };
