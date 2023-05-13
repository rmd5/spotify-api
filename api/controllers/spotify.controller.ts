import { Request, Response } from "express"
import response from "../middlewares/response.middleware";
import querystring from "querystring"
import agent from "../agents"
import { v4 as uuid } from "uuid"

import update_color, { get_album, get_album_from_spotify, get_all, random_album } from "./spotify/album.function"
import { AlbumModel } from "../models/album.model";

import db from "../models"
import { UserModel } from "../models/user.model"
import { get_embed } from "./spotify/embed";
const User = db.user

interface AccessTokenData {
    access_token: string,
    token_type: string,
    expires_in: number,
    refresh_token: string
}

exports.authorize = async (req: Request, res: Response) => {
    let status: number, data: AccessTokenData | null, error: string | null

    ({ status, data, error } = await agent.spotify.account.authorise(req.body.code, process.env.SPOTIFY_CALLBACK_URL)) as RefreshTokenData

    if (status != 200) {
        response.Error(res, status, error)
        return
    }

    let access_token = data.access_token,
        refresh_token = data.refresh_token;

    ({ status, data, error } = await agent.spotify.api.get("/me", {}, access_token))

    if (status != 200) {
        response.Error(res, status, error)
        return
    }

    response.WithData(res, { ...data, refresh_token })
}

exports.request_access_token = async (_req: Request, res: Response) => {
    let status: number, data: AccessTokenData | null, error: string | null

    ({ status, data, error } = await agent.spotify.account.token())

    if (status != 200) {
        response.Error(res, status, error)
        return
    }

    response.WithData(res, data)
}

interface RefreshTokenData {
    status: number
    data: any
    error: string | null
}

var stateKey = 'spotify_auth_state';

exports.auth = async (_req: Request, res: Response) => {
    var state = uuid();
    res.cookie(stateKey, state);

    var scope = 'user-read-private user-read-email';
    let obj = {
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.SPOTIFY_CALLBACK_URL,
        state: state
    }

    res.redirect(`https://accounts.spotify.com/authorize?${querystring.stringify(obj)}`)
}

exports.callback = async (req: Request, res: Response) => {
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
        return
    }

    res.clearCookie(stateKey);

    let status: number, data: any, error: string | null
    ({ status, data, error } = await agent.spotify.account.authorise(code, process.env.SPOTIFY_CALLBACK_URL)) as RefreshTokenData

    if (error && status !== 200) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'invalid_token'
            }));
        return
    }

    let access_token = data.access_token,
        refresh_token = data.refresh_token;

    ({ status, data, error } = await agent.spotify.api.get("/me", {}, access_token))

    res.redirect('/#' +
        querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
        }));
}

exports.create_user = async (req: Request, res: Response) => {
    let status: number, data: any, error: string | null

    ({ status, data, error } = await agent.spotify.account.authorise(req.body.code, process.env.SPOTIFY_CALLBACK_URL)) as RefreshTokenData

    if (status != 200) {
        response.Error(res, status, error)
        return
    }

    let access_token = data.access_token,
        refresh_token = data.refresh_token;

    ({ status, data, error } = await agent.spotify.api.get("/me", {}, access_token))

    if (status != 200) {
        response.Error(res, status, error)
        return
    }

    let stored_user: UserModel = await User.findOneAndUpdate({
        spotify_id: data.id
    }, { token: access_token, refresh_token: refresh_token }, { new: true })

    if (stored_user) {
        stored_user.updateOne()
        response.WithData(res, stored_user)
        return
    }

    const new_user = new User({
        display_name: data.display_name,
        external_urls: data.external_urls,
        followers: data.followers,
        href: data.href,
        spotify_id: data.id,
        images: data.images,
        type: data.type,
        uri: data.uri,
        token: access_token,
        refresh_token: refresh_token
    })

    await new_user.save()

    response.WithData(res, new_user)
}

exports.me = async (req: Request, res: Response) => {
    let stored_user: UserModel = await User.findOne({
        token: req.query.token
    })

    if (!stored_user) {
        response.Error(res, 404, "could not find user")
        return
    }

    response.WithData(res, stored_user)
}

exports.refresh = async (req: Request, res: Response) => {
    let status: number, data: any, error: string | null
    let refresh_token = req.query.refresh_token as string
    console.log(refresh_token) as void
    ({ status, data, error } = await refresh(refresh_token))

    console.log(status, data, error)

    if (status != 200) {
        response.Error(res, status, error)
        return
    }

    ({ status, data, error } = await agent.spotify.api.get("/me", {}, data.access_token))

    if (status != 200) {
        response.Error(res, status, error)
        return
    }

    let stored_user: UserModel = await User.findOneAndUpdate({
        spotify_id: data.id
    }, { token: data.access_token, refresh_token: refresh_token }, { new: true })

    if (stored_user) {
        stored_user.updateOne()
        response.WithData(res, stored_user)
        return
    }

    response.Error(res, 404, "user not found")
}

exports.embed = async (_req: Request, res: Response) => {
    let html = await get_embed()
    res.send(html)
}

exports.get_album_from_spotify = async (req: Request, res: Response) => {
    withReattempt(res, () => get_album_from_spotify(req.query.token as string, req.query.album as string))
}

async function refresh(refresh_token: string): Promise<RefreshTokenData> {
    let status: number, data: any, error: string | null
    let token: string = refresh_token as string

    ({ status, data, error } = await agent.spotify.account.refresh(token))

    return { status, data, error }
}

async function withReattempt(res: Response, func: (token: string) => any) {
    let status: number, data: AccessTokenData | null, error: string | null
    ({ status, data, error } = await func("BQAlakLNHuOhNYFRxfOk7y7bYgZYWX_KFKrkKg0yojmREubx5wpkmrU2dlHIrMtLFdTlHlJ7pSNR-gM36eOf9INthB5dc-28IuSyqh2YT3ade2BGLqiO"))

    if (status == 401) {
        let refreshResp = await refresh(process.env.SPOTIFY_BASE_REFRESH)

        if (refreshResp.status != 200) {
            response.Error(res, refreshResp.status, refreshResp.error)
        }

        ({ status, data, error } = await func(refreshResp.data.access_token))

        if (status != 200) {
            response.Error(res, status, error)
            return
        }

        response.WithData(res, data)

        return
    }

    if (status != 200) {
        response.Error(res, status, error)
        return
    }

    response.WithData(res, data)
}

exports.get_random_album = async (_req: Request, res: Response) => {
    withReattempt(res, random_album)
}

exports.get_album = async (_req: Request, res: Response) => {
    let status: number, data: AlbumModel | null, error: string | null
    ({ status, data, error } = await get_album())

    if (status != 200) {
        response.Error(res, status, error)
        return
    }

    response.WithData(res, data)
}

exports.get_all_albums = async (_req: Request, res: Response) => {
    let status: number, data: AlbumModel[] | null, error: string | null
    ({ status, data, error } = await get_all())

    if (status != 200) {
        response.Error(res, status, error)
        return
    }

    response.WithData(res, data)
}

exports.color = async (req: Request, res: Response) => {
    let status: number, data: AlbumModel | null, error: string | null
    ({ status, data, error } = await update_color(req.body.id, req.body.color))

    if (status != 200) {
        response.Error(res, status, error)
        return
    }

    response.WithData(res, data)
}