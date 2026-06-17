import e from "express";
import morgan from "morgan";
import router from "./routes/auth.route.js";

const app = e();

app.use(morgan("dev"));
app.use(e.json());

app.use("/api/auth", router);

export default app;
