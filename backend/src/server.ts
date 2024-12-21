import dotenv from 'dotenv';
import { ChatOpenAI } from "@langchain/openai";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import "cheerio"; // This is required in notebooks to use the `CheerioWebBaseLoader`
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

dotenv.config();

console.log('environment variables:');
console.log(process.env.OPENAI_API_KEY);
console.log(process.env.TAVILY_API_KEY);

// const search = new TavilySearchResults({
//   maxResults: 2,
// });

// const searchResults: any = await search.invoke("what is the weather in SF");
// console.log('searchResults:', searchResults);

// const model = new ChatOpenAI({ model: "gpt-4" });

// const response = await model.invoke([
//   {
//     role: "user",
//     content: "hi!",
//   },
// ]);

// console.log(response.content);


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

const retrieverResponse: any = (await retriever.invoke("how to upload a dataset"))[0];
console.log('retrieverResponse:', retrieverResponse);
