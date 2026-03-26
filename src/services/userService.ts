import { userRepository } from '@/repositories/userRepository';

export class UserService {
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
      createdAt: user.createdAt,
    };
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers() {
    const users = await userRepository.findAll();
    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    }));
  }

  /**
   * Update user profile
   */
  async updateUser(id: string, data: { name?: string; email?: string; role?: string }) {
    // Check if email is being changed to existing email
    if (data.email) {
      const existingUser = await userRepository.findByEmail(data.email);
      if (existingUser && existingUser.id !== id) {
        return {
          success: false,
          error: 'Email already in use',
        };
      }
    }

    try {
      const user = await userRepository.update(id, data);
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
      await userRepository.delete(id);
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
    const user = await userRepository.findByEmail(email);
    return !!user;
  }
}

export const userService = new UserService();
