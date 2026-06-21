export declare class InfluIQClient {
    private client;
    private baseUrl;
    private authMode;
    constructor(baseUrl?: string);
    setApiKey(apiKey: string): void;
    setJwt(accessToken: string): void;
    getAuthMode(): "api-key" | "jwt" | "none";
    isAuthenticated(): boolean;
    login(email: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T>;
    post<T>(endpoint: string, data?: Record<string, unknown>): Promise<T>;
    delete<T>(endpoint: string): Promise<T>;
}
export declare function handleApiError(error: unknown): string;
