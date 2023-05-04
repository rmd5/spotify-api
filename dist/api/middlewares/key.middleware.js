"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const response_middleware_1 = __importDefault(require("./response.middleware"));
require("dotenv").config();
// check for standard API key
const api = (req, res, next) => {
    // check for correct header
    if (req.header("x-api-key")) {
        // check if header value is authorised
        if (req.header('x-api-key') === process.env.API_KEY)
            next();
        else
            response_middleware_1.default.Error(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, "Invalid API key");
    }
    else
        response_middleware_1.default.Error(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, "API key required");
};
// check for admin API key
const admin = (req, res, next) => {
    // check for correct header
    if (req.header("x-api-key")) {
        // check if header value is authorised
        if (req.header('x-api-key') === process.env.ADMIN_KEY)
            next();
        else
            response_middleware_1.default.Error(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, "Invalid admin key");
    }
    else
        response_middleware_1.default.Error(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, "Admin key required");
};
let key = {
    api,
    admin
};
exports.default = key;
