import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import response from "../middlewares/response.middleware"
import db from "../models"
import { SavedModel } from "../models/saved.model"
import { UserModel } from "../models/user.model"
const Saved = db.saved
const User = db.user

exports.save = async (req: Request, res: Response) => {
    if (!req.body.user_id || !req.body.album) {
        response.Error(res, StatusCodes.BAD_REQUEST, "requires both user_id and album")
        return
    }

    let stored_user: UserModel = await User.findOne({spotify_id: req.body.user_id})

    if (!stored_user) {
        response.Error(res, StatusCodes.BAD_REQUEST, "user doesn't exist")
        return
    }

    const saved = new Saved({
        user_id: req.body.user_id,
        ...req.body.album
    })

    await saved.save()

    response.WithData(res, saved)
}

exports.get_saved = async (req: Request, res: Response) => {
    let stored_saves = await GetSaved(req.body.user_id)
    response.WithData(res, stored_saves)
}

async function GetSaved(user_id: string): Promise<Array<SavedModel>> {
    let stored_saves = await Saved.find({user_id: user_id})
    return stored_saves
}

exports.delete = async (req: Request, res: Response) => {
    let resp = await Saved.deleteOne({
        user_id: req.body.user_id,
        spotify_id: req.body.album_id
    })

    if (resp.deletedCount === 1) {
        response.WithMessage(res, "deleted")
        return
    }
        
    response.Error(res, 500, JSON.stringify(resp))
}