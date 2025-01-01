"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendFailedRes = exports.sendSuccessRes = void 0;
const types_1 = require("../types");
//send success response
const sendSuccessRes = (data, res, message, statusCode, typeOfRes, success, timestamp) => {
    const response = {
        data,
        message,
        statusCode,
        success,
        timestamp: timestamp || new Date().toISOString(),
    };
    switch (typeOfRes) {
        case types_1.typeOfResponse.json:
            res.status(statusCode).json(response);
            return;
        case types_1.typeOfResponse.blob:
            if (data instanceof Buffer) {
                res
                    .status(statusCode)
                    .header("Content-Type", "application/octet-stream")
                    .send(data);
            }
            else {
                throw new Error("Blob responses require data to be a Buffer.");
            }
            return;
        case types_1.typeOfResponse.text:
            if (typeof data === "string") {
                res.status(statusCode).header("Content-Type", "text/plain").send(data);
            }
            else {
                throw new Error("Text responses require data to be a string.");
            }
            return;
        case types_1.typeOfResponse.html:
            if (typeof data === "string") {
                res.status(statusCode).header("Content-Type", "text/html").send(data);
            }
            else {
                throw new Error("HTML responses require data to be a string.");
            }
            return;
        default:
            res.status(500).send({
                message: "Invalid response type",
                statusCode: 500,
                success: false,
            });
            return;
    }
};
exports.sendSuccessRes = sendSuccessRes;
//send failed response
const sendFailedRes = (res, statusCode, success = false, message, errors, timestamp) => {
    const response = {
        statusCode,
        success,
        message,
        errors,
        timestamp: timestamp || new Date().toISOString(),
    };
    res.status(statusCode).json(response);
};
exports.sendFailedRes = sendFailedRes;
