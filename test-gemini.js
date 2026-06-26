import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBvOcjz6rMGjzFC9gpLpfyH_DUt2NxIs9k';

async function run() {
  try {
    let pageToken = '';
    let found = false;
    do {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}${pageToken ? '&pageToken=' + pageToken : ''}`);
      const data = await response.json();
      for (const m of data.models || []) {
         if (m.supportedGenerationMethods.includes('generateContent') && m.name.includes('gemini') && !m.name.includes('embedding') && !m.name.includes('audio')) {
             console.log("Valid model found:", m.name);
             found = true;
         }
      }
      pageToken = data.nextPageToken;
    } while (pageToken);
  } catch (err) {
    console.error("Global error:", err);
  }
}

run();
