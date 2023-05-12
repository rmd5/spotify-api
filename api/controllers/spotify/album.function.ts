import agent from "../../agents"
import utils from "../utils"
import db from "../../models"
import { AlbumModel } from "../../models/album.model"
const Album = db.album

interface ExternalUrls {
    spotify: string
}

interface Image {
    height: number,
    url: string,
    width: number
}

interface Album {
    album_group: string,
    album_type: string,
    external_urls: ExternalUrls,
    href: string,
    id: string,
    images: Image[],
    is_playable: boolean,
    name: string,
    release_date: string,
    release_date_precision: string,
    total_tracks: number,
    type: string,
    uri: string
}

interface Albums {
    href: string,
    items: Album[]
}

interface AlbumResponse {
    albums: Albums
}

export async function get_all() {
    let stored_albums: AlbumModel[] = await Album.find({}, {}, { sort: { date: -1 } })

    if (!stored_albums) {
        return { status: 404, data: null as null, error: "could not find albums" }
    }

    return { status: 200, data: stored_albums, error: null as null }
}

export default async function update_color(id: string, color: string) {
    let stored_album: AlbumModel = await Album.findOneAndUpdate({
        spotify_id: id
    }, { color: color }, { new: true })

    if (!stored_album) {
        return { status: 404, data: null as null, error: "could not find album" }
    }

    return { status: 200, data: stored_album, error: null as null }
}

export async function get_album() {
    let stored_album: AlbumModel = await Album.findOne({}, {}, { sort: { 'date': -1 } })

    if (!stored_album) {
        return { status: 404, data: null as null, error: "could not find album" }
    }

    return { status: 200, data: stored_album, error: null as null }
}

export async function random_album(token: string) {
    let status: number, data: any | null, error: string | null

    let q = utils.getRandomSearch() as string
    ({ status, data, error } = await agent.spotify.api.get(
        "/search",
        {
            type: "album",
            q: q,
            offset: utils.getRandomOffset(),
            limit: 1,
            market: "GB"
        },
        token
    ))

    if (status !== 200) {
        return { status, data: null as null, error }
    }

    let album = data?.albums?.items[0]

    let stored_album: AlbumModel = await Album.findOne({
        spotify_id: album.id
    })

    if (stored_album) {
        random_album(token)
        return
    }

    ({ status, data, error } = await agent.spotify.api.get("/albums/" + album.id, { market: "GB" }, token))
    
    if (data?.popularity < 60 && !q.includes("hipster")) {
        let num = utils.getRandomInteger(0, 7) as number
        if (num != 0) {
            random_album(token)
            return
        }
    }

    if (data.album_type === "single") {
        let num = utils.getRandomInteger(0, 2) as number
        if (num != 0) {
            random_album(token)
            return
        }
    }

    const new_album = new Album({
        spotify_id: album.id,
        href: `https://open.spotify.com/embed/album/${album.id}?utm_source=generator`,
        raw: data
    })

    await new_album.save()

    return { status: 200, data: new_album, error: null as null }
}