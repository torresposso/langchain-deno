import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { ensureGetEnv } from "./env.ts";

import { CallbackManager } from "langchain/callbacks";
import { writeAll } from "$std/streams/write_all.ts";

const encoder = new TextEncoder();
const stream = new TransformStream();
const writer = stream.writable.getWriter();

const llm = new ChatOpenAI({
  openAIApiKey: ensureGetEnv("OPENAI_API_KEY"),
  cache: true,
  temperature: 0,
  streaming: true,
  callbacks: [
    {
      handleLLMNewToken: async (token) => {
        await writer.ready;
        await writer.write(encoder.encode(token));
      },
      handleLLMEnd: async () => {
        await writer.ready;
        await writer.close();
      },
      handleLLMError: async (e) => {
        await writer.ready;
        await writer.abort(e);
      },
    },
  ],
});

const chatPrompt = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(
    "The following is a friendly chat between a human an IA. The IA is talkative and provides specific details from its context. If the AI does not know the answer to a question it truthfully says it does not know.",
  ),
  new MessagesPlaceholder("history"),
  HumanMessagePromptTemplate.fromTemplate("{input}"),
]);

const chain = new ConversationChain({
  llm,
  prompt: chatPrompt,
  memory: new BufferMemory({
    returnMessages: true,
    memoryKey: "history",
  }),
});

try {
  await chain.call({
    input: "Write me a song about sparkling water.",
  });
} catch (error) {
  console.log(error);
} finally {
  Deno.exit();
}
