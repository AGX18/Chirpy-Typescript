import { createUser, getUserByEmail } from "src/database/queries/users.js";
import { Response, Request } from "express";
import { hashPassword, checkPasswordHash, makeJWT } from "../utils/auth.js";
import { UnauthorizedError } from "../errors.js";
import { UserResponse } from "../database/schema";
import { env } from "../env.js";
export async function createUserHandler(req: Request, res: Response) {
  const hashed_passoword = await hashPassword(req.body.password);
  const newUser = await createUser({
    email: req.body.email,
    hashed_password: hashed_passoword,
  });
  console.log(newUser);
  res.status(201).json(newUser);
}

export async function loginHandler(req: Request, res: Response) {
  const user = await getUserByEmail(req.body.email);
  if (!user) {
    throw new UnauthorizedError("Incorrect email or password");
  }
  const isPasswordLegit = await checkPasswordHash(
    req.body.password,
    user.hashed_password,
  );

  if (!isPasswordLegit) {
    throw new UnauthorizedError("Incorrect email or password");
  }
  let expiresIn;
  if (!req.body.expiresInSeconds) {
    expiresIn = parseDurationToSeconds(env.JWT_EXPIRES_IN);
  } else {
    expiresIn = parseInt(req.body.expiresInSeconds, 10);
  }
  const token = makeJWT(user.id, expiresIn, env.JWT_SECRET);
  const returnedUser: UserResponse = {
    email: user.email,
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    token: token,
  };
  res.json(returnedUser);
}

function parseDurationToSeconds(timeString: string) {
  // Get the last character as the unit (e.g., 'h', 'm', 's')
  const unit = timeString.slice(-1).toLowerCase();

  // Get everything *but* the last character as the number
  const number = parseFloat(timeString.slice(0, -1));

  if (isNaN(number)) {
    return NaN; // Invalid format
  }

  switch (unit) {
    case "s":
      return number;
    case "m":
      return number * 60;
    case "h":
      return number * 60 * 60;
    case "d":
      return number * 60 * 60 * 24;
    default:
      return NaN; // Unknown unit
  }
}
