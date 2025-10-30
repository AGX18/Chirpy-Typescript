import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors";
import { Request } from "express";

export function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

export function checkPasswordHash(
  password: string,
  hash: string,
): Promise<boolean> {
  return argon2.verify(hash, password);
}

type payload = Pick<jwt.JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(
  userID: string,
  expiresIn: number,
  secret: string,
): string {
  const data: payload = {
    iss: "chirpy",
    sub: userID,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresIn,
  };
  console.log("creating token");
  console.log(data);
  console.log(expiresIn);
  const token = jwt.sign(data, secret);
  console.log(token);
  return token;
}

export function validateJWT(tokenString: string, secret: string): string {
  let data;
  try {
    data = jwt.verify(tokenString, secret);
  } catch (e: unknown) {
    throw new UnauthorizedError("Invalid token!");
  }
  if (typeof data == "string") {
    return data;
  }

  if (!data.sub) {
    throw new UnauthorizedError("Token payload is missing 'sub' (subject)");
  }

  return data.sub;
}

export function getBearerToken(req: Request): string {
  const token = req.get("Authorization")?.split("Bearer ")[1];
  if (!token) {
    throw new UnauthorizedError("access token is not found!");
  }
  return token;
}
