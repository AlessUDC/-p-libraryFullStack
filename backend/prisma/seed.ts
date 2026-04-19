import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 0. Cleanup Database (Delete in reverse order of relations)
  console.log('Cleaning up database...');
  try {
    await prisma.copy.deleteMany();
    await prisma.bookAuthor.deleteMany();
    await prisma.bookCategory.deleteMany();
    await prisma.bookGenre.deleteMany();
    await prisma.book.deleteMany();
    await prisma.author.deleteMany();
    await prisma.category.deleteMany();
    await prisma.genre.deleteMany();
    await prisma.publisher.deleteMany();
    await prisma.administrator.deleteMany();
    await prisma.librarian.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.student.deleteMany();
    await prisma.user.deleteMany();
    await prisma.userData.deleteMany();
    await prisma.school.deleteMany();
    await prisma.faculty.deleteMany();
    await prisma.district.deleteMany();
    await prisma.province.deleteMany();
  } catch (error) {
    console.log('Some tables did not exist, skipping cleanup...');
  }

  console.log('Database cleaned. Starting data insertion...');

  // 1. Create a Publisher
  const publisher = await prisma.publisher.create({
    data: { title: 'Editorial Prisma Core' }
  });

  // 2. Create a Category and Genre
  const category = await prisma.category.create({
    data: { title: 'Technology' }
  });
  const genre = await prisma.genre.create({
    data: { title: 'Programming' }
  });

  // 3. Create an Author
  const author = await prisma.author.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      nationality: 'USA'
    }
  });

  // 4. Create a Book
  const book = await prisma.book.create({
    data: {
      title: 'Advanced Fullstack Development',
      isbn: '978-3-16-148410-0',
      publicationYear: 2026,
      edition: '1st',
      language: 'English',
      pageCount: 350,
      publisherId: publisher.publisherId,
      authors: {
        create: [{ authorId: author.authorId }]
      },
      categories: {
        create: [{ categoryId: category.categoryId }]
      },
      genres: {
        create: [{ genreId: genre.genreId }]
      }
    }
  });

  // 5. Create Copies for the Book
  await prisma.copy.createMany({
    data: [
      { bookId: book.bookId, barcode: '1000000001', location: 'Section A - Shelf 1', status: 'AVAILABLE' }
    ]
  });

  // 6. Create Provinces and Districts
  console.log('Inserting locations...');
  const lima = await prisma.province.create({
    data: {
      title: 'Lima',
      districts: {
        create: [
          { title: 'Santiago de Surco' },
          { title: 'Miraflores' },
          { title: 'San Isidro' }
        ]
      }
    },
    include: { districts: true }
  });

  const arequipa = await prisma.province.create({
    data: {
      title: 'Arequipa',
      districts: {
        create: [
          { title: 'Yanahuara' },
          { title: 'Cayma' }
        ]
      }
    },
    include: { districts: true }
  });

  // 7. Create Academic Hierarchy
  const faculty = await prisma.faculty.create({
    data: { title: 'Facultad de Ingeniería y Arquitectura' }
  });

  const school = await prisma.school.create({
    data: { 
      title: 'Escuela de Ingeniería de Sistemas',
      facultyId: faculty.facultyId
    }
  });

  // 7. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  // 7.1 Admin User
  await prisma.user.create({
    data: {
      role: 'ADMINISTRATOR',
      code: 'ADMIN-001',
      password: passwordHash,
      isConfirmed: true,
      userData: {
        create: {
          firstName: 'Admin',
          paternalLastName: 'Nexus',
          maternalLastName: 'System',
          documentType: 'DNI',
          documentNumber: '00000000',
          email: 'admin@biblioteca.com',
          isActive: true,
          maritalStatus: 'SINGLE',
          gender: 'MALE',
        }
      },
      administrator: {
        create: { dateAssignment: new Date() }
      }
    }
  });

  // 7.2 Test Student
  await prisma.user.create({
    data: {
      role: 'STUDENT',
      code: '2413010296',
      password: passwordHash,
      isConfirmed: true,
      userData: {
        create: {
          firstName: 'Aless',
          paternalLastName: 'Ursua',
          maternalLastName: 'DLC',
          documentType: 'DNI',
          documentNumber: '60748729',
          email: '2413010@untels.edu.pe',
          isActive: true,
          maritalStatus: 'SINGLE',
          gender: 'OTHER',
          districtId: lima.districts[0].districtId,
          address: 'Av. Los Próceres 123'
        }
      },
      student: {
        create: {
          cycle: 'V',
          schoolId: school.schoolId
        }
      }
    }
  });

  // 7.3 Test Teacher
  await prisma.user.create({
    data: {
      role: 'TEACHER',
      code: 'TEST-TEACHER-99',
      password: passwordHash,
      isConfirmed: true,
      userData: {
        create: {
          firstName: 'Ricardo',
          paternalLastName: 'Geldres',
          maternalLastName: 'Perez',
          documentType: 'DNI',
          documentNumber: '12345678',
          email: 'teacher@universidad.edu.pe',
          isActive: true,
          maritalStatus: 'MARRIED',
          gender: 'MALE',
        }
      },
      teacher: {
        create: {
          facultyId: faculty.facultyId,
          department: 'Ciencias de la Computación',
          specialization: 'Arquitectura de Software'
        }
      }
    }
  });

  // 7.4 Test Librarian
  await prisma.user.create({
    data: {
      role: 'LIBRARIAN',
      code: 'LIB-MASTER-001',
      password: passwordHash,
      isConfirmed: true,
      userData: {
        create: {
          firstName: 'Beatriz',
          paternalLastName: 'Lozano',
          maternalLastName: 'Silva',
          documentType: 'DNI',
          documentNumber: '87654321',
          email: 'librarian@biblioteca.com',
          isActive: true,
          maritalStatus: 'SINGLE',
          gender: 'FEMALE',
        }
      },
      librarian: {
        create: { shift: 'MORNING' }
      }
    }
  });

  console.log('Seeding finished successfully.');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
