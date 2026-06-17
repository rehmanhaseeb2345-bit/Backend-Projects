import dotenv from "dotenv";
dotenv.config();

import dns from "node:dns";
import mongoose from "mongoose";

// Node's bundled DNS resolver (c-ares) was picking up an unreachable local
// resolver (127.0.0.1), which made the mongodb+srv SRV lookup fail with
// `querySrv ECONNREFUSED`. Point it at public DNS so resolution works
// regardless of the OS adapter configuration.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
