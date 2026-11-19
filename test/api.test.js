import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../server/app.js";
import { Store } from "../server/store.js";

function setup() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "coy-discover-"));
  const profilesPath = path.join(directory, "profiles.json");
  const statePath = path.join(directory, "state.json");
  fs.writeFileSync(profilesPath, JSON.stringify([
    { id: 1, name: "A", age: 22, photo: "one", bio: "bio", cityOrCollege: "Delhi", interests: ["Art"], likedYou: true },
    { id: 2, name: "B", age: 23, photo: "two", bio: "bio", cityOrCollege: "Pune", interests: ["Music"], likedYou: false }
  ]));
  fs.writeFileSync(statePath, JSON.stringify({ swipes: {}, matches: [] }));
  return { app: createApp(new Store({ profilesPath, statePath })), statePath };
}

test("feed hides private like state", async () => {
  const { app } = setup();
  const response = await request(app).get("/feed").expect(200);
  assert.equal(response.body.profiles.length, 2);
  assert.equal("likedYou" in response.body.profiles[0], false);
});

test("a mutual like creates and persists a match", async () => {
  const { app, statePath } = setup();
  const swipe = await request(app).post("/swipe").send({ profileId: 1, action: "like" }).expect(200);
  assert.equal(swipe.body.match, true);

  const matches = await request(app).get("/matches").expect(200);
  assert.equal(matches.body.matches[0].id, 1);
  assert.deepEqual(JSON.parse(fs.readFileSync(statePath, "utf8")).matches, [1]);
});

test("passed profiles never return to the feed", async () => {
  const { app } = setup();
  await request(app).post("/swipe").send({ profileId: 2, action: "pass" }).expect(200);
  const response = await request(app).get("/feed").expect(200);
  assert.deepEqual(response.body.profiles.map((profile) => profile.id), [1]);
});

test("a one-sided like is never revealed as a match", async () => {
  const { app } = setup();
  const swipe = await request(app).post("/swipe").send({ profileId: 2, action: "like" }).expect(200);
  assert.equal(swipe.body.match, false);
  assert.equal(swipe.body.profile, null);
  const matches = await request(app).get("/matches").expect(200);
  assert.deepEqual(matches.body.matches, []);
});
