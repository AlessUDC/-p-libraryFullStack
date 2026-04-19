import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const faculties = await prisma.faculty.findMany();
    const schools = await prisma.school.findMany({
      include: { faculty: true }
    });

    console.log('--- FACULTADES ---');
    faculties.forEach(f => console.log(`${f.title}: ${f.facultyId}`));

    console.log('\n--- ESCUELAS ---');
    schools.forEach(s => console.log(`${s.title} (Facultad: ${s.faculty.title}): ${s.schoolId}`));
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
