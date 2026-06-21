import { z } from "zod";
import { handleApiError } from "../services/api-client.js";
export function registerReputationTools(server, client) {
    // ── Generate Reputation Report ──
    server.registerTool("influiq_generate_reputation_report", {
        title: "Generate Reputation Report",
        description: `Generate a reputation report for an influencer. Consumes credits.

Analyzes trust signals, risk factors, and overall reputation score.

Args:
  - influencer_url: Full URL to the YouTube channel or Instagram profile
  - platform: "youtube" or "instagram"

Returns: Report with overallScore, trustSignals, riskFactors, and recommendations.`,
        inputSchema: {
            influencer_url: z
                .string()
                .describe("Full URL to the influencer profile"),
            platform: z
                .enum(["youtube", "instagram"])
                .describe("Platform of the influencer"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
            openWorldHint: true,
        },
    }, async (params) => {
        try {
            const result = await client.post("/reputation-report/generate", {
                influencerUrl: params.influencer_url,
                platform: params.platform,
            });
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                isError: true,
                content: [{ type: "text", text: handleApiError(error) }],
            };
        }
    });
    // ── Get Reputation Report ──
    server.registerTool("influiq_get_reputation_report", {
        title: "Get Reputation Report",
        description: `Retrieve a previously generated reputation report by ID.

Args:
  - report_id: Report UUID

Returns: Full report with scores, trust signals, and risk factors.`,
        inputSchema: {
            report_id: z.string().describe("Reputation report UUID"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
        },
    }, async (params) => {
        try {
            const result = await client.get(`/reputation-report/${params.report_id}`);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                isError: true,
                content: [{ type: "text", text: handleApiError(error) }],
            };
        }
    });
    // ── List Reputation Reports ──
    server.registerTool("influiq_list_reputation_reports", {
        title: "List Reputation Reports",
        description: `List your reputation reports with pagination.

Args:
  - page: Page number (default: 1)
  - limit: Results per page (default: 20)

Returns: Paginated list of reputation reports.`,
        inputSchema: {
            page: z.number().int().min(1).default(1).describe("Page number"),
            limit: z
                .number()
                .int()
                .min(1)
                .max(50)
                .default(20)
                .describe("Results per page"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
        },
    }, async (params) => {
        try {
            const result = await client.get("/reputation-report/my-reports", { page: params.page, limit: params.limit });
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                isError: true,
                content: [{ type: "text", text: handleApiError(error) }],
            };
        }
    });
}
//# sourceMappingURL=reputation.js.map