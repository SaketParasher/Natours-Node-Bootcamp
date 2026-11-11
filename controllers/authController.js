import jwt from 'jsonwebtoken';
import util from 'util';
import { createHash } from 'crypto';
import { User } from '../models/userModel.js';
import { catchAsync } from '../utils/catchErrors.js';
import { AppError } from '../utils/appError.js';
import { sendPasswordResetMail } from '../utils/email.js';

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

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  // find the user with email, if user does not exists return error
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('No user found with this email!', 404));
  }

  // generate the random reset token using document instance method and then save the user since
  // we are setting passwordresethash and tokenexpiresat in document instance method, so to update
  // it in db we need to save the user document
  const token = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // send the email with subject and message to provide the password reset link with token
  const emailSubject = 'Please Reset Your Password (valid for 10 mins only!)';
  const emailMessage = `Use this link to reset your password. Please make a PATCH request on
        ${req.protocol}://${req.host}/v1/users/resetpassword/${token} with password & passwordConfirm fields.
        Please ignore if you didn't requested to update the password.`

  // using try/catch here because if there is any error while sending mail we want to reset the
  // password reset hash and password reset expires at from DB
  try {
    await sendPasswordResetMail({ message: emailMessage, subject: emailSubject, userEmail: user.email })
    res.status(200).json({
      status: 'success',
      message: 'Password Reset URL sent to the mail'
    })
  } catch (error) {
    console.error('Something went wrong while sending password reset email to the user', error);
    return next(new AppError('Something went wrong while sending the password reset mail', 500))
  }

});

export const resetPassword = catchAsync(async (req, res, next) => {

  // create a hashed token based on token coming as req parameter to get the user from DB based on
  // hashedToken and token expire at time
  const hashedTokenFromRequest = createHash('sha256').update(req.params.resetToken).digest('hex')

  // get the user based on hashed token 
  const user = await User.findOne({
    passwordResetHash: hashedTokenFromRequest,
    passwordResetExpiresAt: { $gt: Date.now() }
  })

  // if no user then either token is invalid or expired
  if (!user) {
    return next(new AppError('Password reset Token is Invalid or either expired', 400));
  }

  const { password, passwordConfirm } = req.body;
  if (!password || !passwordConfirm) {
    return next(new AppError('password and passwordConfirm is needed in req body to update new password!'))
  }

  // if password reset token is valid then update the new password and set the hash and expires at to null
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordUpdatedAt = Date.now();
  user.passwordResetHash = undefined;
  user.passwordResetExpiresAt = undefined;

  await user.save();

  const jwtToken = signToken(user._id);

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully',
    data: {
      token: jwtToken
    }
  })

})

export const updatePassword = catchAsync(async (req, res, next) => {
  // get the user from DB and select the password also to compare. get the user.id from req.user
  // since this update password is for logged in users only, hence verifyAuth middleware will run before it
  const user = await User.findById(req.user._id).select('+password');
  const currentPassword = req.body.currentPassword;
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;

  if (!currentPassword || !password || !passwordConfirm) {
    return next(new AppError('current password, password and confirm password is required in req body!', 400));
  }

  if (password !== passwordConfirm) {
    return next(new AppError('Password and passwordConfirm do not match!', 400));
  }

  // match the current password provided in request body 
  const currentPasswordMatches = await user.verifyPassword(currentPassword);

  if (!currentPasswordMatches) {
    return next(new AppError(`Current password does not match your password.
       Please provide correct current password!`, 400));
  }

  // update the user password and save it , document pre save middleware will hash the password
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  const token = signToken(user._id);


  res.status(200).json({
    status: 'success',
    message: 'password updated',
    data: {
      token
    }
  })


})
