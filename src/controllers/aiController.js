import { GoogleGenerativeAI } from '@google/generative-ai';

// @desc    Chat with AI Assistant
// @route   POST /api/ai/chat
// @access  Public
export const chatWithAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Check if API key is missing or set to the default placeholder
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('your_gemini_api_key_here')) {
       // SIMULATED MODE FOR DEMONSTRATION
       const lowerPrompt = prompt.toLowerCase();
       let reply = "I am currently in Simulation Mode since no API key is provided. But I am still happy to help! What do you need?";
       
       if (lowerPrompt.includes('hi') || lowerPrompt.includes('hello')) {
           reply = "Hello there! Welcome to TuitionHub. I am the AI Assistant. How can I help you today?";
       } else if (lowerPrompt.includes('class') || lowerPrompt.includes('search') || lowerPrompt.includes('find')) {
           reply = "You can easily find classes by navigating to the 'Search' page! There you can filter by Subject, Grade, and Location, or even view classes on the Interactive Map.";
       } else if (lowerPrompt.includes('teacher') || lowerPrompt.includes('create')) {
           reply = "To create a class, you must register as a Teacher. Once logged in, go to your Dashboard and click 'Create Class'.";
       } else if (lowerPrompt.includes('reserve') || lowerPrompt.includes('seat')) {
           reply = "To reserve a seat, click 'View Details' on any class in the search page, and then click the 'Reserve Seat' button.";
       }

       return res.json({ reply });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemPrompt = "You are a helpful assistant for an online tuition platform called TuitionHub. Help students find classes, explain subjects, or guide them on how to use the platform.";
    const fullPrompt = `${systemPrompt}\n\nUser: ${prompt}`;

    let text;
    try {
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      text = response.text();
    } catch (apiError) {
      console.error('Gemini API Error:', apiError.message);
      
      // Fallback logic if API fails (Quota Exceeded, etc)
      const lowerPrompt = prompt.toLowerCase();
      text = "I am currently experiencing very high demand (API Quota Exceeded), so my advanced AI is temporarily offline. But I am still here to help! What do you need?";
      
      if (lowerPrompt.includes('hi') || lowerPrompt.includes('hello')) {
          text = "Hello there! Welcome to TuitionHub. My main AI is currently busy, but I am still happy to help you. How can I assist you today?";
      } else if (lowerPrompt.includes('class') || lowerPrompt.includes('search') || lowerPrompt.includes('find')) {
          text = "You can easily find classes by navigating to the 'Search' page! There you can filter by Subject, Grade, and Location, or even view classes on the Interactive Map.";
      } else if (lowerPrompt.includes('teacher') || lowerPrompt.includes('create')) {
          text = "To create a class, you must register as a Teacher. Once logged in, go to your Dashboard and click 'Create Class'.";
      } else if (lowerPrompt.includes('reserve') || lowerPrompt.includes('seat')) {
          text = "To reserve a seat, click 'View Details' on any class in the search page, and then click the 'Reserve Seat' button.";
      }
    }

    res.json({ reply: text });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate response' });
  }
};
