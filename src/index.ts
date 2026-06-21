#!/usr/bin/env node
/**
 * InfluIQ MCP Server
 *
 * Enables AI tools (Claude, Cursor, etc.) to interact with the InfluIQ platform:
 * analyze influencers, discover creators, generate reputation reports, and check account status.
 *
 * Authentication (choose one):
 *   1. Browser login:  Use the influiq_login tool — opens your browser to sign in
 *   2. API key:        Set INFLUIQ_API_KEY env var (format: iq_...)
 *                      Generate at https://influiq.com → Settings → API Keys (Pro/Enterprise plan)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { InfluIQClient } from "./services/api-client.js";
import { registerAuthTools } from "./tools/auth.js";
import { registerAnalysisTools } from "./tools/analysis.js";
import { registerDiscoveryTools } from "./tools/discovery.js";
import { registerReputationTools } from "./tools/reputation.js";
import { registerBillingTools } from "./tools/billing.js";

async function main(): Promise<void> {
  const baseUrl = process.env.INFLUIQ_API_URL;
  const apiKey = process.env.INFLUIQ_API_KEY;

  const client = new InfluIQClient(baseUrl);

  // If API key is provided, use it automatically
  if (apiKey) {
    client.setApiKey(apiKey);
    console.error("InfluIQ MCP server: authenticated via API key");
  } else {
    console.error(
      "InfluIQ MCP server: no API key set. Use influiq_login tool to sign in via browser, " +
        "or set INFLUIQ_API_KEY for automatic authentication.",
    );
  }

  const server = new McpServer({
    name: "influiq-mcp-server",
    version: "1.0.0",
  });

  // Register all tool groups
  registerAuthTools(server, client);
  registerAnalysisTools(server, client);
  registerDiscoveryTools(server, client);
  registerReputationTools(server, client);
  registerBillingTools(server, client);

  // Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("InfluIQ MCP server running");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
