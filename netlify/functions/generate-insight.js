export const handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    // Fallback logic for demo stability
    const getFallbackInsight = (reason = "Demo Fallback") => ({
        nextBestActions: ["Review documentation and initiate follow-up.", "Check for outstanding liens."],
        documentationGaps: ["Unable to analyze specific case details due to connection."],
        paymentDelayRisk: "Medium",
        followUpRecommendation: "Manual review recommended to ensure no timelines are missed.",
        confidence: 0.5,
        model: "fallback-rule-engine",
        generatedAt: new Date().toISOString(),
        note: reason
    });

    try {
        const body = JSON.parse(event.body);
        const {
            caseId,
            injuryType,
            riskTier,
            status,
            predictedRecoveryPercent,
            predictedTimeToSettlementDays,
            recentEventTypes = []
        } = body;

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            console.warn("OPENROUTER_API_KEY not found. Returning fallback.");
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(getFallbackInsight("Missing API Key"))
            };
        }

        const prompt = `
You are an operational AI assistant for a medical provider fee recovery platform.
You do NOT provide legal advice.
You analyze structured case data and recommend next operational steps to accelerate payment.

Return STRICTLY valid JSON in this format:

{
  "nextBestActions": string[],
  "documentationGaps": string[],
  "paymentDelayRisk": "Low" | "Medium" | "High",
  "followUpRecommendation": string,
  "confidence": number
}

Case Data:
- Injury Type: ${injuryType}
- Risk Tier: ${riskTier}
- Status: ${status}
- Predicted Recovery %: ${predictedRecoveryPercent}
- Predicted Time to Settlement (days): ${predictedTimeToSettlementDays}
- Recent Workflow Events: ${recentEventTypes.join(", ")}

Be concise, operational, and professional.
`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                // OpenRouter specific headers for app identification
                "HTTP-Referer": "https://medpayrez-provider.netlify.app",
                "X-Title": "MedPayRez Provider"
            },
            body: JSON.stringify({
                model: "meta-llama/llama-2-13b-chat",
                temperature: 0.2,
                messages: [
                    { role: "system", content: "You return only valid JSON." },
                    { role: "user", content: prompt }
                ]
            })
        });

        if (!response.ok) {
            console.error(`OpenRouter API error: ${response.status}`);
            return {
                statusCode: 200, // Return 200 with fallback to avoid frontend crash
                headers,
                body: JSON.stringify(getFallbackInsight("API Error"))
            };
        }

        const data = await response.json();
        const raw = data.choices?.[0]?.message?.content;

        if (!raw) {
            throw new Error("Empty response from model");
        }

        // Harden JSON parsing
        const cleaned = raw
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        let parsed;
        if (!cleaned || !cleaned.startsWith('{')) {
            console.warn("Model output not valid JSON format, using fallback.");
            console.log("Raw output (truncated):", cleaned.substring(0, 50));
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(getFallbackInsight("Invalid JSON Format"))
            };
        }

        parsed = JSON.parse(cleaned);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                ...parsed,
                generatedAt: new Date().toISOString(),
                model: "meta-llama/llama-2-13b-chat"
            })
        };

    } catch (error) {
        console.error("Function error:", error);
        // Only return 500 if something is truly broken in the function logic itself,
        // but for demo stability, even catched errors should probably return fallback.
        return {
            statusCode: 200,
            headers,
            // Return fallback safely
            body: JSON.stringify(getFallbackInsight("Internal Error"))
        };
    }
};