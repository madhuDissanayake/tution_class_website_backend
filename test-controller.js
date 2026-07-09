import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';

async function test() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const systemPrompt = "You are a helpful assistant for an online tuition platform called TuitionHub. Help students find classes, explain subjects, or guide them on how to use the platform.";
        const fullPrompt = `${systemPrompt}\n\nUser: Hello, how are you?`;
        
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        console.log("Response from Gemini:", response.text());
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
