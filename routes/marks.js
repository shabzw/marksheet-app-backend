const express = require("express");
const app = express();
const router = express.Router();

const Subjects = require("../models/subjects");
const fetchuser = require("../middleware/fetchuser");

router.post("/getmarks/", fetchuser, async (req, res) => {
  try {
    const studentId = req.header("studentId");
    const data = await Subjects.find({ idNumber: studentId });

    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error occured");
  }
});
router.post("/addmarks/", fetchuser, async (req, res) => {
  try {
    const { grade, subjectName, remarks, marksScored, passingMarks } =
      req.body.newContact; // Destructure properties from req.body
    const studentId = req.header("studentId");
    // Create a new Data instance with individual properties
    const newData = new Subjects({
      idNumber: studentId,
      subjectName: subjectName,
      passingMarks: passingMarks,
      grade: grade,
      marksScored: marksScored,
      remarks: remarks,
    });

    // Save the new data to the database
    await newData.save();
    const data = await Subjects.find({ idNumber: studentId });

    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error occured");
  }
});

router.put("/editmarks/", fetchuser, async (req, res) => {
  try {
    const { id, grade, subjectName, remarks, passingMarks, marksScored } =
      req.body.editedContact; // Destructure properties from req.body
    const studentId = req.header("studentId");

    const dataEdit = await Subjects.findById(id);
    dataEdit.set({
      grade,
      subjectName,
      remarks,
      marksScored,
      passingMarks,
    });

    await dataEdit.save();
    const data = await Subjects.find({ idNumber: studentId });

    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error occured");
  }
});

router.delete("/deletemarks/", fetchuser, async (req, res) => {
  const { contactId } = req.body; // Extract the document ID from the request parameters
  try {
    // Check if the document with the specified ID exists
    const existingData = await Subjects.findOne({ _id: contactId });

    if (!existingData) {
      return res.status(404).json({ message: "Data not found" });
    }
    // Update the collection by deleting the document with the specified ID
    await Subjects.deleteOne({ _id: contactId });

    const studentId = req.header("studentId");

    const data = await Subjects.find({ idNumber: studentId });

    res.json(data);
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).json({ message: "Internal Server Error occurred" });
  }
});

module.exports = router;
