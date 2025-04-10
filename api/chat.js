import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const apiKey = OPENAI_API_KEY;
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages format" });
    }

    const userMessage = messages[messages.length - 1].content;

    // Check if the message looks like a query (e.g., "What is..." or "Who is...")
    if (userMessage.match(/(what|my|who|how|where|why|when|I)\s+/i)) {
        const searchQuery = userMessage.trim();
        const duckDuckGoApiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json`;

        try {
            const searchResponse = await fetch(duckDuckGoApiUrl);
            const searchData = await searchResponse.json();
            
            if (searchData.AbstractText) {
                return res.status(200).json({
                    choices: [{
                        message: {
                            content: searchData.AbstractText || "Sorry, I couldn't find anything."
                        }
                    }]
                });
            } else {
                return res.status(200).json({
                    choices: [{
                        message: {
                            content: "Sorry, I couldn't find any relevant results."
                        }
                    }]
                });
            }
        } catch (error) {
            console.error("Search error:", error);
            return res.status(500).json({ error: "Error searching the web." });
        }
    }
    try {
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
            })
        });

        const data = await response.json();

        if (response.ok) {
            return res.status(200).json(data);
        } else {
            return res.status(response.status).json({ error: data.error?.message || "API request failed" });
        }
    } catch (error) {
        console.error("OpenAI API error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
