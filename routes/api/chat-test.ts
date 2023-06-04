import {
  readableStreamFromReader,
  writableStreamFromWriter,
  writeAll,
  writerFromStreamWriter,
} from "$std/streams/mod.ts";

import { chain } from "@/utils/chat.ts";
import { Buffer } from "$std/io/buffer.ts";

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

  const msg = new TextEncoder().encode("data: hello\r\n\r\n");
  let timerId: number | undefined;
  const body = new ReadableStream({
    start(controller) {
      timerId = setInterval(() => {
        controller.enqueue(msg);
      }, 1000);
    },
    cancel() {
      if (typeof timerId === "number") {
        clearInterval(timerId);
      }
    },
  });

  const stream = new ReadableStream();

  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}
