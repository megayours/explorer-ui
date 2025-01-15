import { Project } from "@megayours/sdk";

export interface NFT {
  id: string;
  projectName: string;
  collectionName: string;
  tokenId: string;
  name: string;
  imageUrl: string;
  properties?: {
    [key: string]: any;
    attributes?: Array<{
      trait_type: string;
      value: string | number | boolean;
    }>;
  };
  project: Project;
}