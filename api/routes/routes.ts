import express, { Express, Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import key from '../middlewares/key.middleware';
import cors from 'cors'
import helmet from 'helmet'
import response from '../middlewares/response.middleware';
import cookieParser from "cookie-parser"

const controller = require("../controllers/spotify.controller")
const notifications = require("../controllers/notifications.controller")

module.exports = function (app: Express) {
    var corsOptions = {
        origin: [
            "http://localhost:3000",
            "http://localhost:19006",
            "https://daily-jam.pages.dev"
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

            .post("/user", controller.create_user)
            .get("/user", controller.me)

            .use("/spotify", express.Router()
                .use("/auth", express.Router()
                    .get("/", controller.request_access_token)
                    .get("/me", controller.me)
                    .get("/login", controller.auth)
                    .get('/callback', controller.callback)
                    .get("/refresh", controller.refresh)
                    .get("/authorize", controller.authorize))
                .use("/album", express.Router()
                    .get("/", controller.get_album)
                    .get("/all", controller.get_all_albums)
                    .get("/random", controller.get_random_album)
                    .patch("/color", controller.color)
                    .get("/request", controller.get_album_from_spotify))
                .get("/embed", controller.embed)
            )

            .use("/notifications", express.Router()
                .post("/subscribe", notifications.subscribe)
                .post("/unsubscribe", notifications.unsubscribe)
                .get("/send", notifications.send_notification)))


        // error 404 message
        .use((_req: Request, res: Response) => {
            response.Error(res, StatusCodes.NOT_FOUND, "Route doesn't exist")
        })
}