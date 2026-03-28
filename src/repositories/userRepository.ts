// /repositories/userRepository.ts
import prisma from '@/lib/prisma';

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async create(data: { name: string; email: string; password: string; role?: string }) {
    return prisma.user.create({ data: { ...data, role: data.role || 'STAFF' } });
  }

  async update(id: string, data: Partial<{ name: string; email: string; role: string }>) {
    return prisma.user.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }

  async findAll() {
    return prisma.user.findMany();
  }
}

// ❌ Remove the singleton export
// export const userRepository = new UserRepository();