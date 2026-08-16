const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findUnique({ where: { email: 'prof.smith@portal.edu' } });
  console.log('User found:', !!user);
  if (user) {
    console.log('User passwordHash:', user.passwordHash);
    const isValid = await bcrypt.compare('password123', user.passwordHash);
    console.log('Is valid:', isValid);
  }
}
check().catch(console.error).finally(() => prisma.$disconnect());
