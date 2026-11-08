import { Schema, model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'User name is required'],
    minLength: [3, 'A user name must have at least 3 characters'],
    maxLength: [25, 'A user name must have less than 25 characters'],
  },
  email: {
    type: String,
    required: [true, 'user email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: 'Please Provide a valid Email!',
    },
    // match: [
    //     /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    //     'Please provide a valid email address'
    // ]
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'guide', 'lead-guide', 'admin'],
      message: 'Role can either be user,guide,lead-guide or admin',
    },
    default: 'user',
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minLength: [8, 'Password must have at least 6 characters'],
    select: false, // this will not give password when using find() on user model
  },
  passwordConfirm: {
    type: String,
    required: [true, 'A user must provide confirm password'],
    validate: {
      // this works only on save() and create()
      validator: function (value) {
        return value === this.password;
      },
      message: 'Confirm Password must match the password',
    },
  },
  passwordUpdatedAt: {
    type: Date,
    default: Date.now(),
  },
  passwordResetHash: String,
  passwordResetExpiresAt: Date,
});

// Password hashing pre save document middleware
userSchema.pre('save', async function () {
  // This prevents hashing the password again when you update other user properties and
  //  save an existing document.
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

// Instance method to verify the password , this method will be called on user model instance in controller
// to verify the password entered by a user while login. since select attribute of user schema is set to false
// ideally this.password will not work. but if in controller while calling this instance method if password
// is selected explicitely using .select('+password') then this.password would work.
// important to note : while calling this method password must have been selected
userSchema.methods.verifyPassword = async function (loginPassword) {
  return await bcrypt.compare(loginPassword, this.password);
};

// this instance method checks whether the password is updated after the token is issued or not
// if password is updated after token is issued then it returns true
userSchema.methods.passwordUpdatedAfterTokenIssue = function (tokenIssuedAt) {
  const passwordUpdatedAt = new Date(this.passwordUpdatedAt).getTime();
  return passwordUpdatedAt > tokenIssuedAt * 1000;
};

userSchema.methods.createPasswordResetToken = function () {
  const randomPasswordResetToken = randomBytes(32).toString('hex');
  this.passwordResetHash = createHash('sha256')
    .update(randomPasswordResetToken)
    .digest('hex');
};

export const User = model('user', userSchema);
