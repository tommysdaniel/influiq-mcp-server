import http from "node:http";
import { execFile } from "node:child_process";

/**
 * Starts a temporary local HTTP server, opens the browser to the login page,
 * and waits for the callback with the JWT tokens.
 */
export async function browserLogin(
  loginPageUrl: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      // CORS preflight
      if (req.method === "OPTIONS") {
        res.writeHead(204, {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        });
        res.end();
        return;
      }

      if (req.method === "POST" && req.url === "/callback") {
        let body = "";
        req.on("data", (chunk: Buffer) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const data = JSON.parse(body);
            if (!data.accessToken) {
              res.writeHead(400, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              });
              res.end(JSON.stringify({ error: "Missing accessToken" }));
              return;
            }

            res.writeHead(200, {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            });
            res.end(JSON.stringify({ success: true }));

            server.close();
            resolve({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken || "",
            });
          } catch {
            res.writeHead(400, {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            });
            res.end(JSON.stringify({ error: "Invalid JSON" }));
          }
        });
        return;
      }

      res.writeHead(404);
      res.end();
    });

    // Listen on a random port
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (!addr || typeof addr === "string") {
        reject(new Error("Failed to start local auth server"));
        return;
      }
      const port = addr.port;
      const callbackUrl = `http://127.0.0.1:${port}/callback`;
      const fullUrl = `${loginPageUrl}?mcp_callback=${encodeURIComponent(callbackUrl)}`;

      console.error(`Opening browser for login: ${fullUrl}`);

      // Open browser using execFile (safe, no shell injection)
      const platform = process.platform;
      try {
        if (platform === "darwin") {
          execFile("open", [fullUrl]);
        } else if (platform === "win32") {
          execFile("cmd", ["/c", "start", "", fullUrl]);
        } else {
          execFile("xdg-open", [fullUrl]);
        }
      } catch {
        console.error(`Please open this URL in your browser:\n${fullUrl}`);
      }
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      server.close();
      reject(new Error("Login timed out after 5 minutes. Please try again."));
    }, 5 * 60 * 1000);
  });
}
