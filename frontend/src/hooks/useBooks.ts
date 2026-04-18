import { useState, useEffect } from 'react';
import { bookService } from '../services/bookService';
import type { Book } from '../services/bookService';
export const useBooks = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const data = await bookService.getAll();
            setBooks(data);
        } catch (err) {
            setError('Error al cargar los libros');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const searchBooks = async (term: string) => {
        if (!term.trim()) {
            fetchBooks();
            return;
        }
        try {
            setLoading(true);
            const data = await bookService.search(term);
            setBooks(data);
        } catch (err) {
            setError('Error en la búsqueda');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return { books, loading, error, searchBooks, refreshBooks: fetchBooks };
};
