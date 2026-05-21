import dotenv from "dotenv";
import connectToDB from "./src/db/db.js";

dotenv.config({
  path: "./env",
});

connectToDB();
