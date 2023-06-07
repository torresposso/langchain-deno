import { chain } from "@/utils/chat.ts";

export async function handler(req: Request) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const userInput = new URL(req.url).searchParams.get("userInput");

  console.log("user", userInput);

  let result;

  const response = await chain.call(
    { input: userInput },
    [
      {
        handleLLMNewToken: async (token) => {
          const text = `data: ${token}`;
          const stream = new ReadableStream({
            start(controller) {
              controller.enqueue(text);
            },
          });
          const reader = await stream.getReader().read();
          result = reader;
        },
      },
    ],
  );

  return new Response(result?
    result.value, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
    },
  });
}
