import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { RepositoryFactory } from '../database/repositories';
import { User } from '../database/schemas/user.schema';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AUTH_STORAGE_KEY = '@studyvault_auth';

export class AuthService {
  private userRepository = RepositoryFactory.getUserRepository();

  // Hashear password (simple para SQLite local)
  private async hashPassword(password: string): Promise<string> {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );
  }

  // Validar email
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Registrar nuevo usuario
  async register(data: RegisterData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Validaciones
      if (!this.isValidEmail(data.email)) {
        return { success: false, error: 'Email inválido' };
      }

      if (data.password.length < 6) {
        return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
      }

      if (data.name.trim().length < 2) {
        return { success: false, error: 'El nombre debe tener al menos 2 caracteres' };
      }

      // Verificar si ya existe el email
      const existingUsers = await this.userRepository.getAll();
      const emailExists = existingUsers.some(user => user.email === data.email);
      
      if (emailExists) {
        return { success: false, error: 'Este email ya está registrado' };
      }

      // Crear usuario
      const hashedPassword = await this.hashPassword(data.password);
      const newUser = await this.userRepository.create({
        name: data.name.trim(),
        email: data.email.toLowerCase(),
        password_hash: hashedPassword,
        preferences: {
          theme: 'system',
          notifications_enabled: true,
          default_reminder_time: 15,
          study_goal_hours_per_day: 4,
          first_day_of_week: 1
        }
      });

      // Guardar sesión
      await this.saveSession(newUser);

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, error: 'Error interno. Intenta de nuevo.' };
    }
  }

  // Login
  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      if (!this.isValidEmail(credentials.email)) {
        return { success: false, error: 'Email inválido' };
      }

      const users = await this.userRepository.getAll();
      const user = users.find(u => u.email === credentials.email.toLowerCase());

      if (!user) {
        return { success: false, error: 'Usuario no encontrado' };
      }

      const hashedPassword = await this.hashPassword(credentials.password);
      if (user.password_hash !== hashedPassword) {
        return { success: false, error: 'Contraseña incorrecta' };
      }

      // Actualizar último login
      const updatedUser = await this.userRepository.update(user.id, {
        last_login: new Date().toISOString()
      });

      await this.saveSession(updatedUser);

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: 'Error interno. Intenta de nuevo.' };
    }
  }

  // Logout
  async logout(): Promise<void> {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  }

  // Recuperar sesión guardada
  async getStoredSession(): Promise<User | null> {
    try {
      const storedData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (!storedData) return null;

      const { userId } = JSON.parse(storedData);
      return await this.userRepository.getById(userId);
    } catch (error) {
      console.error('Error recuperando sesión:', error);
      return null;
    }
  }

  // Guardar sesión
  private async saveSession(user: User): Promise<void> {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      userId: user.id,
      email: user.email,
      loginTime: new Date().toISOString()
    }));
  }
}
