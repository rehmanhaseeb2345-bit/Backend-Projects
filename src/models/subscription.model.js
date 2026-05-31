import mongoose, { model } from "mongoose";
import { Schema } from "zod/v3";

const subcriptionSchema = new mongoose.Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export const Subscription = mongoose.model("Subscription", subcriptionSchema);
