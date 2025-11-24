import { NextFunction, Response, Request } from "express";
import { BadRequest } from "../errors.js";
import { NewChirp } from "../database/schema.js";
import { Result } from "drizzle-orm/sqlite-core/session.js";
import {
  createChirp,
  getAllChirps,
  getChirp,
} from "../database/queries/chirps.js";
import { validateJWT, getBearerToken } from "../utils/auth.js";
import { env } from "../env.js";
export function validate_chirp(body: string) {
  if (typeof body !== "string") {
    throw new BadRequest("Chirp's body is invalid.");
  }
  if (!isBodyValid(body)) {
    throw new BadRequest("Chirp is too long. Max length is 140");
  }
  const filteredBody = filterBody(body);
  return filteredBody;
}

export async function createChirpHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = getBearerToken(req);
    const userId = validateJWT(token, env.JWT_SECRET);
    const filteredBody = validate_chirp(req.body.body);
    const newChirp = await createChirp({
      user_id: userId,
      body: filteredBody,
    });
    res.status(201).send({
      // id: newChirp.id,
      // createdAt: newChirp.createdAt,
      // updatedAt: newChirp.updatedAt,
      // body: newChirp.body,
      ...newChirp,
      userId: newChirp.user_id,
    });
  } catch (error) {
    next(error);
  }
}

function isBodyValid(body: string) {
  if (body.length > 140) {
    return false;
  }
  return true;
}

function filterBody(body: string): string {
  const ProfaneWords: string[] = ["kerfuffle", "sharbert", "fornax"];
  const bodyWords = body.split(/\s+/);
  let filteredBody: string[] = bodyWords.map((str) => {
    const Lowerstr = str.toLowerCase();
    for (const word of ProfaneWords) {
      if (Lowerstr.includes(word)) {
        return "****";
      }
    }
    return str;
  });

  return filteredBody.join(" ");
}

export async function getAllChirpsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const allChirps = await getAllChirps();
    res.status(200).json(allChirps);
  } catch (error) {
    next(error);
  }
}

export async function getChirpHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const selectedChirp = await getChirp(req.params.chirpID);
    if (selectedChirp == undefined) {
      res.status(404).end();
      return;
    }
    res.status(200).json(selectedChirp);
  } catch (error) {
    next(error);
  }
}
