import { ensureGetEnv } from "@/utils/env.ts";
import { ApplicationError } from "@/utils/errors.ts";
import { PromptTemplate } from "langchain/prompts";

import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain/chains";

const OPENAI_API_KEY = ensureGetEnv("OPENAI_API_KEY");

const llm = new ChatOpenAI({ openAIApiKey: OPENAI_API_KEY, temperature: 0 });
const template =
  "Translate the text that is delimited by triple # into a style that is {style}. text: ###{text}###";
const promptTemplate = PromptTemplate.fromTemplate(template);

console.log(promptTemplate);
