import { apiClient } from '../api/client';
import type { AuthSession, UserProfile } from '../models/types';

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
  /**
   * Initialize the auth service
   */
  public async initialize(): Promise<void> {
    try {
      await apiClient.initialize();
    } catch (error) {
      console.error('❌ Failed to initialize auth service:', error);
      throw error;
    }
  }

  /**
   * Sign in with email and password
   */  public async signIn(email: string, password: string): Promise<{ success: boolean; data?: AuthSession; error?: string }> {
    try {
      const result = await apiClient.signIn(email, password);
      
      if (result.success && result.data) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('💥 Sign in error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Sign up with email and password
   */  public async signUp(email: string, password: string, userData?: { name?: string }): Promise<{ success: boolean; data?: AuthSession; error?: string }> {
    try {
      const result = await apiClient.signUp(email, password, userData?.name);
      
      if (result.success && result.data) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('💥 Sign up error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Sign out
   */  public async signOut(): Promise<void> {
    try {
      await apiClient.signOut();
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  }
  /**
   * Reset password
   */
  public async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // For now, return a mock response since password reset isn't implemented in API
      return { 
        success: true 
      };
    } catch (error) {
      console.error('❌ Reset password error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Update user profile
   */  public async updateProfile(updates: Partial<UserProfile>): Promise<{ success: boolean; data?: UserProfile; error?: string }> {
    try {
      // For now, return a mock response since profile update isn't implemented in API
      const currentUser = apiClient.getCurrentUser();
      if (currentUser?.user) {
        const updatedUser = { ...currentUser.user, ...updates };
        return { 
          success: true, 
          data: updatedUser 
        };
      } else {
        return { 
          success: false, 
          error: 'No authenticated user found' 
        };
      }
    } catch (error) {
      console.error('❌ Update profile error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get current session
   */
  public async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const user = apiClient.getCurrentUser();
      return user;
    } catch (error) {
      console.error('❌ Get current session error:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Listen for auth state changes
   */
  public onAuthStateChange(callback: (session: AuthSession | null) => void): { data: { subscription: { unsubscribe: () => void } } } {
    // For now, return a mock subscription
    // In a real implementation, you'd set up listeners for auth state changes
    return {
      data: {
        subscription: {          unsubscribe: () => {
            // Auth state listener unsubscribed
          }
        }
      }
    };
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
