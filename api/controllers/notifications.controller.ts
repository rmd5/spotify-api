import { Request, Response } from "express";
import admin from "firebase-admin"
import response from "../middlewares/response.middleware";
import firebase_config from "../../firebase-config.json"

const serviceAccount = firebase_config as admin.ServiceAccount
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

exports.send_notification = async (_req: Request, res: Response) => {
    let status: number, data: any, error: string | null
    ({ status, data, error } = await send())

    if (status != 200) {
        response.Error(res, status, error)
        return
    }

    response.WithData(res, data)
}

exports.subscribe = async (req: Request, res: Response) => {
    let token = req.body.token
    admin.messaging().subscribeToTopic(token, "allowList")
        .then(() => {
            response.WithData(res, { message: "subscribed" })
        })
        .catch(err => {
            response.Error(res, 400, err)
        })
}

exports.unsubscribe = async (req: Request, res: Response) => {
    let token = req.body.token
    admin.messaging().unsubscribeFromTopic(token, "allowList")
        .then(() => {
            response.WithData(res, { message: "unsubscribed" })
        })
        .catch(err => {
            response.Error(res, 400, err)
        })
}

function send(): any {
    var payload = {
        data: {
            title: "Daily Jam",
            body: "Get your day started with some smoooth jams on toast! Album of the day is -",
            icon: "https://rorydobson.com/static/media/dailyjam.349264fd.png",
            image: ""
        },
        topic: "allowList"
    }

    return admin.messaging().send(payload)
        .then(function (response) {
            console.log("Successfully sent message:", response);
            return { status: 200, data: { message: "message sent" }, error: null }
        })
        .catch(function (error) {
            return { status: 400, data: { message: "error sending message" }, error }
        });
}