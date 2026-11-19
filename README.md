# Coy Discover

A mobile-first swipe discovery experience with a blank Home tab and a functional Discover tab.

## Features

- 30 seeded profiles
- Drag gestures on mobile and Like/Pass buttons on desktop
- Mutual-only matching with an "It's a match!" screen
- Matches view that never reveals one-sided likes
- JSON-backed swipe and match persistence
- Empty state after all profiles are swiped

## Run locally

```bash
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and the API at `http://localhost:3001`.

## API

- `GET /health`
- `GET /feed`
- `POST /swipe` with `{ "profileId": 1, "action": "like" }`
- `GET /matches`

## Test

```bash
npm test
```

## Production

```bash
npm run build
npm start
```
