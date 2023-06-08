import Album from "./album.model"
import User from "./user.model"
import Saved from "./saved.model"
import AdditionalAlbum from "./additional_album.model"

const db = {
    album: Album,
    user: User,
    saved: Saved,
    additionalAlbum: AdditionalAlbum
}

export default db