import { OpenRouter } from "@openrouter/sdk";
import dotenv from 'dotenv';

dotenv.config();

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || ''
});

async function test() {
  console.log("Testing pattern 1: { chatRequest: { ... } }");
  try {
    const stream1 = await (openrouter.chat.send as any)({
      chatRequest: {
        model: "google/gemma-4-31b-it:free",
        messages: [{ role: "user", content: "hi" }],
        stream: true
      }
    });
    console.log("Pattern 1 SUCCESS");
  } catch (err: any) {
    console.log("Pattern 1 FAILED:", err.message);
    if (err.cause) console.log("Cause:", err.cause);
  }

  console.log("\nTesting pattern 2: { model, messages }");
  try {
    const stream2 = await (openrouter.chat.send as any)({
      model: "google/gemma-4-31b-it:free",
      messages: [{ role: "user", content: "hi" }],
      stream: true
    });
    console.log("Pattern 2 SUCCESS");
  } catch (err: any) {
    console.log("Pattern 2 FAILED:", err.message);
    if (err.cause) console.log("Cause:", err.cause);
  }

  console.log("\nTesting pattern 3: { ChatRequest: { ... } } (Capital C)");
  try {
    const stream3 = await (openrouter.chat.send as any)({
      ChatRequest: {
        model: "google/gemma-4-31b-it:free",
        messages: [{ role: "user", content: "hi" }],
        stream: true
      }
    });
    console.log("Pattern 3 SUCCESS");
  } catch (err: any) {
    console.log("Pattern 3 FAILED:", err.message);
    if (err.cause) console.log("Cause:", err.cause);
  }
}

test();
