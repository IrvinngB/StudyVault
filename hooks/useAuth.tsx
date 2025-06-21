import type { AuthSession, UserProfile } from '@/database/models/types';
import { authService } from '@/database/services/authService';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: UserProfile | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData?: { name?: string }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);  const initialize = useCallback(async () => {
    try {
      // Initialize auth service
      await authService.initialize();
      
      // Get current session
      const currentSession = await authService.getCurrentSession();
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initialize();    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((session) => {
      setSession(session);
      setUser(session?.user || null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [initialize]);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authService.signIn(email, password);
      
      if (result.success && result.data) {
        setSession(result.data);
        setUser(result.data.user);
      }
      
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al iniciar sesión'
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, userData?: { name?: string }) => {
    setIsLoading(true);
    try {
      const result = await authService.signUp(email, password, userData);
      
      if (result.success && result.data) {
        setSession(result.data);
        setUser(result.data.user);
      }
      
      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear la cuenta'
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);    try {
      await authService.signOut();
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      return await authService.resetPassword(email);
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al restablecer la contraseña'
      };
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      const result = await authService.updateProfile(updates);
      
      if (result.success && result.data) {
        setUser(result.data);
        // Update session user as well
        if (session) {
          setSession({
            ...session,
            user: result.data
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar el perfil'
      };
    }
  }, [session]);

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!session && !!user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
