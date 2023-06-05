import { chain } from "@/utils/chat.ts";
import {
  writeAll,
  writeAllSync,
  writerFromStreamWriter,
} from "$std/streams/mod.ts";

export async function handler(req: Request) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // const userInput = new URL(req.url).searchParams.get("userInput");

  const { userInput } = await req.json();

  return new Response(streamedToken?.value, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
    },
  });
}
