import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPaginationOptions } from "../utils/pagination.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const videoStats = await Video.aggregate([
    { $match: { owner: req.user._id } },
    {
      $group: {
        _id: null,
        totalVideos: { $sum: 1 },
        totalViews: { $sum: "$views" },
        videoIds: { $push: "$_id" },
      },
    },
  ]);

  const { totalVideos = 0, totalViews = 0, videoIds = [] } =
    videoStats[0] || {};

  const [totalSubscribers, totalLikes] = await Promise.all([
    Subscription.countDocuments({ channel: req.user._id }),
    Like.countDocuments({ video: { $in: videoIds } }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalVideos,
        totalViews,
        totalSubscribers,
        totalLikes,
      },
      "Channel stats fetched successfully",
    ),
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const pipeline = [
    { $match: { owner: req.user._id } },
    { $sort: { createdAt: -1 } },
  ];

  const options = getPaginationOptions(req.query);

  const result = await Video.aggregatePaginate(
    Video.aggregate(pipeline),
    options,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
