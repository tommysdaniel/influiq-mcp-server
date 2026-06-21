import axios, { AxiosError } from "axios";
const DEFAULT_BASE_URL = "https://backend.influiq.com/api";
const REQUEST_TIMEOUT = 60_000;
export class InfluIQClient {
    client;
    baseUrl;
    authMode = "none";
    constructor(baseUrl) {
        this.baseUrl = baseUrl || DEFAULT_BASE_URL;
        this.client = axios.create({
            baseURL: this.baseUrl,
            timeout: REQUEST_TIMEOUT,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
    }
    setApiKey(apiKey) {
        this.authMode = "api-key";
        this.client.defaults.headers.common["X-API-Key"] = apiKey;
        delete this.client.defaults.headers.common["Authorization"];
    }
    setJwt(accessToken) {
        this.authMode = "jwt";
        this.client.defaults.headers.common["Authorization"] =
            `Bearer ${accessToken}`;
        delete this.client.defaults.headers.common["X-API-Key"];
    }
    getAuthMode() {
        return this.authMode;
    }
    isAuthenticated() {
        return this.authMode !== "none";
    }
    async login(email, password) {
        const response = await axios.post(`${this.baseUrl}/auth/token`, { email, password }, { timeout: REQUEST_TIMEOUT });
        const { accessToken, refreshToken } = response.data;
        this.setJwt(accessToken);
        return { accessToken, refreshToken };
    }
    async refreshToken(refreshToken) {
        const response = await axios.post(`${this.baseUrl}/auth/refresh`, { refreshToken }, { timeout: REQUEST_TIMEOUT });
        const data = response.data;
        this.setJwt(data.accessToken);
        return data;
    }
    async get(endpoint, params) {
        const response = await this.client.get(endpoint, { params });
        return response.data;
    }
    async post(endpoint, data) {
        const response = await this.client.post(endpoint, data);
        return response.data;
    }
    async delete(endpoint) {
        const response = await this.client.delete(endpoint);
        return response.data;
    }
}
export function handleApiError(error) {
    if (error instanceof AxiosError) {
        if (error.response) {
            const status = error.response.status;
            const msg = error.response.data?.message ||
                error.response.data?.error ||
                error.response.statusText;
            switch (status) {
                case 401:
                    return "Error: Authentication failed. Use influiq_login to sign in with your email/password, or set INFLUIQ_API_KEY environment variable.";
                case 403:
                    return "Error: Access denied. Your subscription plan may not include API access (requires Pro or Enterprise).";
                case 404:
                    return `Error: Resource not found. ${msg}`;
                case 429:
                    return "Error: Rate limit exceeded. Wait before making more requests.";
                default:
                    return `Error: API returned status ${status}. ${msg}`;
            }
        }
        if (error.code === "ECONNABORTED") {
            return "Error: Request timed out. The operation may still be processing — try again later.";
        }
        if (error.code === "ECONNREFUSED") {
            return "Error: Cannot connect to InfluIQ API. Check INFLUIQ_API_URL or try again later.";
        }
    }
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
}
//# sourceMappingURL=api-client.js.map