import fetch from 'node-fetch';

export const handler = async (event) => {
    // 1. Method Check
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    console.log('[Netlify Function] Execution Started');

    try {
        // 2. Parse Body
        if (!event.body) {
            throw new Error('Missing request body');
        }
        const { caseDetails, scenario } = JSON.parse(event.body);
        console.log('[Netlify Function] Request parsed for client:', caseDetails?.client_name);

        // 3. Environment Variable Check
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            console.error('[Netlify Function] CONFIG ERROR: OPENROUTER_API_KEY is missing');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Server configuration error: API Key missing' })
            };
        }
        console.log('[Netlify Function] API Key check: Found (starts with ' + apiKey.substring(0, 8) + '...)');

        // 4. Construct Prompt
        const systemPrompt = `You are an expert AI legal negotiator specializing in medical lien resolution for personal injury cases.

    CASE CONTEXT:
    - Client: ${caseDetails.client_name}
    - Case #: ${caseDetails.case_number}
    - Jurisdiction: ${caseDetails.jurisdiction || 'CA'}
    - Injury: ${caseDetails.injury_type}
    - Total Lien Burden: $${caseDetails.total_lien_amount.toLocaleString()}
    - Settlement Amount: $${caseDetails.settlement_amount.toLocaleString()}

    NEGOTIATION SCENARIO:
    - Risk Tolerance: ${scenario.riskTolerance}
    - Provider Posture: ${scenario.providerStrategy}
    - Projected Recovery Adjustment: $${scenario.settlementAmount.toLocaleString()}

    TASK:
    Generate an AI-optimized negotiation strategy based on the jurisdiction rules (e.g., CA §3040) and the provider profile.

    You MUST return a JSON object with the following structure and NOTHING ELSE:
    {
      "reductionTarget": 0.40,
      "openingPayout": 7680,
      "probabilityAnalysis": {
        "yield": 0.88,
        "statutoryBasis": "CA CIVIL CODE §3040 / COMMON FUND"
      },
      "providerIntelligence": {
        "acceptRate": 0.92,
        "histYield": 0.39,
        "resolutionSpeed": 1.4
      },
      "neuralFrameworkAnalysis": "Detailed reasoning string here...",
      "aiTrustArchitecture": {
        "model": "mistralai/mistral-7b-instruct",
        "confidence": 0.94
      }
    }`;

        console.log('[Netlify Function] Calling OpenRouter API...');

        // 5. OpenRouter Call with Timeout Handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://medpayrez.netlify.app',
                    'X-Title': 'MedPayRez AI'
                },
                signal: controller.signal,
                body: JSON.stringify({
                    model: 'mistralai/mistral-7b-instruct',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a legal AI strategy engine. Return ONLY valid JSON.'
                        },
                        {
                            role: 'user',
                            content: systemPrompt
                        }
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.7
                })
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[Netlify Function] OpenRouter Error Response:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });
                return {
                    statusCode: response.status,
                    body: JSON.stringify({
                        error: 'OpenRouter API error',
                        details: errorText,
                        status: response.status
                    })
                };
            }

            const data = await response.json();
            console.log('[Netlify Function] OpenRouter Response Success');

            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Malformed response from OpenRouter');
            }

            const aiContent = JSON.parse(data.choices[0].message.content);

            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(aiContent)
            };

        } catch (fetchError) {
            if (fetchError.name === 'AbortError') {
                console.error('[Netlify Function] TIMEOUT: OpenRouter took too long (>25s)');
                return {
                    statusCode: 504,
                    body: JSON.stringify({ error: 'AI Engine timeout' })
                };
            }
            throw fetchError;
        }

    } catch (error) {
        console.error('[Netlify Function] Critical Handler Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Internal Server Error',
                message: error.message,
                stack: error.stack?.split('\n').slice(0, 3).join('\n') // Safely log top of stack
            })
        };
    }
};
