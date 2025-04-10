import fetch from 'node-fetch';

const TIMEOUT = 80000; // 

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error("OpenAI API Key is missing or not loading correctly");
        return res.status(500).json({ error: "Missing OpenAI API Key" });
    }

    
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages format" });
    }

    try {
        // Set up timeout controller
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

        // Make request to OpenAI API
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: messages,
                temperature: 0.7
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId); 

        const data = await response.json();
        if (response.ok) {
            res.status(200).json(data);
        } else {
            console.error("OpenAI API error response:", data.error);
            res.status(response.status).json({ error: data.error?.message || "API request failed" });
        }
    } catch (error) {
        
        if (error.name === 'AbortError') {
            console.error("Request timeout reached");
            return res.status(408).json({ error: "Request timeout. Please try again." });
        }

        console.error("OpenAI API error:", error);
        res.status(500).json({ error: "Internal server error. Please try again later." });
    }
}
