import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));

export class Store {
  constructor({ profilesPath = path.join(directory, "profiles.json"), statePath = path.join(directory, "state.json") } = {}) {
    this.profilesPath = profilesPath;
    this.statePath = statePath;
  }

  profiles() {
    return JSON.parse(fs.readFileSync(this.profilesPath, "utf8"));
  }

  state() {
    return JSON.parse(fs.readFileSync(this.statePath, "utf8"));
  }

  save(state) {
    fs.writeFileSync(this.statePath, JSON.stringify(state, null, 2));
  }

  publicProfile(profile) {
    const { likedYou, ...safe } = profile;
    return safe;
  }

  feed() {
    const state = this.state();
    return this.profiles()
      .filter((profile) => !Object.hasOwn(state.swipes, profile.id))
      .map((profile) => this.publicProfile(profile));
  }

  swipe(profileId, action) {
    const profiles = this.profiles();
    const profile = profiles.find((item) => item.id === profileId);
    if (!profile) throw new Error("Profile not found");

    const state = this.state();
    if (Object.hasOwn(state.swipes, profileId)) throw new Error("Profile has already been swiped");

    state.swipes[profileId] = action;
    const matched = action === "like" && profile.likedYou === true;
    if (matched && !state.matches.includes(profileId)) state.matches.push(profileId);
    this.save(state);

    return { match: matched, profile: matched ? this.publicProfile(profile) : null };
  }

  matches() {
    const ids = new Set(this.state().matches);
    return this.profiles().filter((profile) => ids.has(profile.id)).map((profile) => this.publicProfile(profile));
  }
}
