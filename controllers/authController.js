import jwt from 'jsonwebtoken';
import util from 'util';
import { User } from '../models/userModel.js';
import { catchAsync } from '../utils/catchErrors.js';
import { AppError } from '../utils/appError.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const Signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // generate the jwt token after signup and provide back to user
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      newUser,
    },
  });
});

export const Signin = catchAsync(async (req, res, next) => {
  // get the email and paasword from request body
  const { email, password } = req.body;

  // if no email or password send 400 error
  if (!email || !password) {
    return next(
      new AppError('Email and Password is required to sign in.', 400),
    );
  }

  // get the user and verify the password. since the select attribute is false for password in user
  // schema, by default password will not be available while using .find() on user model. hence we
  // explicitely need to select the password with "+password"
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('Invalid Email or Password!', 401));
  }

  // using the User model instance method to verify the password
  const passwordIsCorrect = await user.verifyPassword(password);

  if (!passwordIsCorrect) {
    return next(new AppError('Invalid Email or Password!', 401));
  }

  // if password is correct then create a new JWT token and return it
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

// VERFIY AUTH TOKEN WHETHER USER IS LOGGEDIN OR NOT
export const verifyAuth = catchAsync(async (req, res, next) => {
  // get the bearer token from authorization header of the request
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not authorized! Please Login.', 401));
  }

  // decode the token,any error during decoding token is handled by GlobalErrorHandler in error controller
  // in prod env. In dev env we will send the entire error as it is
  const promisifiedDecode = util.promisify(jwt.verify);
  const decoded = await promisifiedDecode(token, process.env.JWT_SECRET);
  console.log(decoded);

  // if user is deleted after issuing the token send the 401 invalid token
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new AppError('User not found, Invalid Token. Please Signup/Login!', 401),
    );
  }

  // if password is updated after token is issued then also send 401 invalid
  if (user.passwordUpdatedAfterTokenIssue(decoded.iat)) {
    return next(
      new AppError(
        'Password is changed after token was issued. Please Login with new password!',
        401,
      ),
    );
  }

  req.user = user;

  // if token is valid call the next
  next();
});

// ROLE BASED AUTHORIZATION
export const protectToRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You are not allowed for this operation', 403));
    }
    next();
  };
};

export const resetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  // find the user with email, if user does not exists return error
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('No user found with this email!', 404));
  }

  // generate the random reset token using document instance method
});
