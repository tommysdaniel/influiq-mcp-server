import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { InfluIQClient, handleApiError } from "../services/api-client.js";

export function registerAnalysisTools(
  server: McpServer,
  client: InfluIQClient,
): void {
  // ── Start Analysis ──
  server.registerTool(
    "influiq_start_analysis",
    {
      title: "Start Influencer Analysis",
      description: `Start a new influencer analysis on InfluIQ. Consumes 1 analysis credit.

Supports YouTube channels and Instagram profiles. Provide either a URL or a platform + username.

Returns an analysisId to poll for results with influiq_get_analysis.

Args:
  - platform: "youtube" or "instagram"
  - url: Full URL to the channel/profile (e.g. https://youtube.com/@MrBeast)
  - username: Channel handle or username (e.g. "MrBeast", "@MrBeast")
  - brand_profile_id: Optional brand profile ID for brand-fit scoring

Returns: { analysisId, status, platform, creditsRemaining }`,
      inputSchema: {
        platform: z
          .enum(["youtube", "instagram"])
          .describe('Platform to analyze: "youtube" or "instagram"'),
        url: z
          .string()
          .optional()
          .describe("Full URL to the channel or profile"),
        username: z
          .string()
          .optional()
          .describe("Channel handle or Instagram username"),
        brand_profile_id: z
          .string()
          .uuid()
          .optional()
          .describe("Brand profile ID for brand-fit comparison"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const body: Record<string, unknown> = { platform: params.platform };
        if (params.url) body.url = params.url;
        if (params.username) body.channelId = params.username;
        if (params.brand_profile_id)
          body.brandProfileId = params.brand_profile_id;

        const result = await client.post<Record<string, unknown>>(
          "/analysis/start",
          body,
        );
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text" as const, text: handleApiError(error) }],
        };
      }
    },
  );

  // ── Get Analysis ──
  server.registerTool(
    "influiq_get_analysis",
    {
      title: "Get Analysis Results",
      description: `Retrieve the full results of a completed influencer analysis.

Returns comprehensive data including engagement metrics, audience demographics,
content quality scores, sponsorship detection, and brand-fit analysis.

If the analysis is still processing, check status with influiq_get_analysis_progress.

Args:
  - analysis_id: The UUID of the analysis (from influiq_start_analysis)

Returns: Full analysis object with profile, metrics, scores, and AI insights.`,
      inputSchema: {
        analysis_id: z.string().describe("Analysis UUID"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const result = await client.get<Record<string, unknown>>(
          `/analysis/${params.analysis_id}`,
        );
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text" as const, text: handleApiError(error) }],
        };
      }
    },
  );

  // ── Get Analysis Progress ──
  server.registerTool(
    "influiq_get_analysis_progress",
    {
      title: "Check Analysis Progress",
      description: `Poll the progress of a running analysis. Lightweight endpoint.

Args:
  - analysis_id: The UUID of the analysis

Returns: { status, progress (0-100), currentStep }`,
      inputSchema: {
        analysis_id: z.string().describe("Analysis UUID"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const result = await client.get<Record<string, unknown>>(
          `/analysis/${params.analysis_id}/progress`,
        );
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text" as const, text: handleApiError(error) }],
        };
      }
    },
  );

  // ── List Analysis History ──
  server.registerTool(
    "influiq_list_analyses",
    {
      title: "List Analysis History",
      description: `List your past influencer analyses with pagination.

Args:
  - page: Page number (default: 1)
  - limit: Results per page (default: 20, max: 50)
  - platform: Optional filter by "youtube" or "instagram"
  - status: Optional filter by "completed", "processing", "error"

Returns: Paginated list of analyses with basic info (id, platform, username, status, date).`,
      inputSchema: {
        page: z.number().int().min(1).default(1).describe("Page number"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .default(20)
          .describe("Results per page"),
        platform: z
          .enum(["youtube", "instagram"])
          .optional()
          .describe("Filter by platform"),
        status: z
          .enum(["completed", "processing", "error", "pending"])
          .optional()
          .describe("Filter by status"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const query: Record<string, unknown> = {
          page: params.page,
          limit: params.limit,
        };
        if (params.platform) query.platform = params.platform;
        if (params.status) query.status = params.status;

        const result = await client.get<Record<string, unknown>>(
          "/analysis/history",
          query,
        );
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text" as const, text: handleApiError(error) }],
        };
      }
    },
  );

  // ── Dashboard Stats ──
  server.registerTool(
    "influiq_get_dashboard_stats",
    {
      title: "Get Dashboard Statistics",
      description: `Get aggregated statistics: total analyses, completed count, recent analyses, platform breakdown, and current credit balance.

No arguments required.

Returns: { totalAnalyses, completedAnalyses, recentAnalyses, platformStats, analysisCredits }`,
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async () => {
      try {
        const result = await client.get<Record<string, unknown>>(
          "/analysis/dashboard/stats",
        );
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text" as const, text: handleApiError(error) }],
        };
      }
    },
  );
}
