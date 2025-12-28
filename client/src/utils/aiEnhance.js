export async function enhanceTextWithAI(text) {
  console.log("AI INPUT:", text);

  if (!text || !text.trim()) return text;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Improve grammar and clarity." },
        { role: "user", content: text },
      ],
      max_tokens: 150,
    }),
  });

  const data = await res.json();
  console.log("AI RAW RESPONSE:", data);

  if (!res.ok) {
    throw new Error(data.error?.message || "AI failed");
  }

  return data.choices[0].message.content.trim();
}
