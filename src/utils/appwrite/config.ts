import { Client, Account, Databases, Storage } from "appwrite";

// Appwrite configuration
export const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
  userCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID!,
  threadCollectionId: process.env.NEXT_PUBLIC_APPWRITE_THREAD_COLLECTION_ID!,
  messageCollectionId: process.env.NEXT_PUBLIC_APPWRITE_MESSAGE_COLLECTION_ID!,
  bucketId: 'iic-bucket',
};

// Initialize Appwrite client
export const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Server-side client (for API routes)
export const createServerClient = (apiKey?: string) => {
  const serverClient = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId);

  if (apiKey) {
    (serverClient as any).setKey(apiKey);
  }

  return {
    client: serverClient,
    account: new Account(serverClient),
    databases: new Databases(serverClient),
    storage: new Storage(serverClient),
  };
};

// Collection IDs for easy access
export const COLLECTIONS = {
  USER: appwriteConfig.userCollectionId,
  THREAD: appwriteConfig.threadCollectionId,
  MESSAGE: appwriteConfig.messageCollectionId,
} as const;

// Database ID
export const DATABASE_ID = appwriteConfig.databaseId;

// Bucket ID
export const BUCKET_ID = appwriteConfig.bucketId;
