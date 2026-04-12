import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey', {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const fullName = req.body.fullName || req.body.name;

    if (!fullName || !email || !password) {
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

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      fullName, 
      email, 
      password: hashedPassword 
    });

    return res.status(201).json({
      success: true,
      message: 'Successfully registered!',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
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

    const user = await User.findOne({ email });
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
          fullName: user.fullName,
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

export { registerUser, loginUser };