// IPFS service using Pinata for file upload and retrieval
export interface UploadResult {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export interface MemeMetadata {
  name: string;
  description: string;
  image: string;
  creator: string;
  createdAt: string;
  contentType: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

export interface MysteryBoxMetadata {
  name: string;
  description: string;
  contentType: string;
  isRevealed: boolean;
  revealContent?: string;
  creator: string;
  createdAt: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

// Upload file to IPFS using Pinata REST API
export const uploadFileToIPFS = async (file: File): Promise<UploadResult> => {
  try {
    console.log('Uploading file to IPFS via Pinata:', file.name);
    
    const formData = new FormData();
    formData.append('file', file);
    
    const pinataMetadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        timestamp: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', pinataMetadata);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_PINATA_JWT}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('File uploaded successfully:', result);
    
    return {
      IpfsHash: result.IpfsHash,
      PinSize: result.PinSize,
      Timestamp: result.Timestamp
    };
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw new Error('Failed to upload file to IPFS: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

// Upload JSON metadata to IPFS using Pinata REST API
export const uploadJSONToIPFS = async (metadata: MemeMetadata | MysteryBoxMetadata): Promise<UploadResult> => {
  try {
    console.log('Uploading JSON metadata to IPFS:', metadata);
    
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_PINATA_JWT}`
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `metadata_${Date.now()}`,
          keyvalues: {
            timestamp: new Date().toISOString()
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('JSON metadata uploaded successfully:', result);
    
    return {
      IpfsHash: result.IpfsHash,
      PinSize: result.PinSize,
      Timestamp: result.Timestamp
    };
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    throw new Error('Failed to upload JSON to IPFS: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

// Get file from IPFS
export const getFileFromIPFS = async (hash: string): Promise<Blob> => {
  try {
    const gateway = import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud';
    const response = await fetch(`${gateway}/ipfs/${hash}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.blob();
  } catch (error) {
    console.error('Error fetching file from IPFS:', error);
    throw new Error('Failed to fetch file from IPFS: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

// Get JSON metadata from IPFS
export const getJSONFromIPFS = async (hash: string): Promise<MemeMetadata | MysteryBoxMetadata | Record<string, unknown>> => {
  try {
    const gateway = import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud';
    const response = await fetch(`${gateway}/ipfs/${hash}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching JSON from IPFS:', error);
    throw new Error('Failed to fetch JSON from IPFS: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

// Create metadata for meme
export const createMemeMetadata = (
  name: string,
  description: string,
  imageHash: string,
  creator: string,
  contentType: string = 'image'
): MemeMetadata => {
  return {
    name,
    description,
    image: `ipfs://${imageHash}`,
    creator,
    createdAt: new Date().toISOString(),
    contentType,
    attributes: [
      {
        trait_type: "Creator",
        value: creator
      },
      {
        trait_type: "Content Type",
        value: contentType
      },
      {
        trait_type: "Created At",
        value: new Date().toLocaleDateString()
      }
    ]
  };
};

// Create metadata for mystery box
export const createMysteryBoxMetadata = (
  name: string,
  description: string,
  creator: string,
  contentType: string,
  isRevealed: boolean = false,
  revealContent?: string
): MysteryBoxMetadata => {
  return {
    name,
    description,
    contentType,
    isRevealed,
    revealContent,
    creator,
    createdAt: new Date().toISOString(),
    attributes: [
      {
        trait_type: "Creator",
        value: creator
      },
      {
        trait_type: "Content Type",
        value: contentType
      },
      {
        trait_type: "Status",
        value: isRevealed ? "Revealed" : "Mystery"
      },
      {
        trait_type: "Created At",
        value: new Date().toLocaleDateString()
      }
    ]
  };
};

export default {
  uploadFileToIPFS,
  uploadJSONToIPFS,
  getFileFromIPFS,
  getJSONFromIPFS,
  createMemeMetadata,
  createMysteryBoxMetadata
};
