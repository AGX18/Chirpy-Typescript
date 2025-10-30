import * as argon2 from "argon2";
import * as jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors";

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
  const token = jwt.sign(data, secret, {
    expiresIn: expiresIn,
  });
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

  return data.sub!;
}
