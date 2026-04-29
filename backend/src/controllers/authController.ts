import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/Customer.js';
import sendEmail from '../utils/sendEmail.js';

const generateToken = (id: any, rememberMe: boolean = false) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey', {
    expiresIn: rememberMe ? '30d' : '24h',
  });
};

const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const name = req.body.name || req.body.fullName;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required.' 
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ 
        success: false,
        message: 'Email already registered.' 
      });
    }

    const user = await User.create({ 
      name, 
      email, 
      password
    });

    return res.status(201).json({
      success: true,
      message: 'Successfully registered!',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: 'user'
        },
        token: generateToken(user._id)
      }
    });

  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    if (!user.password) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: 'user'
        },
        token: generateToken(user._id, rememberMe)
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Server error. Please try again.' 
    });
  }
};

const getMe = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const updateAvatar = async (req: any, res: Response) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }


    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      data: { avatar: user.avatar }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const addAddress = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    if (req.body.isDefault) {
      user.addresses.forEach(a => a.isDefault = false);
    }
    
    user.addresses.push(req.body);
    await user.save();
    
    res.status(200).json({ success: true, data: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const removeAddress = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    user.addresses.pull({ _id: req.params.id });
    await user.save();
    
    res.status(200).json({ success: true, data: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateAddress = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const address = user.addresses.find(a => a._id.toString() === req.params.id);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });
    
    // Update address fields
    if (req.body.type) address.type = req.body.type;
    if (req.body.name) address.name = req.body.name;
    if (req.body.address) address.address = req.body.address;
    if (req.body.phone) address.phone = req.body.phone;
    
    // Handle default address
    if (req.body.isDefault) {
      user.addresses.forEach(a => a.isDefault = false);
      address.isDefault = true;
    } else {
      address.isDefault = req.body.isDefault || false;
    }
    
    await user.save();
    
    res.status(200).json({ success: true, data: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const addPaymentMethod = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    if (req.body.isDefault) {
      user.paymentMethods.forEach(p => p.isDefault = false);
    }
    
    user.paymentMethods.push(req.body);
    await user.save();
    
    res.status(200).json({ success: true, data: user.paymentMethods });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const removePaymentMethod = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    user.paymentMethods.pull({ _id: req.params.id });
    await user.save();
    
    res.status(200).json({ success: true, data: user.paymentMethods });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateProfile = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    if (req.body.name) user.name = req.body.name;
    if (req.body.phone) user.phone = req.body.phone;
    
    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'There is no user with that email address.'
      });
    }

    // 1) Generate random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 2) Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // 3) Set expires (10 minutes)
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save({ validateBeforeSave: false });

    // 4) Send it to user's email
    const resetURL = `${req.get('origin')}/reset-password?token=${resetToken}`;

    const message = `Forgot your password? Submit a new password to reset it here: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message
      });

      res.status(200).json({
        success: true,
        message: 'Token sent to email!'
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'There was an error sending the email. Try again later!'
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token is invalid or has expired'
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // 3) Log the user in, send JWT
    const jwtToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successful!',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token: jwtToken
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const changePassword = async (req: any, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.password) {
      return res.status(401).json({ success: false, message: 'Invalid current password' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid current password' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export { 
  registerUser, 
  loginUser, 
  getMe, 
  updateAvatar, 
  addAddress, 
  removeAddress, 
  updateAddress, 
  addPaymentMethod, 
  removePaymentMethod, 
  updateProfile,
  forgotPassword,
  resetPassword,
  changePassword
};