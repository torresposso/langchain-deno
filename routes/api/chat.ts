import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { ensureGetEnv } from "@/utils/env.ts";
import { readableStreamFromReader } from "$std/streams/mod.ts";
import { writeAll } from "https://deno.land/std@0.177.0/streams/write_all.ts";
import { chain, stream } from "@/utils/chat.ts";

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

  if (!userInput) {
    throw new Error("Missing query in request data");
  }
  console.log("messages", chain.memory);

  const response = await chain.call({
    input: userInput,
  });

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  chain.callbacks = [{
    handleLLMNewToken: (token) => {
      const msg = new TextEncoder().encode(`data: ${token}`);
      const body = new ReadableStream({
        start(controller) {
          controller.enqueue(msg);
        },
      });
      console.log("D", token);
    },
  }];

  console.log(body, stream.readable);
  return new Response(body, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}
