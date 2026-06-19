import dotenv from "dotenv";
dotenv.config();
import e from "express";
import morgan from "morgan";
import router from "./routes/auth.route.js";
import cookieParser from "cookie-parser";

const app = e();

app.use(morgan("dev"));
app.use(e.json());
app.use(cookieParser());

app.use("/api/auth", router);

export default app;
