import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-sonnet-4-20250514" which was released May 14, 2025. Use this by default unless user has already selected claude-3-7-sonnet-20250219
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY_ENV_VAR || "",
});

export async function generateChatResponse(message: string): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      max_tokens: 2000,
      messages: [{ role: 'user', content: message }],
      model: 'claude-sonnet-4-20250514',
      system: "You are AI Assistant Pro, a sophisticated AI helper with expertise in code generation, analysis, and secure computing. Always provide detailed, secure, and production-ready solutions."
    });

    return response.content[0].type === 'text' ? response.content[0].text : "I apologize, but I couldn't generate a response.";
  } catch (error) {
    console.error("Anthropic API error:", error);
    throw new Error("Failed to generate AI response. Please check your Anthropic API key configuration.");
  }
}

export async function generateCode(prompt: string): Promise<{ code: string; explanation: string }> {
  try {
    const response = await anthropic.messages.create({
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
      model: 'claude-sonnet-4-20250514',
      system: "You are a code generation expert. Generate secure, production-ready code with detailed explanations. Always include security considerations and best practices. Respond in JSON format with 'code' and 'explanation' fields."
    });

    const result = JSON.parse(response.content[0].type === 'text' ? response.content[0].text : "{}");
    return {
      code: result.code || "// Code generation failed",
      explanation: result.explanation || "No explanation available"
    };
  } catch (error) {
    console.error("Anthropic code generation error:", error);
    throw new Error("Failed to generate code. Please check your Anthropic API key configuration.");
  }
}

export async function analyzeSentiment(text: string): Promise<{ sentiment: string, confidence: number }> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      system: `You're a Customer Insights AI. Analyze this feedback and output in JSON format with keys: "sentiment" (positive/negative/neutral) and "confidence" (number, 0 through 1).`,
      max_tokens: 1024,
      messages: [
        { role: 'user', content: text }
      ],
    });

    const result = JSON.parse(response.content[0].type === 'text' ? response.content[0].text : "{}");
    return {
      sentiment: result.sentiment || 'neutral',
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5))
    };
  } catch (error) {
    console.error("Anthropic sentiment analysis error:", error);
    throw new Error("Failed to analyze sentiment. Please check your Anthropic API key configuration.");
  }
}
