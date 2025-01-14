import dotenv from 'dotenv';
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import "cheerio"; // This is required in notebooks to use the `CheerioWebBaseLoader`
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { z } from "zod";
import { tool } from "@langchain/core/tools";
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
// const searchResults: any = await search.invoke("what is the weather in SF");
// console.log('searchResults:', searchResults);

const loader = new CheerioWebBaseLoader(
  "https://docs.smith.langchain.com/overview"
);
const docs = await loader.load();
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});
const documents = await splitter.splitDocuments(docs);
const vectorStore = await MemoryVectorStore.fromDocuments(
  documents,
  new OpenAIEmbeddings()
);
const retriever = vectorStore.asRetriever();

// const retrieverResponse: any = (await retriever.invoke("how to upload a dataset"))[0];
// console.log('retrieverResponse:', retrieverResponse);

const retrieverTool = tool(
  async ({ input }, config) => {
    const docs = await retriever.invoke(input, config);
    return docs.map((doc) => doc.pageContent).join("\n\n");
  },
  {
    name: "langsmith_search",
    description:
      "Search for information about LangSmith. For any questions about LangSmith, you must use this tool!",
    schema: z.object({
      input: z.string(),
    }),
  }
);

const tools = [search, retrieverTool];

const model = new ChatOpenAI({ model: "gpt-4" });

// const modelWithTools = model.bindTools(tools);

// const responseWithTools = await modelWithTools.invoke([
//   {
//     role: "user",
//     content: "Hi!",
//   },
// ]);

// console.log(`Content: ${responseWithTools.content}`);
// console.log(`Tool calls: ${responseWithTools.tool_calls}`);

// const responseWithToolCalls = await modelWithTools.invoke([
//   {
//     role: "user",
//     content: "What's the weather in SF?",
//   },
// ]);

// console.log(`Content: ${responseWithToolCalls.content}`);
// console.log(
//   `Tool calls: ${JSON.stringify(responseWithToolCalls.tool_calls, null, 2)}`
// );

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

// const agentResults: ChainValues = await agentExecutor.invoke({ input: "hi!" });

// const agentResults: ChainValues = await agentExecutor.invoke({ input: "how can langsmith help with testing?" });

const agentResults: ChainValues = await agentExecutor.invoke({ input: "what can you tell me about the restaurant Capelo's Barbecue in Redwood City, California?" });


console.log(agentResults);




console.log('exit');