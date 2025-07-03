import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '') {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  async generateResponse(query: string, context: any[]) {
    try {
      const prompt = `
You are Docsy, a helpful AI assistant for government documents and programs. 
You're friendly, knowledgeable, and always eager to help users understand government services.

User Query: ${query}

Context from documents:
${context.map(doc => `
Title: ${doc.title}
Content: ${doc.content}
Source: ${doc.source}
`).join('\n---\n')}

Please provide a helpful, accurate response based on the context provided. If the information isn't available in the context, let the user know politely.
Keep your response conversational and easy to understand.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini generation error:', error);
      throw error;
    }
  }

  async summarizeDocuments(documents: any[]) {
    try {
      const prompt = `
Please summarize these government documents in a clear, concise way:

${documents.map(doc => `
Title: ${doc.title}
Content: ${doc.content}
`).join('\n---\n')}

Provide a brief summary that highlights the key information from these documents.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini summarization error:', error);
      throw error;
    }
  }
}