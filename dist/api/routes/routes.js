"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_status_codes_1 = require("http-status-codes");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const response_middleware_1 = __importDefault(require("../middlewares/response.middleware"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const controller = require("../controllers/spotify.controller");
module.exports = function (app) {
    var corsOptions = {
        origin: [
            "http://localhost:3000",
        ]
    };
    app.use(express_1.default.json({ limit: '50mb' }))
        .use(express_1.default.urlencoded({ limit: '50mb', extended: true }))
        .use(function (req, res, next) {
        res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
        next();
    })
        .use((0, cookie_parser_1.default)())
        // assign cors to express server
        .use((0, cors_1.default)(corsOptions))
        // helps prevent XSS and enforces secure connections by setting appropriate headers
        .use((0, helmet_1.default)())
        // reduce server fingerprinting
        .disable('x-powered-by')
        // Initial route
        .get('/', (req, res) => {
        response_middleware_1.default.WithMessage(res, "Welcome to the spotify API");
    })
        .use(`${process.env.BASE_API}`, express_1.default.Router()
        .use("/spotify", express_1.default.Router()
        .use("/auth", express_1.default.Router()
        .get("/", controller.request_access_token)
        .get("/login", controller.auth)
        .get('/callback', controller.callback)
        .get("/refresh", controller.refresh))
        .use("/album", express_1.default.Router()
        .get("/", controller.get_album)
        .get("/random", controller.get_random_album))))
        // error 404 message
        .use((_req, res) => {
        response_middleware_1.default.Error(res, http_status_codes_1.StatusCodes.NOT_FOUND, "Route doesn't exist");
    });
};
