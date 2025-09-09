import { createSocket } from "./whatsappClient.js";
import { startHealthCheck } from "./health.js";
import "dotenv/config"

if (!process.env.OPENAI_API_KEY) {
  console.warn("[WARN] OPENAI_API_KEY not set – AI replies will be disabled.")
}
async function main() {
  await createSocket();
  startHealthCheck(30 * 60 * 1000);
  //   startHealthCheck(5000);

  const stop = () => {
    console.log("[APP] shutting down...");
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

main().catch((err) => {
  console.error("[APP] fatal error", err);
  process.exit(1);
});
