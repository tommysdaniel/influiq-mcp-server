import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { InfluIQClient, handleApiError } from "../services/api-client.js";
import { browserLogin } from "../services/browser-auth.js";

const DEFAULT_APP_URL = "https://influiq.com";

export function registerAuthTools(
  server: McpServer,
  client: InfluIQClient,
): void {
  const appUrl = process.env.INFLUIQ_APP_URL || DEFAULT_APP_URL;

  // ── Login ──
  server.registerTool(
    "influiq_login",
    {
      title: "Login to InfluIQ",
      description: `Sign in to InfluIQ by opening the login page in your browser.

A browser window will open where you can securely enter your credentials.
After logging in, the session is automatically linked — no need to copy tokens.

This is an alternative to API key authentication. For API keys:
1. Go to https://influiq.com → Settings → API Keys
2. Click "Generate API Key" (requires Pro or Enterprise plan)
3. Set INFLUIQ_API_KEY in your MCP server config

No arguments required.`,
      inputSchema: {},
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async () => {
      try {
        const loginPageUrl = `${appUrl}/login-mcp`;
        const tokens = await browserLogin(loginPageUrl);
        client.setJwt(tokens.accessToken);

        return {
          content: [
            {
              type: "text" as const,
              text: "Successfully logged in! You can now use all InfluIQ tools.",
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text:
                handleApiError(error) +
                "\n\n**Alternative: Use an API key instead**\n" +
                "1. Go to https://influiq.com → Settings → API Keys\n" +
                "2. Generate a new API key (requires Pro or Enterprise plan)\n" +
                "3. Add `INFLUIQ_API_KEY` to your MCP server environment config",
            },
          ],
        };
      }
    },
  );

  // ── Auth Status ──
  server.registerTool(
    "influiq_auth_status",
    {
      title: "Check Authentication Status",
      description: `Check your current authentication status with InfluIQ.

Shows whether you're authenticated via API key or browser login.
If not authenticated, provides instructions for both methods.

No arguments required.`,
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      const mode = client.getAuthMode();

      if (mode === "none") {
        return {
          content: [
            {
              type: "text" as const,
              text:
                "Not authenticated. You have two options:\n\n" +
                "**Option 1 — Browser login:**\n" +
                "Use the `influiq_login` tool — it will open your browser to sign in securely.\n\n" +
                "**Option 2 — API Key (recommended for automation):**\n" +
                "1. Go to https://influiq.com and sign in\n" +
                "2. Navigate to Settings → API Keys\n" +
                "3. Click \"Generate API Key\" (requires Pro or Enterprise plan)\n" +
                "4. Add `INFLUIQ_API_KEY` to your MCP server environment config\n\n" +
                "API keys persist across sessions without needing to login each time.",
            },
          ],
        };
      }

      const modeLabel =
        mode === "api-key" ? "API Key" : "Browser login session";
      return {
        content: [
          {
            type: "text" as const,
            text: `Authenticated via: **${modeLabel}**\n\nAll InfluIQ tools are ready to use.`,
          },
        ],
      };
    },
  );
}
