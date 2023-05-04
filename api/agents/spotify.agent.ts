import superagent from "superagent"

interface SpotifyResponse {
    status: number,
    data: any,
    error: string | null
}

export default {
    account: {
        token: async (): Promise<SpotifyResponse> => {
            return superagent
                .post(process.env.SPOTIFY_ACCOUNT_URL + "/token")
                .set("Content-Type", "application/x-www-form-urlencoded")
                .send({
                    grant_type: "client_credentials",
                    client_id: process.env.SPOTIFY_CLIENT_ID,
                    client_secret: process.env.SPOTIFY_CLIENT_SECRET
                })
                .withCredentials()
                .then((res: superagent.Response) => {
                    return { status: res.statusCode, data: res.body, error: null }
                })
                .catch((reason) => {
                    return { status: reason?.response?.statusCode, data: null, error: reason?.response?.body?.error }
                })
        },
        authorise: async (code: any, redirect: string): Promise<SpotifyResponse> => {
            let buffer = new (Buffer as any).from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET) as any
            return superagent
                .post(process.env.SPOTIFY_ACCOUNT_URL + "/token")
                .set("Authorization", `Basic ${buffer.toString("base64")}`)
                .set("Content-Type", "application/x-www-form-urlencoded")
                .send({
                    code: code,
                    redirect_uri: redirect,
                    grant_type: "authorization_code",
                })
                .then((res: superagent.Response) => {
                    return { status: res.statusCode, data: res.body, error: null }
                })
                .catch((reason) => {
                    return { status: reason?.response?.statusCode, data: null, error: reason?.response?.body?.error }
                })
        },
        refresh: async (token: string): Promise<SpotifyResponse> => {
            let buffer = new (Buffer as any).from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET) as any
            return superagent
                .post(process.env.SPOTIFY_ACCOUNT_URL + "/token")
                .set("Authorization", `Basic ${buffer.toString("base64")}`)
                .set("Content-Type", "application/x-www-form-urlencoded")
                .send({
                    grant_type: "refresh_token",
                    refresh_token: token
                })
                .then((res: superagent.Response) => {
                    return { status: res.statusCode, data: res.body, error: null }
                })
                .catch((reason) => {
                    return { status: reason?.response?.statusCode, data: null, error: reason?.response?.body?.error }
                })
        }
    },
    api: {
        get: async (path: string, params: object, token: string) => {
            return superagent
                .get(process.env.SPOTIFY_API_URL + path)
                .set("Authorization", `Bearer ${token}`)
                .query(params)
                .then((res: superagent.Response) => {
                    return { status: res.statusCode, data: res.body, error: null }
                })
                .catch((reason) => {
                    return { status: reason?.response?.statusCode, data: null, error: reason?.response?.body?.error?.message }
                })
        }
    }
}