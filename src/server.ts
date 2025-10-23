import express, { Request, Response, NextFunction } from "express";
import { middlewareLogResponses } from "./middlewares/logging.js";
import { middlewareMetricsInc } from "./middlewares/metrics.js";
import { metricsHandler, resetHandler } from "./controllers/metrics.js";
import { validate_chirp } from "./controllers/chirps.js";
// Create Express application
const app = express();
app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));
app.use(express.json());

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", metricsHandler);
app.post("/admin/reset", resetHandler);
app.post("/api/validate_chirp", validate_chirp);
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
  // If it's some other kind of error, pass it to the default handler
  next(err);
});
