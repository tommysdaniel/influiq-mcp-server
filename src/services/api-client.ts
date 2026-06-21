import axios, { AxiosError, AxiosInstance } from "axios";

const DEFAULT_BASE_URL = "https://backend.influiq.com/api";
const REQUEST_TIMEOUT = 60_000;

export class InfluIQClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private authMode: "api-key" | "jwt" | "none" = "none";

  constructor(baseUrl?: string) {
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

  setApiKey(apiKey: string): void {
    this.authMode = "api-key";
    this.client.defaults.headers.common["X-API-Key"] = apiKey;
    delete this.client.defaults.headers.common["Authorization"];
  }

  setJwt(accessToken: string): void {
    this.authMode = "jwt";
    this.client.defaults.headers.common["Authorization"] =
      `Bearer ${accessToken}`;
    delete this.client.defaults.headers.common["X-API-Key"];
  }

  getAuthMode(): "api-key" | "jwt" | "none" {
    return this.authMode;
  }

  isAuthenticated(): boolean {
    return this.authMode !== "none";
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await axios.post(
      `${this.baseUrl}/auth/token`,
      { email, password },
      { timeout: REQUEST_TIMEOUT },
    );
    const { accessToken, refreshToken } = response.data;
    this.setJwt(accessToken);
    return { accessToken, refreshToken };
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await axios.post(
      `${this.baseUrl}/auth/refresh`,
      { refreshToken },
      { timeout: REQUEST_TIMEOUT },
    );
    const data = response.data;
    this.setJwt(data.accessToken);
    return data;
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, unknown>,
  ): Promise<T> {
    const response = await this.client.get<T>(endpoint, { params });
    return response.data;
  }

  async post<T>(
    endpoint: string,
    data?: Record<string, unknown>,
  ): Promise<T> {
    const response = await this.client.post<T>(endpoint, data);
    return response.data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.client.delete<T>(endpoint);
    return response.data;
  }
}

export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      const status = error.response.status;
      const msg =
        error.response.data?.message ||
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
