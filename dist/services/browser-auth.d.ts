/**
 * Starts a temporary local HTTP server, opens the browser to the login page,
 * and waits for the callback with the JWT tokens.
 */
export declare function browserLogin(loginPageUrl: string): Promise<{
    accessToken: string;
    refreshToken: string;
}>;
