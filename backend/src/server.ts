import { env } from "./config/index.js";
import app from "./app.js";

const server = app.listen(env.PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   CS-CLUB Backend Server Running         ║
  ╠══════════════════════════════════════════╣
  ║   Port:        ${String(env.PORT).padEnd(24)}║
  ║   Environment: ${env.NODE_ENV.padEnd(24)}║
  ║   Health:      /api/v1/health            ║
  ╚══════════════════════════════════════════╝
  `);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`\n[${signal}] Shutting down gracefully...`);
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Catch unhandled rejections and uncaught exceptions
process.on("unhandledRejection", (reason) => {
  console.error("[UNHANDLED REJECTION]", reason);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (error) => {
  console.error("[UNCAUGHT EXCEPTION]", error);
  server.close(() => process.exit(1));
});
