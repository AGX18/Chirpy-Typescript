import { NextFunction, Response, Request } from "express";

export function validate_chirp(req: Request, res: Response) {
  const bodyText = req.body?.body;
  if (typeof bodyText !== "string") {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  if (!isBodyValid(bodyText)) {
    res.status(400).json({
      error: "Chirp is too long",
    });
    return;
  }

  res.status(200).send({
    valid: true,
  });
}

function isBodyValid(body: string) {
  if (body.length > 140) {
    return false;
  }
  return true;
}
