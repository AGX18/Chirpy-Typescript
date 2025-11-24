import {
  createUser,
  getUserByEmail,
  getUserById,
  makeUserChirpyRed,
  updateUser,
} from "src/database/queries/users.js";
import { Response, Request, NextFunction } from "express";
import {
  hashPassword,
  checkPasswordHash,
  makeJWT,
  makeRefreshToken,
  getBearerToken,
  getAPIKey,
} from "../utils/auth.js";
import { NotFoundError, UnauthorizedError } from "../errors.js";
import { UserResponse } from "../database/schema";
import { env } from "../env.js";
import {
  createRefreshToken,
  getRefreshToken,
  revokeRefreshToken,
} from "../database/queries/refreshTokens.js";

import { validateJWT } from "../utils/auth.js";

import { updateUserSchema, updateUserType } from "../utils/validators.js";
import { hash } from "crypto";
export async function createUserHandler(req: Request, res: Response) {
  const hashed_passoword = await hashPassword(req.body.password);
  const newUser = await createUser({
    email: req.body.email,
    hashed_password: hashed_passoword,
  });
  console.log(newUser);
  res.status(201).json(newUser);
}

export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { hashed_password, ...user } = await getUserByEmail(req.body.email);
    if (!user) {
      throw new UnauthorizedError("Incorrect email or password");
    }
    const isPasswordLegit = await checkPasswordHash(
      req.body.password,
      hashed_password,
    );

    if (!isPasswordLegit) {
      throw new UnauthorizedError("Incorrect email or password");
    }
    const expiresIn = parseDurationToSeconds(env.JWT_EXPIRES_IN);
    const token = makeJWT(user.id, expiresIn, env.JWT_SECRET);

    const refresh_token = makeRefreshToken();
    await createRefreshToken(refresh_token, user.id);

    res.json({
      ...user,
      token,
      refresh_token,
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = getBearerToken(req);
    const refreshToken = await getRefreshToken(token);
    if (!refreshToken) {
      throw new UnauthorizedError("invalid refresh token");
    }
    if (refreshToken.expiresAt < new Date() || refreshToken.revokedAt != null) {
      throw new UnauthorizedError("expired or revoked refresh token");
    }

    const user = await getUserById(refreshToken.user_id); // just to make sure the user exists
    const expiresIn = parseDurationToSeconds(env.JWT_EXPIRES_IN);
    const accessToken = makeJWT(user.id, expiresIn, env.JWT_SECRET);

    res.status(200).json({ token: accessToken });
  } catch (error) {
    next(error);
  }
}

export async function revokeHandler(req: Request, res: Response) {
  const token = getBearerToken(req);
  const refreshToken = await revokeRefreshToken(token);

  res.status(204).json();
}

export async function updateUserHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = getBearerToken(req);
    const userId = validateJWT(token, env.JWT_SECRET);

    const data = updateUserSchema.parse(req.body);
    const updatedUser = await updateUser(
      userId,
      await hashPassword(data.password),
      data.email,
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
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

/**
 * the shape of the req body
 * {
  "event": "user.upgraded",
  "data": {
    "userId": "3311741c-680c-4546-99f3-fc9efac2036c"
  }
}
 * @param req 
 * @param res 
 */
export async function polkaWebHookHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const key = getAPIKey(req);
    if (key !== env.POLKA_KEY) {
      throw new UnauthorizedError("invalid api key");
    }
    const data = req.body;
    if (data.event === "user.upgraded") {
      const userId = data.data.userId;
      const user = await getUserById(userId);
      if (user) {
        await makeUserChirpyRed(user.id);
        res.status(204).end();
      } else {
        // user is not found
        throw new NotFoundError("user not found");
      }
    } else {
      res.status(204).end();
    }
  } catch (error) {
    next(error);
  }
}
