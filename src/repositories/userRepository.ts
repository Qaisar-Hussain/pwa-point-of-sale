import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: { name: string; email: string; password: string; role?: Role }) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role || 'STAFF',
      },
    });
  }

  async update(id: string, data: Partial<{ name: string; email: string; role: Role }>) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }

  async findAll() {
    return prisma.user.findMany();
  }
}

export const userRepository = new UserRepository();
