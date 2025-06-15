import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AuthService, AuthState, LoginCredentials, RegisterData } from '../auth/AuthService';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  const authService = new AuthService();

  // Recuperar sesión al iniciar
  useEffect(() => {
    const loadStoredSession = async () => {
      try {
        const user = await authService.getStoredSession();
        setState({
          user,
          isAuthenticated: !!user,
          isLoading: false
        });
      } catch (error) {
        console.error('Error loading session:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadStoredSession();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    const result = await authService.login(credentials);
    
    if (result.success && result.user) {
      setState({
        user: result.user,
        isAuthenticated: true,
        isLoading: false
      });
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }

    return { success: result.success, error: result.error };
  };

  const register = async (data: RegisterData) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    const result = await authService.register(data);
    
    if (result.success && result.user) {
      setState({
        user: result.user,
        isAuthenticated: true,
        isLoading: false
      });
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }

    return { success: result.success, error: result.error };
  };

  const logout = async () => {
    await authService.logout();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
