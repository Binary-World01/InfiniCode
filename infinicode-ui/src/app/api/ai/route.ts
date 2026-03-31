import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { prompt, model: requestedModel = 'auto', systemPrompt } = await req.json();

        // 1. Define the Priority Fallback Sequence
        const providers = [
            { id: 'github', model: 'gpt-4o' },
            { id: 'github', model: 'gpt-4o-mini' },
            { id: 'openrouter', model: 'google/gemma-3-27b-it:free' },
            { id: 'groq', model: 'llama-3.3-70b-versatile' },
            { id: 'gemini', model: 'gemini-2.0-flash' },
            { id: 'openrouter', model: 'meta-llama/llama-3.3-70b-instruct:free' },
            { id: 'openrouter', model: 'qwen/qwen3-coder:free' }
        ];

        // 2. If user requested a specific model, put it at the front of the queue
        if (requestedModel !== 'auto') {
            const index = providers.findIndex(p => p.id === requestedModel);
            if (index > -1) {
                const [target] = providers.splice(index, 1);
                providers.unshift(target);
            } else if (requestedModel === 'claude' || requestedModel === 'deepseek') {
                // If it's one of the premium models, add it to front
                providers.unshift({ id: requestedModel as any, model: '' });
            }
        }

        let lastError = null;

        // 3. Sequential Retry Loop
        for (const provider of providers) {
            try {
                console.log(`[AI-ROUTER] Attempting ${provider.id} (${provider.model || 'default'})`);

                if (provider.id === 'github') {
                    const apiKey = process.env.GITHUB_MODELS_KEY;
                    if (!apiKey) continue;
                    const res = await fetch('https://models.inference.ai.azure.com/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: provider.model || 'gpt-4o',
                            messages: [
                                { role: 'system', content: systemPrompt || "You are a helpful coding assistant." },
                                { role: 'user', content: prompt }
                            ],
                            max_tokens: 4096,
                            temperature: 0.7
                        }),
                        signal: AbortSignal.timeout(20000)
                    });
                    const data = await res.json();
                    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
                    return NextResponse.json({
                        reply: data.choices?.[0]?.message?.content || "No response",
                        provider: `GitHub Models (${provider.model})`
                    });
                }

                if (provider.id === 'gemini') {
                    const apiKey = process.env.GEMINI_API_KEY;
                    if (!apiKey) continue;
                    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{ text: systemPrompt ? `${systemPrompt}\n\nUser: ${prompt}` : prompt }]
                            }]
                        }),
                        signal: AbortSignal.timeout(15000) // 15s timeout
                    });
                    const data = await res.json();
                    if (data.error) throw new Error(data.error.message);
                    return NextResponse.json({
                        reply: data.candidates?.[0]?.content?.parts?.[0]?.text || "No response",
                        provider: 'Google Gemini'
                    });
                }

                if (provider.id === 'groq') {
                    const apiKey = process.env.GROQ_API_KEY;
                    if (!apiKey) continue;
                    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                        body: JSON.stringify({
                            model: provider.model || 'llama-3.3-70b-versatile',
                            messages: [
                                { role: 'system', content: systemPrompt || "You are a helpful coding assistant." },
                                { role: 'user', content: prompt }
                            ]
                        }),
                        signal: AbortSignal.timeout(15000)
                    });
                    const data = await res.json();
                    if (data.error) throw new Error(data.error.message);
                    return NextResponse.json({
                        reply: data.choices?.[0]?.message?.content || "No response",
                        provider: 'Groq (Meta Llama)'
                    });
                }

                if (provider.id === 'openrouter') {
                    const apiKey = process.env.OPENROUTER_API_KEY;
                    if (!apiKey) continue;
                    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`,
                            'HTTP-Referer': 'http://localhost:3000',
                            'X-Title': 'Infinicode Editor'
                        },
                        body: JSON.stringify({
                            model: provider.model,
                            messages: [
                                { role: 'system', content: systemPrompt || "You are a helpful coding assistant." },
                                { role: 'user', content: prompt }
                            ]
                        }),
                        signal: AbortSignal.timeout(15000)
                    });
                    const data = await res.json();
                    if (data.error) throw new Error(data.error.message);
                    return NextResponse.json({
                        reply: data.choices?.[0]?.message?.content || "No response",
                        provider: `OpenRouter (${provider.model})`
                    });
                }

                // Placeholder for premium deepseek/claude if user adds credit later
                if (provider.id === 'deepseek') {
                    const apiKey = process.env.DEEPSEEK_API_KEY;
                    if (!apiKey) continue;
                    const res = await fetch('https://api.deepseek.com/chat/completions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                        body: JSON.stringify({
                            model: 'deepseek-chat',
                            messages: [{ role: 'system', content: systemPrompt || "You are a helpful coding assistant." }, { role: 'user', content: prompt }]
                        })
                    });
                    const data = await res.json();
                    if (data.error) throw new Error(data.error.message);
                    return NextResponse.json({ reply: data.choices?.[0]?.message?.content || "No response", provider: 'DeepSeek' });
                }

                if (provider.id === 'claude') {
                    const apiKey = process.env.ANTHROPIC_API_KEY;
                    if (!apiKey) continue;
                    const res = await fetch('https://api.anthropic.com/v1/messages', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
                        body: JSON.stringify({
                            model: 'claude-3-5-sonnet-20241022',
                            max_tokens: 8192,
                            system: systemPrompt || "You are a helpful coding assistant.",
                            messages: [{ role: 'user', content: prompt }]
                        })
                    });
                    const data = await res.json();
                    if (data.error) throw new Error(data.error.message);
                    return NextResponse.json({ reply: data.content?.[0]?.text || "No response", provider: 'Anthropic Claude' });
                }

            } catch (err: any) {
                console.warn(`[AI-ROUTER] ${provider.id} failed:`, err.message);
                lastError = err.message;
                continue; // Try next provider
            }
        }

        throw new Error(`All providers failed. Last error: ${lastError}`);

    } catch (error: any) {
        console.error("AI API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate AI response" }, { status: 500 });
    }
}
