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
const response_middleware_1 = __importDefault(require("../../middlewares/response.middleware"));
const querystring_1 = __importDefault(require("querystring"));
const agents_1 = __importDefault(require("../../agents"));
const random_function_1 = __importDefault(require("./album/random.function"));
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
    var state = Math.floor(Math.random() * 16);
    res.cookie(stateKey, state);
    var scope = 'user-read-private user-read-email';
    let obj = {
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: "http://localhost:8080/spotify/auth/callback",
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
    }
    else {
        res.clearCookie(stateKey);
        let status, data, error;
        ({ status, data, error } = yield agents_1.default.spotify.account.authorise(code, "http://localhost:8080/spotify/auth/callback"));
        if (!error && status === 200) {
            var access_token = data.access_token, refresh_token = data.refresh_token;
            ({ status, data, error } = yield agents_1.default.spotify.api.get("/me", {}, access_token));
            res.redirect('/#' +
                querystring_1.default.stringify({
                    access_token: access_token,
                    refresh_token: refresh_token
                }));
        }
        else {
            res.redirect('/#' +
                querystring_1.default.stringify({
                    error: 'invalid_token'
                }));
        }
    }
});
exports.refresh = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let status, data, error;
    let token = "AQDeT_b5FL0b4nMKWwa-LKNfLXKDmnFiELyN8j7-hSQSb6cCdhFZwGyC302_u1c-SGHh3hfBuzpC43Ik6_YJNf9k7vhZ5RxMkFssQ0QeSoPw2WhgudGWzNoCOGtkuK9vYHU";
    ({ status, data, error } = yield agents_1.default.spotify.account.refresh(token));
    if (status != 200) {
        response_middleware_1.default.Error(res, status, error);
        return;
    }
    response_middleware_1.default.WithData(res, data);
});
exports.get_artist = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let status, data, error;
    // let token: RefreshTokenData = await request_refresh_token() as RefreshTokenData
    // ({ status, data, error } = await agent.spotify.account.refresh("BQAlakLNHuOhNYFRxfOk7y7bYgZYWX_KFKrkKg0yojmREubx5wpkmrU2dlHIrMtLFdTlHlJ7pSNR-gM36eOf9INthB5dc-28IuSyqh2YT3ade2BGLqiO")) as RefreshTokenData
    ({ status, data, error } = yield agents_1.default.spotify.api.get("/artists/4Z8W4fKeB5YxbusRsdQVPb", {}, "BQAlakLNHuOhNYFRxfOk7y7bYgZYWX_KFKrkKg0yojmREubx5wpkmrU2dlHIrMtLFdTlHlJ7pSNR-gM36eOf9INthB5dc-28IuSyqh2YT3ade2BGLqiO"));
    if (status != 200) {
        response_middleware_1.default.Error(res, status, error);
        return;
    }
    response_middleware_1.default.WithData(res, data);
});
exports.get_album = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let status, data, error;
    ({ status, data, error } = yield agents_1.default.spotify.api.get("/albums/3gBVdu4a1MMJVMy6vwPEb8", {}, "BQD9xTTIkyi3ag8iMuAsBcT1wPSXC58YUVjxSJwADsVdoV2uxDNskB2uFLXaorJfXgn5kg6164pIMLqODwNWUwFBwn2ZJyRDhH-ndKrZ18RAMFweMtys_wXLNETy3LmPl2PGod5YrBUz-wYRJ-hNY26hcKUNvuSL6ohtp3RKMN7W1HJfVF3ssPf7co5h31aRhLDkejwJWznhFhmXuzGgvJ4"));
    if (status != 200) {
        response_middleware_1.default.Error(res, status, error);
        return;
    }
    response_middleware_1.default.WithData(res, data);
});
exports.get_random_album = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, random_function_1.default)(res);
});
