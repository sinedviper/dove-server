import jwt, { SignOptions } from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config();

export const signJwt = (payload: Object, options?: SignOptions) => {
  const privateKey = Buffer.from(
    process.env.ACCESS_TOKEN_PRIVATE_KEY,
    "base64"
  ).toString("ascii");

  const sign = jwt.sign(payload, privateKey, {
    ...(options && options),
    algorithm: "RS256",
  });

  return sign;
};

export const verifyJwt = <T>(token: string): T | null => {
  const publicKey = Buffer.from(
    process.env.ACCESS_TOKEN_PUBLIC_KEY,
    "base64"
  ).toString("ascii");

  try {
    return jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    }) as T;
  } catch (error) {
    return null;
  }
};
