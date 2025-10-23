import { config } from "../config.js";
import { NextFunction, Response, Request } from "express";

export function metricsHandler(req: Request, res: Response) {
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

export function resetHandler(req: Request, res: Response) {
  config.fileserverHits = 0;
  res.end();
}
