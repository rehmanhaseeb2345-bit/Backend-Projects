import { Router } from "express";
import {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateMiddleware } from "../middlewares/validate.middleware.js";
import {
  createTweetSchema,
  updateTweetSchema,
} from "../validators/tweet.validator.js";

const router = Router();

router.get("/user/:userId", getUserTweets);

router.post(
  "/",
  verifyJWT,
  validateMiddleware(createTweetSchema),
  createTweet,
);

router.patch(
  "/:tweetId",
  verifyJWT,
  validateMiddleware(updateTweetSchema),
  updateTweet,
);

router.delete("/:tweetId", verifyJWT, deleteTweet);

export default router;
