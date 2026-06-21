import { handleApiError } from "../services/api-client.js";
export function registerBillingTools(server, client) {
    // ── Get Credits Balance ──
    server.registerTool("influiq_get_credits_balance", {
        title: "Get Credits Balance",
        description: `Check your current analysis credit balance.

No arguments required.

Returns: { credits: number }`,
        inputSchema: {},
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
        },
    }, async () => {
        try {
            const result = await client.get("/billing/stripe/credits/balance");
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
    // ── Get Subscription Status ──
    server.registerTool("influiq_get_subscription", {
        title: "Get Subscription Status",
        description: `Get your current subscription plan, status, usage, and billing period.

No arguments required.

Returns: { subscription: { status, currentPeriodEnd, usageUsedThisPeriod }, plan: { name, tier, includedUsagePerMonth, apiAccess } }`,
        inputSchema: {},
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
        },
    }, async () => {
        try {
            const result = await client.get("/billing/subscription/current");
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
    // ── List Subscription Plans ──
    server.registerTool("influiq_list_plans", {
        title: "List Subscription Plans",
        description: `List all available InfluIQ subscription plans with pricing and features.

No arguments required.

Returns: Array of plans with name, tier, pricing, included usage, and feature flags.`,
        inputSchema: {},
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
        },
    }, async () => {
        try {
            const result = await client.get("/billing/subscription/plans");
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
//# sourceMappingURL=billing.js.map