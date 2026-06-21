import env from "./src/config/env.js";
import app from "./src/app.js";
import connectDB from "./src/db/config.js";

connectDB().then(() => {
  app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });
});
