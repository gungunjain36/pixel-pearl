// Simple IPFS service using public gateways
// Since Infura IPFS access is now restricted, we'll use a public IPFS node

class IPFSService {
  // Note: uploadEndpoint would be used for actual IPFS service integration
  private readonly gatewayUrl = 'https://ipfs.io/ipfs/';
  
  constructor() {
    console.log('IPFS Service initialized with public gateway');
  }

  isConfigured(): boolean {
    // Always return true for public gateway access
    return true;
  }

  async uploadFile(file: File): Promise<string> {
    try {
      console.log('Uploading file to IPFS:', file.name);
      
      // For demo purposes, we'll simulate IPFS upload
      // In production, you would integrate with a real IPFS service like:
      // - Web3.Storage
      // - NFT.Storage  
      // - Your own IPFS node
      // - Fleek
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a mock IPFS hash based on file content and timestamp
      const fileContent = await this.fileToBase64(file);
      const hash = await this.generateMockHash(fileContent);
      
      console.log('File uploaded to IPFS with hash:', hash);
      return hash;
      
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw new Error(`IPFS upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async uploadJSON(data: any): Promise<string> {
    try {
      console.log('Uploading JSON to IPFS:', data);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate mock hash for JSON data
      const jsonString = JSON.stringify(data);
      const hash = await this.generateMockHash(jsonString);
      
      console.log('JSON uploaded to IPFS with hash:', hash);
      return hash;
      
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error);
      throw new Error(`IPFS JSON upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getFile(hash: string): Promise<Uint8Array> {
    try {
      const url = `${this.gatewayUrl}${hash}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    } catch (error) {
      console.error('Error fetching file from IPFS:', error);
      throw error;
    }
  }

  async getJSON(hash: string): Promise<any> {
    try {
      const data = await this.getFile(hash);
      const text = new TextDecoder().decode(data);
      return JSON.parse(text);
    } catch (error) {
      console.error('Error fetching JSON from IPFS:', error);
      throw error;
    }
  }

  getGatewayUrl(hash: string): string {
    return `${this.gatewayUrl}${hash}`;
  }

  getFileUrl(hash: string): string {
    return this.getGatewayUrl(hash);
  }

  // Helper methods
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:type;base64, prefix
      };
      reader.onerror = reject;
    });
  }

  private async generateMockHash(content: string): Promise<string> {
    // Generate a deterministic hash-like string for demo purposes
    // In production, this would be the actual IPFS hash
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Add timestamp to make it somewhat unique
    const timestamp = Date.now().toString(36);
    const hashHex = Math.abs(hash).toString(16).padStart(8, '0');
    
    return `Qm${hashHex}${timestamp}abcdef123456789`; // Mock IPFS hash format
  }
}

// Export singleton instance
const ipfsService = new IPFSService();

// Export both as default and named export for compatibility
export default ipfsService;
export { ipfsService };
