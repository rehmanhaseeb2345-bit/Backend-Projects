import e from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import env from "./config/env.js";
import router from "./routes/auth.route.js";
import { notFound } from "./errors/notFound.js";
import { errorHandler } from "./errors/errorHandler.js";

const app = e();

// Behind a proxy/load balancer in production, trust the first hop so req.ip
// (used for sessions + rate limiting) reflects the real client.
if (env.isProduction) {
  app.set("trust proxy", 1);
}

app.use(morgan("dev"));
app.use(e.json());
app.use(cookieParser());

app.use("/api/auth", router);

// 404 + central error handler must come after the routes.
app.use(notFound);
app.use(errorHandler);

export default app;
