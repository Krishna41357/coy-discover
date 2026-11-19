import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Store } from "./store.js";

export function createApp(store = new Store()) {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.get("/feed", (_req, res) => {
    res.json({ profiles: store.feed() });
  });

  app.post("/swipe", (req, res) => {
    const profileId = Number(req.body.profileId);
    const { action } = req.body;
    if (!Number.isInteger(profileId) || !["like", "pass"].includes(action)) {
      return res.status(400).json({ error: "profileId and a valid action are required" });
    }
    try {
      return res.json(store.swipe(profileId, action));
    } catch (error) {
      return res.status(error.message === "Profile not found" ? 404 : 409).json({ error: error.message });
    }
  });

  app.get("/matches", (_req, res) => {
    res.json({ matches: store.matches() });
  });

  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  app.use(express.static(path.join(root, "dist")));
  app.get("/{*path}", (_req, res, next) => {
    if (reqAcceptsHtml(_req)) return res.sendFile(path.join(root, "dist", "index.html"));
    next();
  });

  return app;
}

function reqAcceptsHtml(req) {
  return req.accepts("html") && !req.path.includes(".");
}
