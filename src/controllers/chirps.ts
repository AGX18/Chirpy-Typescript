import { NextFunction, Response, Request } from "express";
import { BadRequest } from "../errors.js";
export function validate_chirp(req: Request, res: Response) {
  const bodyText = req.body?.body;
  if (typeof bodyText !== "string") {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  if (!isBodyValid(bodyText)) {
    // res.status(400).json({
    //   error: "Chirp is too long",
    // });
    throw new BadRequest("Chirp is too long. Max length is 140");
    return;
  }
  const filteredBody = filterBody(bodyText);

  res.status(200).send({
    cleanedBody: filteredBody,
  });
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
