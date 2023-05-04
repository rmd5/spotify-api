import express from 'express'
import mongoose from "mongoose"
mongoose.Promise = global.Promise
require("dotenv").config()

// routes
const app = express();
require('./api/routes/routes')(app)

const db = require("./api/models")
mongoose.connect(process.env.MONGO_URL)
	.then(() => {
		console.log("Successfully connected to MongoDB")
	}).catch((err: Error) => {
		console.error("Connection error: ", err)
		process.exit()
	})

// server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
	console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

module.exports = server