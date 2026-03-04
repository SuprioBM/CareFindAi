import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";

export const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    // 1) Shield: common attack protection
    shield({
      mode: process.env.ARCJET_ENV === "development" ? "DRY_RUN" : "LIVE",
    }),

    // 2) Bot protection
    detectBot({
      mode: process.env.ARCJET_ENV === "development" ? "DRY_RUN" : "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE", // allow Google/Bing etc.
        // "CATEGORY:MONITOR",
        // "CATEGORY:PREVIEW",
      ],
    }),

    // 3) Rate limiting (token bucket)
    tokenBucket({
      mode: process.env.ARCJET_ENV === "development" ? "DRY_RUN" : "LIVE",
      refillRate: 5, // add 5 tokens per interval
      interval: 10, // every 10 seconds
      capacity: 10, // max 10 tokens stored
    }),
  ],
});
