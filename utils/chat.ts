import { ensureGetEnv } from "./env.ts";
import { ApplicationError } from "./errors.ts";

const OPENAI_API_KEY = ensureGetEnv("OPENAI_API_KEY");

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chatCompletions(userInput: string) {
  const chatCompletionsOptions = {
    model: "gpt-3.5-turbo",
    messages: [{
      role: "user",
      content: userInput,
    }],
    max_tokens: 256,
    temperature: 0,
    stream: true,
  };

  // The Fetch API allows for easier response streaming over the OpenAI client.
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(chatCompletionsOptions),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new ApplicationError("Failed to generate completion", error);
  }

  // Proxy the streamed SSE response from OpenAI
  return new Response(response.body, {
    headers: {
      "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
      "Content-Type": "text/event-stream",
    },
  });
}
