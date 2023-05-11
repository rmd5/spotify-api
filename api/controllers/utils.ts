function getRandomOffset(): number {
    return getRandomInteger(0, 999)
}

function getRandomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * ((max + 1) - min) + min)
}

function getRandomSearch(): string {
    // A list of all characters that can be chosen.
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'

    // Gets a random character from the characters string.
    const randomCharacter = characters.charAt(Math.floor(Math.random() * characters.length))
    let randomSearch = ''

    // Places the wildcard character at the beginning, or both beginning and end, randomly.
    switch (getRandomInteger(0, 1)) {
        case 0:
            randomSearch = randomCharacter + '%'
            break
        case 1:
            randomSearch = '%' + randomCharacter + '%'
            break
    }

    switch (getRandomInteger(0, 6)) {
        case 0:
            randomSearch += " tag:hipster"
            break
        case 1:
        case 2:
            randomSearch += " tag:new"
            break
    }

    return randomSearch
}

export default {
    getRandomOffset,
    getRandomSearch,
    getRandomInteger
}