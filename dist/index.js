"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.Promise = global.Promise;
require("dotenv").config();
// routes
const app = (0, express_1.default)();
require('./api/routes/routes')(app);
const db = require("./api/models");
mongoose_1.default.connect(process.env.MONGO_URL)
    .then(() => {
    console.log("Successfully connected to MongoDB");
}).catch((err) => {
    console.error("Connection error: ", err);
    process.exit();
});
// server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
module.exports = server;
