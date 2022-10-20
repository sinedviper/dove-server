import jwt, { SignOptions } from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config();

export const signJwt = (
  payload: Object,
  keyName: "accessTokenPrivateKey" | "refreshTokenPrivateKey",
  options?: SignOptions
) => {
  const key =
    keyName === "accessTokenPrivateKey"
      ? process.env.ACCESS_TOKEN_PRIVATE_KEY
      : process.env.REFRESH_TOKEN_PRIVATE_KEY;

  const privateKey = Buffer.from(key, "base64").toString("ascii");

  const sign = jwt.sign(payload, privateKey, {
    ...(options && options),
    algorithm: "RS256",
  });

  return sign;
};

export const verifyJwt = <T>(
  token: string,
  keyName: "accessTokenPublicKey" | "refreshTokenPublicKey"
): T | null => {
  const key =
    keyName === "accessTokenPublicKey"
      ? process.env.ACCESS_TOKEN_PUBLIC_KEY
      : process.env.REFRESH_TOKEN_PUBLIC_KEY;

  const publicKey = Buffer.from(key, "base64").toString("ascii");

  try {
    return jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    }) as T;
  } catch (error) {
    return null;
  }
};
