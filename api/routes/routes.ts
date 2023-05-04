import express, { Express, Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import key from '../middlewares/key.middleware';
import cors from 'cors'
import helmet from 'helmet'
import response from '../middlewares/response.middleware';
import cookieParser from "cookie-parser"

const controller = require("../controllers/spotify.controller")

module.exports = function (app: Express) {
    var corsOptions = {
        origin: [
            "http://localhost:3000",
        ]
    }

    app.use(express.json({ limit: '50mb' }))
        .use(express.urlencoded({ limit: '50mb', extended: true }))
        .use(function (req: Request, res: Response, next: NextFunction) {
            res.header(
                "Access-Control-Allow-Headers",
                "x-access-token, Origin, Content-Type, Accept"
            );
            next();
        })
        .use(cookieParser())
        // assign cors to express server
        .use(cors(corsOptions))
        // helps prevent XSS and enforces secure connections by setting appropriate headers
        .use(helmet())
        // reduce server fingerprinting
        .disable('x-powered-by')

        // Initial route
        .get('/', (req: Request, res: Response) => {
            response.WithMessage(res, "Welcome to the spotify API");
        })

        .use(`${process.env.BASE_API}`, express.Router()

            .use("/spotify", express.Router()
                .use("/auth", express.Router()
                    .get("/", controller.request_access_token)
                    .get("/login", controller.auth)
                    .get('/callback', controller.callback)
                    .get("/refresh", controller.refresh))
                .use("/album", express.Router()
                    .get("/", controller.get_album)
                    .get("/random", [key.admin], controller.get_random_album))
            ))

        // error 404 message
        .use((_req: Request, res: Response) => {
            response.Error(res, StatusCodes.NOT_FOUND, "Route doesn't exist")
        })
}