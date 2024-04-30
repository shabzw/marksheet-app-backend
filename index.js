//Connect MongoDB ------
const mongoose = require('mongoose');
var cors = require('cors')
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to database"));
// ------------------------

const express = require('express')
const app = express()
const port = 4000
app.use(cors())
app.use(express.json())

// Available Routes
app.get("/health", async (req, res) => {
  res.send({message: "health is OK"});
})
app.use('/api/auth/', require('./routes/auth'))
app.use('/api/marks/', require('./routes/marks'))

app.listen(port, () => {
  console.log(`backend listening on port ${port}`)
})