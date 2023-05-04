"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const superagent_1 = __importDefault(require("superagent"));
exports.default = {
    account: {
        token: () => __awaiter(void 0, void 0, void 0, function* () {
            return superagent_1.default
                .post(process.env.SPOTIFY_ACCOUNT_URL + "/token")
                .set("Content-Type", "application/x-www-form-urlencoded")
                .send({
                grant_type: "client_credentials",
                client_id: process.env.SPOTIFY_CLIENT_ID,
                client_secret: process.env.SPOTIFY_CLIENT_SECRET
            })
                .withCredentials()
                .then((res) => {
                return { status: res.statusCode, data: res.body, error: null };
            })
                .catch((reason) => {
                var _a, _b, _c;
                return { status: (_a = reason === null || reason === void 0 ? void 0 : reason.response) === null || _a === void 0 ? void 0 : _a.statusCode, data: null, error: (_c = (_b = reason === null || reason === void 0 ? void 0 : reason.response) === null || _b === void 0 ? void 0 : _b.body) === null || _c === void 0 ? void 0 : _c.error };
            });
        }),
        authorise: (code, redirect) => __awaiter(void 0, void 0, void 0, function* () {
            let buffer = new Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET);
            return superagent_1.default
                .post(process.env.SPOTIFY_ACCOUNT_URL + "/token")
                .set("Authorization", `Basic ${buffer.toString("base64")}`)
                .set("Content-Type", "application/x-www-form-urlencoded")
                .send({
                code: code,
                redirect_uri: redirect,
                grant_type: "authorization_code",
            })
                .then((res) => {
                return { status: res.statusCode, data: res.body, error: null };
            })
                .catch((reason) => {
                var _a, _b, _c;
                return { status: (_a = reason === null || reason === void 0 ? void 0 : reason.response) === null || _a === void 0 ? void 0 : _a.statusCode, data: null, error: (_c = (_b = reason === null || reason === void 0 ? void 0 : reason.response) === null || _b === void 0 ? void 0 : _b.body) === null || _c === void 0 ? void 0 : _c.error };
            });
        }),
        refresh: (token) => __awaiter(void 0, void 0, void 0, function* () {
            let buffer = new Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET);
            return superagent_1.default
                .post(process.env.SPOTIFY_ACCOUNT_URL + "/token")
                .set("Authorization", `Basic ${buffer.toString("base64")}`)
                .set("Content-Type", "application/x-www-form-urlencoded")
                .send({
                grant_type: "refresh_token",
                refresh_token: token
            })
                .then((res) => {
                return { status: res.statusCode, data: res.body, error: null };
            })
                .catch((reason) => {
                var _a, _b, _c;
                return { status: (_a = reason === null || reason === void 0 ? void 0 : reason.response) === null || _a === void 0 ? void 0 : _a.statusCode, data: null, error: (_c = (_b = reason === null || reason === void 0 ? void 0 : reason.response) === null || _b === void 0 ? void 0 : _b.body) === null || _c === void 0 ? void 0 : _c.error };
            });
        })
    },
    api: {
        get: (path, params, token) => __awaiter(void 0, void 0, void 0, function* () {
            return superagent_1.default
                .get(process.env.SPOTIFY_API_URL + path)
                .set("Authorization", `Bearer ${token}`)
                .query(params)
                .then((res) => {
                return { status: res.statusCode, data: res.body, error: null };
            })
                .catch((reason) => {
                var _a, _b, _c, _d;
                return { status: (_a = reason === null || reason === void 0 ? void 0 : reason.response) === null || _a === void 0 ? void 0 : _a.statusCode, data: null, error: (_d = (_c = (_b = reason === null || reason === void 0 ? void 0 : reason.response) === null || _b === void 0 ? void 0 : _b.body) === null || _c === void 0 ? void 0 : _c.error) === null || _d === void 0 ? void 0 : _d.message };
            });
        })
    }
};
