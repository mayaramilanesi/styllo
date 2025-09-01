import { generateResponse } from "./aiEngine.js";

(async () => {
  const out = await generateResponse(
    "User profile: prefers casual, warm undertones.",
    "Quais cores de camisa combinam comigo para entrevista?"
  );
  console.log("[AI SMOKE]", out);
})();
