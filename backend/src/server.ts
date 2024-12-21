import dotenv from 'dotenv';
import { ChatOpenAI } from "@langchain/openai";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import "cheerio"; // This is required in notebooks to use the `CheerioWebBaseLoader`
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { z } from "zod";
import { tool } from "@langchain/core/tools";

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

const modelWithTools = model.bindTools(tools);

// const responseWithTools = await modelWithTools.invoke([
//   {
//     role: "user",
//     content: "Hi!",
//   },
// ]);

// console.log(`Content: ${responseWithTools.content}`);
// console.log(`Tool calls: ${responseWithTools.tool_calls}`);

const responseWithToolCalls = await modelWithTools.invoke([
  {
    role: "user",
    content: "What's the weather in SF?",
  },
]);

console.log(`Content: ${responseWithToolCalls.content}`);
console.log(
  `Tool calls: ${JSON.stringify(responseWithToolCalls.tool_calls, null, 2)}`
);

console.log('exit');