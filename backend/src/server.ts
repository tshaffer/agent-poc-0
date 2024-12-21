import dotenv from 'dotenv';
import { ChatOpenAI } from "@langchain/openai";

console.log('this is the app');

dotenv.config();

console.log('environment variables:');
console.log(process.env.OPENAI_API_KEY);

const model = new ChatOpenAI({ model: "gpt-4" });

const response = await model.invoke([
  {
    role: "user",
    content: "hi!",
  },
]);

response.content;