import api from '../api/axios';

export interface Student {
    userId: string;
    cycle: string;
    schoolId: string;
    onTimeDeliveriesCount: number;
    user: {
        userId: string;
        userDataId: string;
        role: string;
        code: string;
        userData: {
            userDataId: string;
            firstName: string;
            paternalLastName: string;
            maternalLastName: string;
            documentType: string;
            documentNumber: string;
            isActive: boolean;
            email?: string | null;
            mobilePhone?: string | null;
        };
        penalties?: Array<{
            penaltyId: string;
            type: 'MILD' | 'SEVERE' | 'VERY_SEVERE';
            status: 'ACTIVE' | 'FULFILLED' | 'CANCELED';
        }>;
    };
    school: {
        schoolId: string;
        title: string;
        faculty: {
            facultyId: string;
            title: string;
        };
    };
}

export const studentService = {
    getAll: async () => {
        const response = await api.get<Student[]>('/students');
        return response.data;
    },
    getOne: async (id: string) => {
        const response = await api.get<Student>(`/students/${id}`);
        return response.data;
    },
    findByDocument: async (type: string, number: string) => {
        // En NestJS mandaremos query params o una ruta equivalente, ej: /students/search?document=...
        const response = await api.get<Student | null>(`/students/search?type=${type}&number=${number}`);
        return response.data;
    },
    addSanction: async (id: string) => {
        const response = await api.patch(`/students/${id}/penalize`);
        return response.data;
    },
    removeSanction: async (id: string) => {
        const response = await api.patch(`/students/${id}/remove-penalty`);
        return response.data;
    }
};
