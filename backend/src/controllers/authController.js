import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/Customer.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey', {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
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

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

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
        token: generateToken(user._id)
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

const getMe = async (req, res) => {
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

const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar },
      { new: true }
    );

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

const addAddress = async (req, res) => {
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

const removeAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.id);
    await user.save();
    
    res.status(200).json({ success: true, data: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateAddress = async (req, res) => {
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

const addPaymentMethod = async (req, res) => {
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

const removePaymentMethod = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    user.paymentMethods = user.paymentMethods.filter(p => p._id.toString() !== req.params.id);
    await user.save();
    
    res.status(200).json({ success: true, data: user.paymentMethods });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
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

export { registerUser, loginUser, getMe, updateAvatar, addAddress, removeAddress, updateAddress, addPaymentMethod, removePaymentMethod, updateProfile };