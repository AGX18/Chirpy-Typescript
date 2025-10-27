import { config } from "../config.js";
import { NextFunction, Response, Request } from "express";
import { deleteAllUsers } from "../database/queries/users.js";
import { env, isProd } from "../env.js";
export async function metricsHandler(req: Request, res: Response) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`
    <html>
      <body>
        <h1>Welcome, Chirpy Admin</h1>
        <p>Chirpy has been visited ${config.fileserverHits} times!</p>
      </body>
    </html>
`);
}

export async function resetHandler(req: Request, res: Response) {
  if (isProd()) {
    res.status(403).end();
  }
  config.fileserverHits = 0;
  await deleteAllUsers();
  res.end();
}
