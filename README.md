# InfluIQ MCP Server

Connect your AI tools (Claude Desktop, Cursor, etc.) to InfluIQ to analyze influencers, discover creators, and generate reputation reports — all through natural language.

## Prerequisites

- **Node.js 18+**
- **InfluIQ account** — [sign up at influiq.com](https://influiq.com/register)

## Authentication

You can authenticate in two ways:

### Option 1: Browser Login (easiest)
Just use the `influiq_login` tool — it opens your browser to sign in securely. No API key needed.

### Option 2: API Key (best for automation)
1. Go to [influiq.com](https://influiq.com) and sign in
2. Navigate to **Settings > API Keys**
3. Click **Generate API Key** (requires Pro or Enterprise plan)
4. Set the `INFLUIQ_API_KEY` environment variable in your MCP config

## Setup

```bash
cd influiq-mcp-server
npm install
npm run build
```

## Configure in Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "influiq": {
      "command": "node",
      "args": ["/path/to/influiq-mcp-server/dist/index.js"],
      "env": {
        "INFLUIQ_API_KEY": "iq_your_api_key_here"
      }
    }
  }
}
```

> If using browser login instead of API key, omit the `env` block — you'll authenticate via the `influiq_login` tool.

## Configure in Cursor

Add to your Cursor MCP settings:

```json
{
  "influiq": {
    "command": "node",
    "args": ["/path/to/influiq-mcp-server/dist/index.js"],
    "env": {
      "INFLUIQ_API_KEY": "iq_your_api_key_here"
    }
  }
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `INFLUIQ_API_KEY` | No | Your InfluIQ API key (format: `iq_...`). If not set, use `influiq_login` tool. |
| `INFLUIQ_API_URL` | No | Custom API URL (default: `https://backend.influiq.com/api`) |
| `INFLUIQ_APP_URL` | No | Custom app URL for login page (default: `https://influiq.com`) |

## Available Tools

### Authentication
| Tool | Description |
|------|-------------|
| `influiq_login` | Sign in via browser (opens login page) |
| `influiq_auth_status` | Check current authentication status |

### Analysis
| Tool | Description |
|------|-------------|
| `influiq_start_analysis` | Start a new influencer analysis (YouTube/Instagram) |
| `influiq_get_analysis` | Get full analysis results by ID |
| `influiq_get_analysis_progress` | Poll analysis progress |
| `influiq_list_analyses` | List past analyses with filters |
| `influiq_get_dashboard_stats` | Get aggregated stats and credit balance |

### Discovery
| Tool | Description |
|------|-------------|
| `influiq_discover_influencers` | Search influencers by category, platform, engagement, etc. |
| `influiq_get_discovery_profile` | Get detailed discovery profile |
| `influiq_get_discovery_filters` | Get available filter options |

### Reputation
| Tool | Description |
|------|-------------|
| `influiq_generate_reputation_report` | Generate a reputation report |
| `influiq_get_reputation_report` | Get a report by ID |
| `influiq_list_reputation_reports` | List your reports |

### Billing
| Tool | Description |
|------|-------------|
| `influiq_get_credits_balance` | Check credit balance |
| `influiq_get_subscription` | Get subscription status and usage |
| `influiq_list_plans` | List available plans |

## Example Prompts

- "Analyze the YouTube channel @MrBeast"
- "Find tech influencers with over 100K followers and high engagement"
- "What's my current credit balance?"
- "Generate a reputation report for instagram.com/therock"
- "Discover beauty influencers in the US who are recently active"
