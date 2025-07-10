import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "")

// Create a reusable model instance
const model = genAI.getGenerativeModel({ model: "gemini-pro" })

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export async function generateChatResponse(messages: ChatMessage[], systemPrompt?: string) {
  try {
    // Prepare chat history
    const chatHistory = messages.filter((msg) => msg.role !== "system")

    // Create a chat session
    const chat = model.startChat({
      history: chatHistory.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1000,
      },
    })

    // Add system prompt if provided
    const prompt = systemPrompt || messages.find((msg) => msg.role === "system")?.content || ""

    // Generate response
    const result = await chat.sendMessage(prompt)
    const response = result.response.text()

    return { response }
  } catch (error) {
    console.error("Error generating chat response:", error)
    return { error: "Failed to generate response" }
  }
}
