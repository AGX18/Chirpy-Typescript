import { env } from "./env.js";
import app from "./server.js";

// Start the server
app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
