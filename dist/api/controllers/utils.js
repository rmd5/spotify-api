"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getRandomOffset() {
    return getRandomInteger(0, 999);
}
function getRandomInteger(min, max) {
    return Math.floor(Math.random() * ((max + 1) - min) + min);
}
function getRandomSearch() {
    // A list of all characters that can be chosen.
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    // Gets a random character from the characters string.
    const randomCharacter = characters.charAt(Math.floor(Math.random() * characters.length));
    let randomSearch = '';
    // Places the wildcard character at the beginning, or both beginning and end, randomly.
    switch (getRandomInteger(0, 1)) {
        case 0:
            randomSearch = randomCharacter + '%';
            break;
        case 1:
            randomSearch = '%' + randomCharacter + '%';
            break;
    }
    switch (getRandomInteger(0, 2)) {
        case 0:
            randomSearch += " tag:hipster";
            break;
        case 1:
            randomSearch += " tag:new";
            break;
    }
    return randomSearch;
}
exports.default = {
    getRandomOffset,
    getRandomSearch
};
