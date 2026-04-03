import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import { existsSync } from "node:fs";

export interface AgentConfig {
  id: string;
  name: string;
  skillsDir: string;
  tokensDir: string;
  configFile?: string;
  metadata?: Record<string, unknown>;
  requiresBins?: string[];
  alwaysEnabled?: boolean;
}

export interface AgentsConfig {
  agents: AgentConfig[];
  defaultAgent?: string;
}

const DEFAULT_AGENTS_CONFIG_PATH = join(
  homedir(),
  ".mcptoskill",
  "agents.json",
);

function getDefaultAgents(): AgentsConfig {
  return {
    agents: [
      {
        id: "openclaw",
        name: "OpenClaw",
        skillsDir: join(homedir(), ".openclaw", "skills"),
        tokensDir: join(homedir(), ".openclaw", "mcptoskill", "tokens"),
        configFile: join(homedir(), ".openclaw", "openclaw.json"),
        requiresBins: [],
        alwaysEnabled: true,
        metadata: {
          clawdbot: {},
          openclaw: { requires: { bins: [] }, always: true },
        },
      },
      {
        id: "hermes",
        name: "Hermes",
        skillsDir: join(homedir(), ".hermes", "skills", "mcptoskill"),
        tokensDir: join(homedir(), ".hermes", "mcptoskill", "tokens"),
        requiresBins: [],
        metadata: {
          hermes: { tags: [], category: "mcptoskill" },
        },
      },
      {
        id: "claude",
        name: "Claude",
        skillsDir: join(homedir(), ".claude", "skills"),
        tokensDir: join(homedir(), ".claude", "mcptoskill", "tokens"),
        configFile: join(homedir(), ".claude", "claude.json"),
        requiresBins: [],
        metadata: {
          claude: { version: "1.0", category: "mcp" },
        },
      },
    ],
    defaultAgent: "claude",
  };
}

async function ensureConfigDir(): Promise<void> {
  const configDir = join(homedir(), ".mcptoskill");
  if (!existsSync(configDir)) {
    await mkdir(configDir, { recursive: true });
  }
}

export async function loadAgentsConfig(
  configPath?: string,
): Promise<AgentsConfig> {
  const filePath = configPath ?? DEFAULT_AGENTS_CONFIG_PATH;

  await ensureConfigDir();

  if (!existsSync(filePath)) {
    const defaultConfig = getDefaultAgents();
    await saveAgentsConfig(defaultConfig, filePath);
    return defaultConfig;
  }

  try {
    const raw = await readFile(filePath, "utf8");
    const config = JSON.parse(raw) as AgentsConfig;

    // Merge with defaults to ensure all required fields exist
    const defaultConfig = getDefaultAgents();
    const mergedConfig = {
      ...defaultConfig,
      ...config,
      agents: [
        ...defaultConfig.agents.map((defaultAgent) => {
          const existingAgent = config.agents.find(
            (a) => a.id === defaultAgent.id,
          );
          return existingAgent
            ? { ...defaultAgent, ...existingAgent }
            : defaultAgent;
        }),
        ...config.agents.filter(
          (agent) => !defaultConfig.agents.some((a) => a.id === agent.id),
        ),
      ],
    };

    return mergedConfig;
  } catch (error) {
    console.warn(
      `Failed to load agents config from ${filePath}, using defaults:`,
      error,
    );
    return getDefaultAgents();
  }
}

export async function saveAgentsConfig(
  config: AgentsConfig,
  configPath?: string,
): Promise<void> {
  const filePath = configPath ?? DEFAULT_AGENTS_CONFIG_PATH;
  await ensureConfigDir();
  await writeFile(filePath, JSON.stringify(config, null, 2) + "\n", "utf8");
}

export function getAgentById(
  agents: AgentsConfig,
  id: string,
): AgentConfig | undefined {
  return agents.agents.find((agent) => agent.id === id);
}

export function getAgentIds(agents: AgentsConfig): string[] {
  return agents.agents.map((agent) => agent.id);
}

export function validateAgentConfig(agent: AgentConfig): boolean {
  return !!(agent.id && agent.name && agent.skillsDir && agent.tokensDir);
}
