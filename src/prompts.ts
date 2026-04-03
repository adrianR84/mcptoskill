import { createInterface } from "node:readline";
import type { AgentsConfig } from "./agents.js";

export type TargetChoice = string; // Now represents agent ID or "both"

export type AuthChoice = "oauth" | "api_key" | "no_auth";

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function promptAuth(
  hasOAuthProvider: boolean,
  hasHeader: boolean,
): Promise<AuthChoice> {
  if (hasHeader) return "api_key";

  if (!process.stdin.isTTY) {
    if (hasOAuthProvider) {
      throw new Error(
        "Non-interactive mode: OAuth requires a TTY. Use --header for API key.",
      );
    }
    return "no_auth";
  }

  const options = hasOAuthProvider
    ? "? Auth: (1) OAuth  (2) API key  (3) No auth\n> "
    : "? Auth: (2) API key  (3) No auth (OAuth only for Notion, PostHog, Supabase)\n> ";

  const answer = await question(options);
  const n = answer === "" ? "1" : answer;

  if (hasOAuthProvider && (n === "1" || n.toLowerCase() === "oauth"))
    return "oauth";
  if (n === "2" || n.toLowerCase() === "api" || n.toLowerCase() === "apikey")
    return "api_key";
  if (n === "3" || n.toLowerCase() === "no" || n.toLowerCase() === "none")
    return "no_auth";

  if (hasOAuthProvider) return "oauth";
  return "no_auth";
}

export async function promptTarget(
  agentsConfig: AgentsConfig,
): Promise<TargetChoice> {
  if (!process.stdin.isTTY) {
    return agentsConfig.defaultAgent || "openclaw";
  }

  const agentOptions = agentsConfig.agents
    .map((agent, index) => `(${index + 1}) ${agent.name}`)
    .join("  ");

  const answer = await question(
    `? Install to: ${agentOptions}  (${agentsConfig.agents.length + 1}) All\n> `,
  );
  const n = answer === "" ? "1" : answer;

  const agentIndex = parseInt(n) - 1;
  if (agentIndex >= 0 && agentIndex < agentsConfig.agents.length) {
    return agentsConfig.agents[agentIndex].id;
  }
  if (
    n === (agentsConfig.agents.length + 1).toString() ||
    n.toLowerCase() === "all"
  ) {
    return "all";
  }

  return agentsConfig.defaultAgent || "openclaw";
}

export async function promptApiKey(): Promise<string> {
  const token = await question("? Paste your Bearer token:\n> ");
  if (!token) {
    throw new Error("No token provided.");
  }
  return token;
}
