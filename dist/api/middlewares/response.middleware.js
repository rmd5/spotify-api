"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
function Error(res, status, message) {
    res.status(status).send({
        statusCode: status,
        status: (0, http_status_codes_1.getReasonPhrase)(status),
        message: message
    });
}
function WithData(res, data) {
    res.status(http_status_codes_1.StatusCodes.OK).send({
        statusCode: http_status_codes_1.StatusCodes.OK,
        status: http_status_codes_1.ReasonPhrases.OK,
        data
    });
}
function WithMessage(res, message) {
    res.status(http_status_codes_1.StatusCodes.OK).send({
        statusCode: http_status_codes_1.StatusCodes.OK,
        status: http_status_codes_1.ReasonPhrases.OK,
        message
    });
}
const response = {
    Error,
    WithData,
    WithMessage
};
exports.default = response;
