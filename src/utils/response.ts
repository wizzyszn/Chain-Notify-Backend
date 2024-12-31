import { Response } from "express";
import {
  ErrorInt,
  GeneralErrorInt,
  GeneralReturnInt,
  typeOfResponse,
} from "../types";
//send success response
const sendSuccessRes = <Data>(
  data: Data,
  res: Response,
  message: string,
  statusCode: number,
  typeOfRes: typeOfResponse,
  success: boolean,
  timestamp?: string
) => {
  const response: GeneralReturnInt<Data> = {
    data,
    message,
    statusCode,
    success,
    timestamp: timestamp || new Date().toISOString(),
  };
  switch (typeOfRes) {
    case typeOfResponse.json:
      res.status(statusCode).json(response);
      return;
    case typeOfResponse.blob:
      if (data instanceof Buffer) {
        res
          .status(statusCode)
          .header("Content-Type", "application/octet-stream")
          .send(data);
      } else {
        throw new Error("Blob responses require data to be a Buffer.");
      }
      return;
    case typeOfResponse.text:
      if (typeof data === "string") {
        res.status(statusCode).header("Content-Type", "text/plain").send(data);
      } else {
        throw new Error("Text responses require data to be a string.");
      }
      return;

    case typeOfResponse.html:
      if (typeof data === "string") {
        res.status(statusCode).header("Content-Type", "text/html").send(data);
      } else {
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

//send failed response
const sendFailedRes = (
  res: Response,
  statusCode: number,
  success = false,
  message: string,
  errors ?: ErrorInt,
  timestamp?: string
) => {
  const response: GeneralErrorInt = {
    statusCode,
    success,
    message,
    errors,
    timestamp: timestamp || new Date().toISOString(),
  };
  res.status(statusCode).json(response);
};
export { sendSuccessRes, sendFailedRes };
