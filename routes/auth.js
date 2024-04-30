const express = require("express");
const router = express.Router();
const User = require("../models/User");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var fetchuser = require("../middleware/fetchuser");

const { body, validationResult } = require("express-validator");
const JWT_SECRET = process.env.JWT_SECRET;
const STAFF_SECRET_KEY = process.env.STAFF_SECRET_KEY;

//ROUTE 1 ---> Create a User using: POST "/api/auth/createuser". No login required
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "enter a valid email").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({
      min: 5,
    }),
    body("phoneNo", "phone number must consist of 5 to 15 numbers")
      .isLength({ min: 5, max: 15 })
      .isNumeric(),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    if (req.body.secretKey != STAFF_SECRET_KEY && req.body.role === "staff") {
      return res
        .status(400)
        .json({ success, message: "Secret Key is invalid" });
    }
    // Check whether multiple users exists with same email
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({
            success,
            error: "Sorry a user with this email already exists",
          });
      }
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
        role: req.body.role,
        gender: req.body.gender,
        classN: req.body.classN,
        phoneNo: req.body.phoneNo,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server error occured");
    }
  }
);

//ROUTE 2 ---> Authenticate a User using: POST "/api/auth/login". Login not required.
router.post(
  "/login",
  [
    body("email", "enter a valid email").isEmail(),
    body("password", "password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        success = false;
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success = false;
        return res
          .status(400)
          .json({
            success,
            error: "Please try to login with correct credentials",
          });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      const loggedInData = await User.find({ email: user.email });
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authtoken, loggedInData });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error occured");
    }
  }
);

//ROUTE 3 ---> Get loggedIn User detail using: POST "/api/auth/getuser". Login required
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const className = req.header("classValue");
    const userId = req.user.id;
    const studentsData = await User.find({
      role: "student",
      classN: className,
    }).select("-password");

    res.send(studentsData);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error occured");
  }
});
router.post("/getuserinfo/", fetchuser, async (req, res) => {
  try {
    const userInfo = await User.findById({ _id: req.user.id }).select(
      "-password"
    );
    res.send(userInfo);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error occured");
  }
});

router.put("/edituser/", fetchuser, async (req, res) => {
  try {
    const { id, name, gender, email, phoneNo } = req.body.editedContact; // Destructure properties from req.body
    // const studentId =  req.header('studentId');

    const dataEdit = await User.findById(id);
    dataEdit.set({
      name: name,
      email: email,
      gender: gender,
      phoneNo: phoneNo,
    });

    await dataEdit.save();
    const data = await User.find({
      role: "student",
      classN: req.body.classValue,
    });

    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error occured");
  }
});

router.delete("/deleteuser/", fetchuser, async (req, res) => {
  const { contactId, classValue } = req.body; // Extract the document ID from the request parameters
  try {
    // Check if the document with the specified ID exists
    const existingData = await User.findOne({ _id: contactId });
    if (!existingData) {
      return res.status(404).json({ message: "User not found" });
    }
    // Update the collection by deleting the document with the specified ID
    await User.deleteOne({ _id: contactId });

    const data = await User.find({ role: "student", classN: classValue });

    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error occured");
  }
});
module.exports = router;

module.exports = router;
