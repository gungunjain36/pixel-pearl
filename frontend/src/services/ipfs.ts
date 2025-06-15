    // frontend/src/services/ipfs.ts
    import { create as createIpfsHttpClient } from 'ipfs-http-client';

    // Using local IPFS daemon for simplicity. For production, use Pinata, Infura IPFS, or similar.
    const ipfs = createIpfsHttpClient({ host: 'localhost', port: 5001, protocol: 'http' });

    export const uploadToIpfs = async (file: File): Promise<string> => {
      try {
        const result = await ipfs.add(file);
        console.log("IPFS Upload Result:", result);
        // Construct the public gateway URL. Use a reliable one for production.
        return `https://ipfs.io/ipfs/${result.path}`;
      } catch (error) {
        console.error("Error uploading file to IPFS:", error);
        throw error;
      }
    };
    