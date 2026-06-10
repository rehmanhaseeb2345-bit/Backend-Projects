import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";

// The main test app runs with DISABLE_RATE_LIMIT=true (set in tests/setup.js)
// so the rest of the suite isn't affected by repeated registrations/logins.
// Here we re-import the app with rate limiting enabled and a low threshold
// to verify the limiter actually kicks in.
let app;

beforeAll(async () => {
  process.env.DISABLE_RATE_LIMIT = "false";
  process.env.AUTH_RATE_LIMIT_MAX = "3";
  ({ default: app } = await import("../../src/app.js"));
});

describe("Rate limiting on auth endpoints", () => {
  it("returns 429 after exceeding the limit on /login", async () => {
    const attempt = () =>
      request(app)
        .post("/api/v1/users/login")
        .send({ username: "no_such_user", password: "WrongPassw0rd!" });

    const responses = [];
    for (let i = 0; i < 4; i++) {
      responses.push(await attempt());
    }

    expect(responses[0].statusCode).toBe(401);
    expect(responses[1].statusCode).toBe(401);
    expect(responses[2].statusCode).toBe(401);
    expect(responses[3].statusCode).toBe(429);
  });
});
