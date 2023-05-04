import { Response } from 'express';
import {
    StatusCodes,
    ReasonPhrases,
    getReasonPhrase,
} from 'http-status-codes';

function Error(res: Response, status: StatusCodes, message: string) {
    res.status(status).send({
        statusCode: status,
        status: getReasonPhrase(status),
        message: message
    })
}

function WithData(res: Response, data: object) {
    res.status(StatusCodes.OK).send({
        statusCode: StatusCodes.OK,
        status: ReasonPhrases.OK,
        data
    })
}

function WithMessage(res: Response, message: string) {
    res.status(StatusCodes.OK).send({
        statusCode: StatusCodes.OK,
        status: ReasonPhrases.OK,
        message
    })
}

const response = {
    Error,
    WithData,
    WithMessage
}

export default response