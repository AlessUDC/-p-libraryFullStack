import api from '../api/axios';

export interface Book {
    bookId: string;
    title: string;
    isbn: string;
    publicationYear: number;
    edition?: string;
    language?: string;
    pageCount?: number;
    categories: Array<{ category: { categoryId: string; title: string } }>;
    publisher: { publisherId: string; title: string };
    authors: Array<{ author: { authorId: string; firstName: string; lastName: string; middleName?: string } }>;
    copies?: Array<{
        copyId: string;
        location: string;
        status: 'AVAILABLE' | 'BORROWED' | 'LOST';
        barcode: string;
    }>;
}

export const bookService = {
    getAll: async () => {
        const response = await api.get<Book[]>('/books');
        return response.data;
    },
    getOne: async (id: string) => {
        const response = await api.get<Book>(`/books/${id}`);
        return response.data;
    },
    search: async (term: string) => {
        const response = await api.get<Book[]>(`/books?search=${term}`);
        return response.data;
    },
    update: async (id: string, data: any) => {
        const response = await api.patch<Book>(`/books/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete(`/books/${id}`);
        return response.data;
    },
    updateStock: async (id: string, quantity: number, location: string) => {
        const response = await api.patch(`/copies/update-quantity/${id}`, { quantity, location });
        return response.data;
    },
    getStockHistory: async (id: string) => {
        const response = await api.get<any[]>(`/copies/history/${id}`);
        return response.data;
    },
    getBookCopies: async (id: string) => {
        const response = await api.get<any[]>(`/copies/book/${id}`);
        return response.data;
    }
};
