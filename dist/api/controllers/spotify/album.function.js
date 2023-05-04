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
exports.random_album = exports.get_album = void 0;
const agents_1 = __importDefault(require("../../agents"));
const utils_1 = __importDefault(require("../utils"));
const models_1 = __importDefault(require("../../models"));
const Album = models_1.default.album;
function get_album() {
    return __awaiter(this, void 0, void 0, function* () {
        let stored_album = yield Album.findOne({}, {}, { sort: { 'date': -1 } });
        if (!stored_album) {
            return { status: 404, data: null, error: "could not find album" };
        }
        return { status: 200, data: stored_album, error: null };
    });
}
exports.get_album = get_album;
function random_album(token) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let status, data, error;
        ({ status, data, error } = yield agents_1.default.spotify.api.get("/search", {
            type: "album",
            q: utils_1.default.getRandomSearch(),
            offset: utils_1.default.getRandomOffset(),
            limit: 1,
            market: "GB"
        }, token));
        if (status !== 200) {
            return { status, data: null, error };
        }
        let album = (_a = data === null || data === void 0 ? void 0 : data.albums) === null || _a === void 0 ? void 0 : _a.items[0];
        let stored_album = yield Album.findOne({
            spotify_id: album.id
        });
        if (stored_album) {
            random_album(token);
        }
        const new_album = new Album({
            spotify_id: album.id,
            href: `https://open.spotify.com/embed/album/${album.id}?utm_source=generator`,
            raw: album
        });
        yield new_album.save();
        return { status: 200, data: new_album, erro: null };
    });
}
exports.random_album = random_album;
