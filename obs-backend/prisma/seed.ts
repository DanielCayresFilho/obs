import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando processo de inicialização do banco de dados...');

  // Limpando dados existentes (ordem reversa de dependências)
  console.log('🧹 Limpando banco de dados...');
  await prisma.stockMovement.deleteMany({});
  await prisma.appointments.deleteMany({});
  await prisma.commands.deleteMany({});
  await prisma.budgets.deleteMany({});
  await prisma.sales.deleteMany({});
  await prisma.financials.deleteMany({});
  await prisma.stock.deleteMany({});
  await prisma.clients.deleteMany({});
  await prisma.users.deleteMany({});

  // Criando usuário principal
  console.log('👤 Criando usuário administrador...');
  const hashedPassword = await hash('<@22.SeNh4Massaçç', 10);

  await prisma.users.create({
    data: {
      username: 'joycecayres',
      name: 'Joyce Cayres',
      email: 'joyce@obscuratattoo.com',
      password: hashedPassword,
      birthday: new Date('1990-01-01T00:00:00.000Z'),
    },
  });

  console.log('✅ Banco de dados inicializado com sucesso!');
  console.log('📝 Usuário criado: joycecayres');
  console.log('🔐 Use as credenciais fornecidas para fazer login');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });