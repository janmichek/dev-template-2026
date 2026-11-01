import { claudeCode } from "@ai-hero/sandcastle";

// Claude Code CLI talking to DeepSeek's Anthropic-compatible endpoint.
// Override with SANDCASTLE_MODEL / SANDCASTLE_BASE_URL to try another model.
const MODEL = process.env.SANDCASTLE_MODEL || "deepseek-chat";
const BASE_URL =
  process.env.SANDCASTLE_BASE_URL || "https://api.deepseek.com/anthropic";

export function agent() {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    throw new Error(
      "DEEPSEEK_API_KEY is not set. Put it in .sandcastle/.env or export it.",
    );
  }
  return claudeCode(MODEL, {
    env: {
      ANTHROPIC_BASE_URL: BASE_URL,
      ANTHROPIC_AUTH_TOKEN: key,
      ANTHROPIC_MODEL: MODEL,
      ANTHROPIC_SMALL_FAST_MODEL: MODEL,
      CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
    },
  });
}
