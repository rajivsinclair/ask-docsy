// MCP Client for connecting to the MCP server
export class MCPClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'http://localhost:3001') {
    this.baseUrl = baseUrl;
  }

  async searchDocuments(query: string, filters?: {
    program?: string;
    agency?: string;
    dateRange?: { start: Date; end: Date };
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          filters,
        }),
      });

      if (!response.ok) {
        throw new Error(`MCP server error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('MCP search error:', error);
      throw error;
    }
  }

  async getPrograms() {
    try {
      const response = await fetch(`${this.baseUrl}/programs`);
      if (!response.ok) {
        throw new Error(`MCP server error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('MCP programs error:', error);
      throw error;
    }
  }

  async getAgencies() {
    try {
      const response = await fetch(`${this.baseUrl}/agencies`);
      if (!response.ok) {
        throw new Error(`MCP server error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('MCP agencies error:', error);
      throw error;
    }
  }
}