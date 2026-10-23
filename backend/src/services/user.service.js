import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { orders: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return users;
};

export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      orders: {
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  return user;
};

export const updateUser = async (id, currentUserId, data) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Check role update safeguards
  if (data.role && data.role !== user.role) {
    const validRoles = ['CUSTOMER', 'ADMIN'];
    const normalizedRole = data.role.toUpperCase();
    if (!validRoles.includes(normalizedRole)) {
      throw new Error('Rol no válido. Debe ser CUSTOMER o ADMIN.');
    }
    data.role = normalizedRole;

    // Prevent demoting self
    if (currentUserId === id && data.role !== 'ADMIN') {
      throw new Error('No podés removerte a vos mismo el rol de Administrador.');
    }

    // Prevent demoting the last admin
    if (user.role === 'ADMIN' && data.role !== 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        throw new Error('No se puede remover el rol de Administrador al único administrador existente.');
      }
    }
  }

  // Check if email already exists on another user
  if (data.email && data.email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing && existing.id !== id) {
      throw new Error('El correo electrónico ya está registrado por otro usuario.');
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      name: data.name !== undefined ? data.name : user.name,
      email: data.email !== undefined ? data.email : user.email,
      phone: data.phone !== undefined ? data.phone : user.phone,
      role: data.role !== undefined ? data.role : user.role,
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { orders: true }
      }
    }
  });

  return updated;
};

export const deleteUser = async (id, currentUserId) => {
  if (currentUserId === id) {
    throw new Error('No podés eliminar tu propia cuenta de administrador.');
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  if (user.role === 'ADMIN') {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (adminCount <= 1) {
      throw new Error('No podés eliminar al único administrador del sistema.');
    }
  }

  // Remove tokens
  await prisma.refreshToken.deleteMany({ where: { userId: id } });

  // Unlink orders so history/totals are preserved without foreign key failure
  await prisma.order.updateMany({
    where: { userId: id },
    data: { userId: null }
  });

  // Delete user
  await prisma.user.delete({ where: { id } });

  return { message: 'Usuario eliminado correctamente' };
};

