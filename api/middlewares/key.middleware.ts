import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import response from "./response.middleware"

require("dotenv").config()

// check for standard API key
const api = (req: Request, res: Response, next: NextFunction) => {
    // check for correct header
    if (req.header("x-api-key")) {
        // check if header value is authorised
        if (req.header('x-api-key') === process.env.API_KEY) next()
        else response.Error(res, StatusCodes.UNAUTHORIZED, "Invalid API key")
    } else response.Error(res, StatusCodes.UNAUTHORIZED, "API key required")
}

// check for admin API key
const admin = (req: Request, res: Response, next: NextFunction) => {
    // check for correct header
    if (req.header("x-api-key")) {
        // check if header value is authorised
        if (req.header('x-api-key') === process.env.ADMIN_KEY) next()
        else response.Error(res, StatusCodes.UNAUTHORIZED, "Invalid admin key")
    } else response.Error(res, StatusCodes.UNAUTHORIZED, "Admin key required")
}

let key = {
    api,
    admin
}

export default key