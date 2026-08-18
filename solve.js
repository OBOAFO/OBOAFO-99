// Vercel serverless function.
// Deploy this repo to Vercel, and set the environment variable
// ANTHROPIC_API_KEY in your Vercel project settings.
// Get a key at https://console.anthropic.com/

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, image } = req.body;

  if (!text && !image) {
    return res.status(400).json({ error: "No text or image provided" });
  }

  const content = [];

  if (image) {
    // image is a data URL: "data:image/png;base64,AAAA..."
    const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ error: "Invalid image format" });
    }
    const [, mediaType, base64Data] = match;
    content.push({
      type: "image",
      source: { type: "base64", media_type: mediaType, data: base64Data },
    });
  }

  content.push({
    type: "text",
    text: image
      ? "Read the math problem shown in this image and solve it. Show clear step-by-step working, then give the final answer on its own line at the end labeled 'Answer:'."
      : `Solve this math problem, showing clear step-by-step working, then give the final answer on its own line labeled 'Answer:'.\n\nProblem: ${text}`,
  });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: "AI API error: " + errText });
    }

    const data = await response.json();
    const answer = data.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return res.status(200).json({ answer });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
