import dotenv from 'dotenv';
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { createToolCallingAgent } from "langchain/agents";
import { AgentExecutor } from "langchain/agents";
import { ChainValues } from '@langchain/core/utils/types';

dotenv.config();

console.log('environment variables:');
console.log(process.env.OPENAI_API_KEY);
console.log(process.env.TAVILY_API_KEY);

const search = new TavilySearchResults({
  maxResults: 2,
});
const tools = [search];

const model = new ChatOpenAI({ model: "gpt-4" });

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant"],
  ["placeholder", "{chat_history}"],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);

console.log(prompt.promptMessages);

const agent = await createToolCallingAgent({ llm: model, tools, prompt });

const agentExecutor = new AgentExecutor({
  agent,
  tools,
});

const agentResults: ChainValues = await agentExecutor.invoke({ input: "what can you tell me about the restaurant Capelo's Barbecue in Redwood City, California?" });

console.log(agentResults);

console.log('exit');