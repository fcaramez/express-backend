const router = require("express").Router();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const saltRounds = 10;
const User = require("../models/User.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

router.get("/verify", isAuthenticated, (req, res, _next) => {
  res.json(req.payload);
});

router.post("/signup", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username) {
      return res
        .status(400)
        .json({ errorMessage: "Please provide a username." });
    }

    if (password.length < 8) {
      return res.status(400).json({
        errorMessage: "Your password needs to be at least 8 characters long",
      });
    }

    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

    if (!regex.test(password)) {
      return res.status(400).json({
        errorMessage:
          "Password needs to have a least 8 characters and must contain at least one number, one lowercase and one uppercase letter.",
      });
    }

    const checkUser = await User.findOne({ username });

    if (checkUser !== null) {
      return res.status(400).json({ errorMessage: "Username already taken." });
    }

    const generatedSalt = await bcrypt.genSalt(saltRounds);

    const hashedPassword = await bcrypt.hash(password, generatedSalt);

    const newUser = await User.create({ username, password: hashedPassword });

    console.log(newUser);

    return res.status(200).json({ newUser });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ errorMessage: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        errorMessage:
          "Username needs to be uique. The Username you chose is already in use",
      });
    }
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username) {
      return res
        .status(400)
        .json({ errorMessage: "Please provide a Username" });
    }

    if (!password) {
      return res
        .status(400)
        .json({ errorMessage: "Please provide a password" });
    }

    if (!username && !password) {
      return res.status(400).json({
        errorMessage: "Please provide both your username and password",
      });
    }

    const userToFind = await User.findOne({ username });

    if (!userToFind) {
      return res
        .status(400)
        .json({ errorMessage: "No user matches that username" });
    }

    const comparePassword = bcrypt.compareSync(password, userToFind.password);

    if (!comparePassword) {
      return res.status(400).json({ errorMessage: "Incorrect password" });
    }

    const payload = {
      _id: userToFind._id,
      username: userToFind.username,
    };

    const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "24h",
    });

    res.status(200).json({ authToken });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
