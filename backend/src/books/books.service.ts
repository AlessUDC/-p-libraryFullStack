import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.book.findMany({
      include: {
        categories: { include: { category: true } },
        publisher: true,
        authors: { include: { author: true } },
        copies: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.book.findUnique({
      where: { bookId: id },
      include: {
        categories: { include: { category: true } },
        publisher: true,
        authors: { include: { author: true } },
        copies: true,
      },
    });
  }

  async search(term: string) {
    return this.prisma.book.findMany({
      where: {
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { isbn: { contains: term, mode: 'insensitive' } },
          {
            authors: {
              some: {
                author: {
                  OR: [
                    { firstName: { contains: term, mode: 'insensitive' } },
                    { lastName: { contains: term, mode: 'insensitive' } },
                  ],
                },
              },
            },
          },
        ],
      },
      include: {
        categories: { include: { category: true } },
        publisher: true,
        authors: { include: { author: true } },
        copies: true,
      },
    });
  }

  async create(data: CreateBookDto) {
    return this.prisma.$transaction(async (tx) => {
      let publisher = await tx.publisher.findFirst({ where: { title: data.publisherTitle } });
      if (!publisher) {
        publisher = await tx.publisher.create({ data: { title: data.publisherTitle } });
      }

      const authorIds = [];
      for (const a of data.authors) {
        let author = await tx.author.findFirst({
          where: { firstName: a.firstName, lastName: a.lastName, middleName: a.middleName || null },
        });
        if (!author) {
          author = await tx.author.create({
            data: { firstName: a.firstName, lastName: a.lastName, middleName: a.middleName },
          });
        }
        authorIds.push(author.authorId);
      }

      const book = await tx.book.create({
        data: {
          title: data.title,
          isbn: data.isbn,
          publicationYear: data.publicationYear,
          edition: data.edition,
          language: data.language,
          pageCount: data.pageCount,
          publisherId: publisher.publisherId,
          authors: {
            create: authorIds.map(id => ({ authorId: id })),
          },
          categories: {
            create: data.categoriesIds.map(id => ({ categoryId: id })),
          },
        },
      });

      if (data.initialCopyCount > 0) {
        const copiesData = Array.from({ length: data.initialCopyCount }).map((_, idx) => ({
          bookId: book.bookId,
          status: 'AVAILABLE' as any,
          location: data.initialLocation,
          barcode: `LIB-${Date.now()}-${idx}-${Math.floor(Math.random()*10000)}`,
        }));
        await tx.copy.createMany({ data: copiesData });
        
        await tx.stockHistory.create({
          data: {
            bookId: book.bookId,
            movementType: 'INCREMENT',
            previousQuantity: 0,
            newQuantity: data.initialCopyCount,
          }
        });
      }

      return book;
    });
  }

  async update(id: string, data: UpdateBookDto) {
    return this.prisma.$transaction(async (tx) => {
      const updateData: any = {
        title: data.title,
        isbn: data.isbn,
        publicationYear: data.publicationYear,
        edition: data.edition,
        language: data.language,
        pageCount: data.pageCount,
      };

      if (data.publisherTitle) {
        let publisher = await tx.publisher.findFirst({ where: { title: data.publisherTitle } });
        if (!publisher) {
          publisher = await tx.publisher.create({ data: { title: data.publisherTitle } });
        }
        updateData.publisherId = publisher.publisherId;
      }

      const book = await tx.book.update({
        where: { bookId: id },
        data: updateData,
      });

      if (data.authors && data.authors.length > 0) {
        await tx.bookAuthor.deleteMany({ where: { bookId: id } });
        const authorIds = [];
        for (const a of data.authors) {
          let author = await tx.author.findFirst({
            where: { firstName: a.firstName, lastName: a.lastName, middleName: a.middleName || null },
          });
          if (!author) {
            author = await tx.author.create({
              data: { firstName: a.firstName, lastName: a.lastName, middleName: a.middleName },
            });
          }
          authorIds.push(author.authorId);
        }
        await tx.bookAuthor.createMany({
          data: authorIds.map(aid => ({ bookId: id, authorId: aid })),
        });
      }

      if (data.categoriesIds && data.categoriesIds.length > 0) {
        await tx.bookCategory.deleteMany({ where: { bookId: id } });
        await tx.bookCategory.createMany({
          data: data.categoriesIds.map(cid => ({ bookId: id, categoryId: cid })),
        });
      }

      return book;
    });
  }

  async remove(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const copies = await tx.copy.findMany({ where: { bookId: id, status: 'BORROWED' } });
      if (copies.length > 0) {
         throw new BadRequestException("No se puede eliminar un libro con ejemplares prestados.");
      }
      
      const copiesIds = (await tx.copy.findMany({ select: { copyId: true }, where: { bookId: id } })).map(c => c.copyId);
      
      if(copiesIds.length > 0) {
          await tx.lending.deleteMany({ where: { copyId: { in: copiesIds } } });
      }

      await tx.copy.deleteMany({ where: { bookId: id } });
      await tx.stockHistory.deleteMany({ where: { bookId: id } });
      await tx.bookAuthor.deleteMany({ where: { bookId: id } });
      await tx.bookCategory.deleteMany({ where: { bookId: id } });
      await tx.bookGenre.deleteMany({ where: { bookId: id } });
      await tx.reservation.deleteMany({ where: { bookId: id } });
      
      return tx.book.delete({ where: { bookId: id } });
    });
  }
}
