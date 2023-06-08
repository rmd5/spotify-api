import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import response from "../middlewares/response.middleware"
import db from "../models"
import { AdditionalAlbumModel } from "../models/additional_album.model"
import { SavedModel } from "../models/saved.model"
import { UserModel } from "../models/user.model"
const Saved = db.saved
const User = db.user
const AdditionalAlbum = db.additionalAlbum

exports.save = async (req: Request, res: Response) => {
    if (!req.body.user_id || !req.body.album) {
        response.Error(res, StatusCodes.BAD_REQUEST, "requires both user_id and album")
        return
    }

    let stored_user: UserModel = await User.findOne({ spotify_id: req.body.user_id })

    if (!stored_user) {
        response.Error(res, StatusCodes.BAD_REQUEST, "user doesn't exist")
        return
    }

    let additionalAlbum = null

    if (!req.body.daily_jam) {
        let existing_additional = await AdditionalAlbum.findOne({ spotify_id: req.body.album_id }).lean() as any
        if (!existing_additional) {
            let { other_albums, similar_artists, ...store_album } = req.body.album
            additionalAlbum = new AdditionalAlbum(store_album)
            additionalAlbum.save()
        } else {
            additionalAlbum = existing_additional
        }
    }

    const saved = new Saved({
        user_id: req.body.user_id,
        album_id: req.body.album_id,
        daily_jam: req.body.daily_jam
    })

    await saved.save()

    let saved_resp = { ...saved, album: additionalAlbum } as any

    response.WithData(res, { ...saved_resp?._doc, album: saved_resp?.album })
}

exports.get_saved = async (req: Request, res: Response) => {
    let stored_saves = await GetSaved(req.body.user_id)
    response.WithData(res, stored_saves)
}

export async function GetSaved(user_id: string): Promise<Array<SavedModel | any>> {
    let stored_saves = await Saved.find({ user_id: user_id })

    let nonDailyJams = []
    for (let i = 0; i < stored_saves.length; i++) {
        if (!stored_saves[i].daily_jam) {
            nonDailyJams.push(stored_saves[i].album_id)
            stored_saves.splice(i, 1)
        }
    }

    let additionalAlbums = await AdditionalAlbum.find({
        'spotify_id': { $in: nonDailyJams.map(e => { return e }) }
    })

    let saved_response = [...stored_saves, ...additionalAlbums.map(e => {
        return {
            user_id: user_id,
            album_id: e?.spotify_id,
            daily_jam: false,
            album: e
        }
    })]

    return saved_response
}

exports.delete = async (req: Request, res: Response) => {
    let resp = await Saved.deleteOne({
        user_id: req.body.user_id,
        album_id: req.body.album_id
    })

    if (resp.deletedCount === 1) {
        response.WithMessage(res, "deleted")
        return
    }

    response.Error(res, 500, JSON.stringify(resp))
}