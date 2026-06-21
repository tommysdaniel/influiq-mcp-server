import { z } from "zod";
import { handleApiError } from "../services/api-client.js";
export function registerDiscoveryTools(server, client) {
    // ── Discover Influencers ──
    server.registerTool("influiq_discover_influencers", {
        title: "Discover Influencers",
        description: `Search the InfluIQ discovery database for influencers matching specific criteria.

Filter by platform, categories, follower count, engagement tier, language, country, and more.
Free plans see up to 3 results; paid plans get full access.

Args:
  - platform: "youtube" or "instagram" (optional)
  - categories: Array of category slugs (e.g. ["tech", "gaming", "beauty"])
  - follower_min / follower_max: Follower count range
  - engagement_tier: "high" (>5%), "medium" (1-5%), or "low" (<1%)
  - language / country: Filter by language or country
  - is_verified: Only verified accounts
  - has_sponsorships: Only influencers with sponsorship history
  - is_recently_active: Only posted in last 30 days
  - q: Text search (name, handle, bio)
  - sort_by: "followerCount", "engagementRate", "qualityScore", or "lastPostedAt"
  - page / limit: Pagination

Returns: List of influencer profiles with metrics.`,
        inputSchema: {
            platform: z
                .enum(["youtube", "instagram"])
                .optional()
                .describe("Filter by platform"),
            categories: z
                .array(z.string())
                .optional()
                .describe('Category slugs: tech, gaming, beauty, fashion, food, travel, fitness, education, entertainment, business, lifestyle, sports, science, art, automotive'),
            follower_min: z
                .number()
                .int()
                .min(0)
                .optional()
                .describe("Minimum follower count"),
            follower_max: z
                .number()
                .int()
                .min(0)
                .optional()
                .describe("Maximum follower count"),
            engagement_tier: z
                .enum(["high", "medium", "low"])
                .optional()
                .describe("Engagement tier filter"),
            language: z.string().optional().describe("Language filter"),
            country: z.string().optional().describe("Country filter"),
            is_verified: z
                .boolean()
                .optional()
                .describe("Only verified accounts"),
            has_sponsorships: z
                .boolean()
                .optional()
                .describe("Only with sponsorship history"),
            is_recently_active: z
                .boolean()
                .optional()
                .describe("Only active in last 30 days"),
            q: z.string().optional().describe("Text search query"),
            sort_by: z
                .enum([
                "followerCount",
                "engagementRate",
                "qualityScore",
                "lastPostedAt",
            ])
                .optional()
                .describe("Sort field"),
            sort_order: z
                .enum(["ASC", "DESC"])
                .default("DESC")
                .describe("Sort direction"),
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
            const query = {
                page: params.page,
                limit: params.limit,
                sortOrder: params.sort_order,
            };
            if (params.platform)
                query.platform = params.platform;
            if (params.categories?.length)
                query.categories = params.categories;
            if (params.follower_min != null)
                query.followerMin = params.follower_min;
            if (params.follower_max != null)
                query.followerMax = params.follower_max;
            if (params.engagement_tier)
                query.engagementTier = params.engagement_tier;
            if (params.language)
                query.language = params.language;
            if (params.country)
                query.country = params.country;
            if (params.is_verified != null)
                query.isVerified = params.is_verified;
            if (params.has_sponsorships != null)
                query.hasSponsorships = params.has_sponsorships;
            if (params.is_recently_active != null)
                query.isRecentlyActive = params.is_recently_active;
            if (params.q)
                query.q = params.q;
            if (params.sort_by)
                query.sortBy = params.sort_by;
            const result = await client.get("/discovery", query);
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
    // ── Get Discovery Profile ──
    server.registerTool("influiq_get_discovery_profile", {
        title: "Get Discovery Profile",
        description: `Get detailed profile of a discovered influencer by ID.

Args:
  - profile_id: Discovery profile UUID

Returns: Full profile with metrics, categories, demographics, and sponsorship data.`,
        inputSchema: {
            profile_id: z.string().describe("Discovery profile UUID"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
        },
    }, async (params) => {
        try {
            const result = await client.get(`/discovery/${params.profile_id}`);
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
    // ── Get Discovery Filter Options ──
    server.registerTool("influiq_get_discovery_filters", {
        title: "Get Discovery Filter Options",
        description: `Get available filter options for discovery: categories, languages, and countries.

No arguments required.

Returns: { categories: [{slug, name}], languages: string[], countries: string[] }`,
        inputSchema: {},
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
        },
    }, async () => {
        try {
            const result = await client.get("/discovery/filters");
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
//# sourceMappingURL=discovery.js.map