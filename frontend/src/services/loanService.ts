import api from '../api/axios';

export interface Loan {
    lendingId: string;
    copyId: string;
    borrowerUserId: string;
    librarianUserId: string;
    lendingDate: string;
    expectedReturnDate: string;
    actualReturnDate: string | null;
    status: 'IN_PROGRESS' | 'RETURNED_LATE' | 'LOST' | 'ACTIVE' | 'DEVUELTO'; // Mapping old statuses if needed
    borrower: {
        userId: string;
        code: string;
        userData: {
            firstName: string;
            paternalLastName: string;
            maternalLastName: string;
            documentNumber: string;
        };
        student?: {
            school: {
                title: string;
            };
        };
    };
    copy: {
        copyId: string;
        location: string;
        status: string;
        book: {
            bookId: string;
            title: string;
        };
    };
}

export const loanService = {
    getAll: async () => {
        const response = await api.get<Loan[]>('/loans');
        return response.data;
    },
    getByStudentId: async (studentId: string) => {
        const response = await api.get<Loan[]>(`/loans/student/${studentId}`);
        return response.data;
    },
    getOne: async (id: string) => {
        const response = await api.get<Loan>(`/loans/${id}`);
        return response.data;
    },
    create: async (data: { borrowerUserId: string; copyId: string; librarianUserId: string; expectedReturnDate: string; lendingPolicyId: string }) => {
        const response = await api.post<Loan>('/loans', data);
        return response.data;
    },
    return: async (id: string) => {
        const response = await api.patch<Loan>(`/loans/${id}/return`);
        return response.data;
    },
    update: async (id: string, data: Partial<Loan>) => {
        const response = await api.patch<Loan>(`/loans/${id}`, data);
        return response.data;
    }
};
