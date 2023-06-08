import { ensureGetEnv } from "@/utils/env.ts";
import { ApplicationError, UserError } from "@/utils/errors.ts";

export const corsHeaders = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = ensureGetEnv("OPENAI_API_KEY");

export async function handler(req: Request): Promise<Response> {
  try {
    // Handle CORS
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    const userInput = new URL(req.url).searchParams.get("userInput")?.trimEnd();

    if (!userInput) {
      throw new Error("Missing query in request data");
    }

    const chatCompletions = {
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: userInput,
      }],
      max_tokens: 512,
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
      body: JSON.stringify(chatCompletions),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApplicationError("Failed to generate completion", error);
    }

    // Proxy the streamed SSE response from OpenAI
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
      },
    });
  } catch (err: unknown) {
    if (err instanceof UserError) {
      return Response.json({
        error: err.message,
        data: err.data,
      }, {
        status: 400,
        headers: corsHeaders,
      });
    } else if (err instanceof ApplicationError) {
      // Print out application errors with their additional data
      console.error(`${err.message}: ${JSON.stringify(err.data)}`);
    } else {
      // Print out unexpected errors as is to help with debugging
      console.error(err);
    }

    // TODO: include more response info in debug environments
    return Response.json({
      error: "There was an error processing your request",
    }, {
      status: 500,
      headers: corsHeaders,
    });
  }
}
