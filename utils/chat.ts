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

const llm = new ChatOpenAI({
  openAIApiKey: ensureGetEnv("OPENAI_API_KEY"),
  cache: true,
  temperature: 0,
});

const chatPrompt = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(
    "The following is a friendly chat between a human an IA. The IA is talkative and provides specific details from its context. If the AI does not know the answer to a question it truthfully says it does not know.",
  ),
  new MessagesPlaceholder("history"),
  HumanMessagePromptTemplate.fromTemplate("{input}"),
]);

export const chain = new ConversationChain({
  llm,
  prompt: chatPrompt,
  memory: new BufferMemory({
    returnMessages: true,
    memoryKey: "history",
  }),
});
