# mcptoskill

`mcptoskill` connects to any remote MCP server, discovers its tools, and generates skills for multiple AI agents (OpenClaw, Hermes, Claude) — letting you wire any MCP-compatible service into your AI agent environment with a single command.

**Original work by filiksyos** - Enhanced with multi-agent support and aesthetic UI improvements.

---

## CLI Tool

**Install** — two variants:

- Global install via `npm install -g @filiksyos/mcptoskill`
- No-install via `npx @filiksyos/mcptoskill <url>`
- Or clone from source: `git clone https://github.com/adrianR84/mcptoskill.git`

**Usage** — full command signature:

```
npx @filiksyos/mcptoskill <mcp-server-url> [--target=openclaw|hermes|claude|all] [--header "Key: Value"] [--name=<skill-name>] [--out=<output-dir>] [--skill-key=<key>]
```

**Flags**

| Flag                    | Description                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| `<url>`                 | MCP server endpoint URL (required)                                                          |
| `--target`              | Output target: `openclaw` (default), `hermes`, `claude`, or `all` for all configured agents |
| `--header "Key: Value"` | Add an HTTP header (repeatable for multiple headers)                                        |
| `--skill-key=<key>`     | _(Deprecated)_ Legacy skill key from mcptoskill.com. Use local OAuth instead.               |
| `--name=<name>`         | Override the auto-generated skill name                                                      |
| `--out=<dir>`           | Custom output directory (default: agent-specific directories)                               |

**Examples**

1. **Context7 (no auth) - generates skill for default agent (Claude):**

```
npx @filiksyos/mcptoskill https://mcp.context7.com/mcp
```

2. **Target specific agents:**

```
# Generate for Claude
npx @filiksyos/mcptoskill https://mcp.context7.com/mcp --target=claude

# Generate for OpenClaw
npx @filiksyos/mcptoskill https://mcp.context7.com/mcp --target=openclaw

# Generate for Hermes
npx @filiksyos/mcptoskill https://mcp.context7.com/mcp --target=hermes

# Generate for all configured agents
npx @filiksyos/mcptoskill https://mcp.context7.com/mcp --target=all
```

3. **Custom skill name and output:**

```
npx @filiksyos/mcptoskill https://mcp.context7.com/mcp --name=my-context7-skill --out=./my-skills
```

4. **OAuth providers (Notion, PostHog, Supabase) - interactive prompts:**

```
npx @filiksyos/mcptoskill https://mcp.notion.com/mcp
```

The CLI prints an auth URL. Open it in your browser, complete OAuth, then copy the redirect URL from the address bar (it will fail to load — that's fine) and paste it into the terminal. Tokens are saved locally to agent-specific token directories.

5. **API key authentication:**

```
npx @filiksyos/mcptoskill https://mcp.supabase.com/mcp --header "Authorization: Bearer your-token"
```

```
npx @filiksyos/mcptoskill "https://mcp.supabase.com/mcp?project_ref=YOUR_REF" --header "Authorization: Bearer YOUR_TOKEN"
```

6. Exa MCP (key in URL):

```
npx @filiksyos/mcptoskill "https://mcp.exa.ai/mcp?exaApiKey=YOUR_KEY"
```

7. Render MCP (API key auth) — create an API key from [Render Dashboard → Account Settings → API Keys](https://dashboard.render.com/settings#api-keys):

```
npx @filiksyos/mcptoskill https://mcp.render.com/mcp --header "Authorization: Bearer YOUR_RENDER_API_KEY"
```

## Multi-Agent Configuration

`mcptoskill` supports multiple AI agents through a configuration file at `~/.mcptoskill/agents.json`. The first run automatically creates this file with default agents:

- **OpenClaw** - Skills in `~/.openclaw/skills/`
- **Hermes** - Skills in `~/.hermes/skills/mcptoskill/`
- **Claude** - Skills in `~/.claude/skills/` (default agent)

You can customize agents, add new ones, or modify paths by editing the configuration file.

**VPS / headless** — Run the CLI on a remote machine. When prompted, open the auth URL on your laptop, complete OAuth, then copy the redirect URL from the address bar and paste it into the SSH terminal. No server needs to listen on localhost.

## What Gets Generated

Two files are created in the target agent's directory:

- `SKILL.md` — the skill definition with tool documentation
- `scripts/<skill-name>.sh` — a shell script that calls the MCP server via curl

Output location depends on `--target` and `--out`:

- **OpenClaw** (default): `~/.openclaw/skills/<skill-name>/`
- **Hermes** (`--target=hermes`): `~/.hermes/skills/mcptoskill/<skill-name>/`

Hermes auto-discovers skills from `~/.hermes/skills/`; no config file needed. The agent runs the script via terminal when it needs to call tools. No `pip install hermes-agent[mcp]` needed for mcptoskill skills.

**Skill visibility** — Generated skills no longer declare `requires.bins: ["curl"]` because OpenClaw checks bins against the gateway process PATH at load time; in systemd/Docker/minimal environments, curl is often not found there, causing skills to be filtered out. The script runs in the agent's execution context where curl is typically available.

---

## Web Page

[https://mcptoskill.com](https://mcptoskill.com)

Generate the correct CLI command for any MCP server without leaving your browser.

**Contributing** — Fork the repo → edit → open a pull request.
