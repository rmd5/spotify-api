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
const response_middleware_1 = __importDefault(require("../middlewares/response.middleware"));
const querystring_1 = __importDefault(require("querystring"));
const agents_1 = __importDefault(require("../agents"));
const uuid_1 = require("uuid");
const album_function_1 = require("./spotify/album.function");
exports.request_access_token = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let status, data, error;
    ({ status, data, error } = yield agents_1.default.spotify.account.token());
    if (status != 200) {
        response_middleware_1.default.Error(res, status, error);
        return;
    }
    response_middleware_1.default.WithData(res, data);
});
var stateKey = 'spotify_auth_state';
exports.auth = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var state = (0, uuid_1.v4)();
    res.cookie(stateKey, state);
    var scope = 'user-read-private user-read-email';
    let obj = {
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.SPOTIFY_CALLBACK_URL,
        state: state
    };
    res.redirect(`https://accounts.spotify.com/authorize?${querystring_1.default.stringify(obj)}`);
});
exports.callback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;
    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring_1.default.stringify({
                error: 'state_mismatch'
            }));
        return;
    }
    res.clearCookie(stateKey);
    let status, data, error;
    ({ status, data, error } = yield agents_1.default.spotify.account.authorise(code, process.env.SPOTIFY_CALLBACK_URL));
    if (error && status !== 200) {
        res.redirect('/#' +
            querystring_1.default.stringify({
                error: 'invalid_token'
            }));
        return;
    }
    let access_token = data.access_token, refresh_token = data.refresh_token;
    ({ status, data, error } = yield agents_1.default.spotify.api.get("/me", {}, access_token));
    res.redirect('/#' +
        querystring_1.default.stringify({
            access_token: access_token,
            refresh_token: refresh_token
        }));
});
exports.refresh = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let status, data, error;
    ({ status, data, error } = yield refresh());
    if (status != 200) {
        response_middleware_1.default.Error(res, status, error);
        return;
    }
    response_middleware_1.default.WithData(res, data);
});
function refresh() {
    return __awaiter(this, void 0, void 0, function* () {
        let status, data, error;
        let token = process.env.SPOTIFY_BASE_REFRESH;
        ({ status, data, error } = yield agents_1.default.spotify.account.refresh(token));
        return { status, data, error };
    });
}
function withReattempt(res, func) {
    return __awaiter(this, void 0, void 0, function* () {
        let status, data, error;
        ({ status, data, error } = yield func("BQAlakLNHuOhNYFRxfOk7y7bYgZYWX_KFKrkKg0yojmREubx5wpkmrU2dlHIrMtLFdTlHlJ7pSNR-gM36eOf9INthB5dc-28IuSyqh2YT3ade2BGLqiO"));
        if (status == 401) {
            let refreshResp = yield refresh();
            if (refreshResp.status != 200) {
                response_middleware_1.default.Error(res, refreshResp.status, refreshResp.error);
            }
            ({ status, data, error } = yield func(refreshResp.data.access_token));
            if (status != 200) {
                response_middleware_1.default.Error(res, status, error);
                return;
            }
            response_middleware_1.default.WithData(res, data);
            return;
        }
        if (status != 200) {
            response_middleware_1.default.Error(res, status, error);
            return;
        }
        response_middleware_1.default.WithData(res, data);
    });
}
exports.get_random_album = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    withReattempt(res, album_function_1.random_album);
});
exports.get_album = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let status, data, error;
    ({ status, data, error } = yield (0, album_function_1.get_album)());
    if (status != 200) {
        response_middleware_1.default.Error(res, status, error);
        return;
    }
    response_middleware_1.default.WithData(res, data);
});
