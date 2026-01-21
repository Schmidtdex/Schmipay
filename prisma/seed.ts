import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.create({
      data: {
        email: 'guilherme.schmidt@sou.inteli.edu.br',
        name: 'Guilherme Schmidt',
      },
    });
    console.log('Usuário criado:', user);
  } catch (e) {
    console.error('Erro ao criar usuário:', e);
    throw e;
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });