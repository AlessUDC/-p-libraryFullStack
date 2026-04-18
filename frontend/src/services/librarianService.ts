import api from '../api/axios';

export interface Librarian {
    userId: string;
    shift: string;
    user: {
        userId: string;
        code: string;
        userData: {
            firstName: string;
            lastName: string;
            middleName?: string | null;
        };
    };
}

export const librarianService = {
    getAll: async () => {
        const response = await api.get<Librarian[]>('/librarians');
        return response.data;
    },
    getOne: async (id: string) => {
        const response = await api.get<Librarian>(`/librarians/${id}`);
        return response.data;
    }
};
