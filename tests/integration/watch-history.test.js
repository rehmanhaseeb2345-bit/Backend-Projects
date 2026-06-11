import { describe, it, expect } from "vitest";
import { app, request, registerAndLogin } from "../helpers/auth.js";
import { publishVideo } from "../helpers/video.js";

const watchVideo = (videoId, cookies) =>
  request(app).get(`/api/v1/videos/${videoId}`).set("Cookie", cookies);

describe("GET /api/v1/users/history", () => {
  it("requires authentication", async () => {
    const res = await request(app).get("/api/v1/users/history");
    expect(res.statusCode).toBe(401);
  });

  it("returns an empty list for a user with no watch history", async () => {
    const { cookies } = await registerAndLogin();

    const res = await request(app)
      .get("/api/v1/users/history")
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.docs).toEqual([]);
    expect(res.body.data.totalDocs).toBe(0);
  });

  it("returns watched videos with owner populated", async () => {
    const { cookies: ownerCookies } = await registerAndLogin();
    const { cookies } = await registerAndLogin();
    const created = await publishVideo(ownerCookies, { title: "Watched One" });
    const videoId = created.body.data._id;

    await watchVideo(videoId, cookies);

    const res = await request(app)
      .get("/api/v1/users/history")
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.docs.length).toBe(1);
    expect(res.body.data.docs[0]._id).toBe(videoId);
    expect(res.body.data.docs[0].title).toBe("Watched One");
    expect(res.body.data.docs[0].owner.username).toBeTruthy();
  });

  it("orders history most-recently-watched first", async () => {
    const { cookies: ownerCookies } = await registerAndLogin();
    const { cookies } = await registerAndLogin();
    const first = await publishVideo(ownerCookies, { title: "First Watched" });
    const second = await publishVideo(ownerCookies, { title: "Second Watched" });

    await watchVideo(first.body.data._id, cookies);
    await watchVideo(second.body.data._id, cookies);

    const res = await request(app)
      .get("/api/v1/users/history")
      .set("Cookie", cookies);

    expect(res.body.data.docs.length).toBe(2);
    expect(res.body.data.docs[0].title).toBe("Second Watched");
    expect(res.body.data.docs[1].title).toBe("First Watched");
  });

  it("does not duplicate a video watched multiple times", async () => {
    const { cookies: ownerCookies } = await registerAndLogin();
    const { cookies } = await registerAndLogin();
    const created = await publishVideo(ownerCookies);
    const videoId = created.body.data._id;

    await watchVideo(videoId, cookies);
    await watchVideo(videoId, cookies);

    const res = await request(app)
      .get("/api/v1/users/history")
      .set("Cookie", cookies);

    expect(res.body.data.docs.length).toBe(1);
  });

  it("does not record owners watching their own videos", async () => {
    const { cookies } = await registerAndLogin();
    const created = await publishVideo(cookies);

    await watchVideo(created.body.data._id, cookies);

    const res = await request(app)
      .get("/api/v1/users/history")
      .set("Cookie", cookies);

    expect(res.body.data.docs.length).toBe(0);
  });

  it("excludes videos that were unpublished after being watched", async () => {
    const { cookies: ownerCookies } = await registerAndLogin();
    const { cookies } = await registerAndLogin();
    const created = await publishVideo(ownerCookies);
    const videoId = created.body.data._id;

    await watchVideo(videoId, cookies);
    await request(app)
      .patch(`/api/v1/videos/${videoId}/toggle-publish`)
      .set("Cookie", ownerCookies);

    const res = await request(app)
      .get("/api/v1/users/history")
      .set("Cookie", cookies);

    expect(res.body.data.docs.length).toBe(0);
  });

  it("excludes videos that were deleted after being watched", async () => {
    const { cookies: ownerCookies } = await registerAndLogin();
    const { cookies } = await registerAndLogin();
    const created = await publishVideo(ownerCookies);
    const videoId = created.body.data._id;

    await watchVideo(videoId, cookies);
    await request(app)
      .delete(`/api/v1/videos/${videoId}`)
      .set("Cookie", ownerCookies);

    const res = await request(app)
      .get("/api/v1/users/history")
      .set("Cookie", cookies);

    expect(res.body.data.docs.length).toBe(0);
  });

  it("paginates with the standard envelope", async () => {
    const { cookies: ownerCookies } = await registerAndLogin();
    const { cookies } = await registerAndLogin();

    for (let i = 0; i < 3; i++) {
      const created = await publishVideo(ownerCookies);
      await watchVideo(created.body.data._id, cookies);
    }

    const res = await request(app)
      .get("/api/v1/users/history?page=1&limit=2")
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.docs.length).toBe(2);
    expect(res.body.data.totalDocs).toBe(3);
    expect(res.body.data.totalPages).toBe(2);
    expect(res.body.data.hasNextPage).toBe(true);
  });
});
