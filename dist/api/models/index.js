"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const album_model_1 = __importDefault(require("./album.model"));
const db = {
    album: album_model_1.default
};
exports.default = db;
