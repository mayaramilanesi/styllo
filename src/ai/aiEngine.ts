import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

export async function generateResponse(context: string, userMsg: string) {

  const ctx = context.slice(0, 600)
  const msg = userMsg.slice(0, 800)

  const messages = [
    {
      role: "system",
      content:
        "You are a helpful personal stylist. Be concise, specific and friendly.",
    },
    { role: "user", content: `Context: ${ctx}\nUser: ${msg}` },
  ];

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",          
    messages: messages as any,                      
    temperature: 0.7,
    max_tokens: 300,
  });

  const text = completion.choices[0]?.message?.content?.trim() ?? "";
  return text;
}
