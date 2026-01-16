import fetch from 'node-fetch';

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const { caseDetails, scenario } = JSON.parse(event.body);

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

        console.log('[Netlify Function] Calling OpenRouter...');

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://medpayrez.netlify.app',
                'X-Title': 'MedPayRez AI'
            },
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

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Netlify Function] OpenRouter Error:', errorText);
            throw new Error(`OpenRouter API failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('[Netlify Function] OpenRouter Response Received');

        const aiContent = JSON.parse(data.choices[0].message.content);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(aiContent)
        };
    } catch (error) {
        console.error('[Netlify Function] Handler Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'Internal Server Error' })
        };
    }
};
