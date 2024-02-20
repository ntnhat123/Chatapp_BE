import User from "../model/auth.js";
import Chat from "../model/chat.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export const Register = async (req, res) => {
  const { fullName, email, password, avatar, address, phone } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Email is not valid",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }
    if (phone.length < 10) {
      return res.status(400).json({
        message: "Phone number must be at least 10 characters",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      avatar,
      address,
      phone,
    });

    const token = jwt.sign(
      { email: newUser.email, id: newUser._id },
      process.env.TOKEN,
      { expiresIn: "30d" }
    );
    res.status(200).json({
      result: newUser,
      token,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
export const Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Invalid email",
      });
    }

    if (!user) {
      return res.status(400).json({
        message: "User does not exist",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Password is incorrect",
      });
    }

    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.TOKEN,
      { expiresIn: "30d" }
    );
    res.status(200).json({
      result: user,
      token,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
export const UpdateUser = async (req, res) => {
  const { id } = req.params;
  const { fullName, avatar, address, phone } = req.body;
  try {
    const newUser = await User.findByIdAndUpdate(
      id,
      {
        fullName,
        avatar,
        address,
        phone,
      },
      { new: true }
    );
    const token = jwt.sign(
      { email: newUser.email, id: newUser._id },
      process.env.TOKEN,
      { expiresIn: "30d" }
    );

    res.status(200).json({
      result: newUser,
      token,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};
