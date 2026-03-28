// /services/authService.ts
import bcryptjs from 'bcryptjs';
import { UserRepository } from '@/repositories/userRepository';
import { SignupInput, LoginInput } from '@/lib/validations';
import { AuthResponse } from '@/types/auth';

export class AuthService {
  private memoryUsers: Array<{
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
  }> = [];
  private useMemory = false;

  // ✅ Instantiate repository at runtime
  private userRepository = new UserRepository();

  /**
   * Hash password using bcryptjs
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcryptjs.genSalt(10);
    return bcryptjs.hash(password, salt);
  }

  /**
   * Compare password with hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcryptjs.compare(password, hash);
  }

  /**
   * Flag database problems and switch to in-memory mode
   */
  private markDbError(err: any) {
    if (err?.message?.includes('Authentication failed')) {
      console.warn('DB connection failed, switching to in-memory store');
      this.useMemory = true;
    }
  }

  /**
   * Register a new user
   */
  async signup(input: SignupInput): Promise<AuthResponse> {
    if (this.useMemory) {
      const existing = this.memoryUsers.find(u => u.email === input.email);
      if (existing) {
        return { success: false, error: 'Email already registered' };
      }
      const hashedPassword = await this.hashPassword(input.password);
      const newUser = {
        id: crypto.randomUUID(),
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: 'STAFF',
      };
      this.memoryUsers.push(newUser);
      return {
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      };
    }

    try {
      const existingUser = await this.userRepository.findByEmail(input.email);
      if (existingUser) {
        return { success: false, error: 'Email already registered' };
      }

      const hashedPassword = await this.hashPassword(input.password);
      const user = await this.userRepository.create({
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: 'STAFF',
      });

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      console.error('Signup error:', error);
      this.markDbError(error);
      if (this.useMemory) {
        return this.signup(input);
      }
      return { success: false, error: 'Failed to create user' };
    }
  }

  /**
   * Authenticate user
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    if (this.useMemory) {
      const user = this.memoryUsers.find(u => u.email === input.email);
      if (!user) return { success: false, error: 'Invalid email or password' };

      const valid = await this.comparePassword(input.password, user.password);
      if (!valid) return { success: false, error: 'Invalid email or password' };

      return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
    }

    try {
      const user = await this.userRepository.findByEmail(input.email);
      if (!user) return { success: false, error: 'Invalid email or password' };

      const valid = await this.comparePassword(input.password, user.password);
      if (!valid) return { success: false, error: 'Invalid email or password' };

      return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
    } catch (error) {
      console.error('Login error:', error);
      this.markDbError(error);
      if (this.useMemory) return this.login(input);
      return { success: false, error: 'Login failed' };
    }
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) return null;
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }
}

// ✅ Export instance safely at runtime
export const authService = new AuthService();