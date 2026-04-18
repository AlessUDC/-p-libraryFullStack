import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

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
      { bookId: book.bookId, barcode: '1000000001', location: 'Section A - Shelf 1', status: 'AVAILABLE' },
      { bookId: book.bookId, barcode: '1000000002', location: 'Section A - Shelf 1', status: 'AVAILABLE' }
    ]
  });

  // 6. Create Initial Admin User
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.create({
    data: {
      role: 'ADMINISTRATOR',
      code: 'ADMIN-001',
      password: passwordHash,
      userData: {
        create: {
          firstName: 'Admin',
          lastName: 'System',
          documentNumber: '00000000',
          email: 'admin@biblioteca.com',
          isActive: true
        }
      },
      administrator: {
        create: {
          dateAssignment: new Date()
        }
      }
    }
  });

  console.log('Seeding finished.');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
