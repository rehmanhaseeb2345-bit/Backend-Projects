import { describe, it, expect } from "vitest";
import { app, request, registerAndLogin } from "../helpers/auth.js";
import { publishVideo } from "../helpers/video.js";

describe("Security headers", () => {
  it("does not expose the X-Powered-By header", async () => {
    const res = await request(app).get("/api/v1/videos");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  it("sets helmet security headers", async () => {
    const res = await request(app).get("/api/v1/videos");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-dns-prefetch-control"]).toBeTruthy();
  });
});

describe("Deep pagination cap", () => {
  it("clamps an absurdly large page number instead of an unbounded $skip", async () => {
    const res = await request(app)
      .get("/api/v1/videos")
      .query({ page: "999999999", limit: "10" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.page).toBeLessThanOrEqual(1000);
  });

  it("clamps a negative/zero page to 1", async () => {
    const res = await request(app).get("/api/v1/videos").query({ page: "0" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.page).toBe(1);
  });
});

describe("Refresh token reuse revokes the session", () => {
  it("invalidates the rotated (legitimate) refresh token after reuse of the old one is detected", async () => {
    const { cookies, refreshToken } = await registerAndLogin();

    // Rotate once: old `refreshToken` becomes stale, a new one is set in cookies.
    const first = await request(app)
      .post("/api/v1/users/refresh-token")
      .set("Cookie", cookies);
    expect(first.statusCode).toBe(200);
    const rotatedCookies = first.headers["set-cookie"];

    // Reuse the old (now stale) refresh token -> reuse detected, session revoked.
    const reuse = await request(app)
      .post("/api/v1/users/refresh-token")
      .send({ refreshToken });
    expect(reuse.statusCode).toBe(401);

    // The legitimate, rotated refresh token must now also be invalid.
    const afterRevocation = await request(app)
      .post("/api/v1/users/refresh-token")
      .set("Cookie", rotatedCookies);
    expect(afterRevocation.statusCode).toBe(401);
  });
});

describe("Stored content sanitization", () => {
  it("strips HTML/script tags from comment content before storing", async () => {
    const { cookies } = await registerAndLogin();
    const created = await publishVideo(cookies);
    const videoId = created.body.data._id;

    const res = await request(app)
      .post(`/api/v1/comments/${videoId}`)
      .set("Cookie", cookies)
      .send({ content: "<script>alert(1)</script>Nice video" });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.content).toBe("Nice video");
    expect(res.body.data.content).not.toMatch(/<script>/i);
    expect(res.body.data.content).not.toMatch(/alert/i);
  });

  it("strips HTML tags from a tweet's content", async () => {
    const { cookies } = await registerAndLogin();

    const res = await request(app)
      .post("/api/v1/tweets")
      .set("Cookie", cookies)
      .send({ content: "<b>bold</b> tweet" });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.content).toBe("bold tweet");
  });
});
