import express from "express";

// Create Express application
const app = express();

// Export the app for use in other modules (like tests)
export { app };

// Default export for convenience
export default app;
