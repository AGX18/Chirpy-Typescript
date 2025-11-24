import express, { Request, Response, NextFunction } from "express";
import { middlewareLogResponses } from "./middlewares/logging.js";
import { middlewareMetricsInc } from "./middlewares/metrics.js";
import { metricsHandler, resetHandler } from "./controllers/metrics.js";
import {
  createChirpHandler,
  getAllChirpsHandler,
  getChirpHandler,
  deleteChirpHandler,
} from "./controllers/chirps.js";
import {
  BadRequest,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from "./errors.js";
import {
  createUserHandler,
  loginHandler,
  refreshHandler,
  revokeHandler,
  updateUserHandler,
  polkaWebHookHandler,
} from "./controllers/users.js";
// Create Express application
const app = express();
app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));
app.use(express.json());

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", metricsHandler);
app.post("/admin/reset", resetHandler);
/**
 * It accepts an email as JSON in the request body and returns the user's ID, email, and timestamps in the response body
 */
app.post("/api/users", createUserHandler);
app.post("/api/login", loginHandler);
app.put("/api/users", updateUserHandler);

app.post("/api/chirps", createChirpHandler);
app.get("/api/chirps", getAllChirpsHandler);
app.get("/api/chirps/:chirpID", getChirpHandler);
app.delete("/api/chirps/:chirpID", deleteChirpHandler);

app.post("/api/refresh", refreshHandler);
app.post("/api/revoke", revokeHandler);

app.post("/api/polka/webhooks", polkaWebHookHandler);

export { app };

// Default export for convenience
export default app;

async function handlerReadiness(req: Request, res: Response): Promise<void> {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.status(200).send("OK");
}

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Check if the error is a SyntaxError thrown by express.json()
  if (
    err instanceof SyntaxError &&
    "status" in err &&
    err.status === 400 &&
    "body" in err
  ) {
    // This is a malformed JSON error
    return res.status(400).json({
      error: "Malformed JSON",
      message: "The request body contains invalid JSON.",
    });
  }

  if (err instanceof BadRequest) {
    res.status(400).json({
      error: err.message,
    });
    return;
  }
  if (err instanceof UnauthorizedError) {
    res.status(401).json({
      error: err.message,
    });
    return;
  }

  if (err instanceof ForbiddenError) {
    res.status(403).json({
      error: err.message,
    });
    return;
  }

  if (err instanceof NotFoundError) {
    res.status(404).json({
      error: err.message,
    });
    return;
  }

  console.log(err);
  return res.status(500).json({
    error: "Something went wrong on our end",
  });
});
