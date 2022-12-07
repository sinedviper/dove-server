import { Request } from "express";

import { success } from "../utils/constants";
import { verifyJwt } from "../utils/helpers";

interface Data {
  id: number | undefined;
  message: string;
}

export const autorization = async (req: Request): Promise<Data> => {
  try {
    // Get the access token
    const accessHeaders: string = req.headers.authorization;

    if (!accessHeaders) {
      return { id: undefined, message: "Invalid access token" };
    }

    // Validate the Access token
    const decoded = verifyJwt<{ userId: string }>(accessHeaders);

    if (!decoded) {
      return { id: undefined, message: "Invalid access token" };
    }

    return { id: Number(decoded.userId), message: success };
  } catch (error: any) {
    console.error("Error token: " + error);
  }
};

export const autorizationConfirmation = async (
  accessHeaders: string
): Promise<Data> => {
  try {
    // Validate the Access token
    const decoded = verifyJwt<{ userId: string }>(accessHeaders);

    if (!decoded) {
      return { id: undefined, message: "Invalid access token" };
    }

    return { id: Number(decoded.userId), message: success };
  } catch (error: any) {
    console.error("Error token: " + error);
  }
};
