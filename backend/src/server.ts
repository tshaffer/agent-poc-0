import dotenv from 'dotenv';
import { ChatOpenAI } from "@langchain/openai";
import "cheerio"; // This is required in notebooks to use the `CheerioWebBaseLoader`
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

dotenv.config();

console.log('environment variables:');
console.log(process.env.OPENAI_API_KEY);
console.log(process.env.TAVILY_API_KEY);

const search = new TavilySearchResults({
  maxResults: 2,
});

const searchResults: any = await search.invoke("what is the weather in SF");
console.log('searchResults:', searchResults);

// const model = new ChatOpenAI({ model: "gpt-4" });

// const response = await model.invoke([
//   {
//     role: "user",
//     content: "hi!",
//   },
// ]);

// console.log(response.content);