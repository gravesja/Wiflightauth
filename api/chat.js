const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 15000); // 15 sec timeout

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
        }),
        signal: controller.signal
    });

    clearTimeout(timeout);
    const data = await response.json();

    if (response.ok) {
        res.status(200).json(data);
    } else {
        res.status(response.status).json({ error: data.error?.message || "API request failed" });
    }
} catch (error) {
    if (error.name === "AbortError") {
        res.status(504).json({ error: "Request timed out" });
    } else {
        console.error("OpenAI API error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
