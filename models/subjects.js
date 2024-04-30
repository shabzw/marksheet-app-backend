const mongoose = require("mongoose");
const { Schema } = mongoose;

const subjectsSchema = new Schema({
  idNumber: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  subjectName: { type: String, required: true }, // Name of the subject (e.g., Math, English)
  marksScored: { type: Number, required: true },
  remarks: { type: String, required: true },
  passingMarks: { type: Number },
  grade: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now },
});

const SubjectsModel = mongoose.model("Subjects", subjectsSchema);

module.exports = SubjectsModel;
