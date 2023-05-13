import agent from "../../agents"
import utils from "../utils"
import db from "../../models"
import { AlbumModel } from "../../models/album.model"
import e from "express"
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
        spotify_id: album?.id
    })

    if (stored_album) {
        console.log("redo reason: already stored")
        let send = await random_album(token) as any
        return send
    }

    if (data.album_type === "single") {
        let num = utils.getRandomInteger(0, 2) as number
        if (num != 0) {
            console.log("redo reason: single")
            let send = await random_album(token) as any
            return send
        }
    }

    ({ data, error } = await agent.spotify.api.get("/albums/" + album.id, { market: "GB" }, token))

    if (error !== null) {
        console.log("redo reason: album fetch")
        let send = await random_album(token) as any
        return send
    }

    let result = {
        spotify_id: album.id,
        href: `https://open.spotify.com/embed/album/${album.id}?utm_source=generator`,
        raw: {
            artists: data.artists.map((e: any) => {
                return {
                    id: e.id,
                    name: e.name,
                    uri: e.uri
                }
            }),
            genres: data.genres,
            id: data.id,
            uri: data.uri,
            images: data.images,
            popularity: data.popularity,
            name: data.name,
            tracks: {
                items: data.tracks.items.map((e: any) => {
                    return {
                        duration_ms: e.duration_ms,
                        explicit: e.explicit,
                        is_local: e.is_local,
                        id: e.id,
                        name: e.name,
                        uri: e.uri,
                        artists: e.artists
                    }
                })
            }
        },
        other_albums: undefined as any,
        similar_artists: undefined as any
    }

    if (data?.popularity < 60 && !q.includes("hipster")) {
        let num = utils.getRandomInteger(0, 7) as number
        if (num != 0) {
            console.log("redo reason: hipster")
            let send = await random_album(token) as any
            return send
        }
    }

    let artist_id = data.artists[0].id as string

    ({ status, data, error } = await agent.spotify.api.get("/artists/" + artist_id + "/albums", { market: "GB" }, token))

    if (error !== null) {
        console.log("redo reason: similar albums")
        let send = await random_album(token) as any
        return send
    }

    result.other_albums = data?.items.map((e: any) => {
        return {
            album_type: e.album_type,
            id: e.id,
            name: e.name,
            uri: e.uri,
            images: e.images
        }
    }) as string

    ({ data, error } = await agent.spotify.api.get("/artists/" + artist_id + "/related-artists", {}, token))

    if (error !== null) {
        console.log("redo reason: related artists")
        let send = await random_album(token) as any
        return send
    }

    result.similar_artists = data.artists.map((e: any) => {
        return {
            id: e.id,
            uri: e.uri,
            name: e.name,
            popularity: e.popularity,
            followers: e.followers,
            genres: e.genres,
            images: e.images
        }
    })

    const new_album = new Album(result)

    let res = await new_album.save()

    return { status: 200, data: result, error: null as null }
}

export async function get_album_from_spotify(token: string, id: string) {
    let status: number, data: any, error: string | null
    ({ status, data, error } = await agent.spotify.api.get("/albums/" + id, { market: "GB" }, token))

    if (status != 200) {
        return { status, data, error }
    }

    let result = {
        spotify_id: data.id,
        href: `https://open.spotify.com/embed/album/${data.id}?utm_source=generator`,
        raw: {
            artists: data.artists.map((e: any) => {
                return {
                    id: e.id,
                    name: e.name,
                    uri: e.uri
                }
            }),
            genres: data.genres,
            id: data.id,
            uri: data.uri,
            images: data.images,
            popularity: data.popularity,
            name: data.name,
            tracks: {
                items: data.tracks.items.map((e: any) => {
                    return {
                        duration_ms: e.duration_ms,
                        explicit: e.explicit,
                        is_local: e.is_local,
                        id: e.id,
                        name: e.name,
                        uri: e.uri,
                        artists: e.artists
                    }
                })
            }
        },
        other_albums: undefined as any,
        similar_artists: undefined as any
    }

    let artist_id = data.artists[0].id as string

    ({ status, data, error } = await agent.spotify.api.get("/artists/" + artist_id + "/albums", { market: "GB" }, token))

    if (error != null) {
        return { status, data, error }
    }

    result.other_albums = data?.items.map((e: any) => {
        return {
            album_type: e.album_type,
            id: e.id,
            name: e.name,
            uri: e.uri,
            images: e.images
        }
    }) as string

    ({ data, error } = await agent.spotify.api.get("/artists/" + artist_id + "/related-artists", {}, token))

    if (error != null) {
        return { status, data, error }
    }

    result.similar_artists = data.artists.map((e: any) => {
        return {
            id: e.id,
            uri: e.uri,
            name: e.name,
            popularity: e.popularity,
            followers: e.followers,
            genres: e.genres,
            images: e.images
        }
    })

    return { status: 200, data: result, error: null }
}