import { ID, Models } from "appwrite";
import { account } from "./config";

export interface CreateUserAccount {
  email: string;
  password: string;
  name: string;
}

export interface LoginUser {
  email: string;
  password: string;
}

class AuthService {
  // Create a new user account
  async createAccount({
    email,
    password,
    name,
  }: CreateUserAccount): Promise<Models.User<Models.Preferences>> {
    try {
      const userAccount = await account.create(
        ID.unique(),
        email,
        password,
        name
      );

      if (userAccount) {
        // Automatically log in the user after account creation
        await this.login({ email, password });
        const user = await this.getCurrentUser();
        return user || userAccount;
      }

      return userAccount;
    } catch (error) {
      console.error("Error creating account:", error);
      throw error;
    }
  }

  // Login user
  async login({ email, password }: LoginUser): Promise<Models.Session> {
    try {
      // First, try to get current session to check if user is already logged in
      try {
        const currentSession = await account.getSession("current");
        if (currentSession) {
          // User is already logged in, delete the current session first
          await account.deleteSession("current");
        }
      } catch (error) {
        // No active session, which is fine
      }

      const session = await account.createEmailPasswordSession(email, password);
      return session;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
    try {
      const currentUser = await account.get();
      return currentUser;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await account.deleteSessions();
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  }

  // Get user sessions
  async getSessions(): Promise<Models.SessionList> {
    try {
      const sessions = await account.listSessions();
      return sessions;
    } catch (error) {
      console.error("Error getting sessions:", error);
      throw error;
    }
  }

  // Update user name
  async updateName(name: string): Promise<Models.User<Models.Preferences>> {
    try {
      const user = await account.updateName(name);
      return user;
    } catch (error) {
      console.error("Error updating name:", error);
      throw error;
    }
  }

  // Update user email
  async updateEmail(
    email: string,
    password: string
  ): Promise<Models.User<Models.Preferences>> {
    try {
      const user = await account.updateEmail(email, password);
      return user;
    } catch (error) {
      console.error("Error updating email:", error);
      throw error;
    }
  }

  // Update user password
  async updatePassword(
    newPassword: string,
    oldPassword: string
  ): Promise<Models.User<Models.Preferences>> {
    try {
      const user = await account.updatePassword(newPassword, oldPassword);
      return user;
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  }

  // Send password recovery email
  async sendPasswordRecovery(email: string): Promise<Models.Token> {
    try {
      const recovery = await account.createRecovery(
        email,
        `${window.location.origin}/reset-password`
      );
      return recovery;
    } catch (error) {
      console.error("Error sending password recovery:", error);
      throw error;
    }
  }

  // Complete password recovery
  async completePasswordRecovery(
    userId: string,
    secret: string,
    newPassword: string
  ): Promise<Models.Token> {
    try {
      const recovery = await account.updateRecovery(
        userId,
        secret,
        newPassword
      );
      return recovery;
    } catch (error) {
      console.error("Error completing password recovery:", error);
      throw error;
    }
  }

  // Send email verification
  async sendEmailVerification(): Promise<Models.Token> {
    try {
      const verification = await account.createVerification(
        `${window.location.origin}/verify-email`
      );
      return verification;
    } catch (error) {
      console.error("Error sending email verification:", error);
      throw error;
    }
  }

  // Complete email verification
  async completeEmailVerification(
    userId: string,
    secret: string
  ): Promise<Models.Token> {
    try {
      const verification = await account.updateVerification(userId, secret);
      return verification;
    } catch (error) {
      console.error("Error completing email verification:", error);
      throw error;
    }
  }
}

export const authService = new AuthService();
