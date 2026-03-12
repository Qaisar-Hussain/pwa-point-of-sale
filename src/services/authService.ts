import bcryptjs from 'bcryptjs';
import { userRepository } from '@/repositories/userRepository';
import { SignupInput, LoginInput } from '@/lib/validations';

export class AuthService {
  // in-memory fallback state
  private memoryUsers: Array<{
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
  }> = [];
  private useMemory = false;

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
  async signup(input: SignupInput) {
    // If we've already decided to run in memory, use that store
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

    // Normal DB flow
    try {
      const existingUser = await userRepository.findByEmail(input.email);
      if (existingUser) {
        return {
          success: false,
          error: 'Email already registered',
        };
      }

      const hashedPassword = await this.hashPassword(input.password);
      const user = await userRepository.create({
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
        // try memory fallback after marking
        return this.signup(input);
      }
      return {
        success: false,
        error: 'Failed to create user',
      };
    }
  }

  /**
   * Authenticate user with email and password
   */
  async login(input: LoginInput) {
    // in-memory mode
    if (this.useMemory) {
      console.debug('memoryUsers contents:', this.memoryUsers);
      const user = this.memoryUsers.find(u => u.email === input.email);
      if (!user) {
        console.debug('no user found in memory for', input.email);
        return { success: false, error: 'Invalid email or password' };
      }
      const isPasswordValid = await this.comparePassword(input.password, user.password);
      if (!isPasswordValid) {
        console.debug('password mismatch for', input.email);
        return { success: false, error: 'Invalid email or password' };
      }
      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    }

    try {
      const user = await userRepository.findByEmail(input.email);
      
      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Compare password
      const isPasswordValid = await this.comparePassword(input.password, user.password);
      
      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

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
      console.error('Login error:', error);
      this.markDbError(error);
      if (this.useMemory) {
        return this.login(input);
      }
      return {
        success: false,
        error: 'Login failed',
      };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}

export const authService = new AuthService();
