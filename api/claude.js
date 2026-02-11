const sendJson = (res, status, body) => {
    res.status(status).json(body);
};

module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return sendJson(res, 405, { error: "Method not allowed" });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
        return sendJson(res, 500, { error: "Missing ANTHROPIC_API_KEY" });
    }

    const { prompt, maxTokens, system, messages, model } = req.body || {};

    if (!prompt && !messages) {
        return sendJson(res, 400, { error: "Missing prompt or messages" });
    }

    const payload = {
        model: model || "claude-sonnet-4-20250514",
        max_tokens: maxTokens || 800,
        messages: messages || [
            {
                role: "user",
                content: prompt
            }
        ]
    };

    if (system) {
        payload.system = system;
    }

    try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        return sendJson(res, response.status, data);
    } catch (error) {
        console.error("Claude proxy error:", error);
        return sendJson(res, 502, { error: "Upstream request failed" });
    }
};
