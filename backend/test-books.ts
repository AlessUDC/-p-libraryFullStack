import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const books = await prisma.book.findMany({
            include: {
                categories: { include: { category: true } },
                publisher: true,
                authors: { include: { author: true } },
                copies: true,
            },
        });
        console.log(`Found ${books.length} books`);
        console.log(JSON.stringify(books, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
