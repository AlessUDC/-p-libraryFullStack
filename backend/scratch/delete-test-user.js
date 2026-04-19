const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Buscar el usuario que creaste antes
    const user = await prisma.user.findUnique({
      where: { code: "123456789" },
      include: { userData: true }
    });

    if (user) {
      await prisma.student.deleteMany({ where: { userId: user.userId } });
      await prisma.user.delete({ where: { userId: user.userId } });
      await prisma.userData.delete({ where: { userDataId: user.userDataId } });
      console.log('Usuario de prueba anterior eliminado.');
    } else {
      console.log('No se encontró el usuario de prueba anterior.');
    }
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
