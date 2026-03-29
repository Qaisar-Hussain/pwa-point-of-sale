import { UserRepository } from '@/repositories/userRepository';

export class UserService {
  private userRepository = new UserRepository();

  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: (user as any).role || 'STAFF',
      createdAt: user.createdAt,
    };
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers() {
    const users = await this.userRepository.findAll();
    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: (user as any).role || 'STAFF',
      createdAt: user.createdAt,
    }));
  }

  /**
   * Update user profile
   */
  async updateUser(id: string, data: { name?: string; email?: string; role?: string }) {
    // Check if email is being changed to existing email
    if (data.email) {
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser && existingUser.id !== id) {
        return {
          success: false,
          error: 'Email already in use',
        };
      }
    }

    try {
      const user = await this.userRepository.update(id, data);
      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: (user as any).role || 'STAFF',
        },
      };
    } catch (error) {
      console.error('Update user error:', error);
      return {
        success: false,
        error: 'Failed to update user',
      };
    }
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(id: string) {
    try {
      await this.userRepository.delete(id);
      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      console.error('Delete user error:', error);
      return {
        success: false,
        error: 'Failed to delete user',
      };
    }
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const user = await this.userRepository.findByEmail(email);
    return !!user;
  }
}

export const userService = new UserService();
