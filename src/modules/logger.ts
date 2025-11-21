import { pino } from "pino";

export const logger = pino(
  process.env.NODE_ENV === "development"
    ? { level: "debug", transport: { target: "pino-pretty" } }
    : { level: "info" },
);
