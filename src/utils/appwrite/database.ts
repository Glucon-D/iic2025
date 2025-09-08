import { ID, Models, Query } from 'appwrite';
import { databases, DATABASE_ID, COLLECTIONS } from './config';

// User interface based on the schema
export interface User {
  $id?: string;
  userId: string; // Auth user ID
  username: string;
  location: string;
  farmsize?: string;
  crop?: string[];
  experience?: string;
  language?: string;
  $createdAt?: string;
  $updatedAt?: string;
}

// Thread interface based on the schema
export interface Thread {
  $id?: string;
  userId: string;
  title: string;
  description?: string;
  category?: string;
  priority?: string;
  status?: string;
  tags?: string[];
  messageCount?: number;
  lastMessageAt?: string;
  $createdAt?: string;
  $updatedAt?: string;
}

// Message interface based on the schema
export interface Message {
  $id?: string;
  threadId: string;
  userId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  contentType: 'text' | 'image' | 'voice' | 'file';
  attachment?: string;
  $createdAt?: string;
  $updatedAt?: string;
}

class DatabaseService {
  // User operations
  async createUser(userData: User): Promise<Models.Document> {
    try {
      const user = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USER,
        ID.unique(),
        userData
      );
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUser(userId: string): Promise<Models.Document> {
    try {
      const user = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.USER,
        userId
      );
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async getUserByUserId(userId: string): Promise<Models.Document | null> {
    try {
      const users = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USER,
        [Query.equal('userId', userId)]
      );
      return users.documents.length > 0 ? users.documents[0] : null;
    } catch (error) {
      console.error('Error getting user by userId:', error);
      throw error;
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<Models.Document> {
    try {
      const user = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USER,
        userId,
        userData
      );
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Thread operations
  async createThread(threadData: Thread): Promise<Models.Document> {
    try {
      const thread = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.THREAD,
        ID.unique(),
        {
          ...threadData,
          messageCount: 0,
          lastMessageAt: new Date().toISOString(),
        }
      );
      return thread;
    } catch (error) {
      console.error('Error creating thread:', error);
      throw error;
    }
  }

  async getThread(threadId: string): Promise<Models.Document> {
    try {
      const thread = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.THREAD,
        threadId
      );
      return thread;
    } catch (error) {
      console.error('Error getting thread:', error);
      throw error;
    }
  }

  async getUserThreads(userId: string): Promise<Models.DocumentList<Models.Document>> {
    try {
      const threads = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.THREAD,
        [
          Query.equal('userId', userId),
          Query.orderDesc('$updatedAt'),
        ]
      );
      return threads;
    } catch (error) {
      console.error('Error getting user threads:', error);
      throw error;
    }
  }

  async updateThread(threadId: string, threadData: Partial<Thread>): Promise<Models.Document> {
    try {
      const thread = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.THREAD,
        threadId,
        threadData
      );
      return thread;
    } catch (error) {
      console.error('Error updating thread:', error);
      throw error;
    }
  }

  // Message operations
  async createMessage(messageData: Message): Promise<Models.Document> {
    try {
      const message = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.MESSAGE,
        ID.unique(),
        messageData
      );

      // Update thread's message count and last message time
      await this.updateThread(messageData.threadId, {
        lastMessageAt: new Date().toISOString(),
      });

      return message;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  async getThreadMessages(threadId: string): Promise<Models.DocumentList<Models.Document>> {
    try {
      const messages = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MESSAGE,
        [
          Query.equal('threadId', threadId),
          Query.orderAsc('$createdAt'),
        ]
      );
      return messages;
    } catch (error) {
      console.error('Error getting thread messages:', error);
      throw error;
    }
  }

  async getMessage(messageId: string): Promise<Models.Document> {
    try {
      const message = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.MESSAGE,
        messageId
      );
      return message;
    } catch (error) {
      console.error('Error getting message:', error);
      throw error;
    }
  }

  async updateMessage(messageId: string, messageData: Partial<Message>): Promise<Models.Document> {
    try {
      const message = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.MESSAGE,
        messageId,
        messageData
      );
      return message;
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.MESSAGE,
        messageId
      );
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }
}

export const databaseService = new DatabaseService();
