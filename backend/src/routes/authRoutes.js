'use strict';

const { Router } = require('express');
const { register, login } = require('../controllers/authController');

const authRouter = Router();

authRouter.post('/auth/register', register);
authRouter.post('/auth/login', login);

module.exports = authRouter;
