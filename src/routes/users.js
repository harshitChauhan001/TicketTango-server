const express = require("express");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("../models/userModel.js");

const authenticateToken = require("../middlewares/authenticateToken.js");
const saltRounds = 10;

const router = express.Router();

router.post("/auth/register", async (req, res) => {

  const {
    email,
    password,
    first_name,
    last_name,
    date_of_birth,
    gender,
    phone_number,
   
  } = req.body;
  try {
    const existinguser = await User.findOne({ email: email });
    if (existinguser) {
      return res.status(404).json({ message: "User already Exist." });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const capitalFirstName =
      first_name.charAt(0).toUpperCase() + first_name.slice(1);
    const capitalLastName =
    last_name.charAt(0).toUpperCase() + last_name.slice(1);

    const newUser = new User({
      email,
      password: hashedPassword,
      first_name: capitalFirstName,
      last_name:capitalLastName,
      date_of_birth,
      gender,
      phone_number,
     
    });

    const registeredUser = await newUser.save();
    const token = jwt.sign(
      { email: registeredUser.email, id: registeredUser._id },
      "secret-code",
      {
        expiresIn: "1d",
      }
    );


    return res.status(201).json({
      user: {
        first_name: registeredUser.first_name,
        role: registeredUser.role,
        profile_picture_url: registeredUser.profile_picture_url,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: `${email}` });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (isPasswordCorrect) {
      

      const token = jwt.sign(
        { email: user.email, id: user._id },
        "secret-code",
        {
          expiresIn: "1d",
        }
      );
      return res.status(201).json({
        user: {
          first_name: user.first_name,
          role: user.role,
        },
        token,
      });
    } else {
      return res.status(409).json({ message: "Incorrect Password" });
    }
  } catch (error) {
    return res.status(409).json({ message: error.message });
  }
});


router.post("/auth/logout", authenticateToken, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error destroying session" });
    } else {
      return res.status(200).json({ message: "Logout successful" });
    }
  });
});

module.exports = router;
