#!/usr/bin/env node

/**
 * stitch-mcp-apikey - MCP Server for Google Stitch using API Key
 */

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const os = require("os");

const STITCH_URL = "https://stitch.googleapis.com/mcp";
const TIMEOUT_MS = 180000; // 3 minutes

// API Key from Environment
const API_KEY = process.env.STITCH_API_KEY;
// Default project ID if not provided in args
const DEFAULT_PROJECT_ID = process.env.STITCH_PROJECT_ID || "medpayrez-poc";

if (!API_KEY) {
    console.error("[stitch-mcp] ❌ Error: STITCH_API_KEY environment variable is required.");
    process.exit(1);
}

// Helpers for formatted logging
const log = {
    info: (msg) => console.error(`[stitch-mcp] ℹ️  ${msg}`),
    success: (msg) => console.error(`[stitch-mcp] ✅ ${msg}`),
    warn: (msg) => console.error(`[stitch-mcp] ⚠️  ${msg}`),
    error: (msg) => console.error(`[stitch-mcp] ❌ ${msg}`),
};

async function callStitchAPI(method, params) {
    const body = {
        jsonrpc: "2.0",
        method,
        params,
        id: Date.now()
    };

    log.info(`→ ${method}`);

    // With API Key, we append it to the URL
    // We also remove the Authorization header
    const url = `${STITCH_URL}?key=${API_KEY}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
                // No Authorization or X-Goog-User-Project needed typically with API Key
            },
            body: JSON.stringify(body),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            const text = await response.text();
            let errorMessage = `HTTP ${response.status}: ${text}`;
            let errorCode = -32000;

            if (response.status === 400) errorCode = -32602;
            if (response.status === 401 || response.status === 403) errorCode = -32001;
            if (response.status === 404) errorCode = -32601;

            throw { code: errorCode, message: errorMessage };
        }

        const data = await response.json();

        // Log success but truncate large data
        log.success(`Completed ${method}`);
        return data;

    } catch (error) {
        clearTimeout(timeout);
        if (error.name === 'AbortError') throw { code: -32002, message: "Request timeout" };
        if (error.code) throw error;
        throw { code: -32603, message: error.message || "Internal error" };
    }
}

function sanitizeSchema(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => sanitizeSchema(item));

    const cleaned = {};
    for (const key of Object.keys(obj)) {
        if (key.startsWith('x-')) continue;
        cleaned[key] = sanitizeSchema(obj[key]);
    }
    return cleaned;
}

async function main() {
    try {
        log.info(`Starting Stitch MCP Server (API Key Mode)`);

        const server = new Server(
            { name: "stitch", version: "1.0.0" },
            { capabilities: { tools: {} } }
        );

        const { ListToolsRequestSchema, CallToolRequestSchema } = require("@modelcontextprotocol/sdk/types.js");

        const CUSTOM_TOOLS = [
            {
                name: "fetch_screen_code",
                description: "Retrieves the actual HTML/Code content of a screen.",
                inputSchema: {
                    type: "object",
                    properties: {
                        projectId: { type: "string", description: "The project ID" },
                        screenId: { type: "string", description: "The screen ID" }
                    },
                    required: ["screenId"]
                }
            },
            {
                name: "fetch_screen_image",
                description: "Retrieves the screenshot/preview image of a screen.",
                inputSchema: {
                    type: "object",
                    properties: {
                        projectId: { type: "string", description: "The project ID" },
                        screenId: { type: "string", description: "The screen ID" }
                    },
                    required: ["screenId"]
                }
            }
        ];

        server.setRequestHandler(ListToolsRequestSchema, async () => {
            try {
                const result = await callStitchAPI("tools/list", {});
                const rawTools = result.result ? result.result.tools : [];

                const tools = rawTools.map(tool => ({
                    ...tool,
                    inputSchema: tool.inputSchema ? sanitizeSchema(tool.inputSchema) : tool.inputSchema
                }));
                return { tools: [...tools, ...CUSTOM_TOOLS] };
            } catch (error) {
                log.error(`Tools list failed: ${error.message}`);
                return { tools: [...CUSTOM_TOOLS] };
            }
        });

        server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            // Ensure args has projectId if missing
            if (args && !args.projectId) {
                args.projectId = DEFAULT_PROJECT_ID;
            }

            // Custom Tools Logic
            if (name === "fetch_screen_code") {
                try {
                    log.info(`Fetching code for screen: ${args.screenId}`);
                    // Use 'get_screen' tool from Stitch API
                    const screenRes = await callStitchAPI("tools/call", {
                        name: "get_screen",
                        arguments: { projectId: args.projectId, screenId: args.screenId }
                    });

                    if (!screenRes.result) throw new Error("Could not fetch screen details");

                    let downloadUrl = null;
                    const findUrl = (obj) => {
                        if (downloadUrl) return;
                        if (!obj || typeof obj !== 'object') return;
                        if (obj.downloadUrl) { downloadUrl = obj.downloadUrl; return; }
                        for (const key in obj) findUrl(obj[key]);
                    };
                    findUrl(screenRes.result);

                    if (!downloadUrl) return { content: [{ type: "text", text: "No code download URL found." }], isError: true };

                    const res = await fetch(downloadUrl);
                    if (!res.ok) throw new Error(`Failed to download: ${res.status}`);
                    const code = await res.text();
                    return { content: [{ type: "text", text: code }] };

                } catch (err) {
                    return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
                }
            }

            if (name === "fetch_screen_image") {
                // Simplified image fetch logic
                try {
                    log.info(`Fetching image for screen: ${args.screenId}`);
                    const screenRes = await callStitchAPI("tools/call", {
                        name: "get_screen",
                        arguments: { projectId: args.projectId, screenId: args.screenId }
                    });

                    if (!screenRes.result) throw new Error("Could not fetch screen details");

                    // Logic to find image URL (simplified from original)
                    let imageUrl = null;
                    const findImg = (obj) => {
                        if (imageUrl) return;
                        if (!obj || typeof obj !== 'object') return;
                        if (obj.screenshot && obj.screenshot.downloadUrl) { imageUrl = obj.screenshot.downloadUrl; return; }
                        // Priority 2: Generic URI check
                        const isImgUrl = (s) => typeof s === "string" && (
                            s.includes(".png") ||
                            s.includes(".jpg") ||
                            (s.includes("googleusercontent.com") && !s.includes("contribution.usercontent"))
                        );
                        if (obj.downloadUrl && isImgUrl(obj.downloadUrl)) { imageUrl = obj.downloadUrl; return; }
                        for (const key in obj) findImg(obj[key]);
                    };
                    findImg(screenRes.result);

                    if (!imageUrl) return { content: [{ type: "text", text: "No image URL found." }], isError: true };

                    // Return URL or download? Let's just return URL for now to be safe, or download if needed.
                    // Original downloaded it. Let's do that.
                    const imgRes = await fetch(imageUrl);
                    const buffer = await imgRes.buffer();
                    const base64Img = buffer.toString('base64');
                    return {
                        content: [
                            { type: "text", text: `Image downloaded (base64)` },
                            { type: "image", data: base64Img, mimeType: "image/png" }
                        ]
                    };
                } catch (err) {
                    return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
                }
            }
            // End Custom Tools

            // Default: Proxy to Stitch API
            try {
                const result = await callStitchAPI("tools/call", { name, arguments: args || {} });

                // Auto-download logic omitted for brevity, can add back if needed.
                // Just return result
                if (result.result) {
                    return { content: [{ type: "text", text: JSON.stringify(result.result, null, 2) }] };
                }
                if (result.error) return { content: [{ type: "text", text: `API Error: ${result.error.message}` }], isError: true };
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };

            } catch (error) {
                log.error(`Tool ${name} failed: ${error.message}`);
                return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
            }
        });

        const transport = new StdioServerTransport();
        await server.connect(transport);
        log.success("Server ready");

    } catch (error) {
        log.error(`Fatal Startup Error: ${error.message}`);
        process.exit(1);
    }
}

main();
