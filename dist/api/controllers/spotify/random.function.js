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
const response_middleware_1 = __importDefault(require("../../../middlewares/response.middleware"));
const agents_1 = __importDefault(require("../../../agents"));
function random_album(res) {
    return __awaiter(this, void 0, void 0, function* () {
        let status, data, error;
        let query = getRandomSearch();
        ({ status, data, error } = yield agents_1.default.spotify.api.get("/search", {
            type: "album",
            q: query,
            offset: getRandomOffset(),
            limit: 1,
            market: "GB"
        }, "BQD9xTTIkyi3ag8iMuAsBcT1wPSXC58YUVjxSJwADsVdoV2uxDNskB2uFLXaorJfXgn5kg6164pIMLqODwNWUwFBwn2ZJyRDhH-ndKrZ18RAMFweMtys_wXLNETy3LmPl2PGod5YrBUz-wYRJ-hNY26hcKUNvuSL6ohtp3RKMN7W1HJfVF3ssPf7co5h31aRhLDkejwJWznhFhmXuzGgvJ4"));
        if (status != 200) {
            response_middleware_1.default.Error(res, status, error);
            return;
        }
        response_middleware_1.default.WithData(res, data.albums.items[0]);
    });
}
exports.default = random_album;
