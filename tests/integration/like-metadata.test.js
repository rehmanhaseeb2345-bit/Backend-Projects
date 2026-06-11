import { describe, it, expect } from "vitest";
import { app, request, registerAndLogin } from "../helpers/auth.js";
import { publishVideo } from "../helpers/video.js";

describe("like metadata on GET /api/v1/videos/:videoId", () => {
  it("returns likesCount 0 and isLiked false for an anonymous viewer", async () => {
    const { cookies } = await registerAndLogin();
    const created = await publishVideo(cookies);

    const res = await request(app).get(`/api/v1/videos/${created.body.data._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.likesCount).toBe(0);
    expect(res.body.data.isLiked).toBe(false);
  });

  it("reflects likesCount and per-user isLiked", async () => {
    const { cookies: ownerCookies } = await registerAndLogin();
    const { cookies: likerCookies } = await registerAndLogin();
    const { cookies: otherCookies } = await registerAndLogin();
    const videoId = (await publishVideo(ownerCookies)).body.data._id;

    await request(app)
      .post(`/api/v1/likes/toggle/v/${videoId}`)
      .set("Cookie", likerCookies);

    const likerView = await request(app)
      .get(`/api/v1/videos/${videoId}`)
      .set("Cookie", likerCookies);
    expect(likerView.body.data.likesCount).toBe(1);
    expect(likerView.body.data.isLiked).toBe(true);

    const otherView = await request(app)
      .get(`/api/v1/videos/${videoId}`)
      .set("Cookie", otherCookies);
    expect(otherView.body.data.likesCount).toBe(1);
    expect(otherView.body.data.isLiked).toBe(false);
  });
});

describe("like metadata on GET /api/v1/comments/:videoId", () => {
  it("includes likesCount and isLiked on each comment", async () => {
    const { cookies: ownerCookies } = await registerAndLogin();
    const { cookies: likerCookies } = await registerAndLogin();
    const videoId = (await publishVideo(ownerCookies)).body.data._id;

    const commentRes = await request(app)
      .post(`/api/v1/comments/${videoId}`)
      .set("Cookie", ownerCookies)
      .send({ content: "Great video" });
    const commentId = commentRes.body.data._id;

    await request(app)
      .post(`/api/v1/likes/toggle/c/${commentId}`)
      .set("Cookie", likerCookies);

    const likerView = await request(app)
      .get(`/api/v1/comments/${videoId}`)
      .set("Cookie", likerCookies);
    expect(likerView.statusCode).toBe(200);
    expect(likerView.body.data.docs[0].likesCount).toBe(1);
    expect(likerView.body.data.docs[0].isLiked).toBe(true);

    const anonView = await request(app).get(`/api/v1/comments/${videoId}`);
    expect(anonView.body.data.docs[0].likesCount).toBe(1);
    expect(anonView.body.data.docs[0].isLiked).toBe(false);
  });
});

describe("like metadata on GET /api/v1/tweets/user/:userId", () => {
  it("includes likesCount and isLiked on each tweet", async () => {
    const { cookies: ownerCookies, user } = await registerAndLogin();
    const { cookies: likerCookies } = await registerAndLogin();

    const tweetRes = await request(app)
      .post("/api/v1/tweets")
      .set("Cookie", ownerCookies)
      .send({ content: "Hello world" });
    const tweetId = tweetRes.body.data._id;

    await request(app)
      .post(`/api/v1/likes/toggle/t/${tweetId}`)
      .set("Cookie", likerCookies);

    const likerView = await request(app)
      .get(`/api/v1/tweets/user/${user._id}`)
      .set("Cookie", likerCookies);
    expect(likerView.statusCode).toBe(200);
    expect(likerView.body.data.docs[0].likesCount).toBe(1);
    expect(likerView.body.data.docs[0].isLiked).toBe(true);

    const anonView = await request(app).get(`/api/v1/tweets/user/${user._id}`);
    expect(anonView.body.data.docs[0].likesCount).toBe(1);
    expect(anonView.body.data.docs[0].isLiked).toBe(false);
  });
});
